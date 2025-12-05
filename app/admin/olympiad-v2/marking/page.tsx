"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function MarkingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/session")
        const data = await response.json()
        if (!response.ok || !data.admin) {
          router.push("/admin/login")
          return
        }
      } catch (err) {
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [router])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin/dashboard" className="text-sm text-primary-foreground/80 hover:text-primary-foreground mb-1 block">← Back</Link>
          <h1 className="text-2xl font-bold">Manual Marking & Moderation</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-card border rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Manual Marking Interface</h2>
          <p className="text-muted-foreground mb-4">Mark essays, file uploads, and structured questions</p>
          <p className="text-sm text-muted-foreground">Implementation: Use <code className="bg-muted px-2 py-1 rounded">getPendingMarkingTasks()</code> and <code className="bg-muted px-2 py-1 rounded">submitManualMark()</code></p>
        </div>
      </main>
    </div>
  )
}
