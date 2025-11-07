import { neon } from "@neondatabase/serverless"

export interface ExamAttempt {
  id: string
  participant_id: string
  exam_id: string
  olympiad_id: string
  subject: string
  phase: string
  started_at?: string
  completed_at?: string
  status: "Not Started" | "In Progress" | "Completed" | "Eliminated"
  score?: number
  answers?: Record<string, number>
}

// Duration in minutes by phase and type
const EXAM_DURATIONS: Record<string, Record<string, number>> = {
  Quiz: { Primary: 45, "O-level": 60, "A-level": 60 },
  Theory: { Primary: 90, "O-level": 120, "A-level": 150 },
  Practical: { Primary: 150, "O-level": 150, "A-level": 195 },
}

export function getExamDuration(questionType: string, educationLevel: string): number {
  return EXAM_DURATIONS[questionType]?.[educationLevel] || 60
}

export async function createExamAttempt(
  participantId: string,
  olympiadId: string,
  subject: string,
  phase: string,
): Promise<ExamAttempt> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    INSERT INTO exam_attempts (
      participant_id, olympiad_id, subject, phase, status, started_at
    )
    VALUES (${participantId}, ${olympiadId}, ${subject}, ${phase}, 'In Progress', NOW())
    RETURNING *
  `

  if (result.length === 0) throw new Error("Failed to create exam attempt")
  return result[0] as ExamAttempt
}

export async function getExamAttempt(attemptId: string): Promise<ExamAttempt | null> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT * FROM exam_attempts WHERE id = ${attemptId}
  `

  if (result.length === 0) return null
  return result[0] as ExamAttempt
}

export async function submitExamAnswers(
  attemptId: string,
  answers: Record<string, number>,
  correctAnswers: Record<string, number>,
): Promise<number> {
  const sql = neon(process.env.DATABASE_URL!)
  // Calculate score
  let correctCount = 0
  for (const [questionId, userAnswer] of Object.entries(answers)) {
    if (correctAnswers[questionId] === userAnswer) {
      correctCount++
    }
  }

  const totalQuestions = Object.keys(correctAnswers).length
  const score = Math.round((correctCount / totalQuestions) * 100 * 100) / 100

  // Update exam attempt
  await sql`
    UPDATE exam_attempts 
    SET 
      status = 'Completed',
      completed_at = NOW(),
      score = ${score},
      answers = ${JSON.stringify(answers)}
    WHERE id = ${attemptId}
  `

  return score
}

export async function checkAndEliminateParticipants(olympiadId: string, currentPhase: string): Promise<number> {
  const sql = neon(process.env.DATABASE_URL!)
  let eliminatedCount = 0

  if (currentPhase === "Quiz") {
    // Eliminate those scoring below 70%
    const result = await sql`
      UPDATE participant_registrations
      SET is_eliminated = true, elimination_phase = 'Quiz'
      WHERE 
        olympiad_id = ${olympiadId} 
        AND current_phase = 'Preparation'
        AND is_eliminated = false
        AND participant_id IN (
          SELECT DISTINCT participant_id FROM exam_attempts
          WHERE olympiad_id = ${olympiadId} 
            AND phase = 'Quiz'
            AND status = 'Completed'
            AND score < 70
        )
      RETURNING id
    `
    eliminatedCount = result.length
  } else if (currentPhase === "Bronze") {
    // Get all participants who completed Quiz phase
    const participants = (await sql`
      SELECT DISTINCT ea.participant_id, ea.score
      FROM exam_attempts ea
      WHERE ea.olympiad_id = ${olympiadId} AND ea.phase = 'Quiz' AND ea.status = 'Completed'
      ORDER BY ea.score DESC
    `) as any

    if (participants.length > 0) {
      // Bottom 30% and score < 60% get eliminated
      const bottomThirty = Math.ceil(participants.length * 0.3)
      const toEliminate = participants
        .slice(-bottomThirty)
        .filter((p: any) => p.score < 60)
        .map((p: any) => p.participant_id)

      if (toEliminate.length > 0) {
        const result = (await sql`
          UPDATE participant_registrations
          SET is_eliminated = true, elimination_phase = 'Bronze'
          WHERE 
            olympiad_id = ${olympiadId}
            AND participant_id = ANY($1::uuid[])
          RETURNING id
        `) as any
        eliminatedCount = result.length
      }
    }
  } else if (currentPhase === "Silver") {
    // Bottom 50% and score < 50% get eliminated
    const participants = (await sql`
      SELECT DISTINCT ea.participant_id, ea.score
      FROM exam_attempts ea
      WHERE ea.olympiad_id = ${olympiadId} AND ea.phase = 'Bronze' AND ea.status = 'Completed'
      ORDER BY ea.score DESC
    `) as any

    if (participants.length > 0) {
      const bottomHalf = Math.ceil(participants.length * 0.5)
      const toEliminate = participants
        .slice(-bottomHalf)
        .filter((p: any) => p.score < 50)
        .map((p: any) => p.participant_id)

      if (toEliminate.length > 0) {
        const result = (await sql`
          UPDATE participant_registrations
          SET is_eliminated = true, elimination_phase = 'Silver'
          WHERE 
            olympiad_id = ${olympiadId}
            AND participant_id = ANY($1::uuid[])
          RETURNING id
        `) as any
        eliminatedCount = result.length
      }
    }
  }

  return eliminatedCount
}

export async function getExamForParticipant(
  participantId: string,
  olympiadId: string,
  subject: string,
  phase: string,
  adminId: string,
): Promise<any> {
  const sql = neon(process.env.DATABASE_URL!)
  // Get education level
  const participantData = (await sql`
    SELECT p.education_level FROM participants p
    WHERE p.id = ${participantId}
  `) as any

  if (!participantData || participantData.length === 0) {
    throw new Error("Participant not found")
  }

  const educationLevel = participantData[0].education_level

  // Get or create exam
  let exams = (await sql`
    SELECT * FROM exams 
    WHERE olympiad_id = ${olympiadId}
      AND subject = ${subject}
      AND education_level = ${educationLevel}
      AND phase = ${phase}
  `) as any

  if (exams.length === 0) {
    // Create new exam - get questions matching the phase type
    let questionType = "Quiz"
    if (phase === "Bronze") questionType = "Theory"
    else if (phase === "Silver") questionType = "Practical"

    // Get questions for exam (from question bank)
    const questions = (await sql`
      SELECT id FROM questions 
      WHERE education_level = ${educationLevel}
        AND subject = ${subject}
        AND question_type = ${questionType}
      ORDER BY RANDOM()
      LIMIT 20
    `) as any

    if (questions.length === 0) {
      throw new Error("No questions available for this exam")
    }

    const questionIds = questions.map((q: any) => q.id)
    const duration = getExamDuration(questionType, educationLevel)

    const examRes = (await sql`
      INSERT INTO exams (
        olympiad_id, phase, subject, education_level, question_ids, duration_minutes
      )
      VALUES (${olympiadId}, ${phase}, ${subject}, ${educationLevel}, ${JSON.stringify(questionIds)}, ${duration})
      RETURNING *
    `) as any

    exams = examRes
  }

  return exams[0]
}
