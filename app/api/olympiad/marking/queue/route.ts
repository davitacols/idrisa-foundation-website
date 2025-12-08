import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assigned_marker_id = searchParams.get('assigned_marker_id')
    const subject = searchParams.get('subject')
    const education_level = searchParams.get('education_level')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        mq.*,
        ea.selected_answer,
        ea.is_correct as auto_correct,
        ea.points_earned as auto_points,
        ea.time_taken_seconds,
        qb.question_text,
        qb.question_type,
        qb.correct_answer,
        qb.explanation,
        qb.options,
        qb.subject,
        qb.education_level,
        qb.stage,
        es.session_code,
        es.total_score as session_total_score,
        op.first_name || ' ' || op.last_name as participant_name,
        op.email,
        ec.name as exam_name,
        marker.first_name || ' ' || marker.last_name as assigned_marker_name,
        marked_by.first_name || ' ' || marked_by.last_name as marked_by_name
      FROM marking_queue mq
      LEFT JOIN exam_answers ea ON mq.answer_id = ea.id
      LEFT JOIN question_bank qb ON mq.question_id = qb.id
      LEFT JOIN exam_sessions es ON mq.session_id = es.id
      LEFT JOIN olympiad_participants op ON es.participant_id = op.id
      LEFT JOIN exam_configurations ec ON es.exam_config_id = ec.id
      LEFT JOIN admins marker ON mq.assigned_marker_id = marker.id
      LEFT JOIN admins marked_by ON mq.marked_by_admin_id = marked_by.id
    `
    
    const conditions = []
    if (status) {
      conditions.push(`mq.status = ${status}`)
    }
    if (assigned_marker_id) {
      conditions.push(`mq.assigned_marker_id = ${assigned_marker_id}`)
    }
    if (subject) {
      conditions.push(`qb.subject = ${subject}`)
    }
    if (education_level) {
      conditions.push(`qb.education_level = ${education_level}`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ` ORDER BY mq.created_at ASC LIMIT ${limit} OFFSET ${offset}`

    const markingItems = await sql(query)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM marking_queue mq'
    if (conditions.length > 0) {
      countQuery += ` LEFT JOIN exam_answers ea ON mq.answer_id = ea.id LEFT JOIN question_bank qb ON mq.question_id = qb.id WHERE ${conditions.join(' AND ')}`
    }

    const countResult = await sql(countQuery)
    const total = parseInt(countResult[0].total)

    return NextResponse.json({
      marking_items: markingItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch marking queue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marking queue' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      session_id,
      question_id,
      answer_id,
      assigned_marker_id
    } = body

    // Validate required fields
    if (!session_id || !question_id || !answer_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if already in queue
    const existing = await sql`
      SELECT * FROM marking_queue 
      WHERE session_id = ${session_id} AND question_id = ${question_id}
    `
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Answer already in marking queue' },
        { status: 400 }
      )
    }

    // Add to marking queue
    const result = await sql`
      INSERT INTO marking_queue (session_id, question_id, answer_id, assigned_marker_id, status)
      VALUES (${session_id}, ${question_id}, ${answer_id}, ${assigned_marker_id}, 'pending')
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      marking_item: result[0],
      message: 'Answer added to marking queue successfully'
    })
  } catch (error) {
    console.error('Failed to add to marking queue:', error)
    return NextResponse.json(
      { error: 'Failed to add to marking queue' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { marking_id, action, data, admin_id } = body

    if (!marking_id || !action || !admin_id) {
      return NextResponse.json(
        { error: 'Marking ID, action, and admin ID are required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'assign':
        const { assigned_marker_id } = data
        result = await sql`
          UPDATE marking_queue 
          SET assigned_marker_id = ${assigned_marker_id}, 
              assigned_at = CURRENT_TIMESTAMP,
              status = 'in_progress'
          WHERE id = ${marking_id} AND status = 'pending'
          RETURNING *
        `
        break

      case 'start_marking':
        result = await sql`
          UPDATE marking_queue 
          SET marking_started_at = CURRENT_TIMESTAMP,
              assigned_marker_id = ${admin_id},
              status = 'in_progress'
          WHERE id = ${marking_id}
          RETURNING *
        `
        break

      case 'submit_mark':
        const { manual_score, marker_feedback, requires_review } = data
        const finalStatus = requires_review ? 'requires_review' : 'completed'
        
        result = await sql`
          UPDATE marking_queue 
          SET manual_score = ${manual_score},
              final_score = ${manual_score},
              marker_feedback = ${marker_feedback},
              marked_by_admin_id = ${admin_id},
              marking_completed_at = CURRENT_TIMESTAMP,
              status = ${finalStatus}
          WHERE id = ${marking_id}
          RETURNING *
        `

        // Update the exam answer with the manual score
        if (result.length > 0) {
          await sql`
            UPDATE exam_answers 
            SET points_earned = ${manual_score}
            WHERE id = (SELECT answer_id FROM marking_queue WHERE id = ${marking_id})
          `
        }
        break

      case 'moderate':
        const { moderator_feedback, final_score } = data
        result = await sql`
          UPDATE marking_queue 
          SET final_score = ${final_score},
              moderator_feedback = ${moderator_feedback},
              status = 'completed'
          WHERE id = ${marking_id} AND status = 'requires_review'
          RETURNING *
        `

        // Update the exam answer with the final moderated score
        if (result.length > 0) {
          await sql`
            UPDATE exam_answers 
            SET points_earned = ${final_score}
            WHERE id = (SELECT answer_id FROM marking_queue WHERE id = ${marking_id})
          `
        }
        break

      case 'unassign':
        result = await sql`
          UPDATE marking_queue 
          SET assigned_marker_id = NULL,
              assigned_at = NULL,
              marking_started_at = NULL,
              status = 'pending'
          WHERE id = ${marking_id}
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
        { error: 'Marking item not found or action not allowed' },
        { status: 404 }
      )
    }

    // Recalculate session score if marking was completed
    if (action === 'submit_mark' || action === 'moderate') {
      const sessionId = result[0].session_id
      await sql`
        UPDATE exam_sessions 
        SET total_score = (
          SELECT COALESCE(SUM(points_earned), 0) 
          FROM exam_answers 
          WHERE session_id = ${sessionId}
        ),
        percentage_score = CASE 
          WHEN max_score > 0 THEN ROUND(
            (SELECT COALESCE(SUM(points_earned), 0) FROM exam_answers WHERE session_id = ${sessionId}) / 
            max_score * 100, 2
          )
          ELSE 0
        END
        WHERE id = ${sessionId}
      `
    }

    return NextResponse.json({
      success: true,
      marking_item: result[0],
      message: `Marking ${action} action completed successfully`
    })
  } catch (error) {
    console.error('Failed to update marking queue:', error)
    return NextResponse.json(
      { error: 'Failed to update marking queue' },
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
        { error: 'Marking item ID is required' },
        { status: 400 }
      )
    }

    // Only allow deletion of pending items
    const item = await sql`
      SELECT * FROM marking_queue WHERE id = ${id}
    `
    if (item.length === 0) {
      return NextResponse.json(
        { error: 'Marking item not found' },
        { status: 404 }
      )
    }

    if (item[0].status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot delete marking item that is in progress or completed' },
        { status: 400 }
      )
    }

    await sql`DELETE FROM marking_queue WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: 'Marking item deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete marking item:', error)
    return NextResponse.json(
      { error: 'Failed to delete marking item' },
      { status: 500 }
    )
  }
}
