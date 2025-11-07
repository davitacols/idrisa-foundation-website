import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

export interface Guardian {
  id: string
  email: string
  full_name: string
  phone_number: string
}

export interface Participant {
  id: string
  full_name: string
  education_level: "Primary" | "O-level" | "A-level"
  date_of_birth: string
  class: string
  school_name: string
  district: string
  guardian_id: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createGuardian(
  email: string,
  password: string,
  fullName: string,
  relationship: string,
  occupation: string,
  address: string,
  phoneNumber: string,
): Promise<Guardian> {
  const sql = neon(process.env.DATABASE_URL!)
  const passwordHash = await hashPassword(password)

  const result = await sql`
    INSERT INTO guardians (email, password_hash, full_name, relationship, occupation, address, phone_number)
    VALUES (${email}, ${passwordHash}, ${fullName}, ${relationship}, ${occupation}, ${address}, ${phoneNumber})
    RETURNING id, email, full_name, phone_number
  `

  if (result.length === 0) throw new Error("Failed to create guardian")
  return result[0] as Guardian
}

export async function loginGuardian(email: string, password: string): Promise<Guardian | null> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT id, email, full_name, password_hash, phone_number FROM guardians WHERE email = ${email}
  `

  if (result.length === 0) return null

  const guardian = result[0] as any
  const passwordValid = await verifyPassword(password, guardian.password_hash)

  if (!passwordValid) return null

  return {
    id: guardian.id,
    email: guardian.email,
    full_name: guardian.full_name,
    phone_number: guardian.phone_number,
  }
}

export async function getGuardianById(id: string): Promise<Guardian | null> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT id, email, full_name, phone_number FROM guardians WHERE id = ${id}
  `

  if (result.length === 0) return null
  return result[0] as Guardian
}

export async function createParticipant(
  guardianId: string,
  fullName: string,
  educationLevel: "Primary" | "O-level" | "A-level",
  dateOfBirth: Date,
  studentClass: string,
  schoolName: string,
  district: string,
  photoUrl?: string,
  schoolIdFrontUrl?: string,
  schoolIdBackUrl?: string,
): Promise<Participant> {
  const sql = neon(process.env.DATABASE_URL!)
  // Validate age based on education level
  const today = new Date()
  const age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate()) ? age - 1 : age

  if (educationLevel === "Primary" && (finalAge < 10 || finalAge > 14)) {
    throw new Error("Primary students must be aged 10-14")
  }
  if (educationLevel === "O-level" && (finalAge < 12 || finalAge > 18)) {
    throw new Error("O-level students must be aged 12-18")
  }
  if (educationLevel === "A-level" && (finalAge < 16 || finalAge > 21)) {
    throw new Error("A-level students must be aged 16-21")
  }

  const result = await sql`
    INSERT INTO participants (
      guardian_id, full_name, education_level, date_of_birth, class, 
      school_name, district, photo_url, school_id_front_url, school_id_back_url
    )
    VALUES (
      ${guardianId}, ${fullName}, ${educationLevel}, ${dateOfBirth.toISOString().split("T")[0]}, ${studentClass},
      ${schoolName}, ${district}, ${photoUrl || null}, ${schoolIdFrontUrl || null}, ${schoolIdBackUrl || null}
    )
    RETURNING *
  `

  if (result.length === 0) throw new Error("Failed to create participant")
  return result[0] as Participant
}

export async function getParticipantById(id: string): Promise<Participant | null> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT * FROM participants WHERE id = ${id}
  `

  if (result.length === 0) return null
  return result[0] as Participant
}

export async function getParticipantsByGuardian(guardianId: string): Promise<Participant[]> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT * FROM participants WHERE guardian_id = ${guardianId}
  `

  return result as Participant[]
}
