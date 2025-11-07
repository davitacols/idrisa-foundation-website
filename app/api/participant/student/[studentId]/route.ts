import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const { studentId } = await params

    const result = await sql`
      SELECT * FROM participants WHERE id = ${studentId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Get student error:", error)
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 })
  }
}
