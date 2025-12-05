import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/admin-auth"
import { 
  createEdition, 
  getAllEditions, 
  updateEdition, 
  deleteEdition,
  getEditionStatistics 
} from "@/lib/olympiad-v2/editions"

// GET all editions
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
    const status = searchParams.get("status")
    const year = searchParams.get("year")

    const editions = await getAllEditions({
      status: status as any,
      year: year ? parseInt(year) : undefined
    })

    // Get stats for each edition
    const editionsWithStats = await Promise.all(
      editions.map(async (edition) => {
        const stats = await getEditionStatistics(edition.id)
        return { ...edition, stats }
      })
    )

    return NextResponse.json({ editions: editionsWithStats })
  } catch (error: any) {
    console.error("Get editions error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST create new edition
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
    const { name, year, theme, description, start_date, end_date, min_age, max_age, stages } = body

    // Validate required fields
    if (!name || !year || !start_date || !end_date || !stages || stages.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const edition = await createEdition(admin.id, {
      name,
      year,
      enrollment_start: start_date,
      enrollment_end: end_date,
      theme,
      description
    })

    return NextResponse.json({ edition }, { status: 201 })
  } catch (error: any) {
    console.error("Create edition error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update edition
export async function PUT(request: Request) {
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Edition ID required" }, { status: 400 })
    }

    const edition = await updateEdition(id, updates)

    return NextResponse.json({ edition })
  } catch (error: any) {
    console.error("Update edition error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE edition
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
      return NextResponse.json({ error: "Edition ID required" }, { status: 400 })
    }

    await deleteEdition(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete edition error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
