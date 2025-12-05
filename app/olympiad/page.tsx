import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type AdminAction = {
  title: string
  description: string
  cta: string
  href: string
}

const educationLevels = [
  {
    name: "Primary",
    ages: "9–15 years",
    subjects: ["Math", "Science", "ICT"],
  },
  {
    name: "O’Level",
    ages: "11–18 years",
    subjects: ["Math", "Biology", "Chemistry", "Physics", "ICT", "Agriculture"],
  },
  {
    name: "A’Level",
    ages: "15–21 years",
    subjects: ["Math", "Biology", "Chemistry", "Physics", "ICT", "Agriculture"],
  },
]

const adminActions: AdminAction[] = [
  {
    title: "Create Olympiad edition",
    description:
      "Define the yearly event with enrollment windows, enabled levels, and active subjects per level.",
    cta: "New edition",
    href: "/admin/olympiad/editions/new",
  },
  {
    title: "Manage question banks",
    description:
      "Add questions by level, subject, and stage with tags, difficulty, and auto-grade answers or rubrics.",
    cta: "Open question bank",
    href: "/admin/olympiad/questions",
  },
  {
    title: "Schedule exams",
    description:
      "Configure Beginner, Theory, Practical exam windows, duration, randomization, and option shuffling.",
    cta: "Schedule now",
    href: "/admin/olympiad/exams",
  },
  {
    title: "Run progression",
    description:
      "Process scores, percentile cutoffs, and eligibility records to advance candidates to next stages.",
    cta: "Recompute progression",
    href: "/admin/olympiad/progression",
  },
  {
    title: "Finals & venues",
    description:
      "Assign venues, seats, admission slips, attendance, and enter or import final scores for rankings.",
    cta: "Manage finals",
    href: "/admin/olympiad/finals",
  },
  {
    title: "Exports & certificates",
    description:
      "Download rankings, score sheets, eligibility reports, and publish certificates for participants and minors.",
    cta: "Export data",
    href: "/admin/olympiad/exports",
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

export default function Olympiad() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <section className="text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-primary">STEM Olympiad</p>
            <h1 className="text-5xl font-bold">A full-featured Olympiad module for our platform</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Built for participants, guardians, teachers, and admins to manage nationwide STEM competitions—
              from enrollment and eligibility to multi-stage exams, rankings, and certificates.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2 text-sm text-muted-foreground">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">Primary</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">O’Level</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">A’Level</span>
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent-foreground">Self or Minor Enrollment</span>
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent-foreground">Admin-Driven Finals</span>
              <span className="px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground">Question Bank & Exams</span>
              <span className="px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground">Results, Rankings, Certificates</span>
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-3 mb-6">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Navigation</p>
              <h2 className="text-3xl font-bold">All required pages and views</h2>
              <p className="text-muted-foreground max-w-3xl">
                Every participant and admin interaction is mapped to a dedicated page with the expected logic, empty
                states, and CTAs. These routes align to the platform shell and assume authenticated access where needed.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="border border-border rounded-lg p-5 bg-background space-y-3">
                <h3 className="text-lg font-semibold">User side</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                  <li>
                    <span className="font-medium text-foreground">/olympiad</span>: Overview, eligibility rules, and CTA to
                    enroll self or minors.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/participant/signup</span>: Select edition, level,
                    subjects, confirm DOB, and create participant record.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/participant/minors</span>: List and edit minor profiles;
                    add new minor via <span className="font-medium text-foreground">/participant/minors/new</span>.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/participant/enrollments</span>: See self and minor
                    enrollments, statuses, and links to stage attempts.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/participant/exams</span>: Shows active and upcoming exams
                    with eligibility badges, timers, and launch actions.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/participant/results</span>: Scores, rankings, and
                    certificate downloads per subject and stage.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/participant/support</span>: Issue reporting,
                    disqualification appeals, and guidance for retakes when allowed.
                  </li>
                </ul>
              </div>
              <div className="border border-border rounded-lg p-5 bg-background space-y-3">
                <h3 className="text-lg font-semibold">Admin side</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                  <li>
                    <span className="font-medium text-foreground">/admin/olympiad/editions</span>: CRUD editions, set
                    enrollment windows, levels, and subjects; open/close status.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/admin/olympiad/questions</span>: Level/subject/stage
                    filtered bank with add/edit, bulk import/export, and activation toggles.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/admin/olympiad/exams</span>: Schedule windows, durations,
                    randomization, and publish options per stage.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/admin/olympiad/progression</span>: Trigger eligibility
                    recompute, see percentile cutoffs, and resolve ties or overrides.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/admin/olympiad/finals</span>: Configure venues, seating,
                    attendance, and manual score entry or CSV uploads.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/admin/olympiad/exports</span>: Rankings, eligibility, and
                    certificate publishing; audit logs and download center.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">/admin/olympiad/settings</span>: System rules (age
                    overrides, max subjects, retake windows), notification templates, and access control for co-admins.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-6 bg-card shadow-sm space-y-3">
              <h2 className="text-2xl font-bold">System Overview</h2>
              <p className="text-muted-foreground">
                The Olympiad lives within the Idrisa platform. Every platform user can browse Olympiad info and enroll,
                while a dedicated Admin configures editions, manages question banks, and runs the stage progression logic.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Supports self-participation and enrolling minors (children or students).</li>
                <li>Admin controls levels, subjects, stages, venues, and score entry.</li>
                <li>Participants track enrollments, stage eligibility, results, and certificates.</li>
              </ul>
            </div>
            <div className="border border-border rounded-lg p-6 bg-card shadow-sm space-y-3">
              <h2 className="text-2xl font-bold">Roles & Actors</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Admin:</span> Configures editions, question banks, exams,
                  venues, and progression; manages participants; exports rankings and certificates.
                </p>
                <p>
                  <span className="font-semibold text-foreground">Platform User:</span> Enrolls self or minors, manages
                  minor profiles, selects levels/subjects, and views progress, results, and certificates.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
                Admin can override defaults (e.g., age limits), rerun progression, and handle disqualifications or withdrawals.
              </div>
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Levels & Subjects</p>
              <h2 className="text-3xl font-bold">Education coverage</h2>
              <p className="text-muted-foreground max-w-3xl">
                Editions can enable specific levels and subjects. Age ranges are validated automatically, with optional admin overrides.
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

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-3 mb-6">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Enrollment workspace</p>
              <h2 className="text-3xl font-bold">Complete flows for self and minors</h2>
              <p className="text-muted-foreground max-w-3xl">
                Enforce enrollment windows, duplicate prevention, age checks, subject limits, and transparent messaging
                before creating participant records. Guardians or teachers can manage any number of minors from one account.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/participant/signup">
                  <Button variant="default">Enroll myself</Button>
                </Link>
                <Link href="/participant/minors/new">
                  <Button variant="secondary">Add a minor profile</Button>
                </Link>
                <Link href="/participant/enrollments">
                  <Button variant="outline">View my enrollments</Button>
                </Link>
              </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="border border-border rounded-lg p-5 bg-background space-y-3">
                <h3 className="text-lg font-semibold">Self enrollment</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Select edition, education level, and subjects (edition rules apply).</li>
                  <li>Age validated against chosen level; prevents duplicate entries per edition.</li>
                  <li>Participant record ties to the user account with ACTIVE status.</li>
                </ul>
              </div>
              <div className="border border-border rounded-lg p-5 bg-background space-y-3">
                <h3 className="text-lg font-semibold">Minor enrollment</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Create or reuse minor profiles with DOB, school, optional IDs, and class/grade.</li>
                  <li>Enrollment validates eligibility and records the enrolling guardian/teacher.</li>
                  <li>Supports multiple minors per user with clear tracking and certificates.</li>
                </ul>
              </div>
              <div className="border border-border rounded-lg p-5 bg-background space-y-3">
                <h3 className="text-lg font-semibold">Eligibility checks</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Enrollment window, level availability, and age ranges enforced.</li>
                  <li>Subject validation per level and optional max-subject limits.</li>
                  <li>Clear error feedback for users and audit logs for admins.</li>
                  <li>Handles disqualifications or withdrawals with state changes and notifications.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Stages</p>
              <h2 className="text-3xl font-bold">Four-stage journey with progression rules</h2>
              <p className="text-muted-foreground max-w-3xl">
                Each (level, subject) follows a common pipeline. Eligibility is recomputed after every stage using scores
                and percentile cutoffs for fair advancement.
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
            <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">Assessment types</p>
                <p>Auto-marked MCQs, multiple-select, T/F, numeric; plus manually graded theory/practical answers.</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">Eligibility records</p>
                <p>Stored per participant and subject, capturing percentage scores, ranks, and advancement decisions.</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">Question bank</p>
                <p>Scoped by level, subject, stage, and optionally edition with difficulty tags, marks, and explanations.</p>
              </div>
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Exam delivery</p>
              <h2 className="text-3xl font-bold">Scheduling, delivery, and marking</h2>
              <p className="text-muted-foreground max-w-3xl">
                Admin schedules exams per edition, level, subject, and stage. Participants see only eligible exams with
                countdown timers, auto-save, navigation, and automatic submission at the deadline.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="border border-border rounded-lg p-4 bg-background space-y-2">
                <p className="font-semibold text-foreground">Exam setup</p>
                <p>Configure start/end, duration, late start rules, fixed or randomized questions, and option shuffling.</p>
              </div>
              <div className="border border-border rounded-lg p-4 bg-background space-y-2">
                <p className="font-semibold text-foreground">Auto vs manual marking</p>
                <p>Auto-grading for objective types; marking interfaces for essays, structured questions, and practical uploads.</p>
              </div>
              <div className="border border-border rounded-lg p-4 bg-background space-y-2">
                <p className="font-semibold text-foreground">Results & ranks</p>
                <p>Percentages computed per exam; rankings per (edition, level, subject, stage); exports and certificates available.</p>
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">Session integrity</p>
                <p>Locks attempts after submission, enforces one active session per participant, and supports rejoin with the remaining timer.</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">Error handling</p>
                <p>Graceful recovery for network drops, auto-save retries, and admin tooling to unlock or reset attempts when policy permits.</p>
              </div>
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Finals & logistics</p>
              <h2 className="text-3xl font-bold">Venue management and score entry</h2>
              <p className="text-muted-foreground max-w-3xl">
                Admin assigns physical venues, generates admission slips, and captures attendance. Final scores can be
                entered manually or uploaded in bulk before publishing winners and certificates.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="border border-border rounded-lg p-4 bg-background">
                <p className="font-semibold text-foreground">Venue setup</p>
                <p>Configure venue details, rooms, and capacity; generate finalist lists and seating/attendance sheets.</p>
              </div>
              <div className="border border-border rounded-lg p-4 bg-background">
                <p className="font-semibold text-foreground">Score capture</p>
                <p>Enter or import scores, handle disqualifications or absences, and compute final rankings by subject and level.</p>
              </div>
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-3 mb-6">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Admin control room</p>
              <h2 className="text-3xl font-bold">Buttons to operate every part of the system</h2>
              <p className="text-muted-foreground max-w-3xl">
                One admin (or a small set sharing the role) controls the entire Olympiad lifecycle—from drafting editions
                to publishing certificates. Each action below represents a dedicated admin workspace with audit logging.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminActions.map((action) => (
                <div key={action.title} className="border border-border rounded-lg p-4 bg-background space-y-3">
                  <div>
                    <p className="text-lg font-semibold">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <Link href={action.href} className="inline-block">
                    <Button variant="secondary" className="w-full justify-center">
                      {action.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">Guardian & minor management</p>
                <p>Admins can view who enrolled each minor, override age validation when justified, and mark withdrawals or disqualifications.</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">Audit & overrides</p>
                <p>Every admin action is logged; overrides to scores, eligibility, or stage status require reasons and are traceable.</p>
              </div>
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-3 mb-6">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Data model</p>
              <h2 className="text-3xl font-bold">Tables and core entities</h2>
              <p className="text-muted-foreground max-w-3xl">
                Backend storage expects normalized tables with foreign keys to ensure every participant (self or minor),
                exam attempt, and eligibility record is traceable. All tables carry audit columns for created/updated by.
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-5 text-sm text-muted-foreground">
              <div className="border border-border rounded-lg p-5 bg-background space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Identity & enrollment</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-medium text-foreground">users</span>: platform accounts (email, name, contact).
                  </li>
                  <li>
                    <span className="font-medium text-foreground">minor_profiles</span>: full name, DOB, gender, school,
                    class, optional IDs, created_by_user_id.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">olympiad_editions</span>: name, year, windows, status,
                    enabled levels/subjects, age overrides.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">participants</span>: participant_type, edition_id, user_id
                    or minor_profile_id, enrolled_by_user_id, education_level, status.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">participant_subjects</span>: participant_id, subject,
                    stage enrollment flags, subject-specific status.
                  </li>
                </ul>
              </div>
              <div className="border border-border rounded-lg p-5 bg-background space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Exams, scoring, and finals</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-medium text-foreground">questions</span>: level, subject, stage, type, text,
                    options, answers, difficulty, status.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">exams</span>: edition_id, level, subject, stage,
                    schedule window, duration, randomization, publish rules.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">exam_attempts</span>: participant_subject_id, stage,
                    start/end time, auto/total marks, percentage, submission state.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">answers</span>: attempt_id, question_id, response payload,
                    auto marks, manual marks, grader_id (nullable), moderation notes.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">eligibility_records</span>: participant_subject_id,
                    stage, qualified (boolean), reason, percentile cutoffs, run metadata.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">final_venues</span>: venue details, capacity, schedule,
                    map link; linked finalists and seating.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">final_results</span>: participant_subject_id, attendance,
                    final score, rank, awards, certificate link.
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 border border-dashed border-primary rounded-lg p-4 text-sm text-muted-foreground">
              Include supporting tables for notifications, audit logs, file uploads, and role assignments to satisfy the
              security, reliability, and integrity requirements stated above.
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-3 mb-6">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Logic</p>
              <h2 className="text-3xl font-bold">Eligibility, exams, and progression</h2>
              <p className="text-muted-foreground max-w-3xl">
                Each page hooks into consistent service logic: enrollment checks guard participant creation, exam launching
                enforces time windows, and progression jobs compute advancement after every stage with tie-handling and
                overrides.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4 bg-background space-y-2 text-sm text-muted-foreground">
                <h3 className="text-lg font-semibold text-foreground">Enrollment guards</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check edition window, level availability, and age range (with override support).</li>
                  <li>Validate chosen subjects against edition config; enforce maximum subject limits.</li>
                  <li>Block duplicate participant per edition+level for both self and minors.</li>
                </ul>
              </div>
              <div className="border border-border rounded-lg p-4 bg-background space-y-2 text-sm text-muted-foreground">
                <h3 className="text-lg font-semibold text-foreground">Exam delivery</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Show only eligible stage attempts with countdown timers and auto-save.</li>
                  <li>Randomize questions/options, lock submission after end time, auto-submit on expiry.</li>
                  <li>Combine auto-marking with manual grading; store submission states and audit.</li>
                </ul>
              </div>
              <div className="border border-border rounded-lg p-4 bg-background space-y-2 text-sm text-muted-foreground">
                <h3 className="text-lg font-semibold text-foreground">Progression runs</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Compute percentages and rankings per stage; apply ≥70% / ≥60% thresholds.</li>
                  <li>Apply percentile filters (top 50% for Theory→Practical, top 40% for Final).</li>
                  <li>Write eligibility_records and notify participants; admins can rerun with overrides.</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">Page logic coverage</p>
                <p>Each route lists prerequisites, shows contextual CTAs (start exam, continue, view results), and hides actions when disallowed.</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">Background jobs</p>
                <p>Scheduled tasks recompute eligibility after exam close, send notifications, and rebuild rankings; admins can force reruns from the control room.</p>
              </div>
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Dashboards & visibility</p>
              <h2 className="text-3xl font-bold">Purpose-built dashboards for every actor</h2>
              <p className="text-muted-foreground max-w-3xl">
                Real-time cards summarize enrollments, stage eligibility, schedules, and scores. Admins see edition health,
                exam readiness, and how many participants progressed at each step.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">User dashboard</p>
                <p>Self and minors in one view with subject selections, upcoming exams, countdown timers, results, certificates, and notifications.</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">Admin dashboard</p>
                <p>Totals per edition, level, and subject; stage progression counts; auto-graded vs manual marking queues; and final venue readiness.</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold text-foreground">Exports & reporting</p>
                <p>Download rankings, eligibility status, attendance, and question performance analytics; share public leaderboards if approved.</p>
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="border border-border rounded-lg p-4 bg-background">
                <p className="font-semibold text-foreground">Certificate center</p>
                <p>Generates PDFs for each stage, supports batch publish, and exposes download links in participant dashboards.</p>
              </div>
              <div className="border border-border rounded-lg p-4 bg-background">
                <p className="font-semibold text-foreground">Appeals & issue tracking</p>
                <p>Admins track disputes on marks or eligibility, capture resolutions, and reissue results or certificates after moderation.</p>
              </div>
            </div>
          </section>

          <section className="border border-border rounded-lg p-8 bg-card shadow-sm">
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Integrity & support</p>
              <h2 className="text-3xl font-bold">Security, reliability, and notifications</h2>
              <p className="text-muted-foreground max-w-3xl">
                Protect participant data, keep exams reliable, and communicate clearly across all stages—from enrollment to finals.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="border border-border rounded-lg p-4 bg-background">
                <p className="font-semibold text-foreground">Security & authorization</p>
                <p>Authenticated access, role-gated admin panels, and visibility only for enrolling guardians over their minors.</p>
              </div>
              <div className="border border-border rounded-lg p-4 bg-background">
                <p className="font-semibold text-foreground">Reliability & autosave</p>
                <p>Auto-save during exams, session rejoin, timed auto-submit, and locked attempts after submission with audit traces.</p>
              </div>
              <div className="border border-border rounded-lg p-4 bg-background">
                <p className="font-semibold text-foreground">Notifications</p>
                <p>Email/SMS/in-app updates for enrollment confirmations, eligibility changes, exam reminders, and published results or certificates.</p>
              </div>
            </div>
          </section>

          <section className="bg-primary text-primary-foreground rounded-2xl p-10 text-center shadow-lg">
            <h2 className="text-3xl font-bold mb-3">Ready to launch the Olympiad?</h2>
            <p className="text-lg mb-6 text-primary-foreground/90 max-w-2xl mx-auto">
              Enroll now or create minor profiles, pick an edition, and choose your subjects. Admins can configure editions,
              upload questions, and open the enrollment window in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/participant/signup">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">Enroll now</Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Go to admin setup
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
