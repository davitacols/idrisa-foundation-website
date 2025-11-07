import { neon } from "@neondatabase/serverless"

export interface Olympiad {
  id: string
  name: string
  theme: string
  starting_date: string
  closing_date: string
  venue?: string
  admin_id: string
  created_at: string
  updated_at: string
}

export interface OlympiadPhase {
  id: string
  olympiad_id: string
  phase: "Preparation" | "Quiz" | "Bronze" | "Silver" | "Golden Finale"
  phase_number: number
  start_date: string
  end_date: string
}

export async function createOlympiad(
  adminId: string,
  name: string,
  theme: string,
  startingDate: Date,
  closingDate: Date,
  venue: string,
): Promise<Olympiad> {
  const sql = neon(process.env.DATABASE_URL!)
  // Validate date range (3-5 months = 90-150 days)
  const daysDiff = Math.floor((closingDate.getTime() - startingDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff < 90 || daysDiff > 150) {
    throw new Error("Dates must be 3-5 months (90-150 days) apart")
  }

  const result = await sql`
    INSERT INTO olympiads (admin_id, name, theme, starting_date, closing_date, venue)
    VALUES (${adminId}, ${name}, ${theme}, ${startingDate.toISOString()}, ${closingDate.toISOString()}, ${venue})
    RETURNING *
  `

  if (result.length === 0) throw new Error("Failed to create olympiad")

  const olympiad = result[0] as any

  // Create 5 equal phases
  const totalMs = closingDate.getTime() - startingDate.getTime()
  const phaseLengthMs = totalMs / 5

  const phaseNames: ("Preparation" | "Quiz" | "Bronze" | "Silver" | "Golden Finale")[] = [
    "Preparation",
    "Quiz",
    "Bronze",
    "Silver",
    "Golden Finale",
  ]

  for (let i = 0; i < 5; i++) {
    const phaseStart = new Date(startingDate.getTime() + i * phaseLengthMs)
    const phaseEnd = new Date(startingDate.getTime() + (i + 1) * phaseLengthMs)

    await sql`
      INSERT INTO olympiad_phases (olympiad_id, phase, phase_number, start_date, end_date)
      VALUES (${olympiad.id}, ${phaseNames[i]}, ${i + 1}, ${phaseStart.toISOString()}, ${phaseEnd.toISOString()})
    `
  }

  return olympiad
}

export async function getOlympiadsByAdmin(adminId: string): Promise<Olympiad[]> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT * FROM olympiads WHERE admin_id = ${adminId}
    ORDER BY created_at DESC
  `
  return result as Olympiad[]
}

export async function getOlympiadById(id: string): Promise<Olympiad | null> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT * FROM olympiads WHERE id = ${id}
  `
  return result.length > 0 ? (result[0] as Olympiad) : null
}

export async function getOlympiadPhases(olympiadId: string): Promise<OlympiadPhase[]> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT * FROM olympiad_phases WHERE olympiad_id = ${olympiadId}
    ORDER BY phase_number ASC
  `
  return result as OlympiadPhase[]
}

export async function getAllOlympiaads(): Promise<Olympiad[]> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT * FROM olympiads ORDER BY created_at DESC
  `
  return result as Olympiad[]
}
