"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<{ fullName: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Pages that don't need the sidebar layout
  const publicPages = ["/admin/login", "/admin/signup"]
  const isPublicPage = publicPages.includes(pathname)

  useEffect(() => {
    if (isPublicPage) {
      setLoading(false)
      return
    }

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
  }, [router, pathname, isPublicPage])

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (err) {
      console.log("[v0] Logout error:", err)
    }
  }

  // Public pages render without sidebar
  if (isPublicPage) {
    return <>{children}</>
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar admin={admin} onLogout={handleLogout} />
      <main className="lg:pl-64 min-h-screen transition-all duration-200">
        {children}
      </main>
    </div>
  )
}
