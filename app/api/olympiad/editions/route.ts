import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { initializeOlympiadDatabase, checkDatabaseStatus } from '@/lib/olympiad-v2/database'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Check if database is initialized
    const dbStatus = await checkDatabaseStatus()
    if (!dbStatus.initialized) {
      return NextResponse.json(
        { error: 'Database not initialized', tables: dbStatus.tables },
        { status: 400 }
      )
    }

    const editions = await sql`
      SELECT 
        oe.*,
        a.first_name || ' ' || a.last_name as created_by_name,
        COUNT(DISTINCT op.id) as participant_count
      FROM olympiad_editions oe
      LEFT JOIN admins a ON oe.created_by_admin_id = a.id
      LEFT JOIN olympiad_participants op ON oe.id = op.edition_id
      GROUP BY oe.id, a.first_name, a.last_name
      ORDER BY oe.year DESC, oe.created_at DESC
    `

    return NextResponse.json({ editions })
  } catch (error) {
    console.error('Failed to fetch editions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch editions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      year,
      enrollment_start,
      enrollment_end,
      active_levels,
      active_subjects,
      age_rules,
      max_subjects_per_participant,
      reference_date,
      created_by_admin_id
    } = body

    // Validate required fields
    if (!name || !year || !enrollment_start || !enrollment_end || !created_by_admin_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if database is initialized
    const dbStatus = await checkDatabaseStatus()
    if (!dbStatus.initialized) {
      const initResult = await initializeOlympiadDatabase()
      if (!initResult.success) {
        return NextResponse.json(
          { error: 'Failed to initialize database', details: initResult.message },
          { status: 500 }
        )
      }
    }

    // Create the edition
    const result = await sql`
      INSERT INTO olympiad_editions (
        name, year, enrollment_start, enrollment_end,
        active_levels, active_subjects, age_rules,
        max_subjects_per_participant, reference_date, created_by_admin_id
      )
      VALUES (
        ${name}, ${year}, ${enrollment_start}, ${enrollment_end},
        ${JSON.stringify(active_levels || ["Primary", "O-Level", "A-Level"])},
        ${JSON.stringify(active_subjects || {
          "Primary": ["Math", "Science", "ICT"],
          "O-Level": ["Math", "Biology", "Chemistry", "Physics", "ICT", "Agriculture"],
          "A-Level": ["Math", "Biology", "Chemistry", "Physics", "ICT", "Agriculture"]
        })},
        ${JSON.stringify(age_rules || {
          "Primary": {"min": 9, "max": 15},
          "O-Level": {"min": 11, "max": 18},
          "A-Level": {"min": 15, "max": 21}
        })},
        ${max_subjects_per_participant || 3}, ${reference_date}, ${created_by_admin_id}
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      edition: result[0],
      message: 'Olympiad edition created successfully'
    })
  } catch (error) {
    console.error('Failed to create edition:', error)
    return NextResponse.json(
      { error: 'Failed to create edition' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Edition ID is required' },
        { status: 400 }
      )
    }

    // Check if edition has participants
    const participants = await sql`
      SELECT COUNT(*) as count FROM olympiad_participants WHERE edition_id = ${id}
    `

    if (parseInt(participants[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete edition with enrolled participants' },
        { status: 400 }
      )
    }

    // Delete the edition
    await sql`DELETE FROM olympiad_editions WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: 'Olympiad edition deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete edition:', error)
    return NextResponse.json(
      { error: 'Failed to delete edition' },
      { status: 500 }
    )
  }
}
