import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const education_level = searchParams.get('education_level')
    const stage = searchParams.get('stage')
    const difficulty = searchParams.get('difficulty')
    const question_type = searchParams.get('question_type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        qb.*,
        a.first_name || ' ' || a.last_name as created_by_name
      FROM question_bank qb
      LEFT JOIN admins a ON qb.created_by_admin_id = a.id
      WHERE qb.is_active = true
    `
    const params: any[] = []

    if (subject) {
      query += ` AND qb.subject = ${subject}`
    }
    if (education_level) {
      query += ` AND qb.education_level = ${education_level}`
    }
    if (stage) {
      query += ` AND qb.stage = ${stage}`
    }
    if (difficulty) {
      query += ` AND qb.difficulty = ${difficulty}`
    }
    if (question_type) {
      query += ` AND qb.question_type = ${question_type}`
    }

    query += ` ORDER BY qb.created_at DESC LIMIT ${limit} OFFSET ${offset}`

    const questions = await sql(query)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM question_bank WHERE is_active = true'
    if (subject || education_level || stage || difficulty || question_type) {
      countQuery += ' AND'
      const conditions = []
      if (subject) conditions.push(` subject = ${subject}`)
      if (education_level) conditions.push(` education_level = ${education_level}`)
      if (stage) conditions.push(` stage = ${stage}`)
      if (difficulty) conditions.push(` difficulty = ${difficulty}`)
      if (question_type) conditions.push(` question_type = ${question_type}`)
      countQuery += conditions.join(' AND')
    }

    const countResult = await sql(countQuery)
    const total = parseInt(countResult[0].total)

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      question_text,
      question_type,
      difficulty,
      subject,
      education_level,
      stage,
      options,
      correct_answer,
      explanation,
      points_value,
      time_limit_seconds,
      created_by_admin_id
    } = body

    // Validate required fields
    if (!question_text || !question_type || !difficulty || !subject || !education_level || !stage || !correct_answer || !created_by_admin_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate options for multiple choice
    if (question_type === 'multiple_choice' && (!options || !Array.isArray(options) || options.length < 2)) {
      return NextResponse.json(
        { error: 'Multiple choice questions must have at least 2 options' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO question_bank (
        question_text, question_type, difficulty, subject, education_level,
        stage, options, correct_answer, explanation, points_value,
        time_limit_seconds, created_by_admin_id
      )
      VALUES (
        ${question_text}, ${question_type}, ${difficulty}, ${subject}, ${education_level},
        ${stage}, ${options ? JSON.stringify(options) : null}, ${correct_answer}, ${explanation},
        ${points_value || 1.00}, ${time_limit_seconds || 60}, ${created_by_admin_id}
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      question: result[0],
      message: 'Question added to bank successfully'
    })
  } catch (error) {
    console.error('Failed to create question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}

// Random question selection for exams
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      subject,
      education_level,
      stage,
      total_questions,
      questions_per_difficulty,
      exclude_ids = []
    } = body

    // Validate required fields
    if (!subject || !education_level || !stage || !total_questions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const difficultyDistribution = questions_per_difficulty || {
      easy: Math.floor(total_questions * 0.3),
      medium: Math.floor(total_questions * 0.5),
      hard: Math.floor(total_questions * 0.2)
    }

    const selectedQuestions: any[] = []

    // Select questions for each difficulty level
    for (const [difficulty, count] of Object.entries(difficultyDistribution)) {
      if (count > 0) {
        let query = `
          SELECT * FROM question_bank 
          WHERE subject = ${subject} 
          AND education_level = ${education_level}
          AND stage = ${stage}
          AND difficulty = ${difficulty}
          AND is_active = true
        `
        
        if (exclude_ids.length > 0) {
          query += ` AND id NOT IN (${exclude_ids.map(() => '?').join(',')})`
        }
        
        query += ` ORDER BY RANDOM() LIMIT ${count}`

        const questions = await sql(query)
        selectedQuestions.push(...questions)
      }
    }

    // If we don't have enough questions, adjust from other difficulties
    if (selectedQuestions.length < total_questions) {
      const needed = total_questions - selectedQuestions.length
      const remainingQuery = `
        SELECT * FROM question_bank 
        WHERE subject = ${subject} 
        AND education_level = ${education_level}
        AND stage = ${stage}
        AND is_active = true
        AND id NOT IN (${selectedQuestions.map(q => `'${q.id}'`).join(',')})
        ORDER BY RANDOM() LIMIT ${needed}
      `
      const remainingQuestions = await sql(remainingQuery)
      selectedQuestions.push(...remainingQuestions)
    }

    return NextResponse.json({
      success: true,
      questions: selectedQuestions.slice(0, total_questions),
      total_selected: selectedQuestions.length,
      requested: total_questions
    })
  } catch (error) {
    console.error('Failed to select random questions:', error)
    return NextResponse.json(
      { error: 'Failed to select random questions' },
      { status: 500 }
    )
  }
}
