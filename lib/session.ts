import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface AdminSession {
  adminId: string
  email: string
  fullName: string
}

export async function createAdminSession(adminId: string, email: string, fullName: string) {
  const session: AdminSession = { adminId, email, fullName }
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
  const cookieStore = await cookies()
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as AdminSession
  } catch {
    return null
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
}
