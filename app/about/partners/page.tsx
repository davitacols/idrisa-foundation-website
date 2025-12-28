import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Mail, Users, Building2, FileText, Heart } from "lucide-react"

export default function PartnersPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-accent font-semibold mb-4">Partners & Supporters</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-3xl">
              Building Impact Together
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl">
              The Idrisa Foundation is proud to work alongside a small but committed group of partners and supporters who believe in empowering young people through education, innovation, and opportunity.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-12">
                {/* Founding Supporters */}
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="text-3xl font-bold mb-4">Founding Supporters</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>Our early work has been made possible through the generosity, guidance, and encouragement of individuals who believe in the vision of the Idrisa Foundation.</p>
                    <p>These founding supporters have contributed through:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Mentorship and advisory support</li>
                      <li>Program volunteering</li>
                      <li>Financial and in-kind contributions</li>
                      <li>Community advocacy and outreach</li>
                    </ul>
                    <p>Their trust at this early stage helps us lay a strong foundation for long-term impact.</p>
                  </div>
                </div>

                {/* Educational & Community Collaborators */}
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="text-3xl font-bold mb-4">Educational & Community Collaborators</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>We collaborate informally with:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Local educators and mentors</li>
                      <li>Schools and learning communities</li>
                      <li>Youth leaders and volunteers</li>
                    </ul>
                    <p>These collaborations support our programs in STEM education, academic competitions, and student mentorship as we continue to grow our reach.</p>
                  </div>
                </div>

                {/* Why Partnerships Matter */}
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="text-3xl font-bold mb-4">Why Partnerships Matter to Us</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>At Idrisa Foundation, partnerships are not just logos — they are relationships built on shared values. Every supporter plays a role in:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Expanding access to quality education</li>
                      <li>Encouraging innovation and critical thinking</li>
                      <li>Supporting talented students with limited resources</li>
                      <li>Strengthening community-led solutions</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-4">Become a Partner or Supporter</h2>
                  <p className="text-muted-foreground mb-6">As we officially launch, we welcome organizations, institutions, and individuals who would like to grow with us.</p>
                  <Link href="/contact" className="inline-flex items-center justify-center w-full px-6 py-3 text-lg font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition">
                    Partner with Us <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    or email us at <a href="mailto:info@idrisafoundation.org" className="underline">info@idrisafoundation.org</a>
                  </p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-3">Ways to Partner</h3>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start"><Users className="w-5 h-5 mr-3 mt-1 text-primary" /> Program sponsorship</li>
                        <li className="flex items-start"><Building2 className="w-5 h-5 mr-3 mt-1 text-primary" /> Educational collaboration</li>
                        <li className="flex items-start"><Heart className="w-5 h-5 mr-3 mt-1 text-primary" /> Mentorship and skills support</li>
                        <li className="flex items-start"><FileText className="w-5 h-5 mr-3 mt-1 text-primary" /> Resource or equipment donations</li>
                    </ul>
                </div>
              </div>
            </div>

            {/* Looking Ahead */}
            <div className="mt-20 text-center">
              <h2 className="text-3xl font-bold mb-4">Looking Ahead</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground">This page will continue to grow as our community of partners expands. We look forward to recognizing and celebrating the organizations and individuals who join us on this journey.</p>
              <p className="mt-8 text-lg font-semibold text-primary">“Impact is strongest when built together.”</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
