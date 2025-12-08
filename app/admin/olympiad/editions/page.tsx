"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Calendar,
  Users,
  Trophy,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Settings,
  ChevronDown,
  Search,
  Filter,
} from "lucide-react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
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
    loadEditions()
  }, [])

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
        setInitDbMessage("Database tables created successfully!")
        setTimeout(() => setShowInitDb(false), 2000)
      } else {
        setInitDbMessage(`Error: ${data.error || "Failed to create tables"}`)
      }
    } catch (err: any) {
      setInitDbMessage(`Error: ${err.message}`)
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
        resetForm()
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const resetForm = () => {
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
  }

  const handleDeleteEdition = async (id: number) => {
    if (!confirm("Are you sure you want to delete this edition? This action cannot be undone.")) return
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
      case "ACTIVE": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "PUBLISHED": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "COMPLETED": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
      case "DRAFT": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const filteredEditions = editions.filter(edition => {
    const matchesSearch = edition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edition.theme?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || edition.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            Olympiad Editions
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage olympiad editions</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowInitDb(true)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Initialize DB
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Edition
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{editions.length}</div>
              <div className="text-xs text-muted-foreground">Total Editions</div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{editions.filter(e => e.status === "ACTIVE").length}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Edit className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{editions.filter(e => e.status === "DRAFT").length}</div>
              <div className="text-xs text-muted-foreground">Drafts</div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{editions.reduce((acc, e) => acc + (e.stats?.total_participants || 0), 0)}</div>
              <div className="text-xs text-muted-foreground">Participants</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search editions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-border rounded-lg bg-background appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PUBLISHED">Published</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Editions List */}
      {filteredEditions.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Editions Found</h3>
          <p className="text-muted-foreground mb-6">
            {editions.length === 0 
              ? "Create your first olympiad edition to get started"
              : "No editions match your search criteria"}
          </p>
          {editions.length === 0 && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Edition
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEditions.map((edition) => (
            <div key={edition.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold truncate">{edition.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(edition.status)}`}>
                      {edition.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {edition.year}
                    </span>
                  </div>
                  {edition.theme && (
                    <p className="text-sm text-muted-foreground mb-3">{edition.theme}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(edition.start_date).toLocaleDateString()} - {new Date(edition.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Ages {edition.min_age}-{edition.max_age}</span>
                    </div>
                    {edition.stats && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{edition.stats.total_participants} participants</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => handleDeleteEdition(edition.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Initialize DB Modal */}
      {showInitDb && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-2">Initialize Database</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will create all necessary tables for the Olympiad system. Run this only once.
            </p>
            {initDbMessage && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${initDbMessage.includes("Error") ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                {initDbMessage}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowInitDb(false)} disabled={initDbLoading}>
                Cancel
              </Button>
              <Button onClick={initializeDatabase} disabled={initDbLoading}>
                {initDbLoading ? "Initializing..." : "Initialize Now"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Edition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl p-6 max-w-4xl w-full my-8 shadow-xl">
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
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., Innovation for Sustainability"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Min Age</label>
                  <input
                    type="number"
                    value={formData.min_age}
                    onChange={(e) => setFormData({ ...formData, min_age: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Age</label>
                  <input
                    type="number"
                    value={formData.max_age}
                    onChange={(e) => setFormData({ ...formData, max_age: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold mb-3">Stages Configuration</h4>
                <div className="space-y-3">
                  {formData.stages.map((stage, index) => (
                    <div key={index} className="bg-muted/50 border border-border p-4 rounded-lg">
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
                            className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                            className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                            className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                            className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
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
