import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { randomBytes } from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exam_config_id = searchParams.get('exam_config_id')
    const participant_id = searchParams.get('participant_id')
    const status = searchParams.get('status')

    let query = `
      SELECT 
        es.*,
        ec.name as exam_name,
        ec.subject,
        ec.education_level,
        ec.stage,
        ec.duration_minutes,
        op.first_name || ' ' || op.last_name as participant_name,
        op.email,
        oe.name as edition_name
      FROM exam_sessions es
      LEFT JOIN exam_configurations ec ON es.exam_config_id = ec.id
      LEFT JOIN olympiad_participants op ON es.participant_id = op.id
      LEFT JOIN olympiad_editions oe ON ec.edition_id = oe.id
    `
    
    const conditions = []
    if (exam_config_id) {
      conditions.push(`es.exam_config_id = ${exam_config_id}`)
    }
    if (participant_id) {
      conditions.push(`es.participant_id = ${participant_id}`)
    }
    if (status) {
      conditions.push(`es.status = ${status}`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ` ORDER BY es.created_at DESC`

    const sessions = await sql(query)

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Failed to fetch exam sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exam sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      exam_config_id,
      participant_id,
      duration_minutes
    } = body

    // Validate required fields
    if (!exam_config_id || !participant_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if exam configuration exists and is ready
    const examConfig = await sql`
      SELECT * FROM exam_configurations 
      WHERE id = ${exam_config_id} AND status = 'ready'
    `
    if (examConfig.length === 0) {
      return NextResponse.json(
        { error: 'Exam configuration not found or not ready' },
        { status: 404 }
      )
    }

    // Check if participant exists and is active
    const participant = await sql`
      SELECT * FROM olympiad_participants 
      WHERE id = ${participant_id} AND is_active = true
    `
    if (participant.length === 0) {
      return NextResponse.json(
        { error: 'Participant not found or inactive' },
        { status: 404 }
      )
    }

    // Check if participant already has an active session for this exam
    const existingSession = await sql`
      SELECT * FROM exam_sessions 
      WHERE exam_config_id = ${exam_config_id} 
      AND participant_id = ${participant_id}
      AND status IN ('created', 'started', 'in_progress')
    `
    if (existingSession.length > 0) {
      return NextResponse.json(
        { error: 'Participant already has an active session for this exam' },
        { status: 400 }
      )
    }

    // Generate unique session code
    const sessionCode = randomBytes(4).toString('hex').toUpperCase()

    // Create the exam session
    const sessionDuration = duration_minutes || examConfig[0].duration_minutes
    const result = await sql`
      INSERT INTO exam_sessions (
        exam_config_id, participant_id, session_code, duration_minutes,
        time_remaining_seconds, status
      )
      VALUES (
        ${exam_config_id}, ${participant_id}, ${sessionCode}, ${sessionDuration},
        ${sessionDuration * 60}, 'created'
      )
      RETURNING *
    `

    // Get questions for this exam (random selection)
    const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/olympiad/questions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: examConfig[0].subject,
        education_level: examConfig[0].education_level,
        stage: examConfig[0].stage,
        total_questions: examConfig[0].total_questions,
        questions_per_difficulty: examConfig[0].questions_per_difficulty
      })
    })

    if (!questionsResponse.ok) {
      // Rollback session creation if question selection fails
      await sql`DELETE FROM exam_sessions WHERE id = ${result[0].id}`
      return NextResponse.json(
        { error: 'Failed to select questions for exam' },
        { status: 500 }
      )
    }

    const questionsData = await questionsResponse.json()
    const selectedQuestions = questionsData.questions

    // Create answer records for each question
    for (const question of selectedQuestions) {
      await sql`
        INSERT INTO exam_answers (session_id, question_id, max_points)
        VALUES (${result[0].id}, ${question.id}, ${question.points_value})
      `
    }

    return NextResponse.json({
      success: true,
      session: result[0],
      questions: selectedQuestions,
      message: 'Exam session created successfully'
    })
  } catch (error) {
    console.error('Failed to create exam session:', error)
    return NextResponse.json(
      { error: 'Failed to create exam session' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, action, data } = body

    if (!session_id || !action) {
      return NextResponse.json(
        { error: 'Session ID and action are required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'start':
        result = await sql`
          UPDATE exam_sessions 
          SET status = 'started', started_at = CURRENT_TIMESTAMP, 
              last_activity_at = CURRENT_TIMESTAMP
          WHERE id = ${session_id} AND status = 'created'
          RETURNING *
        `
        break

      case 'submit_answer':
        const { question_id, selected_answer, time_taken } = data
        if (!question_id || selected_answer === undefined) {
          return NextResponse.json(
            { error: 'Question ID and answer are required' },
            { status: 400 }
          )
        }

        // Get the question to check if answer is correct
        const question = await sql`
          SELECT correct_answer, question_type, options FROM question_bank WHERE id = ${question_id}
        `

        if (question.length === 0) {
          return NextResponse.json(
            { error: 'Question not found' },
            { status: 404 }
          )
        }

        const isCorrect = question[0].correct_answer === selected_answer
        const pointsEarned = isCorrect ? (await sql`SELECT max_points FROM exam_answers WHERE session_id = ${session_id} AND question_id = ${question_id}`)[0].max_points : 0

        // Update the answer
        await sql`
          UPDATE exam_answers 
          SET selected_answer = ${selected_answer}, is_correct = ${isCorrect},
              points_earned = ${pointsEarned}, time_taken_seconds = ${time_taken || 0}
          WHERE session_id = ${session_id} AND question_id = ${question_id}
        `

        // Update session activity and calculate total score
        await sql`
          UPDATE exam_sessions 
          SET last_activity_at = CURRENT_TIMESTAMP,
              total_score = (
                SELECT COALESCE(SUM(points_earned), 0) 
                FROM exam_answers 
                WHERE session_id = ${session_id}
              ),
              max_score = (
                SELECT COALESCE(SUM(max_points), 0) 
                FROM exam_answers 
                WHERE session_id = ${session_id}
              )
          WHERE id = ${session_id}
        `

        result = await sql`SELECT * FROM exam_sessions WHERE id = ${session_id}`
        break

      case 'pause':
        result = await sql`
          UPDATE exam_sessions 
          SET is_paused = true, last_activity_at = CURRENT_TIMESTAMP
          WHERE id = ${session_id} AND status = 'in_progress'
          RETURNING *
        `
        break

      case 'resume':
        result = await sql`
          UPDATE exam_sessions 
          SET is_paused = false, last_activity_at = CURRENT_TIMESTAMP
          WHERE id = ${session_id} AND is_paused = true
          RETURNING *
        `
        break

      case 'finish':
        const finishTime = new Date().toISOString()
        result = await sql`
          UPDATE exam_sessions 
          SET status = 'completed', completed_at = ${finishTime},
              percentage_score = CASE 
                WHEN max_score > 0 THEN ROUND((total_score / max_score) * 100, 2)
                ELSE 0
              END
          WHERE id = ${session_id} AND status IN ('started', 'in_progress')
          RETURNING *
        `

        // Add questions to marking queue if they need manual marking
        if (result.length > 0) {
          await sql`
            INSERT INTO marking_queue (session_id, question_id, answer_id, status)
            SELECT es.id, ea.question_id, ea.id, 'pending'
            FROM exam_sessions es
            JOIN exam_answers ea ON es.id = ea.session_id
            JOIN question_bank qb ON ea.question_id = qb.id
            WHERE es.id = ${session_id}
            AND qb.question_type IN ('short_answer', 'essay')
            AND ea.is_flagged_for_review = true
            ON CONFLICT (session_id, question_id) DO NOTHING
          `
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Session not found or action not allowed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session: result[0],
      message: `Session ${action} action completed successfully`
    })
  } catch (error) {
    console.error('Failed to update exam session:', error)
    return NextResponse.json(
      { error: 'Failed to update exam session' },
      { status: 500 }
    )
  }
}
