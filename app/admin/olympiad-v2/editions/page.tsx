"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Edition {
  id: number
  name: string
  year: number
  theme?: string
  description?: string
  start_date: string
  end_date: string
  status: string
  min_age: number
  max_age: number
  created_at: string
  stats?: {
    total_participants: number
    total_stages: number
  }
}

interface Stage {
  stage_number: number
  stage_name: string
  stage_type: string
  start_date: string
  end_date: string
  pass_percentage?: number
  pass_count?: number
}

export default function EditionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [editions, setEditions] = useState<Edition[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInitDb, setShowInitDb] = useState(false)
  const [initDbLoading, setInitDbLoading] = useState(false)
  const [initDbMessage, setInitDbMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    theme: "",
    description: "",
    start_date: "",
    end_date: "",
    min_age: 10,
    max_age: 18,
    stages: [
      { stage_number: 1, stage_name: "Online Quiz", stage_type: "ONLINE_QUIZ", start_date: "", end_date: "", pass_percentage: 70 },
      { stage_number: 2, stage_name: "Online Theory", stage_type: "ONLINE_THEORY", start_date: "", end_date: "", pass_percentage: 60 },
      { stage_number: 3, stage_name: "Online Practical", stage_type: "ONLINE_PRACTICAL", start_date: "", end_date: "", pass_count: 50 },
      { stage_number: 4, stage_name: "Final Physical", stage_type: "FINAL_PHYSICAL", start_date: "", end_date: "" }
    ] as Stage[]
  })

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/admin/session")
      const data = await response.json()
      if (!response.ok || !data.admin) {
        router.push("/admin/login")
        return
      }
      await loadEditions()
    } catch (err) {
      router.push("/admin/login")
    }
  }

  const loadEditions = async () => {
    try {
      const response = await fetch("/api/olympiad-v2/editions")
      if (response.ok) {
        const data = await response.json()
        setEditions(data.editions || [])
      }
    } catch (err) {
      console.error("Load editions error:", err)
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    setInitDbLoading(true)
    setInitDbMessage("")
    try {
      const response = await fetch("/api/olympiad-v2/init-db", { method: "POST" })
      const data = await response.json()
      if (response.ok) {
        setInitDbMessage("✅ Database tables created successfully!")
        setTimeout(() => setShowInitDb(false), 2000)
      } else {
        setInitDbMessage(`❌ Error: ${data.error || "Failed to create tables"}`)
      }
    } catch (err: any) {
      setInitDbMessage(`❌ Error: ${err.message}`)
    } finally {
      setInitDbLoading(false)
    }
  }

  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/olympiad-v2/editions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setShowCreateModal(false)
        await loadEditions()
        // Reset form
        setFormData({
          name: "",
          year: new Date().getFullYear(),
          theme: "",
          description: "",
          start_date: "",
          end_date: "",
          min_age: 10,
          max_age: 18,
          stages: [
            { stage_number: 1, stage_name: "Online Quiz", stage_type: "ONLINE_QUIZ", start_date: "", end_date: "", pass_percentage: 70 },
            { stage_number: 2, stage_name: "Online Theory", stage_type: "ONLINE_THEORY", start_date: "", end_date: "", pass_percentage: 60 },
            { stage_number: 3, stage_name: "Online Practical", stage_type: "ONLINE_PRACTICAL", start_date: "", end_date: "", pass_count: 50 },
            { stage_number: 4, stage_name: "Final Physical", stage_type: "FINAL_PHYSICAL", start_date: "", end_date: "" }
          ]
        })
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleDeleteEdition = async (id: number) => {
    if (!confirm("Are you sure you want to delete this edition?")) return
    try {
      const response = await fetch(`/api/olympiad-v2/editions?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        await loadEditions()
      }
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "PUBLISHED": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "COMPLETED": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "DRAFT": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default: return "bg-gray-100 text-gray-800"
    }
  }

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
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/admin/dashboard" className="text-sm text-white/80 hover:text-white mb-2 block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-4xl">🎯</span>
                Olympiad Editions
              </h1>
              <p className="text-white/80 mt-1">Manage olympiad editions and stages</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowInitDb(true)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                🔧 Initialize DB
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-blue-600 hover:bg-white/90 font-semibold"
              >
                + Create Edition
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{editions.length}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Total Editions</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {editions.filter(e => e.status === "ACTIVE").length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Active</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {editions.filter(e => e.status === "DRAFT").length}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Drafts</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {editions.filter(e => e.status === "COMPLETED").length}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Completed</div>
          </div>
        </div>

        {/* Editions List */}
        {editions.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">No Editions Yet</h3>
            <p className="text-muted-foreground mb-6">Create your first Olympiad V2 edition to get started</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create First Edition
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {editions.map((edition) => (
              <div key={edition.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">{edition.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(edition.status)}`}>
                        {edition.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {edition.year}
                      </span>
                    </div>
                    {edition.theme && (
                      <p className="text-sm text-muted-foreground mb-2">🎨 {edition.theme}</p>
                    )}
                    {edition.description && (
                      <p className="text-sm text-muted-foreground mb-3">{edition.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">📅 Start:</span>
                        <span className="font-medium">{new Date(edition.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">📅 End:</span>
                        <span className="font-medium">{new Date(edition.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">👥 Age:</span>
                        <span className="font-medium">{edition.min_age}-{edition.max_age} years</span>
                      </div>
                      {edition.stats && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">👨‍🎓 Participants:</span>
                            <span className="font-medium">{edition.stats.total_participants}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">📊 Stages:</span>
                            <span className="font-medium">{edition.stats.total_stages}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleDeleteEdition(edition.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Initialize DB Modal */}
      {showInitDb && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Initialize Database</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will create all the necessary tables for Olympiad V2 in your database. Run this only once.
            </p>
            {initDbMessage && (
              <div className="bg-muted p-3 rounded mb-4 text-sm">
                {initDbMessage}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowInitDb(false)}
                disabled={initDbLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={initializeDatabase}
                disabled={initDbLoading}
                className="bg-primary text-primary-foreground"
              >
                {initDbLoading ? "Initializing..." : "Initialize Now"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Edition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-lg p-6 max-w-4xl w-full my-8">
            <h3 className="text-2xl font-bold mb-6">Create New Edition</h3>
            <form onSubmit={handleCreateEdition}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Edition Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="e.g., STEM Olympiad 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Year *</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="e.g., Innovation for Sustainability"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    rows={3}
                    placeholder="Brief description of the olympiad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Min Age</label>
                  <input
                    type="number"
                    value={formData.min_age}
                    onChange={(e) => setFormData({ ...formData, min_age: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Age</label>
                  <input
                    type="number"
                    value={formData.max_age}
                    onChange={(e) => setFormData({ ...formData, max_age: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold mb-3">Stages Configuration</h4>
                <div className="space-y-3">
                  {formData.stages.map((stage, index) => (
                    <div key={index} className="bg-muted p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Stage Name</label>
                          <input
                            type="text"
                            value={stage.stage_name}
                            onChange={(e) => {
                              const newStages = [...formData.stages]
                              newStages[index].stage_name = e.target.value
                              setFormData({ ...formData, stages: newStages })
                            }}
                            className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Type</label>
                          <select
                            value={stage.stage_type}
                            onChange={(e) => {
                              const newStages = [...formData.stages]
                              newStages[index].stage_type = e.target.value
                              setFormData({ ...formData, stages: newStages })
                            }}
                            className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                          >
                            <option value="ONLINE_QUIZ">Online Quiz</option>
                            <option value="ONLINE_THEORY">Online Theory</option>
                            <option value="ONLINE_PRACTICAL">Online Practical</option>
                            <option value="FINAL_PHYSICAL">Final Physical</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Start Date</label>
                          <input
                            type="date"
                            value={stage.start_date}
                            onChange={(e) => {
                              const newStages = [...formData.stages]
                              newStages[index].start_date = e.target.value
                              setFormData({ ...formData, stages: newStages })
                            }}
                            className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">End Date</label>
                          <input
                            type="date"
                            value={stage.end_date}
                            onChange={(e) => {
                              const newStages = [...formData.stages]
                              newStages[index].end_date = e.target.value
                              setFormData({ ...formData, stages: newStages })
                            }}
                            className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  Create Edition
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
