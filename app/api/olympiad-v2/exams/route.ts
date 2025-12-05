import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/admin-auth"
import { createExamConfig } from "@/lib/olympiad-v2/exams"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET exam configs for a stage
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stageId = searchParams.get("stageId")
    const editionId = searchParams.get("editionId")

    let query = `
      SELECT 
        ec.*,
        es.stage_name,
        es.stage_number,
        oe.name as edition_name,
        (SELECT COUNT(*) FROM exam_questions WHERE exam_config_id = ec.id) as question_count
      FROM exam_configs ec
      JOIN edition_stages es ON ec.stage_id = es.id
      JOIN olympiad_editions oe ON ec.edition_id = oe.id
      WHERE 1=1
    `

    const params: any[] = []
    if (stageId) {
      params.push(stageId)
      query += ` AND ec.stage_id = $${params.length}`
    }
    if (editionId) {
      params.push(editionId)
      query += ` AND ec.edition_id = $${params.length}`
    }

    query += ` ORDER BY es.stage_number, ec.education_level`

    const examConfigs = await sql(query, params)

    return NextResponse.json({ examConfigs })
  } catch (error: any) {
    console.error("Get exam configs error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST create exam config
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      edition_id, 
      stage_id, 
      education_level, 
      duration_minutes, 
      total_marks, 
      pass_marks,
      instructions,
      question_ids 
    } = body

    if (!edition_id || !stage_id || !education_level || !duration_minutes || !total_marks || !pass_marks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const examConfig = await createExamConfig({
      edition_id,
      stage_id,
      education_level,
      duration_minutes,
      total_marks,
      pass_marks,
      instructions,
      question_ids: question_ids || []
    })

    return NextResponse.json({ examConfig }, { status: 201 })
  } catch (error: any) {
    console.error("Create exam config error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE exam config
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Exam config ID required" }, { status: 400 })
    }

    await sql`DELETE FROM exam_configs WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete exam config error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
