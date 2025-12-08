"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  Menu,
  X,
  BookOpen,
  Users,
  Trophy,
  GraduationCap,
  Heart,
  FileText,
  Calendar,
  HandHeart,
  Building2,
  UserPlus,
  Share2,
  Search,
} from "lucide-react"

export function Header() {
  const [userType, setUserType] = useState<"admin" | "participant" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const adminRes = await fetch("/api/admin/session")
        if (adminRes.ok) {
          setUserType("admin")
          setIsLoading(false)
          return
        }
        const participantRes = await fetch("/api/participant/session")
        if (participantRes.ok) {
          setUserType("participant")
          setIsLoading(false)
          return
        }
        setUserType(null)
      } catch (error) {
        setUserType(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  const handleDashboardClick = () => {
    if (userType === "admin") {
      router.push("/admin/dashboard")
    } else if (userType === "participant") {
      router.push("/participant/dashboard")
    } else {
      router.push("/login")
    }
  }

  const navItems = [
    {
      label: "About Us",
      href: "/about",
      dropdown: [
        { label: "Our Story & Mission", href: "/about/story", icon: BookOpen },
        { label: "Our Team", href: "/about/team", icon: Users },
        { label: "Partners & Supporters", href: "/about/partners", icon: Building2 },
        { label: "Financials & Transparency", href: "/about/financials", icon: FileText },
      ],
    },
    {
      label: "Our Programs",
      href: "/programs",
      dropdown: [
        { label: "STEM Olympiad", href: "/olympiad", icon: Trophy },
        { label: "Scholarships", href: "/scholarship", icon: GraduationCap },
        { label: "Mentorship & Incubation", href: "/programs/mentorship", icon: Users },
      ],
    },
    {
      label: "For Scholars",
      href: "/scholars",
      dropdown: [
        { label: "How to Apply", href: "/scholars/apply", icon: FileText },
        { label: "Application Portal", href: "/participant/signup", icon: UserPlus },
        { label: "Scholar Resources", href: "/scholars/resources", icon: BookOpen },
        { label: "FAQs", href: "/scholars/faqs", icon: BookOpen },
      ],
    },
    {
      label: "Impact",
      href: "/impact",
      dropdown: [
        { label: "Success Stories", href: "/impact/stories", icon: Heart },
        { label: "Research & Publications", href: "/impact/research", icon: FileText },
        { label: "Annual Impact Report", href: "/impact/report", icon: FileText },
      ],
    },
    {
      label: "Get Involved",
      href: "/get-involved",
      dropdown: [
        { label: "Donate", href: "/get-involved/donate", icon: Heart },
        { label: "Become a Partner", href: "/get-involved/partner", icon: Building2 },
        { label: "Volunteer", href: "/get-involved/volunteer", icon: HandHeart },
        { label: "Advocate & Share", href: "/get-involved/advocate", icon: Share2 },
      ],
    },
    {
      label: "News & Events",
      href: "/news",
      dropdown: [
        { label: "Blog & Articles", href: "/news/blog", icon: FileText },
        { label: "Events Calendar", href: "/news/events", icon: Calendar },
        { label: "Media Gallery", href: "/news/gallery", icon: FileText },
      ],
    },
  ]

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition shrink-0">
            <div className="w-12 h-12">
              <img src="/logo.png" alt="Idrisa Foundation Logo" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg leading-tight">The Idrisa Foundation</div>
              <div className="text-xs text-primary-foreground/80">Empowering Tomorrow's Minds</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md transition"
                >
                  {item.label}
                  {item.dropdown && <ChevronDown className="w-4 h-4" />}
                </Link>

                {/* Dropdown Menu */}
                {item.dropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white text-foreground rounded-lg shadow-xl border border-border py-2 z-50">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition"
                      >
                        <subItem.icon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section - CTAs */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-primary-foreground/10 rounded-full transition hidden md:block"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Donate Button */}
            <Link href="/get-involved/donate" className="hidden md:block">
              <Button
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent font-semibold"
              >
                Donate Now
              </Button>
            </Link>

            {/* Apply/Dashboard Button */}
            {!isLoading && (
              <Button
                onClick={handleDashboardClick}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                {userType ? "Dashboard" : "Apply Now"}
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-primary-foreground/10 rounded-md transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar (expandable) */}
        {searchOpen && (
          <div className="py-4 border-t border-primary-foreground/20">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search programs, scholarships, events..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-primary border-t border-primary-foreground/20">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block px-4 py-3 text-sm font-medium hover:bg-primary-foreground/10 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.dropdown && (
                  <div className="pl-6 space-y-1">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-primary-foreground/80 hover:bg-primary-foreground/10 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <subItem.icon className="w-4 h-4" />
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-primary-foreground/20 space-y-2">
              <Link href="/get-involved/donate" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                >
                  Donate Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
