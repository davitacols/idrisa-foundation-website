import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/admin-auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET venues or results
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
    const type = searchParams.get("type") // 'venues' or 'results'
    const editionId = searchParams.get("editionId")

    if (type === "venues") {
      const venues = await sql`
        SELECT 
          fv.*,
          (SELECT COUNT(*) FROM final_attendance WHERE venue_id = fv.id) as registered_count,
          (SELECT COUNT(*) FROM final_attendance WHERE venue_id = fv.id AND attended = true) as attended_count
        FROM final_venues fv
        WHERE fv.edition_id = ${editionId}
        ORDER BY fv.event_date, fv.venue_name
      `
      return NextResponse.json({ venues })
    } else if (type === "results") {
      const results = await sql`
        SELECT 
          fr.*,
          p.education_level,
          p.class_level,
          CASE 
            WHEN p.participant_type = 'SELF' THEN part.full_name
            WHEN p.participant_type = 'MINOR' THEN mp.full_name
          END as participant_name,
          fv.venue_name
        FROM final_results fr
        JOIN participants_v2 p ON fr.participant_v2_id = p.id
        LEFT JOIN participants part ON p.participant_id = part.id
        LEFT JOIN minor_profiles mp ON p.minor_id = mp.id
        LEFT JOIN final_venues fv ON fr.venue_id = fv.id
        WHERE p.edition_id = ${editionId}
        ORDER BY fr.final_rank NULLS LAST
      `
      return NextResponse.json({ results })
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
  } catch (error: any) {
    console.error("Get finals data error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST create venue or record result
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
    const { type } = body

    if (type === "venue") {
      const { edition_id, venue_name, venue_address, district, capacity, event_date, event_time } = body

      const venue = await sql`
        INSERT INTO final_venues (edition_id, venue_name, venue_address, district, capacity, event_date, event_time)
        VALUES (${edition_id}, ${venue_name}, ${venue_address}, ${district}, ${capacity}, ${event_date}, ${event_time})
        RETURNING *
      `

      return NextResponse.json({ venue: venue[0] }, { status: 201 })
    } else if (type === "result") {
      const { participant_v2_id, venue_id, final_score, final_rank, award, remarks } = body

      const result = await sql`
        INSERT INTO final_results (participant_v2_id, venue_id, final_score, final_rank, award, remarks)
        VALUES (${participant_v2_id}, ${venue_id}, ${final_score}, ${final_rank}, ${award}, ${remarks})
        ON CONFLICT (participant_v2_id) 
        DO UPDATE SET 
          venue_id = EXCLUDED.venue_id,
          final_score = EXCLUDED.final_score,
          final_rank = EXCLUDED.final_rank,
          award = EXCLUDED.award,
          remarks = EXCLUDED.remarks,
          recorded_at = NOW()
        RETURNING *
      `

      return NextResponse.json({ result: result[0] }, { status: 201 })
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
  } catch (error: any) {
    console.error("Create finals data error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update attendance
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
    const { participant_v2_id, venue_id, attended } = body

    const attendance = await sql`
      INSERT INTO final_attendance (participant_v2_id, venue_id, attended, checked_in_at)
      VALUES (${participant_v2_id}, ${venue_id}, ${attended}, ${attended ? 'NOW()' : null})
      ON CONFLICT (participant_v2_id, venue_id)
      DO UPDATE SET 
        attended = EXCLUDED.attended,
        checked_in_at = CASE WHEN EXCLUDED.attended THEN NOW() ELSE NULL END
      RETURNING *
    `

    return NextResponse.json({ attendance: attendance[0] })
  } catch (error: any) {
    console.error("Update attendance error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
