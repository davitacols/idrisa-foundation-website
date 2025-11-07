import { neon } from "@neondatabase/serverless"
import { getParticipantSession } from "@/lib/participant-session"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const session = await getParticipantSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { olympiadId, studentId, subjects } = await request.json()

    if (!olympiadId || !studentId || !subjects || subjects.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (subjects.length > 2) {
      return NextResponse.json({ error: "Maximum 2 subjects allowed" }, { status: 400 })
    }

    // Create registration
    const result = await sql`
      INSERT INTO participant_registrations (
        participant_id, olympiad_id, selected_subjects, current_phase
      )
      VALUES (${studentId}, ${olympiadId}, ${JSON.stringify(subjects)}, 'Preparation')
      RETURNING *
    `

    return NextResponse.json({ success: true, registration: result[0] })
  } catch (error: any) {
    console.error("[v0] Register olympiad error:", error)
    return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 })
  }
}
