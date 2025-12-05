import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    // Read the SQL schema file content
    const schemaSQL = `
-- Olympiad V2 Schema Initialization
-- This creates all tables needed for the new Olympiad system

-- Create enums
DO $$ BEGIN
  CREATE TYPE participant_type AS ENUM ('SELF', 'MINOR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE stage_type AS ENUM ('ONLINE_QUIZ', 'ONLINE_THEORY', 'ONLINE_PRACTICAL', 'FINAL_PHYSICAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE question_type_v2 AS ENUM ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY', 'FILE_UPLOAD', 'STRUCTURED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE edition_status AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE marking_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE award_type AS ENUM ('GOLD', 'SILVER', 'BRONZE', 'MERIT', 'PARTICIPATION');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Minor Profiles Table
CREATE TABLE IF NOT EXISTS minor_profiles (
  id SERIAL PRIMARY KEY,
  guardian_id INT NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  school_name VARCHAR(255),
  district VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Olympiad Editions Table
CREATE TABLE IF NOT EXISTS olympiad_editions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  theme TEXT,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status edition_status DEFAULT 'DRAFT',
  min_age INT DEFAULT 10,
  max_age INT DEFAULT 18,
  created_by INT REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Edition Stages Table
CREATE TABLE IF NOT EXISTS edition_stages (
  id SERIAL PRIMARY KEY,
  edition_id INT NOT NULL REFERENCES olympiad_editions(id) ON DELETE CASCADE,
  stage_number INT NOT NULL,
  stage_name VARCHAR(255) NOT NULL,
  stage_type stage_type NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  pass_percentage DECIMAL(5,2),
  pass_count INT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(edition_id, stage_number)
);

-- Participants Table (combines SELF and MINOR)
CREATE TABLE IF NOT EXISTS participants_v2 (
  id SERIAL PRIMARY KEY,
  edition_id INT NOT NULL REFERENCES olympiad_editions(id) ON DELETE CASCADE,
  participant_type participant_type NOT NULL,
  guardian_id INT REFERENCES guardians(id) ON DELETE CASCADE,
  participant_id INT REFERENCES participants(id) ON DELETE CASCADE,
  minor_id INT REFERENCES minor_profiles(id) ON DELETE CASCADE,
  education_level VARCHAR(50) NOT NULL,
  class_level VARCHAR(50) NOT NULL,
  current_stage INT DEFAULT 1,
  is_qualified BOOLEAN DEFAULT TRUE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  CHECK (
    (participant_type = 'SELF' AND participant_id IS NOT NULL AND minor_id IS NULL) OR
    (participant_type = 'MINOR' AND minor_id IS NOT NULL AND participant_id IS NULL)
  )
);

-- Exam Configurations Table
CREATE TABLE IF NOT EXISTS exam_configs (
  id SERIAL PRIMARY KEY,
  edition_id INT NOT NULL REFERENCES olympiad_editions(id) ON DELETE CASCADE,
  stage_id INT NOT NULL REFERENCES edition_stages(id) ON DELETE CASCADE,
  education_level VARCHAR(50) NOT NULL,
  duration_minutes INT NOT NULL,
  total_marks INT NOT NULL,
  pass_marks INT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(stage_id, education_level)
);

-- Exam Questions Mapping
CREATE TABLE IF NOT EXISTS exam_questions (
  id SERIAL PRIMARY KEY,
  exam_config_id INT NOT NULL REFERENCES exam_configs(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  marks INT NOT NULL,
  question_order INT NOT NULL
);

-- Exam Attempts Table
CREATE TABLE IF NOT EXISTS exam_attempts_v2 (
  id SERIAL PRIMARY KEY,
  participant_v2_id INT NOT NULL REFERENCES participants_v2(id) ON DELETE CASCADE,
  exam_config_id INT NOT NULL REFERENCES exam_configs(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  time_taken_minutes INT,
  is_submitted BOOLEAN DEFAULT FALSE,
  auto_submitted BOOLEAN DEFAULT FALSE
);

-- Exam Answers Table
CREATE TABLE IF NOT EXISTS exam_answers_v2 (
  id SERIAL PRIMARY KEY,
  attempt_id INT NOT NULL REFERENCES exam_attempts_v2(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_file_url TEXT,
  answered_at TIMESTAMP DEFAULT NOW()
);

-- Marking Table
CREATE TABLE IF NOT EXISTS exam_marking (
  id SERIAL PRIMARY KEY,
  attempt_id INT NOT NULL REFERENCES exam_attempts_v2(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(5,2),
  max_marks INT NOT NULL,
  marked_by INT REFERENCES admins(id),
  marking_status marking_status DEFAULT 'PENDING',
  feedback TEXT,
  marked_at TIMESTAMP
);

-- Stage Results Table
CREATE TABLE IF NOT EXISTS stage_results (
  id SERIAL PRIMARY KEY,
  participant_v2_id INT NOT NULL REFERENCES participants_v2(id) ON DELETE CASCADE,
  stage_id INT NOT NULL REFERENCES edition_stages(id) ON DELETE CASCADE,
  attempt_id INT REFERENCES exam_attempts_v2(id) ON DELETE CASCADE,
  total_marks DECIMAL(5,2) DEFAULT 0,
  marks_obtained DECIMAL(5,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  rank INT,
  is_qualified BOOLEAN DEFAULT FALSE,
  computed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_v2_id, stage_id)
);

-- Final Venues Table
CREATE TABLE IF NOT EXISTS final_venues (
  id SERIAL PRIMARY KEY,
  edition_id INT NOT NULL REFERENCES olympiad_editions(id) ON DELETE CASCADE,
  venue_name VARCHAR(255) NOT NULL,
  venue_address TEXT,
  district VARCHAR(100),
  capacity INT,
  event_date DATE NOT NULL,
  event_time TIME,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Final Attendance Table
CREATE TABLE IF NOT EXISTS final_attendance (
  id SERIAL PRIMARY KEY,
  participant_v2_id INT NOT NULL REFERENCES participants_v2(id) ON DELETE CASCADE,
  venue_id INT NOT NULL REFERENCES final_venues(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP,
  UNIQUE(participant_v2_id, venue_id)
);

-- Final Results Table
CREATE TABLE IF NOT EXISTS final_results (
  id SERIAL PRIMARY KEY,
  participant_v2_id INT NOT NULL REFERENCES participants_v2(id) ON DELETE CASCADE,
  venue_id INT REFERENCES final_venues(id),
  final_score DECIMAL(5,2),
  final_rank INT,
  award award_type,
  certificate_url TEXT,
  remarks TEXT,
  recorded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_v2_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications_v2 (
  id SERIAL PRIMARY KEY,
  guardian_id INT REFERENCES guardians(id) ON DELETE CASCADE,
  participant_v2_id INT REFERENCES participants_v2(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_minor_profiles_guardian ON minor_profiles(guardian_id);
CREATE INDEX IF NOT EXISTS idx_participants_v2_edition ON participants_v2(edition_id);
CREATE INDEX IF NOT EXISTS idx_participants_v2_guardian ON participants_v2(guardian_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_v2_participant ON exam_attempts_v2(participant_v2_id);
CREATE INDEX IF NOT EXISTS idx_stage_results_participant ON stage_results(participant_v2_id);
CREATE INDEX IF NOT EXISTS idx_stage_results_stage ON stage_results(stage_id);
CREATE INDEX IF NOT EXISTS idx_notifications_v2_guardian ON notifications_v2(guardian_id);
CREATE INDEX IF NOT EXISTS idx_exam_marking_attempt ON exam_marking(attempt_id);
CREATE INDEX IF NOT EXISTS idx_exam_marking_status ON exam_marking(marking_status);
`;

    // Execute the schema
    await sql(schemaSQL)

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully"
    })
  } catch (error: any) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
