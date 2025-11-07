import { cookies } from "next/headers"
import { jwtVerify } from "@/lib/jose"
import { SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface ParticipantSession {
  guardianId: string
  email: string
  fullName: string
}

export async function createParticipantSession(guardianId: string, email: string, fullName: string) {
  const session: ParticipantSession = { guardianId, email, fullName }
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret)
  const cookieStore = await cookies()
  cookieStore.set("participant_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function getParticipantSession(): Promise<ParticipantSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("participant_session")?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as ParticipantSession
  } catch {
    return null
  }
}

export async function clearParticipantSession() {
  const cookieStore = await cookies()
  cookieStore.delete("participant_session")
}
