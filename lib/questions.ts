import { neon } from "@neondatabase/serverless"

export interface Question {
  id: string
  admin_id: string
  subject: string
  education_level: "Primary" | "O-level" | "A-level"
  question_type: "Quiz" | "Theory" | "Practical"
  hardness: "1-star" | "2-star" | "3-star"
  question_text: string
  options: string[]
  correct_option: number
  created_at: string
}

export async function createQuestion(
  adminId: string,
  subject: string,
  educationLevel: "Primary" | "O-level" | "A-level",
  questionType: "Quiz" | "Theory" | "Practical",
  hardness: "1-star" | "2-star" | "3-star",
  questionText: string,
  options: string[],
  correctOption: number,
): Promise<Question> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    INSERT INTO questions (
      admin_id, subject, education_level, question_type, hardness, 
      question_text, options, correct_option
    )
    VALUES (
      ${adminId}, ${subject}, ${educationLevel}, ${questionType}, ${hardness},
      ${questionText}, ${JSON.stringify(options)}, ${correctOption}
    )
    RETURNING *
  `

  if (result.length === 0) throw new Error("Failed to create question")
  return result[0] as Question
}

export async function getQuestionsByAdmin(adminId: string): Promise<Question[]> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT * FROM questions WHERE admin_id = ${adminId}
    ORDER BY created_at DESC
  `
  return result as Question[]
}

export async function getQuestionsByFilters(
  adminId: string,
  subject?: string,
  educationLevel?: string,
  questionType?: string,
  hardness?: string,
): Promise<Question[]> {
  const sql = neon(process.env.DATABASE_URL!)
  let query = "SELECT * FROM questions WHERE admin_id = $1"
  const params: any[] = [adminId]
  let paramIndex = 2

  if (subject) {
    query += ` AND subject = $${paramIndex}`
    params.push(subject)
    paramIndex++
  }
  if (educationLevel) {
    query += ` AND education_level = $${paramIndex}`
    params.push(educationLevel)
    paramIndex++
  }
  if (questionType) {
    query += ` AND question_type = $${paramIndex}`
    params.push(questionType)
    paramIndex++
  }
  if (hardness) {
    query += ` AND hardness = $${paramIndex}`
    params.push(hardness)
    paramIndex++
  }

  query += " ORDER BY created_at DESC"

  const result = await sql(query, params)
  return result as Question[]
}

export async function getQuestionsForExam(
  adminId: string,
  subject: string,
  educationLevel: string,
  questionType: string,
  count = 20,
): Promise<Question[]> {
  const sql = neon(process.env.DATABASE_URL!)
  // Get equal distribution across hardness levels
  const perHardness = Math.ceil(count / 3)

  const result = await sql`
    (
      SELECT * FROM questions 
      WHERE admin_id = ${adminId} 
        AND subject = ${subject}
        AND education_level = ${educationLevel}
        AND question_type = ${questionType}
        AND hardness = '1-star'
      ORDER BY RANDOM()
      LIMIT ${perHardness}
    )
    UNION ALL
    (
      SELECT * FROM questions 
      WHERE admin_id = ${adminId} 
        AND subject = ${subject}
        AND education_level = ${educationLevel}
        AND question_type = ${questionType}
        AND hardness = '2-star'
      ORDER BY RANDOM()
      LIMIT ${perHardness}
    )
    UNION ALL
    (
      SELECT * FROM questions 
      WHERE admin_id = ${adminId} 
        AND subject = ${subject}
        AND education_level = ${educationLevel}
        AND question_type = ${questionType}
        AND hardness = '3-star'
      ORDER BY RANDOM()
      LIMIT ${perHardness}
    )
    LIMIT ${count}
  `

  return result as Question[]
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!)
  await sql`
    DELETE FROM questions WHERE id = ${questionId}
  `
}
