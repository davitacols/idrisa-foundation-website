import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const edition_id = searchParams.get('edition_id')
    const education_level = searchParams.get('education_level')
    const subject = searchParams.get('subject')
    const stage = searchParams.get('stage')
    const status = searchParams.get('status')

    let query = `
      SELECT 
        ec.*,
        oe.name as edition_name,
        a.first_name || ' ' || a.last_name as created_by_name,
        COUNT(DISTINCT es.id) as session_count
      FROM exam_configurations ec
      LEFT JOIN olympiad_editions oe ON ec.edition_id = oe.id
      LEFT JOIN admins a ON ec.created_by_admin_id = a.id
      LEFT JOIN exam_sessions es ON ec.id = es.exam_config_id
    `
    
    const conditions = []
    const params: any[] = []

    if (edition_id) {
      conditions.push(`ec.edition_id = ${edition_id}`)
    }
    if (education_level) {
      conditions.push(`ec.education_level = ${education_level}`)
    }
    if (subject) {
      conditions.push(`ec.subject = ${subject}`)
    }
    if (stage) {
      conditions.push(`ec.stage = ${stage}`)
    }
    if (status) {
      conditions.push(`ec.status = ${status}`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ` GROUP BY ec.id, oe.name, a.first_name, a.last_name ORDER BY ec.created_at DESC`

    const exams = await sql(query)

    return NextResponse.json({ exams })
  } catch (error) {
    console.error('Failed to fetch exam configurations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exam configurations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      edition_id,
      name,
      description,
      education_level,
      subject,
      stage,
      total_questions,
      questions_per_difficulty,
      randomize_questions,
      randomize_options,
      duration_minutes,
      start_time,
      end_time,
      requires_supervision,
      max_attempts,
      created_by_admin_id
    } = body

    // Validate required fields
    if (!edition_id || !name || !education_level || !subject || !stage || !total_questions || !duration_minutes || !created_by_admin_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if edition exists
    const edition = await sql`SELECT * FROM olympiad_editions WHERE id = ${edition_id}`
    if (edition.length === 0) {
      return NextResponse.json(
        { error: 'Olympiad edition not found' },
        { status: 404 }
      )
    }

    // Check if questions are available for this configuration
    const availableQuestions = await sql`
      SELECT COUNT(*) as count FROM question_bank 
      WHERE subject = ${subject} 
      AND education_level = ${education_level}
      AND stage = ${stage}
      AND is_active = true
    `

    if (parseInt(availableQuestions[0].count) < total_questions) {
      return NextResponse.json(
        { error: `Not enough questions available. Found ${availableQuestions[0].count}, need ${total_questions}` },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO exam_configurations (
        edition_id, name, description, education_level, subject, stage,
        total_questions, questions_per_difficulty, randomize_questions,
        randomize_options, duration_minutes, start_time, end_time,
        requires_supervision, max_attempts, created_by_admin_id
      )
      VALUES (
        ${edition_id}, ${name}, ${description}, ${education_level}, ${subject}, ${stage},
        ${total_questions}, ${JSON.stringify(questions_per_difficulty || {
          easy: Math.floor(total_questions * 0.3),
          medium: Math.floor(total_questions * 0.5),
          hard: Math.floor(total_questions * 0.2)
        })}, ${randomize_questions || true}, ${randomize_options || true},
        ${duration_minutes}, ${start_time}, ${end_time}, ${requires_supervision || false},
        ${max_attempts || 1}, ${created_by_admin_id}
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      exam: result[0],
      message: 'Exam configuration created successfully'
    })
  } catch (error) {
    console.error('Failed to create exam configuration:', error)
    return NextResponse.json(
      { error: 'Failed to create exam configuration' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { exam_id, status, start_time, end_time } = body

    if (!exam_id) {
      return NextResponse.json(
        { error: 'Exam ID is required' },
        { status: 400 }
      )
    }

    const updates: string[] = []
    const params: any[] = []

    if (status) {
      updates.push(`status = ${status}`)
    }
    if (start_time) {
      updates.push(`start_time = ${start_time}`)
    }
    if (end_time) {
      updates.push(`end_time = ${end_time}`)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE exam_configurations 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${exam_id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Exam configuration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      exam: result[0],
      message: 'Exam configuration updated successfully'
    })
  } catch (error) {
    console.error('Failed to update exam configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update exam configuration' },
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
        { error: 'Exam configuration ID is required' },
        { status: 400 }
      )
    }

    // Check if exam has sessions
    const sessions = await sql`
      SELECT COUNT(*) as count FROM exam_sessions WHERE exam_config_id = ${id}
    `

    if (parseInt(sessions[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete exam configuration with existing sessions' },
        { status: 400 }
      )
    }

    await sql`DELETE FROM exam_configurations WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: 'Exam configuration deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete exam configuration:', error)
    return NextResponse.json(
      { error: 'Failed to delete exam configuration' },
      { status: 500 }
    )
  }
}
