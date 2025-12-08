import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Mail, ExternalLink, GraduationCap, Award, Globe, Heart } from "lucide-react"

export default function TeamPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-accent font-semibold mb-4">Our Team</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-3xl">
              Meet the Visionaries Behind Idrisa Foundation
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl">
              Led by passionate scientists and educators committed to transforming STEM education in Uganda.
            </p>
          </div>
        </section>

        {/* Founder Section */}
        <section className="py-20 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-accent font-semibold mb-3 text-sm uppercase tracking-wider">Leadership</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Founder</h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl p-8 card-hover sticky top-8">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary-foreground">IK</span>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2 text-foreground">Idrisa Kiryowa</h3>
                  <p className="text-muted-foreground text-center mb-4">Founder & Executive Director</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span>Master's Student, Russia</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4 text-primary" />
                      <span>Research Background, India</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="w-4 h-4 text-primary" />
                      <span>Entebbe, Uganda</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border space-y-2">
                    <a 
                      href="https://orcid.org/0009-0007-3178-0424" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition group"
                    >
                      <span className="text-sm text-muted-foreground group-hover:text-foreground">ORCID Profile</span>
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </a>
                    <a 
                      href="https://www.webofscience.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition group"
                    >
                      <span className="text-sm text-muted-foreground group-hover:text-foreground">Web of Science</span>
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </a>
                    <a 
                      href="https://www.researchgate.net" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition group"
                    >
                      <span className="text-sm text-muted-foreground group-hover:text-foreground">ResearchGate</span>
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </a>
                    <a 
                      href="mailto:founder@idrisafoundation.org" 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition group"
                    >
                      <span className="text-sm text-muted-foreground group-hover:text-foreground">Contact Founder</span>
                      <Mail className="w-4 h-4 text-primary" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Detailed Bio */}
              <div className="lg:col-span-2 space-y-8">
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Visionary Leadership</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    <strong className="text-foreground">Idrisa Kiryowa</strong> is the visionary founder of the Idrisa Foundation, 
                    established in 2025 with a mission to transform STEM education in Uganda. Currently pursuing his Master's degree 
                    in Russia, Idrisa brings a wealth of international experience and scientific expertise to the foundation's leadership.
                  </p>

                  <h4 className="text-xl font-semibold text-foreground mb-3">Academic & Research Background</h4>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    With significant research contributions in medicine and various scientific fields, Idrisa has built a strong 
                    academic foundation through advanced studies in India and now Russia. His research work has been published in 
                    reputable scientific journals, contributing to the global scientific community while maintaining deep roots 
                    in his Ugandan heritage.
                  </p>

                  <div className="bg-primary text-primary-foreground rounded-2xl p-8 my-8">
                    <blockquote className="text-xl italic leading-relaxed mb-4">
                      "I was fortunate to receive opportunities that changed my life. Now, my mission is to ensure that 
                      talented young Ugandans don't have to leave their country to find those same opportunities. We're 
                      building them right here, with world-class STEM education and mentorship."
                    </blockquote>
                    <p className="font-semibold">— Idrisa Kiryowa, Founder</p>
                  </div>

                  <h4 className="text-xl font-semibold text-foreground mb-3">Scientific Credibility & Publications</h4>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Idrisa's commitment to scientific excellence is demonstrated through his active presence in the 
                    international research community. His work can be verified through multiple credible scientific sources:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Research Impact</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        Peer-reviewed publications in medical and scientific journals with measurable citation impact.
                      </p>
                      <a 
                        href="https://www.researchgate.net" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        View Research Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    
                    <div className="bg-card border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Academic Verification</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        Verified researcher identity through ORCID, ensuring transparency in academic contributions.
                      </p>
                      <a 
                        href="https://orcid.org" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Verify Academic Identity <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <h4 className="text-xl font-semibold text-foreground mb-3">The Foundation's Vision</h4>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    The Idrisa Foundation represents Idrisa's belief that every talented young person in Uganda deserves 
                    access to world-class STEM education. By establishing the foundation, he aims to create opportunities 
                    that allow young Ugandans to thrive scientifically without having to leave their homeland, ultimately 
                    contributing to Africa's scientific progress and innovation landscape.
                  </p>

                  <h4 className="text-xl font-semibold text-foreground mb-3">Commitment to Excellence</h4>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Through his leadership, Idrisa ensures that the foundation maintains the highest standards of 
                    academic rigor, scientific integrity, and educational excellence. His international experience 
                    and research background provide the foundation with credible expertise and global connections 
                    that benefit every student participating in our programs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-secondary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Join Our Mission</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Be part of transforming STEM education in Uganda. Whether you're a student, educator, or partner, 
              there's a place for you in our mission.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/programs">
                <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition">
                  Explore Programs <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/about/partners">
                <button className="inline-flex items-center gap-2 bg-background text-foreground border border-border px-6 py-3 rounded-lg hover:bg-muted transition">
                  Become a Partner <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
