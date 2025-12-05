import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/admin-auth"
import { runProgressionForEdition, getLeaderboard } from "@/lib/olympiad-v2/progression"

// GET leaderboard
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
    const educationLevel = searchParams.get("educationLevel")
    const limit = searchParams.get("limit")

    if (!editionId || !stageId) {
      return NextResponse.json(
        { error: "Edition ID and Stage ID required" },
        { status: 400 }
      )
    }

    const leaderboard = await getLeaderboard(
      parseInt(editionId),
      parseInt(stageId),
      educationLevel || undefined,
      limit ? parseInt(limit) : undefined
    )

    return NextResponse.json({ leaderboard })
  } catch (error: any) {
    console.error("Get leaderboard error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST run progression
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
    const { edition_id } = body

    if (!edition_id) {
      return NextResponse.json({ error: "Edition ID required" }, { status: 400 })
    }

    const result = await runProgressionForEdition(edition_id)

    return NextResponse.json({ result })
  } catch (error: any) {
    console.error("Run progression error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
