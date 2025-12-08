import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
      tags
    } = body

    // Validation
    if (!question_text || !question_type || !subject || !difficulty || !correct_answer) {
      return NextResponse.json(
        { error: 'Missing required fields: question_text, question_type, subject, difficulty, correct_answer' },
        { status: 400 }
      )
    }

    if (question_type === 'multiple_choice' && (!options || !Array.isArray(options) || options.length < 2)) {
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
        ${question_text},
        ${question_type},
        ${subject},
        ${difficulty},
        ${correct_answer},
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
