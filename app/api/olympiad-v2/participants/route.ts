import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/admin-auth"
import { getEditionParticipants } from "@/lib/olympiad-v2/enrollment"

// GET all participants for an edition
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
    const educationLevel = searchParams.get("educationLevel")
    const participantType = searchParams.get("participantType")

    if (!editionId) {
      return NextResponse.json({ error: "Edition ID required" }, { status: 400 })
    }

    const participants = await getEditionParticipants(
      parseInt(editionId),
      educationLevel || undefined,
      participantType as any
    )

    return NextResponse.json({ participants })
  } catch (error: any) {
    console.error("Get participants error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
