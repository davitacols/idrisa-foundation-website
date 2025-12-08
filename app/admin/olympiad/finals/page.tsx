"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Award, MapPin, Users, Trophy, Plus, Calendar } from "lucide-react"

export default function FinalsPage() {
  const [venues, setVenues] = useState<any[]>([])

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Award className="w-8 h-8 text-primary" />
            Finals Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage venues, attendance, and awards</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Venue
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{venues.length}</div>
              <div className="text-xs text-muted-foreground">Venues</div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">Finalists</div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">Events</div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">Awards</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
        <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Finals Configured</h3>
        <p className="text-muted-foreground mb-6">Add venues and configure final events for your olympiad</p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add First Venue
        </Button>
      </div>
    </div>
  )
}
