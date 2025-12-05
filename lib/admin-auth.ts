import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

export interface Admin {
  id: string
  email: string
  full_name: string
  created_at: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function loginAdmin(email: string, password: string): Promise<Admin | null> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT id, email, full_name, password_hash FROM admins WHERE email = ${email}
  `

  if (result.length === 0) return null

  const admin = result[0] as any
  const passwordValid = await verifyPassword(password, admin.password_hash)

  if (!passwordValid) return null

  return {
    id: admin.id,
    email: admin.email,
    full_name: admin.full_name,
    created_at: admin.created_at,
  }
}

export async function getAdminById(id: string): Promise<Admin | null> {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql`
    SELECT id, email, full_name, created_at FROM admins WHERE id = ${id}
  `

  if (result.length === 0) return null
  return result[0] as Admin
}

export async function createAdmin(email: string, password: string, fullName: string): Promise<Admin> {
  const sql = neon(process.env.DATABASE_URL!)
  const passwordHash = await hashPassword(password)

  const result = await sql`
    INSERT INTO admins (email, password_hash, full_name)
    VALUES (${email}, ${passwordHash}, ${fullName})
    RETURNING id, email, full_name, created_at
  `

  return result[0] as Admin
}

export async function verifyAdminToken(token: string): Promise<Admin | null> {
  try {
    // In a real app, verify JWT token here
    // For now, we'll treat the token as the admin ID
    return await getAdminById(token)
  } catch (error) {
    return null
  }
}
