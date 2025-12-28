"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { Olympiad } from "@/lib/olympiad"

const educationLevels = [
  {
    name: "Primary",
    ages: "9–15 years",
    subjects: ["Math", "Science", "ICT"],
    classes: ["P.4", "P.5", "P.6", "P.7"],
  },
  {
    name: "O’Level",
    ages: "11–18 years",
    subjects: ["Math", "Biology", "Chemistry", "Physics", "ICT", "Agriculture"],
    classes: ["S.1", "S.2", "S.3", "S.4"],
  },
  {
    name: "A’Level",
    ages: "15–21 years",
    subjects: ["Math", "Biology", "Chemistry", "Physics", "ICT", "Agriculture"],
    classes: ["S.5", "S.6"],
  },
]

const stages = [
  {
    name: "Beginner",
    description: "Quiz-style screening with MCQ, multiple-select, T/F, or short answers for all enrolled subjects.",
    progression: "Need ≥70% to reach Theory.",
  },
  {
    name: "Theory",
    description: "Written theory exam with structured and essay responses.",
    progression: "Need ≥60% and stay in the top 50% to reach Practical.",
  },
  {
    name: "Practical",
    description: "Hands-on online practical tasks (uploads, auto-graded parts, descriptive answers).",
    progression: "Need ≥60% and stay in the top 40% to reach the Final.",
  },
  {
    name: "Final",
    description: "Physical finale at an admin-chosen venue with manual scoring and rankings.",
    progression: "Admin enters scores and publishes winners.",
  },
]

export default function OlympiadPage() {
  const [activeOlympiad, setActiveOlympiad] = useState<Olympiad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [eligibilityResult, setEligibilityResult] = useState("")

  useEffect(() => {
    const fetchActiveOlympiad = async () => {
      try {
        const response = await fetch("/api/olympiad/active")
        if (!response.ok) {
          throw new Error("Failed to fetch active Olympiad")
        }
        const data = await response.json()
        if (data.length > 0) {
          setActiveOlympiad(data[0])
          setSelectedLevel(educationLevels[0].name)
          setSelectedClass(educationLevels[0].classes[0])
        }
      } catch (err) {
        setError("Could not load Olympiad information. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchActiveOlympiad()
  }, [])

  const handleEligibilityCheck = () => {
    if (!activeOlympiad) {
      setEligibilityResult("No active Olympiad found.")
      return
    }

    const level = educationLevels.find((l) => l.name === selectedLevel)
    if (!level || !level.classes.includes(selectedClass)) {
      setEligibilityResult("Invalid level or class selected.")
      return
    }

    // This is a simplified check. A more robust implementation would check age against the edition's age rules.
    setEligibilityResult(`You are eligible to participate in the ${selectedLevel} level Olympiad for class ${selectedClass}.`)
  }

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value)
    const level = educationLevels.find((l) => l.name === value)
    if (level && level.classes.length > 0) {
      setSelectedClass(level.classes[0])
    }
    setEligibilityResult("")
  }

  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <section className="text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-primary">STEM Olympiad</p>
            <h1 className="text-5xl font-bold">Competitive STEM Excellence Program</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Designed for students who want to challenge themselves through competitive STEM competitions.
              Test your knowledge, compete with peers nationwide, and showcase your scientific excellence.
            </p>
            <div className="flex justify-center pt-2">
              <Link href="/participant/signup">
                <Button size="lg">Register for Olympiad</Button>
              </Link>
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Check Your Eligibility</p>
              <h2 className="text-3xl font-bold">Are you ready to compete?</h2>
              <p className="text-muted-foreground max-w-3xl">
                Select your education level and class to see if you are eligible for the current Olympiad.
              </p>
            </div>
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : !activeOlympiad ? (
              <div className="text-center">There are no active Olympiads at the moment. Please check back later.</div>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Education Level</label>
                    <Select value={selectedLevel} onValueChange={handleLevelChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((level) => (
                          <SelectItem key={level.name} value={level.name}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Class</label>
                    <Select
                      value={selectedClass}
                      onValueChange={(value) => {
                        setSelectedClass(value)
                        setEligibilityResult("")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels
                          .find((l) => l.name === selectedLevel)
                          ?.classes.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="self-end">
                    <Button onClick={handleEligibilityCheck} className="w-full">
                      Check Eligibility
                    </Button>
                  </div>
                </div>
                {eligibilityResult && (
                  <div className="mt-4 p-4 rounded-lg bg-muted text-center">
                    <p className="font-semibold">{eligibilityResult}</p>
                    {eligibilityResult.includes("eligible") && (
                      <Link href="/participant/signup" className="mt-2 inline-block">
                        <Button variant="secondary">Proceed to Registration</Button>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Stages</p>
              <h2 className="text-3xl font-bold">Four-stage journey to excellence</h2>
              <p className="text-muted-foreground max-w-3xl">
                Each participant progresses through stages, with eligibility recomputed based on performance.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {stages.map((stage) => (
                <div key={stage.name} className="border border-border rounded-lg p-5 bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{stage.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{stage.progression}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Levels & Subjects</p>
              <h2 className="text-3xl font-bold">Education Coverage</h2>
              <p className="text-muted-foreground max-w-3xl">
                The Olympiad is open to students in Primary, O'Level, and A'Level.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {educationLevels.map((level) => (
                <div key={level.name} className="border border-border rounded-lg p-5 bg-background">
                  <h3 className="text-xl font-semibold">{level.name}</h3>
                  <p className="text-sm text-muted-foreground">Ages: {level.ages}</p>
                  <ul className="mt-3 space-y-1 text-muted-foreground text-sm list-disc list-inside">
                    {level.subjects.map((subject) => (
                      <li key={subject}>{subject}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-primary text-primary-foreground rounded-2xl p-10 text-center shadow-lg">
            <h2 className="text-3xl font-bold mb-3">Ready to launch the Olympiad?</h2>
            <p className="text-lg mb-6 text-primary-foreground/90 max-w-2xl mx-auto">
              Enroll now, pick an edition, and choose your subjects.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/participant/signup">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">Enroll now</Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
