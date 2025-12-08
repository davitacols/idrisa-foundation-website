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
    const can_progress = searchParams.get('can_progress')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build a simple query without complex dynamic conditions for now
    const progression = await sql`
      SELECT 
        sp.*,
        op.first_name || ' ' || op.last_name as participant_name,
        op.email,
        op.education_level,
        op.school_name,
        op.district,
        oe.name as edition_name,
        oe.year as edition_year,
        COUNT(DISTINCT es.id) as exam_sessions_count,
        COUNT(DISTINCT ea.id) as total_questions_answered
      FROM stage_progression sp
      LEFT JOIN olympiad_participants op ON sp.participant_id = op.id
      LEFT JOIN olympiad_editions oe ON sp.edition_id = oe.id
      LEFT JOIN exam_sessions es ON op.id = es.participant_id
      LEFT JOIN exam_answers ea ON es.id = ea.session_id
      ${edition_id ? sql`WHERE sp.edition_id = ${edition_id}` : sql``}
      ${education_level ? sql`AND op.education_level = ${education_level}` : sql``}
      ${current_stage ? sql`AND sp.current_stage = ${current_stage}` : sql``}
      ${can_progress !== null ? sql`AND sp.can_progress = ${can_progress === 'true'}` : sql``}
      GROUP BY sp.id, op.id, oe.id 
      ORDER BY sp.stage_percentage DESC, sp.stage_score DESC 
      LIMIT ${limit} OFFSET ${offset}
   `

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(DISTINCT sp.id) as total 
      FROM stage_progression sp 
      LEFT JOIN olympiad_participants op ON sp.participant_id = op.id
      ${edition_id ? sql`WHERE sp.edition_id = ${edition_id}` : sql``}
      ${education_level ? sql`AND op.education_level = ${education_level}` : sql``}
      ${current_stage ? sql`AND sp.current_stage = ${current_stage}` : sql``}
      ${can_progress !== null ? sql`AND sp.can_progress = ${can_progress === 'true'}` : sql``}
    `
    const total = parseInt(countResult[0].total)

    return NextResponse.json({
      progression,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch progression data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progression data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      participant_id,
      edition_id,
      current_stage,
      stage_score,
      stage_max_score,
      can_progress,
      progression_reason
    } = body

    // Validate required fields
    if (!participant_id || !edition_id || !current_stage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate percentage
    const stage_percentage = stage_max_score > 0 ? 
      Math.round((stage_score / stage_max_score) * 100 * 100) / 100 : 0

    // Calculate rank
    const rankResult = await sql`
      SELECT COUNT(*) + 1 as rank
      FROM stage_progression sp
      LEFT JOIN olympiad_participants op ON sp.participant_id = op.id
      WHERE sp.edition_id = ${edition_id}
      AND sp.current_stage = ${current_stage}
      AND sp.stage_percentage > ${stage_percentage}
    `

    const stage_rank = parseInt(rankResult[0].rank)

    // Get total participants for this stage
    const totalResult = await sql`
      SELECT COUNT(*) as total
      FROM stage_progression sp
      LEFT JOIN olympiad_participants op ON sp.participant_id = op.id
      WHERE sp.edition_id = ${edition_id}
      AND sp.current_stage = ${current_stage}
    `
    const total_participants = parseInt(totalResult[0].total)

    // Create or update progression record
    const result = await sql`
      INSERT INTO stage_progression (
        participant_id, edition_id, current_stage, stage_score,
        stage_max_score, stage_percentage, stage_rank, total_participants,
        can_progress, progression_reason, stage_completed
      )
      VALUES (
        ${participant_id}, ${edition_id}, ${current_stage}, ${stage_score || 0},
        ${stage_max_score || 0}, ${stage_percentage}, ${stage_rank}, ${total_participants},
        ${can_progress || false}, ${progression_reason}, ${stage_score > 0}
      )
      ON CONFLICT (participant_id, edition_id, current_stage)
      DO UPDATE SET
        stage_score = EXCLUDED.stage_score,
        stage_max_score = EXCLUDED.stage_max_score,
        stage_percentage = EXCLUDED.stage_percentage,
        stage_rank = EXCLUDED.stage_rank,
        total_participants = EXCLUDED.total_participants,
        can_progress = EXCLUDED.can_progress,
        progression_reason = EXCLUDED.progression_reason,
        stage_completed = EXCLUDED.stage_completed,
        completion_date = CASE 
          WHEN EXCLUDED.stage_score > 0 AND sp.stage_completed = false 
          THEN CURRENT_TIMESTAMP 
          ELSE sp.completion_date 
        END,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    // Update participant's current stage if they can progress
    if (can_progress && result.length > 0) {
      const nextStages = {
        'Beginner': 'Theory',
        'Theory': 'Practical',
        'Practical': 'Final',
        'Final': 'Completed'
      }
      
      const nextStage = nextStages[current_stage as keyof typeof nextStages]
      if (nextStage && nextStage !== 'Completed') {
        await sql`
          UPDATE olympiad_participants 
          SET current_stage = ${nextStage}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${participant_id}
        `
      }
    }

    return NextResponse.json({
      success: true,
      progression: result[0],
      message: 'Progression record updated successfully'
    })
  } catch (error) {
    console.error('Failed to update progression:', error)
    return NextResponse.json(
      { error: 'Failed to update progression' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'recalculate_rankings':
        const { edition_id: ranking_edition_id, current_stage: ranking_stage } = data
        if (!ranking_edition_id || !ranking_stage) {
          return NextResponse.json(
            { error: 'Edition ID and current stage are required' },
            { status: 400 }
          )
        }

        // Recalculate rankings for all participants in this stage
        const participants = await sql`
          SELECT sp.id, sp.stage_percentage, sp.participant_id, sp.edition_id
          FROM stage_progression sp
          LEFT JOIN olympiad_participants op ON sp.participant_id = op.id
          WHERE sp.edition_id = ${ranking_edition_id}
          AND sp.current_stage = ${ranking_stage}
          ORDER BY sp.stage_percentage DESC, sp.stage_score DESC
        `

        const totalParticipants = participants.length
        
        // Update ranks
        for (let i = 0; i < participants.length; i++) {
          const participant = participants[i]
          const rank = i + 1
          
          await sql`
            UPDATE stage_progression 
            SET stage_rank = ${rank}, total_participants = ${totalParticipants}
            WHERE id = ${participant.id}
          `
        }

        result = { updated_count: participants.length }
        break

      case 'auto_progress':
        const { edition_id: progress_edition_id, stage: progress_stage, threshold_percentage } = data
        if (!progress_edition_id || !progress_stage || !threshold_percentage) {
          return NextResponse.json(
            { error: 'Edition ID, stage, and threshold percentage are required' },
            { status: 400 }
          )
        }

        // Find participants who meet the threshold
        const eligibleParticipants = await sql`
          UPDATE stage_progression 
          SET can_progress = true,
              progression_reason = 'Auto-progressed based on score threshold',
              updated_at = CURRENT_TIMESTAMP
          WHERE edition_id = ${progress_edition_id}
          AND current_stage = ${progress_stage}
          AND stage_percentage >= ${threshold_percentage}
          AND can_progress = false
          RETURNING *
        `

        // Update participant current stages
        const nextStages = {
          'Beginner': 'Theory',
          'Theory': 'Practical',
          'Practical': 'Final',
          'Final': 'Completed'
        }
        
        const nextStage = nextStages[progress_stage as keyof typeof nextStages]
        if (nextStage && nextStage !== 'Completed') {
          for (const participant of eligibleParticipants) {
            await sql`
              UPDATE olympiad_participants 
              SET current_stage = ${nextStage}, updated_at = CURRENT_TIMESTAMP
              WHERE id = ${participant.participant_id}
            `
          }
        }

        result = { progressed_count: eligibleParticipants.length }
        break

      case 'bulk_update':
        const { updates } = data
        if (!updates || !Array.isArray(updates)) {
          return NextResponse.json(
            { error: 'Updates array is required' },
            { status: 400 }
          )
        }

        const updatedRecords = []
        for (const update of updates) {
          const record = await sql`
            UPDATE stage_progression 
            SET can_progress = ${update.can_progress},
                progression_reason = ${update.progression_reason},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${update.id}
            RETURNING *
          `
          if (record.length > 0) {
            updatedRecords.push(record[0])
          }
        }

        result = { updated_count: updatedRecords.length, records: updatedRecords }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      result,
      message: `Progression ${action} action completed successfully`
    })
  } catch (error) {
    console.error('Failed to update progression:', error)
    return NextResponse.json(
      { error: 'Failed to update progression' },
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
        { error: 'Progression ID is required' },
        { status: 400 }
      )
    }

    await sql`DELETE FROM stage_progression WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: 'Progression record deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete progression record:', error)
    return NextResponse.json(
      { error: 'Failed to delete progression record' },
      { status: 500 }
    )
  }
}
