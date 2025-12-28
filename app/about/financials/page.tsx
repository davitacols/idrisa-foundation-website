import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, DollarSign, Eye, BarChart2 } from "lucide-react"

export default function FinancialsPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-accent font-semibold mb-4">Financials & Transparency</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-3xl">
              Your Trust. Our Responsibility.
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl">
              The Idrisa Foundation is committed to responsible financial management, openness, and ethical use of resources. Every contribution directly supports our mission.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-12">
                {/* How Your Donation Is Used */}
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="text-3xl font-bold mb-4">How Your Donation Is Used</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>We focus on high-impact, low-overhead operations. Contributions support:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Educational programs & STEM initiatives</li>
                      <li>Student scholarships and academic support</li>
                      <li>Learning materials, competitions, and mentorship</li>
                      <li>Essential program administration</li>
                    </ul>
                    <p>Our priority is ensuring that resources reach students and communities where they are needed most.</p>
                  </div>
                </div>

                {/* Our Financial Approach */}
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="text-3xl font-bold mb-4">Our Financial Approach</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>As a newly launched organization:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>We operate with lean costs to maximize impact</li>
                      <li>Core leadership currently serves on a voluntary or minimal-cost basis</li>
                      <li>Funds are allocated based on program needs and mission alignment</li>
                      <li>Organizational finances are kept separate from personal accounts</li>
                    </ul>
                    <p>This approach allows us to scale responsibly while maintaining accountability from the start.</p>
                  </div>
                </div>

                {/* Transparency & Oversight */}
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="text-3xl font-bold mb-4">Transparency & Oversight</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>We are committed to clear and ethical financial practices, including:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Accurate tracking of all donations and expenses</li>
                      <li>Internal review of financial activity</li>
                      <li>Documented approval for expenditures</li>
                      <li>Compliance with applicable legal and regulatory requirements</li>
                    </ul>
                    <p>As the foundation grows, we will strengthen oversight and publish summarized financial and impact reports.</p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-4">Support Our Work</h2>
                  <p className="text-muted-foreground mb-6">Every contribution — no matter the size — helps us deliver programs, support students, and expand opportunity.</p>
                  <Link href="/contact" className="inline-flex items-center justify-center w-full px-6 py-3 text-lg font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition">
                    Make a Donation <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
                <div className="bg-card border border-border rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-3">Why Support Idrisa Foundation?</h3>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start"><DollarSign className="w-5 h-5 mr-3 mt-1 text-primary" /> Students with limited access to quality educational resources</li>
                        <li className="flex items-start"><BarChart2 className="w-5 h-5 mr-3 mt-1 text-primary" /> Early-stage programs with strong long-term potential</li>
                        <li className="flex items-start"><Eye className="w-5 h-5 mr-3 mt-1 text-primary" /> A foundation built on integrity, not excess</li>
                    </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
