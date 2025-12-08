import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, FileText, Calendar, Award, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function ScholarshipDashboard() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <section className="bg-card border border-border rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Scholarship Dashboard</h1>
                <p className="text-muted-foreground">Manage your scholarship applications and track your progress</p>
              </div>
              <Link href="/scholarship/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  New Application <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Application Status */}
          <section className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Active Applications</h3>
                  <p className="text-2xl font-bold text-green-600">2</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Currently under review</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Awards Received</h3>
                  <p className="text-2xl font-bold text-blue-600">1</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Total UGX 2,500,000</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Pending Actions</h3>
                  <p className="text-2xl font-bold text-orange-600">3</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Documents required</p>
            </div>
          </section>

          {/* Recent Applications */}
          <section className="bg-card border border-border rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recent Applications</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>

            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">Full Tuition Scholarship</h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Under Review</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Applied: March 15, 2025</p>
                    <p className="text-sm text-muted-foreground">Education Level: Secondary • School: Kampala Secondary School</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Upload Documents</Button>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">Excellence Award</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Awarded</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Applied: February 28, 2025</p>
                    <p className="text-sm text-muted-foreground">Education Level: Secondary • School: Kampala Secondary School</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Award</Button>
                    <Button variant="outline" size="sm">Download Certificate</Button>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">Partial Scholarship</h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Under Review</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Applied: March 10, 2025</p>
                    <p className="text-sm text-muted-foreground">Education Level: Secondary • School: Kampala Secondary School</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Upload Documents</Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Required Documents */}
          <section className="bg-card border border-border rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Required Documents</h2>
              <Button variant="outline" size="sm">Upload All</Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-foreground">Academic Transcripts</p>
                    <p className="text-sm text-muted-foreground">Recent academic records</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Upload</Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-foreground">Birth Certificate</p>
                    <p className="text-sm text-muted-foreground">Uploaded on March 15, 2025</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-foreground">Parent/Guardian ID</p>
                    <p className="text-sm text-muted-foreground">National ID or passport</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Upload</Button>
              </div>
            </div>
          </section>

          {/* Important Dates */}
          <section className="bg-card border border-border rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Important Dates</h2>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <h3 className="font-semibold text-foreground">Application Deadline</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-1">April 30, 2025</p>
                <p className="text-xs text-red-600">15 days remaining</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h3 className="font-semibold text-foreground">Review Period</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-1">May 1 - May 31, 2025</p>
                <p className="text-xs text-muted-foreground">Applications under review</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h3 className="font-semibold text-foreground">Award Notification</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-1">June 15, 2025</p>
                <p className="text-xs text-muted-foreground">Results announced</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <h3 className="font-semibold text-foreground">Award Ceremony</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-1">July 1, 2025</p>
                <p className="text-xs text-muted-foreground">Annual award ceremony</p>
              </div>
            </div>
          </section>

          {/* Resources */}
          <section className="bg-card border border-border rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Helpful Resources</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Application Guide</h3>
                <p className="text-sm text-muted-foreground mb-4">Step-by-step instructions for completing your application</p>
                <Button variant="outline" size="sm">Download PDF</Button>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Financial Aid Info</h3>
                <p className="text-sm text-muted-foreground mb-4">Understanding different types of financial support</p>
                <Button variant="outline" size="sm">Learn More</Button>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Success Stories</h3>
                <p className="text-sm text-muted-foreground mb-4">Read about past scholarship recipients</p>
                <Button variant="outline" size="sm">View Stories</Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
