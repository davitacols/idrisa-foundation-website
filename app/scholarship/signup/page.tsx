"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const UGANDA_DISTRICTS = [
  "Kampala", "Wakiso", "Mukono", "Entebbe", "Mpigi", "Masaka", "Jinja", "Soroti", "Kigezi", 
  "Kabale", "Kanungu", "Kisoro", "Bundibugyo", "Kasese", "Kabarole", "Kyenjojo", "Kibale", 
  "Hoima", "Masindi", "Mubende", "Semliki", "Bunyoro", "Arua", "Nebbi", "Yumbe", "Pakwach", 
  "Moyo", "Adjumani", "Gulu", "Lira", "Pader", "Kitgum", "Moroto", "Napak", "Katakwi", 
  "Karenga", "Kaabong", "Kotido"
]

const SCHOLARSHIP_TYPES = [
  { id: "full-tuition", name: "Full Tuition Scholarship", description: "Complete tuition coverage" },
  { id: "partial", name: "Partial Scholarship", description: "50-75% tuition coverage" },
  { id: "excellence", name: "Excellence Award", description: "Merit-based recognition award" }
]

type Step = "personal" | "academic" | "financial" | "documents"

export default function ScholarshipSignup() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scholarshipType = searchParams.get("type") || "full-tuition"
  
  const [step, setStep] = useState<Step>("personal")
  const [personalData, setPersonalData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    district: "",
    nationalId: "",
    password: "",
    confirmPassword: "",
  })
  const [academicData, setAcademicData] = useState({
    currentSchool: "",
    educationLevel: "Secondary",
    currentClass: "",
    previousSchool: "",
    gpa: "",
    stemSubjects: "",
    achievements: "",
    teacherReference: "",
    teacherEmail: "",
    teacherPhone: "",
  })
  const [financialData, setFinancialData] = useState({
    familyIncome: "",
    familySize: "",
    parentsOccupation: "",
    financialStatement: "",
    specialCircumstances: "",
  })
  const [selectedScholarship, setSelectedScholarship] = useState(scholarshipType)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPersonalData({
      ...personalData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAcademicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAcademicData({
      ...academicData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFinancialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFinancialData({
      ...financialData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (personalData.password !== personalData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (personalData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    const requiredFields = ["fullName", "email", "phoneNumber", "dateOfBirth", "gender", "address", "district"]
    for (const field of requiredFields) {
      if (!personalData[field as keyof typeof personalData]) {
        setError("All fields are required")
        return
      }
    }

    setStep("academic")
  }

  const handleAcademicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const requiredFields = ["currentSchool", "educationLevel", "gpa", "stemSubjects"]
    for (const field of requiredFields) {
      if (!academicData[field as keyof typeof academicData]) {
        setError("All fields are required")
        return
      }
    }

    setStep("financial")
  }

  const handleFinancialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const requiredFields = ["familyIncome", "familySize", "parentsOccupation"]
    for (const field of requiredFields) {
      if (!financialData[field as keyof typeof financialData]) {
        setError("All fields are required")
        return
      }
    }

    setStep("documents")
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const formData = new FormData()
      
      // Personal information
      Object.entries(personalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
      
      // Academic information
      Object.entries(academicData).forEach(([key, value]) => {
        formData.append(key, value)
      })
      
      // Financial information
      Object.entries(financialData).forEach(([key, value]) => {
        formData.append(key, value)
      })
      
      formData.append("scholarshipType", selectedScholarship)

      const response = await fetch("/api/scholarship/signup", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Application failed")
        return
      }

      router.push("/scholarship/dashboard")
    } catch (err) {
      setError("An error occurred during application")
      console.log("[v0] Scholarship signup error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getClassOptions = () => {
    switch (academicData.educationLevel) {
      case "Primary":
        return ["P.4", "P.5", "P.6", "P.7"]
      case "Secondary":
        return ["S.1", "S.2", "S.3", "S.4", "S.5", "S.6"]
      case "University":
        return ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5+"]
      default:
        return []
    }
  }

  const stepTitles = {
    personal: "Personal Information",
    academic: "Academic Background",
    financial: "Financial Information",
    documents: "Review & Submit"
  }

  const currentStepIndex = Object.keys(stepTitles).indexOf(step)
  const totalSteps = Object.keys(stepTitles).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
            IF
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Scholarship Application
          </h1>
          <p className="text-muted-foreground">{stepTitles[step]}</p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStepIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStepIndex + 1} of {totalSteps}
          </p>
        </div>

        {/* Scholarship Type Selection */}
        {step === "personal" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Scholarship Type
            </label>
            <div className="space-y-2">
              {SCHOLARSHIP_TYPES.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-muted"
                >
                  <input
                    type="radio"
                    name="scholarshipType"
                    value={type.id}
                    checked={selectedScholarship === type.id}
                    onChange={(e) => setSelectedScholarship(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-foreground">{type.name}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {step === "personal" && (
          <form onSubmit={handlePersonalSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                <Input
                  type="text"
                  name="fullName"
                  value={personalData.fullName}
                  onChange={handlePersonalChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={personalData.email}
                  onChange={handlePersonalChange}
                  placeholder="your@email.ug"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={personalData.phoneNumber}
                  onChange={handlePersonalChange}
                  placeholder="+256..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Date of Birth</label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={personalData.dateOfBirth}
                  onChange={handlePersonalChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Gender</label>
                <select
                  name="gender"
                  value={personalData.gender}
                  onChange={handlePersonalChange}
                  className="w-full border border-border rounded px-3 py-2"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">National ID</label>
                <Input
                  type="text"
                  name="nationalId"
                  value={personalData.nationalId}
                  onChange={handlePersonalChange}
                  placeholder="National ID number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Address</label>
              <Input
                type="text"
                name="address"
                value={personalData.address}
                onChange={handlePersonalChange}
                placeholder="Your residential address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">District</label>
              <select
                name="district"
                value={personalData.district}
                onChange={handlePersonalChange}
                className="w-full border border-border rounded px-3 py-2"
                required
              >
                <option value="">Select district</option>
                {UGANDA_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={personalData.password}
                  onChange={handlePersonalChange}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={personalData.confirmPassword}
                  onChange={handlePersonalChange}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Continue to Academic Info
            </Button>
          </form>
        )}

        {step === "academic" && (
          <form onSubmit={handleAcademicSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Current School</label>
                <Input
                  type="text"
                  name="currentSchool"
                  value={academicData.currentSchool}
                  onChange={handleAcademicChange}
                  placeholder="School name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Education Level</label>
                <select
                  name="educationLevel"
                  value={academicData.educationLevel}
                  onChange={handleAcademicChange}
                  className="w-full border border-border rounded px-3 py-2"
                  required
                >
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="University">University</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Current Class/Year</label>
                <select
                  name="currentClass"
                  value={academicData.currentClass}
                  onChange={handleAcademicChange}
                  className="w-full border border-border rounded px-3 py-2"
                  required
                >
                  <option value="">Select class</option>
                  {getClassOptions().map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">GPA/Average Grade</label>
                <Input
                  type="text"
                  name="gpa"
                  value={academicData.gpa}
                  onChange={handleAcademicChange}
                  placeholder="e.g., 4.0 or 85%"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">STEM Subjects Studied</label>
              <textarea
                name="stemSubjects"
                value={academicData.stemSubjects}
                onChange={handleAcademicChange}
                placeholder="List the STEM subjects you are currently studying"
                className="w-full border border-border rounded px-3 py-2 min-h-[100px]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Academic Achievements</label>
              <textarea
                name="achievements"
                value={academicData.achievements}
                onChange={handleAcademicChange}
                placeholder="Describe any academic awards, competitions, or achievements"
                className="w-full border border-border rounded px-3 py-2 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Teacher Reference Name</label>
                <Input
                  type="text"
                  name="teacherReference"
                  value={academicData.teacherReference}
                  onChange={handleAcademicChange}
                  placeholder="Teacher's full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Teacher Email</label>
                <Input
                  type="email"
                  name="teacherEmail"
                  value={academicData.teacherEmail}
                  onChange={handleAcademicChange}
                  placeholder="teacher@school.ug"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Teacher Phone</label>
                <Input
                  type="tel"
                  name="teacherPhone"
                  value={academicData.teacherPhone}
                  onChange={handleAcademicChange}
                  placeholder="+256..."
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={() => setStep("personal")} variant="outline" className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                Continue to Financial Info
              </Button>
            </div>
          </form>
        )}

        {step === "financial" && (
          <form onSubmit={handleFinancialSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Monthly Family Income (UGX)</label>
                <select
                  name="familyIncome"
                  value={financialData.familyIncome}
                  onChange={handleFinancialChange}
                  className="w-full border border-border rounded px-3 py-2"
                  required
                >
                  <option value="">Select income range</option>
                  <option value="0-500000">Below 500,000</option>
                  <option value="500000-1000000">500,000 - 1,000,000</option>
                  <option value="1000000-2000000">1,000,000 - 2,000,000</option>
                  <option value="2000000-5000000">2,000,000 - 5,000,000</option>
                  <option value="5000000+">Above 5,000,000</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Family Size</label>
                <Input
                  type="number"
                  name="familySize"
                  value={financialData.familySize}
                  onChange={handleFinancialChange}
                  placeholder="Number of family members"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Parents/Guardians Occupation</label>
              <Input
                type="text"
                name="parentsOccupation"
                value={financialData.parentsOccupation}
                onChange={handleFinancialChange}
                placeholder="Parents' or guardians' occupations"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Financial Statement</label>
              <textarea
                name="financialStatement"
                value={financialData.financialStatement}
                onChange={handleFinancialChange}
                placeholder="Please explain your financial situation and why you need this scholarship"
                className="w-full border border-border rounded px-3 py-2 min-h-[120px]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Special Circumstances</label>
              <textarea
                name="specialCircumstances"
                value={financialData.specialCircumstances}
                onChange={handleFinancialChange}
                placeholder="Any special circumstances we should consider (optional)"
                className="w-full border border-border rounded px-3 py-2 min-h-[100px]"
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={() => setStep("academic")} variant="outline" className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                Review Application
              </Button>
            </div>
          </form>
        )}

        {step === "documents" && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="bg-muted rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Application Summary</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">Name:</span> {personalData.fullName}
                </div>
                <div>
                  <span className="font-medium text-foreground">Email:</span> {personalData.email}
                </div>
                <div>
                  <span className="font-medium text-foreground">School:</span> {academicData.currentSchool}
                </div>
                <div>
                  <span className="font-medium text-foreground">Scholarship Type:</span> {SCHOLARSHIP_TYPES.find(t => t.id === selectedScholarship)?.name}
                </div>
                <div>
                  <span className="font-medium text-foreground">Family Income Range:</span> {financialData.familyIncome}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You will receive a confirmation email</li>
                <li>• Our scholarship committee will review your application</li>
                <li>• You may be contacted for additional information or an interview</li>
                <li>• Results will be communicated within 4-6 weeks</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={() => setStep("financial")} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/scholarship/login" className="text-primary font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
