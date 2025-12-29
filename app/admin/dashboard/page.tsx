"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Trophy,
  Users,
  FileText,
  CheckSquare,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Clock,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  totalEditions: number
  activeEditions: number
  totalParticipants: number
  totalQuestions: number
  recentActivity: {
    type: string
    message: string
    time: string
  }[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalEditions: 0,
    activeEditions: 0,
    totalParticipants: 0,
    totalQuestions: 0,
    recentActivity: [],
  })
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
        await loadStats()
      } catch (err) {
        console.log("[v0] Session check error:", err)
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  const loadStats = async () => {
    try {
      // Load editions stats
      const editionsRes = await fetch("/api/olympiad-v2/editions")
      if (editionsRes.ok) {
        const data = await editionsRes.json()
        const editions = data.editions || []
        setStats((prev) => ({
          ...prev,
          totalEditions: editions.length,
          activeEditions: editions.filter((e: any) => e.status === "ACTIVE").length,
        }))
      }
    } catch (err) {
      console.log("Stats load error:", err)
    }
  }

  if (loading) {
    return null // Layout handles loading
  }

  const quickActions = [
    {
      title: "Editions",
      description: "Manage olympiad editions",
      href: "/admin/olympiad/editions",
      icon: Trophy,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Participants",
      description: "View all enrollments",
      href: "/admin/olympiad/participants",
      icon: Users,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Exams",
      description: "Configure exams",
      href: "/admin/olympiad/exams",
      icon: FileText,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Marking",
      description: "Mark & moderate",
      href: "/admin/olympiad/marking",
      icon: CheckSquare,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Progression",
      description: "Rankings & eligibility",
      href: "/admin/olympiad/progression",
      icon: TrendingUp,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950",
    },
    {
      title: "Finals",
      description: "Venues & awards",
      href: "/admin/olympiad/finals",
      icon: Award,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
  ]

  const statCards = [
    {
      title: "Total Editions",
      value: stats.totalEditions,
      change: "+2",
      changeType: "positive",
      icon: Trophy,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Active Editions",
      value: stats.activeEditions,
      change: stats.activeEditions > 0 ? "Live" : "None",
      changeType: stats.activeEditions > 0 ? "positive" : "neutral",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Total Participants",
      value: stats.totalParticipants,
      change: "+15%",
      changeType: "positive",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Questions in Bank",
      value: stats.totalQuestions,
      change: "Ready",
      changeType: "neutral",
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {admin?.fullName?.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your olympiad today.
            </p>
          </div>
          <Link href="/admin/olympiad/editions">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Edition
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : stat.changeType === "negative"
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                {stat.changeType === "positive" && <ArrowUpRight className="w-3 h-3" />}
                {stat.changeType === "negative" && <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Olympiad Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div
                className={`${action.bgColor} border border-border rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer h-full`}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}
                >
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm">{action.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all
            </Button>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Activity will appear here as participants engage
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link
              href="/admin/question-bank"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Question Bank</p>
                <p className="text-xs text-muted-foreground">Manage questions</p>
              </div>
            </Link>
            <Link
              href="/admin/question-bank/add"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Plus className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Add Questions</p>
                <p className="text-xs text-muted-foreground">Create new questions</p>
              </div>
            </Link>
            <Link
              href="/admin/olympiad/editions"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">All Editions</p>
                <p className="text-xs text-muted-foreground">View all olympiads</p>
              </div>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Target className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Settings</p>
                <p className="text-xs text-muted-foreground">Configure system</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Getting Started Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/50 rounded-lg p-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mb-3">
              1
            </div>
            <h3 className="font-medium mb-1">Create an Edition</h3>
            <p className="text-sm text-muted-foreground">
              Set up a new olympiad with name, dates, and stages configuration.
            </p>
          </div>
          <div className="bg-card/50 rounded-lg p-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mb-3">
              2
            </div>
            <h3 className="font-medium mb-1">Build Question Bank</h3>
            <p className="text-sm text-muted-foreground">
              Add questions by subject and level. Configure exams for each stage.
            </p>
          </div>
          <div className="bg-card/50 rounded-lg p-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mb-3">
              3
            </div>
            <h3 className="font-medium mb-1">Monitor Progress</h3>
            <p className="text-sm text-muted-foreground">
              Track participants, mark exams, and manage progression to finals.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
