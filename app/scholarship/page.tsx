import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, GraduationCap, DollarSign, Award, BookOpen, Users } from "lucide-react"

export default function ScholarshipPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-6">
              <GraduationCap className="w-16 h-16 mx-auto text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Scholarship Programs
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
              Financial support and educational opportunities for talented Ugandan students pursuing STEM education.
              Our scholarships make quality education accessible to deserving students across Uganda.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/scholarship/signup">
                <Button size="lg" className="bg-background text-primary hover:bg-muted">
                  Apply for Scholarship <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/programs">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  View All Programs
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Scholarship Types */}
        <section className="py-20 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Available Scholarship Opportunities
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We offer various scholarship types to support different educational needs and academic levels.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card border border-border rounded-2xl p-8 card-hover">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <DollarSign className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Full Tuition Scholarships</h3>
                <p className="text-muted-foreground mb-6">
                  Complete coverage of tuition fees for exceptional students demonstrating academic excellence 
                  and financial need. Available for primary, secondary, and university levels.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>• 100% tuition coverage</li>
                  <li>• Textbook allowance</li>
                  <li>• Mentorship program</li>
                  <li>• Academic support</li>
                </ul>
                <Link href="/scholarship/signup?type=full-tuition">
                  <Button className="w-full">Apply Now</Button>
                </Link>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8 card-hover">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Partial Scholarships</h3>
                <p className="text-muted-foreground mb-6">
                  Partial financial support covering 50-75% of tuition costs for students who demonstrate 
                  strong academic potential and moderate financial need.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>• 50-75% tuition coverage</li>
                  <li>• Study materials support</li>
                  <li>• Career guidance</li>
                  <li>• Network access</li>
                </ul>
                <Link href="/scholarship/signup?type=partial">
                  <Button className="w-full">Apply Now</Button>
                </Link>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8 card-hover">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Excellence Awards</h3>
                <p className="text-muted-foreground mb-6">
                  Merit-based awards for top-performing students in STEM competitions and examinations. 
                  Recognizes and rewards outstanding academic achievement.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>• One-time awards</li>
                  <li>• Recognition certificates</li>
                  <li>• Internship opportunities</li>
                  <li>• Industry exposure</li>
                </ul>
                <Link href="/scholarship/signup?type=excellence">
                  <Button className="w-full">Apply Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Eligibility */}
        <section className="py-20 px-4 bg-secondary">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Eligibility Criteria
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our scholarships are designed to support talented Ugandan students who demonstrate 
                academic potential and financial need.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-background rounded-2xl p-8 border border-border">
                <h3 className="text-2xl font-bold mb-6 text-foreground">Academic Requirements</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Minimum grade point average of 3.5 or equivalent</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Strong performance in STEM subjects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Demonstrated participation in academic activities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Teacher recommendations and references</span>
                  </li>
                </ul>
              </div>

              <div className="bg-background rounded-2xl p-8 border border-border">
                <h3 className="text-2xl font-bold mb-6 text-foreground">Financial Need</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Family income verification required</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Priority given to underserved communities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Consideration of family size and dependents</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Special consideration for orphaned students</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Application Process */}
        <section className="py-20 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Application Process
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our streamlined application process ensures fair evaluation of all candidates.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Online Application</h3>
                <p className="text-sm text-muted-foreground">
                  Complete the scholarship application form with personal and academic details
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Document Submission</h3>
                <p className="text-sm text-muted-foreground">
                  Upload required documents including transcripts, recommendations, and financial proof
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Review & Evaluation</h3>
                <p className="text-sm text-muted-foreground">
                  Applications are reviewed by our scholarship committee for merit and need assessment
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                  4
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Award Notification</h3>
                <p className="text-sm text-muted-foreground">
                  Successful candidates are notified and provided with award details and next steps
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Impact */}
        <section className="py-20 px-4 bg-secondary">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Scholarship Impact
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transforming lives through educational opportunities since 2025.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-background rounded-2xl p-8 border border-border">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Students Supported</p>
              </div>
              <div className="bg-background rounded-2xl p-8 border border-border">
                <div className="text-4xl font-bold text-primary mb-2">UGX 50M+</div>
                <p className="text-muted-foreground">Scholarships Awarded</p>
              </div>
              <div className="bg-background rounded-2xl p-8 border border-border">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <p className="text-muted-foreground">Academic Success Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Apply?</h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Take the first step towards securing your educational future. 
              Our scholarship application is now open for the 2025-2026 academic year.
            </p>
            <Link href="/scholarship/signup">
              <Button size="lg" className="bg-background text-primary hover:bg-muted">
                Start Your Application <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
