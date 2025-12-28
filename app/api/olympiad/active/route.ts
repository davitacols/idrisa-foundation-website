import { getActiveOlympiads } from "@/lib/olympiad"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const olympiads = await getActiveOlympiads()
    return NextResponse.json(olympiads)
  } catch (error) {
    console.error("[v0] Get active olympiads error:", error)
    return NextResponse.json({ error: "Failed to fetch active olympiads" }, { status: 500 })
  }
}
