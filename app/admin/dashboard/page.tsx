"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
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

        setAdmin(data.admin)
      } catch (err) {
        console.log("[v0] Session check error:", err)
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (err) {
      console.log("[v0] Logout error:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-primary-foreground/80">The Idrisa Foundation</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{admin?.fullName}</p>
              <p className="text-sm text-primary-foreground/80">{admin?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-primary border-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Welcome, {admin?.fullName}!</h2>
          <p className="text-muted-foreground">Manage olympiads, questions, and competitions</p>
        </div>

        {/* Olympiad V2 Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-primary">🚀 Olympiad V2 (New System)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Link href="/admin/olympiad-v2/editions">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-2">Editions</h3>
                <p className="text-muted-foreground">Manage olympiad editions with advanced features</p>
              </div>
            </Link>

            <Link href="/admin/olympiad-v2/participants">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-300 dark:border-green-700 rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                <div className="text-3xl mb-4">👥</div>
                <h3 className="text-xl font-bold mb-2">Participants</h3>
                <p className="text-muted-foreground">View enrollments (self & minors)</p>
              </div>
            </Link>

            <Link href="/admin/olympiad-v2/exams">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                <div className="text-3xl mb-4">📝</div>
                <h3 className="text-xl font-bold mb-2">Exams</h3>
                <p className="text-muted-foreground">Configure exams for all stages</p>
              </div>
            </Link>

            <Link href="/admin/olympiad-v2/marking">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                <div className="text-3xl mb-4">✅</div>
                <h3 className="text-xl font-bold mb-2">Marking</h3>
                <p className="text-muted-foreground">Manual marking & moderation</p>
              </div>
            </Link>

            <Link href="/admin/olympiad-v2/progression">
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-2 border-pink-300 dark:border-pink-700 rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                <div className="text-3xl mb-4">📈</div>
                <h3 className="text-xl font-bold mb-2">Progression</h3>
                <p className="text-muted-foreground">Compute rankings & eligibility</p>
              </div>
            </Link>

            <Link href="/admin/olympiad-v2/finals">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="text-xl font-bold mb-2">Finals</h3>
                <p className="text-muted-foreground">Venues, attendance & awards</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Legacy System Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-muted-foreground">Legacy System (V1)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Link href="/admin/olympiad/create">
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition cursor-pointer opacity-75">
                <div className="text-3xl mb-4">🎓</div>
                <h3 className="text-xl font-bold mb-2">Create Olympiad</h3>
                <p className="text-muted-foreground">Set up a new STEM Olympiad competition</p>
              </div>
            </Link>

            <Link href="/admin/question-bank">
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition cursor-pointer opacity-75">
                <div className="text-3xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">Question Bank</h3>
                <p className="text-muted-foreground">Create and manage exam questions</p>
              </div>
            </Link>

            <Link href="/admin/olympiads">
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition cursor-pointer opacity-75">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-2">Manage Olympiads</h3>
                <p className="text-muted-foreground">View and manage all olympiads</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Getting Started</h3>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong>1. Create an Olympiad:</strong> Start by creating a new olympiad with a name, theme, starting
              date, and closing date. The system will automatically divide the timeline into 5 phases.
            </p>
            <p>
              <strong>2. Build Question Bank:</strong> Add questions for each subject and education level. Questions are
              categorized by type (Quiz, Theory, Practical) and difficulty level.
            </p>
            <p>
              <strong>3. Monitor Competition:</strong> Track participant progress as they move through each phase. The
              system automatically eliminates participants based on scoring criteria.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
