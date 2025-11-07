import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const { studentId } = await params

    const result = await sql`
      SELECT pr.*, o.name as olympiad_name
      FROM participant_registrations pr
      JOIN olympiads o ON pr.olympiad_id = o.id
      WHERE pr.participant_id = ${studentId}
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Fetch registrations error:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}
