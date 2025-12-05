import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/admin-auth"
import { getPendingMarkingTasks, submitManualMark } from "@/lib/olympiad-v2/marking"

// GET pending marking tasks
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
    const editionId = searchParams.get("editionId")
    const stageId = searchParams.get("stageId")

    const tasks = await getPendingMarkingTasks(
      editionId ? parseInt(editionId) : undefined,
      stageId ? parseInt(stageId) : undefined
    )

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error("Get marking tasks error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST submit manual mark
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
    const { attempt_id, question_id, marks_obtained, max_marks, feedback } = body

    if (!attempt_id || !question_id || marks_obtained === undefined || !max_marks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await submitManualMark(
      attempt_id,
      question_id,
      marks_obtained,
      max_marks,
      admin.id,
      feedback
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Submit mark error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
