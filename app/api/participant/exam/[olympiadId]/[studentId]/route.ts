import { neon } from "@neondatabase/serverless"
import { getExamForParticipant } from "@/lib/exams"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { olympiadId: string; studentId: string } }) {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const { olympiadId, studentId } = params

    // Get current phase and get exam
    const olympiadPhases = (await sql`
      SELECT * FROM olympiad_phases WHERE olympiad_id = ${olympiadId}
      ORDER BY phase_number ASC
    `) as any

    const now = new Date()
    let currentPhase = olympiadPhases[0]
    for (const phase of olympiadPhases) {
      if (new Date(phase.start_date) <= now && now <= new Date(phase.end_date)) {
        currentPhase = phase
        break
      }
    }

    // Get participant registration to get subjects
    const registration = (await sql`
      SELECT selected_subjects FROM participant_registrations
      WHERE participant_id = ${studentId} AND olympiad_id = ${olympiadId}
    `) as any

    if (!registration || registration.length === 0) {
      return NextResponse.json({ error: "Not registered for this olympiad" }, { status: 400 })
    }

    const subject = (registration[0] as any).selected_subjects?.[0]
    if (!subject) {
      return NextResponse.json({ error: "No subject selected" }, { status: 400 })
    }

    // Get exam for this subject
    const exam = await getExamForParticipant(
      studentId,
      olympiadId,
      subject,
      currentPhase.phase,
      "admin_id", // Would need to get admin ID from olympiad
    )

    const questions = (await sql`
      SELECT id, question_text, options, correct_option FROM questions
      WHERE id = ANY($1::uuid[])
    `) as any

    const questionIds = exam.question_ids || []
    const questionsData = questions.length > 0 ? questions : []

    return NextResponse.json({
      questions: questionsData.map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options || [],
      })),
      duration: exam.duration_minutes,
      phase: currentPhase.phase,
    })
  } catch (error: any) {
    console.error("[v0] Get exam error:", error)
    return NextResponse.json({ error: error.message || "Failed to get exam" }, { status: 500 })
  }
}
