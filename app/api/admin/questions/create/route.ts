import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle both camelCase and snake_case field names
    const {
      question_text,
      question_type,
      subject,
      difficulty,
      correct_answer,
      options,
      explanation,
      marks,
      time_limit_seconds,
      tags,
      // Support camelCase alternatives
      questionText,
      questionType,
      correctOption
    } = body

    // Use camelCase fields as fallback if snake_case fields are not provided
    const finalQuestionText = question_text || questionText
    const finalQuestionType = question_type || questionType
    const finalCorrectAnswer = correct_answer || (Array.isArray(options) ? options[correctOption] : correctOption)

    // Validation
    if (!finalQuestionText || !finalQuestionType || !subject || !difficulty || finalCorrectAnswer === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: question_text, question_type, subject, difficulty, correct_answer' },
        { status: 400 }
      )
    }

    if (finalQuestionType === 'multiple_choice' && (!options || !Array.isArray(options) || options.length < 2)) {
      return NextResponse.json(
        { error: 'Multiple choice questions must have at least 2 options' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO question_bank (
        question_text,
        question_type,
        subject,
        difficulty,
        correct_answer,
        options,
        explanation,
        marks,
        time_limit_seconds,
        tags,
        created_by_admin_id
      )
      VALUES (
        ${finalQuestionText},
        ${finalQuestionType},
        ${subject},
        ${difficulty},
        ${finalCorrectAnswer},
        ${options ? JSON.stringify(options) : null},
        ${explanation || null},
        ${marks || 1},
        ${time_limit_seconds || null},
        ${tags ? JSON.stringify(tags) : null},
        'admin-1'
      )
      RETURNING *
    `

    return NextResponse.json({
      question: result[0],
      message: 'Question created successfully'
    })
  } catch (error) {
    console.error('Failed to create question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
