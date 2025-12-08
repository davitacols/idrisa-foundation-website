import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const edition_id = searchParams.get('edition_id')
    const education_level = searchParams.get('education_level')
    const subject = searchParams.get('subject')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get venues
    let venuesQuery = `
      SELECT 
        fv.*,
        oe.name as edition_name,
        COUNT(DISTINCT fr.participant_id) as assigned_participants
      FROM final_venues fv
      LEFT JOIN olympiad_editions oe ON fv.edition_id = oe.id
      LEFT JOIN final_results fr ON fv.id = fr.final_venue_id
    `
    
    const venueConditions = []
    if (edition_id) {
      venueConditions.push(`fv.edition_id = ${edition_id}`)
    }
    if (education_level) {
      venueConditions.push(`fv.education_level = ${education_level}`)
    }
    if (subject) {
      venueConditions.push(`fv.subject = ${subject}`)
    }

    if (venueConditions.length > 0) {
      venuesQuery += ` WHERE ${venueConditions.join(' AND ')}`
    }

    venuesQuery += ` GROUP BY fv.id, oe.id ORDER BY fv.event_date ASC`

    const venues = await sql(venuesQuery)

    // Get results
    let resultsQuery = `
      SELECT 
        fr.*,
        fv.venue_name,
        fv.event_date,
        fv.venue_address,
        op.first_name || ' ' || op.last_name as participant_name,
        op.email,
        op.education_level,
        op.school_name,
        oe.name as edition_name,
        marked_by.first_name || ' ' || marked_by.last_name as entered_by_name
      FROM final_results fr
      LEFT JOIN final_venues fv ON fr.final_venue_id = fv.id
      LEFT JOIN olympiad_participants op ON fr.participant_id = op.id
      LEFT JOIN olympiad_editions oe ON fv.edition_id = oe.id
      LEFT JOIN admins marked_by ON fr.entered_by_admin_id = marked_by.id
    `
    
    const resultConditions = []
    if (edition_id) {
      resultConditions.push(`fv.edition_id = ${edition_id}`)
    }
    if (education_level) {
      resultConditions.push(`op.education_level = ${education_level}`)
    }
    if (subject) {
      resultConditions.push(`fr.subject = ${subject}`)
    }

    if (resultConditions.length > 0) {
      resultsQuery += ` WHERE ${resultConditions.join(' AND ')}`
    }

    resultsQuery += ` ORDER BY fv.event_date, fr.final_rank ASC LIMIT ${limit} OFFSET ${offset}`

    const results = await sql(resultsQuery)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM final_results fr LEFT JOIN final_venues fv ON fr.final_venue_id = fv.id LEFT JOIN olympiad_participants op ON fr.participant_id = op.id'
    if (resultConditions.length > 0) {
      countQuery += ` WHERE ${resultConditions.join(' AND ')}`
    }

    const countResult = await sql(countQuery)
    const total = parseInt(countResult[0].total)

    return NextResponse.json({
      venues,
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch finals data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch finals data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Type (venue/result) is required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'venue':
        const {
          edition_id,
          education_level,
          subject: venue_subject,
          venue_name,
          venue_address,
          venue_map_link,
          event_date,
          capacity
        } = data

        // Validate required fields
        if (!edition_id || !education_level || !venue_subject || !venue_name || !event_date) {
          return NextResponse.json(
            { error: 'Missing required venue fields' },
            { status: 400 }
          )
        }

        // Check if venue already exists for this combination
        const existing = await sql`
          SELECT * FROM final_venues 
          WHERE edition_id = ${edition_id} 
          AND education_level = ${education_level}
          AND subject = ${venue_subject}
        `
        if (existing.length > 0) {
          return NextResponse.json(
            { error: 'Venue already exists for this edition, level, and subject combination' },
            { status: 400 }
          )
        }

        result = await sql`
          INSERT INTO final_venues (
            edition_id, education_level, subject, venue_name,
            venue_address, venue_map_link, event_date, capacity
          )
          VALUES (
            ${edition_id}, ${education_level}, ${venue_subject}, ${venue_name},
            ${venue_address}, ${venue_map_link}, ${event_date}, ${capacity}
          )
          RETURNING *
        `
        break

      case 'result':
        const {
          participant_id,
          final_venue_id,
          subject,
          attendance_status,
          final_score,
          final_rank,
          award_category,
          certificate_url,
          entered_by_admin_id
        } = data

        // Validate required fields
        if (!participant_id || !final_venue_id || !subject || !entered_by_admin_id) {
          return NextResponse.json(
            { error: 'Missing required result fields' },
            { status: 400 }
          )
        }

        // Check if result already exists
        const existingResult = await sql`
          SELECT * FROM final_results 
          WHERE participant_id = ${participant_id} 
          AND final_venue_id = ${final_venue_id}
          AND subject = ${subject}
        `
        if (existingResult.length > 0) {
          return NextResponse.json(
            { error: 'Result already exists for this participant, venue, and subject' },
            { status: 400 }
          )
        }

        result = await sql`
          INSERT INTO final_results (
            participant_id, final_venue_id, subject, attendance_status,
            final_score, final_rank, award_category, certificate_url,
            entered_by_admin_id, entered_at
          )
          VALUES (
            ${participant_id}, ${final_venue_id}, ${subject}, ${attendance_status},
            ${final_score}, ${final_rank}, ${award_category}, ${certificate_url},
            ${entered_by_admin_id}, CURRENT_TIMESTAMP
          )
          RETURNING *
        `
        break

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be "venue" or "result"' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      [type]: result[0],
      message: `Final ${type} created successfully`
    })
  } catch (error) {
    console.error('Failed to create finals data:', error)
    return NextResponse.json(
      { error: 'Failed to create finals data' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, data } = body

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'venue':
        const venueUpdates = []
        const venueParams = []

        if (data.venue_name !== undefined) {
          venueUpdates.push(`venue_name = ${data.venue_name}`)
        }
        if (data.venue_address !== undefined) {
          venueUpdates.push(`venue_address = ${data.venue_address}`)
        }
        if (data.venue_map_link !== undefined) {
          venueUpdates.push(`venue_map_link = ${data.venue_map_link}`)
        }
        if (data.event_date !== undefined) {
          venueUpdates.push(`event_date = ${data.event_date}`)
        }
        if (data.capacity !== undefined) {
          venueUpdates.push(`capacity = ${data.capacity}`)
        }

        if (venueUpdates.length === 0) {
          return NextResponse.json(
            { error: 'No fields to update' },
            { status: 400 }
          )
        }

        result = await sql`
          UPDATE final_venues 
          SET ${venueUpdates.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `
        break

      case 'result':
        const resultUpdates = []
        const resultParams = []

        if (data.attendance_status !== undefined) {
          resultUpdates.push(`attendance_status = ${data.attendance_status}`)
        }
        if (data.final_score !== undefined) {
          resultUpdates.push(`final_score = ${data.final_score}`)
        }
        if (data.final_rank !== undefined) {
          resultUpdates.push(`final_rank = ${data.final_rank}`)
        }
        if (data.award_category !== undefined) {
          resultUpdates.push(`award_category = ${data.award_category}`)
        }
        if (data.certificate_url !== undefined) {
          resultUpdates.push(`certificate_url = ${data.certificate_url}`)
        }
        if (data.entered_by_admin_id !== undefined) {
          resultUpdates.push(`entered_by_admin_id = ${data.entered_by_admin_id}`)
          resultUpdates.push(`entered_at = CURRENT_TIMESTAMP`)
        }

        if (resultUpdates.length === 0) {
          return NextResponse.json(
            { error: 'No fields to update' },
            { status: 400 }
          )
        }

        result = await sql`
          UPDATE final_results 
          SET ${resultUpdates.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `
        break

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be "venue" or "result"' },
          { status: 400 }
        )
    }

    if (result.length === 0) {
      return NextResponse.json(
        { error: `Final ${type} not found` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      [type]: result[0],
      message: `Final ${type} updated successfully`
    })
  } catch (error) {
    console.error('Failed to update finals data:', error)
    return NextResponse.json(
      { error: 'Failed to update finals data' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'venue':
        // Check if venue has assigned results
        const results = await sql`
          SELECT COUNT(*) as count FROM final_results WHERE final_venue_id = ${id}
        `
        if (parseInt(results[0].count) > 0) {
          return NextResponse.json(
            { error: 'Cannot delete venue with assigned participants' },
            { status: 400 }
          )
        }
        await sql`DELETE FROM final_venues WHERE id = ${id}`
        break

      case 'result':
        await sql`DELETE FROM final_results WHERE id = ${id}`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be "venue" or "result"' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Final ${type} deleted successfully`
    })
  } catch (error) {
    console.error('Failed to delete finals data:', error)
    return NextResponse.json(
      { error: 'Failed to delete finals data' },
      { status: 500 }
    )
  }
}
