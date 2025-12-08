import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const edition_id = searchParams.get('edition_id')
    const education_level = searchParams.get('education_level')
    const subject = searchParams.get('subject')
    const current_stage = searchParams.get('current_stage')
    const is_active = searchParams.get('is_active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        op.*,
        oe.name as edition_name,
        oe.year as edition_year,
        sp.stage_score,
        sp.stage_percentage,
        sp.stage_rank,
        sp.can_progress,
        COUNT(DISTINCT es.id) as exam_sessions_count,
        COUNT(DISTINCT ea.id) as answered_questions_count
      FROM olympiad_participants op
      LEFT JOIN olympiad_editions oe ON op.edition_id = oe.id
      LEFT JOIN stage_progression sp ON op.id = sp.participant_id AND op.edition_id = sp.edition_id
      LEFT JOIN exam_sessions es ON op.id = es.participant_id
      LEFT JOIN exam_answers ea ON es.id = ea.session_id
    `
    
    const conditions = []
    if (edition_id) {
      conditions.push(`op.edition_id = ${edition_id}`)
    }
    if (education_level) {
      conditions.push(`op.education_level = ${education_level}`)
    }
    if (current_stage) {
      conditions.push(`op.current_stage = ${current_stage}`)
    }
    if (is_active !== null) {
      conditions.push(`op.is_active = ${is_active === 'true'}`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ` GROUP BY op.id, oe.name, oe.year, sp.stage_score, sp.stage_percentage, sp.stage_rank, sp.can_progress ORDER BY op.created_at DESC LIMIT ${limit} OFFSET ${offset}`

    const participants = await sql(query)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(DISTINCT op.id) as total FROM olympiad_participants op'
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`
    }

    const countResult = await sql(countQuery)
    const total = parseInt(countResult[0].total)

    return NextResponse.json({
      participants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch participants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      edition_id,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      education_level,
      school_name,
      district,
      parent_consent,
      consent_given_by,
      consent_contact,
      subjects  // Array of subjects participant wants to take
    } = body

    // Validate required fields
    if (!user_id || !edition_id || !first_name || !last_name || !email || !education_level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if edition exists and is open for enrollment
    const edition = await sql`
      SELECT * FROM olympiad_editions 
      WHERE id = ${edition_id} 
      AND status IN ('OPEN', 'ACTIVE')
      AND enrollment_start <= CURRENT_TIMESTAMP 
      AND enrollment_end >= CURRENT_TIMESTAMP
    `
    if (edition.length === 0) {
      return NextResponse.json(
        { error: 'Edition not found or not open for enrollment' },
        { status: 404 }
      )
    }

    // Check if user is already enrolled in this edition
    const existing = await sql`
      SELECT * FROM olympiad_participants 
      WHERE user_id = ${user_id} AND edition_id = ${edition_id}
    `
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User already enrolled in this edition' },
        { status: 400 }
      )
    }

    // Check age requirements
    if (date_of_birth) {
      const ageRules = edition[0].age_rules
      const levelRules = ageRules[education_level]
      const birthDate = new Date(date_of_birth)
      const referenceDate = new Date(edition[0].reference_date || Date.now())
      const age = Math.floor((Number(referenceDate) - Number(birthDate)) / (365.25 * 24 * 60 * 60 * 1000))

      if (levelRules && (age < levelRules.min || age > levelRules.max)) {
        return NextResponse.json(
          { error: `Age ${age} is not within the required range for ${education_level} (${levelRules.min}-${levelRules.max} years)` },
          { status: 400 }
        )
      }
    }

    // Check if education level is active for this edition
    const activeLevels = edition[0].active_levels
    if (!activeLevels.includes(education_level)) {
      return NextResponse.json(
        { error: `${education_level} is not active for this edition` },
        { status: 400 }
      )
    }

    // Validate subjects if provided
    if (subjects && subjects.length > 0) {
      const activeSubjects = edition[0].active_subjects
      const levelSubjects = activeSubjects[education_level] || []
      const invalidSubjects = subjects.filter((subject: string) => !levelSubjects.includes(subject))
      
      if (invalidSubjects.length > 0) {
        return NextResponse.json(
          { error: `Invalid subjects for ${education_level}: ${invalidSubjects.join(', ')}` },
          { status: 400 }
        )
      }

      if (subjects.length > edition[0].max_subjects_per_participant) {
        return NextResponse.json(
          { error: `Cannot select more than ${edition[0].max_subjects_per_participant} subjects` },
          { status: 400 }
        )
      }
    }

    // Check if parent consent is required (for minors)
    const needsConsent = date_of_birth ? 
      Math.floor((Date.now() - new Date(date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) < 18 : false

    if (needsConsent && !parent_consent) {
      return NextResponse.json(
        { error: 'Parental consent required for participants under 18 years' },
        { status: 400 }
      )
    }

    // Create the participant
    const result = await sql`
      INSERT INTO olympiad_participants (
        user_id, edition_id, first_name, last_name, email, phone,
        date_of_birth, education_level, school_name, district,
        parent_consent, consent_given_by, consent_contact
      )
      VALUES (
        ${user_id}, ${edition_id}, ${first_name}, ${last_name}, ${email}, ${phone},
        ${date_of_birth}, ${education_level}, ${school_name}, ${district},
        ${parent_consent || false}, ${consent_given_by}, ${consent_contact}
      )
      RETURNING *
    `

    // Create initial stage progression record
    await sql`
      INSERT INTO stage_progression (participant_id, edition_id, current_stage)
      VALUES (${result[0].id}, ${edition_id}, 'Beginner')
    `

    return NextResponse.json({
      success: true,
      participant: result[0],
      message: 'Participant enrolled successfully'
    })
  } catch (error) {
    console.error('Failed to enroll participant:', error)
    return NextResponse.json(
      { error: 'Failed to enroll participant' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { participant_id, action, data } = body

    if (!participant_id || !action) {
      return NextResponse.json(
        { error: 'Participant ID and action are required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'update_status':
        const { is_active } = data
        result = await sql`
          UPDATE olympiad_participants 
          SET is_active = ${is_active}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${participant_id}
          RETURNING *
        `
        break

      case 'update_stage':
        const { current_stage } = data
        result = await sql`
          UPDATE olympiad_participants 
          SET current_stage = ${current_stage}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${participant_id}
          RETURNING *
        `

        // Update stage progression
        if (result.length > 0) {
          await sql`
            INSERT INTO stage_progression (participant_id, edition_id, current_stage)
            VALUES (${participant_id}, (SELECT edition_id FROM olympiad_participants WHERE id = ${participant_id}), ${current_stage})
            ON CONFLICT (participant_id, edition_id, current_stage) 
            DO UPDATE SET updated_at = CURRENT_TIMESTAMP
          `
        }
        break

      case 'update_info':
        const { phone, school_name, district } = data
        const updates = []
        const params = []

        if (phone !== undefined) {
          updates.push(`phone = ${phone}`)
        }
        if (school_name !== undefined) {
          updates.push(`school_name = ${school_name}`)
        }
        if (district !== undefined) {
          updates.push(`district = ${district}`)
        }

        if (updates.length === 0) {
          return NextResponse.json(
            { error: 'No fields to update' },
            { status: 400 }
          )
        }

        result = await sql`
          UPDATE olympiad_participants 
          SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${participant_id}
          RETURNING *
        `
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      participant: result[0],
      message: `Participant ${action} action completed successfully`
    })
  } catch (error) {
    console.error('Failed to update participant:', error)
    return NextResponse.json(
      { error: 'Failed to update participant' },
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
        { error: 'Participant ID is required' },
        { status: 400 }
      )
    }

    // Check if participant has exam sessions
    const sessions = await sql`
      SELECT COUNT(*) as count FROM exam_sessions WHERE participant_id = ${id}
    `

    if (parseInt(sessions[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete participant with exam sessions' },
        { status: 400 }
      )
    }

    await sql`DELETE FROM olympiad_participants WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: 'Participant deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete participant:', error)
    return NextResponse.json(
      { error: 'Failed to delete participant' },
      { status: 500 }
    )
  }
}
