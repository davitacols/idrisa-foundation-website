import { getAdminSession } from "@/lib/session"
import { type NextRequest, NextResponse } from "next/server"
import { neon } from '@neondatabase/serverless'
import { ensureQuestionBankTable } from "@/lib/olympiad-v2/database"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    
    // Ensure table exists
    await ensureQuestionBankTable()
    
    // Delete the question
    await sql`DELETE FROM question_bank WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete question error:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
