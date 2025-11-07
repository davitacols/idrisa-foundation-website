import { neon } from "@neondatabase/serverless"
import { getParticipantSession } from "@/lib/participant-session"
import { getParticipantsByGuardian } from "@/lib/participant-auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const session = await getParticipantSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const participants = await getParticipantsByGuardian(session.guardianId)
    const participantIds = participants.map((p) => p.id)

    if (participantIds.length === 0) {
      return NextResponse.json([])
    }

    const result = (await sql`
      SELECT 
        pr.id,
        pr.olympiad_id,
        o.name as olympiad_name,
        pr.selected_subjects,
        pr.current_phase,
        pr.is_eliminated
      FROM participant_registrations pr
      JOIN olympiads o ON pr.olympiad_id = o.id
      WHERE pr.participant_id = ANY($1::uuid[])
      ORDER BY pr.created_at DESC
    `) as any

    return NextResponse.json(
      result.map((reg: any) => ({
        ...reg,
        selected_subjects: reg.selected_subjects || [],
      })),
    )
  } catch (error) {
    console.error("[v0] Fetch registrations error:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}
