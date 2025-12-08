import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Database schema for the complete olympiad system
const OLYMPIAD_SCHEMA = `
-- ============================================================================
-- OLYMPIAD EDITIONS
-- ============================================================================
CREATE TYPE edition_status AS ENUM ('DRAFT', 'OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS olympiad_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  year INT NOT NULL,
  enrollment_start TIMESTAMP WITH TIME ZONE NOT NULL,
  enrollment_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status edition_status NOT NULL DEFAULT 'DRAFT',
  
  -- Active levels (JSON array of enabled levels)
  active_levels JSONB NOT NULL DEFAULT '["Primary", "O-Level", "A-Level"]',
  
  -- Active subjects per level (JSON object)
  active_subjects JSONB NOT NULL DEFAULT '{
    "Primary": ["Math", "Science", "ICT"],
    "O-Level": ["Math", "Biology", "Chemistry", "Physics", "ICT", "Agriculture"],
    "A-Level": ["Math", "Biology", "Chemistry", "Physics", "ICT", "Agriculture"]
  }',
  
  -- Age rules (can override defaults)
  age_rules JSONB NOT NULL DEFAULT '{
    "Primary": {"min": 9, "max": 15},
    "O-Level": {"min": 11, "max": 18},
    "A-Level": {"min": 15, "max": 21}
  }',
  
  -- Global rules
  max_subjects_per_participant INT DEFAULT 3,
  reference_date DATE,  -- For age calculation
  
  created_by_admin_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PARTICIPANTS
-- ============================================================================
CREATE TYPE education_level AS ENUM ('Primary', 'O-Level', 'A-Level');

CREATE TABLE IF NOT EXISTS olympiad_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  edition_id UUID NOT NULL REFERENCES olympiad_editions(id) ON DELETE CASCADE,
  
  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  education_level education_level NOT NULL,
  school_name TEXT,
  district TEXT,
  
  -- Enrollment details
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  parent_consent BOOLEAN DEFAULT FALSE,  -- For minors
  consent_given_by TEXT,  -- Parent/guardian name
  consent_contact TEXT,  -- Parent/guardian contact
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  current_stage TEXT DEFAULT 'Beginner',  -- Current stage in progression
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, edition_id)
);

-- ============================================================================
-- QUESTION BANK
-- ============================================================================
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  difficulty difficulty_level NOT NULL,
  subject TEXT NOT NULL,
  education_level education_level NOT NULL,
  stage TEXT NOT NULL,  -- Beginner, Theory, Practical, Final
  
  -- Multiple choice options (JSON)
  options JSONB,  -- Array of options for multiple choice
  
  -- Correct answer(s)
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  
  -- Metadata
  points_value DECIMAL(5,2) DEFAULT 1.00,
  time_limit_seconds INT DEFAULT 60,  -- Suggested time limit
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_by_admin_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EXAM CONFIGURATIONS
-- ============================================================================
CREATE TYPE exam_status AS ENUM ('draft', 'ready', 'active', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS exam_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID NOT NULL REFERENCES olympiad_editions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Exam details
  education_level education_level NOT NULL,
  subject TEXT NOT NULL,
  stage TEXT NOT NULL,  -- Beginner, Theory, Practical, Final
  
  -- Question selection
  total_questions INT NOT NULL,
  questions_per_difficulty JSONB NOT NULL DEFAULT '{
    "easy": 0,
    "medium": 0,
    "hard": 0
  }',
  randomize_questions BOOLEAN DEFAULT TRUE,
  randomize_options BOOLEAN DEFAULT TRUE,
  
  -- Timing
  duration_minutes INT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  
  -- Access control
  requires_supervision BOOLEAN DEFAULT FALSE,
  max_attempts INT DEFAULT 1,
  
  -- Status
  status exam_status DEFAULT 'draft',
  
  created_by_admin_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EXAM SESSIONS
-- ============================================================================
CREATE TYPE session_status AS ENUM ('created', 'started', 'in_progress', 'completed', 'abandoned', 'expired');

CREATE TABLE IF NOT EXISTS exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_config_id UUID NOT NULL REFERENCES exam_configurations(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES olympiad_participants(id) ON DELETE CASCADE,
  
  -- Session details
  session_code TEXT UNIQUE,  -- For joining exams
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Timing
  duration_minutes INT NOT NULL,
  time_remaining_seconds INT,
  is_paused BOOLEAN DEFAULT FALSE,
  
  -- Status
  status session_status DEFAULT 'created',
  
  -- Results
  total_score DECIMAL(8,2) DEFAULT 0,
  max_score DECIMAL(8,2) DEFAULT 0,
  percentage_score DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EXAM ANSWERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS exam_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  
  -- Answer details
  selected_answer TEXT,
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2) DEFAULT 0,
  max_points DECIMAL(5,2) DEFAULT 1.00,
  
  -- Timing
  time_taken_seconds INT,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Flag for review
  is_flagged_for_review BOOLEAN DEFAULT FALSE,
  
  UNIQUE(session_id, question_id)
);

-- ============================================================================
-- MARKING QUEUE
-- ============================================================================
CREATE TYPE marking_status AS ENUM ('pending', 'in_progress', 'completed', 'requires_review');

CREATE TABLE IF NOT EXISTS marking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  
  -- Marking details
  answer_id UUID NOT NULL REFERENCES exam_answers(id) ON DELETE CASCADE,
  assigned_marker_id UUID,  -- Admin ID
  marked_by_admin_id UUID,
  
  -- Status
  status marking_status DEFAULT 'pending',
  
  -- Scores
  auto_score DECIMAL(5,2),
  manual_score DECIMAL(5,2),
  final_score DECIMAL(5,2),
  
  -- Feedback
  marker_feedback TEXT,
  moderator_feedback TEXT,
  
  -- Timestamps
  assigned_at TIMESTAMP WITH TIME ZONE,
  marking_started_at TIMESTAMP WITH TIME ZONE,
  marking_completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(session_id, question_id)
);

-- ============================================================================
-- PROGRESSION & RANKINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS stage_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES olympiad_participants(id) ON DELETE CASCADE,
  edition_id UUID NOT NULL REFERENCES olympiad_editions(id) ON DELETE CASCADE,
  
  -- Stage details
  current_stage TEXT NOT NULL,
  stage_completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMP WITH TIME ZONE,
  
  -- Scores for this stage
  stage_score DECIMAL(8,2) DEFAULT 0,
  stage_max_score DECIMAL(8,2) DEFAULT 0,
  stage_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Ranking
  stage_rank INT,
  total_participants INT,
  
  -- Progression decision
  can_progress BOOLEAN DEFAULT FALSE,
  progression_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(participant_id, edition_id, current_stage)
);

-- ============================================================================
-- FINAL VENUES
-- ============================================================================
CREATE TABLE IF NOT EXISTS final_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID NOT NULL REFERENCES olympiad_editions(id) ON DELETE CASCADE,
  
  -- Venue details
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  venue_map_link TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(edition_id, education_level, subject)
);

-- ============================================================================
-- FINAL RESULTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS final_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES olympiad_participants(id) ON DELETE CASCADE,
  final_venue_id UUID NOT NULL REFERENCES final_venues(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  
  -- Attendance
  attendance_status TEXT,  -- PRESENT, ABSENT
  
  -- Results
  final_score DECIMAL(8, 2),
  final_rank INT,
  
  -- Awards
  award_category TEXT,  -- GOLD, SILVER, BRONZE, MERIT
  certificate_url TEXT,
  
  entered_by_admin_id UUID,
  entered_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(participant_id, final_venue_id, subject)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_olympiad_editions_status ON olympiad_editions(status);
CREATE INDEX IF NOT EXISTS idx_participants_edition ON olympiad_participants(edition_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON olympiad_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_level ON question_bank(subject, education_level);
CREATE INDEX IF NOT EXISTS idx_questions_stage ON question_bank(stage);
CREATE INDEX IF NOT EXISTS idx_exam_configs_edition ON exam_configurations(edition_id);
CREATE INDEX IF NOT EXISTS idx_sessions_participant ON exam_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_config ON exam_sessions(exam_config_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON exam_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_marking_queue_status ON marking_queue(status);
CREATE INDEX IF NOT EXISTS idx_progression_participant ON stage_progression(participant_id);
CREATE INDEX IF NOT EXISTS idx_final_results_participant ON final_results(participant_id);
`

export async function initializeOlympiadDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // Execute the schema creation
    await sql`${OLYMPIAD_SCHEMA}`
    
    // Check if tables were created successfully
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'olympiad_%' OR table_name = 'question_bank' 
      OR table_name = 'exam_configurations' OR table_name = 'exam_sessions'
      OR table_name = 'exam_answers' OR table_name = 'marking_queue'
      OR table_name = 'stage_progression' OR table_name = 'final_venues'
      OR table_name = 'final_results'
      ORDER BY table_name
    `
    
    return {
      success: true,
      message: `Database initialized successfully. Created ${tables.length} tables.`
    }
  } catch (error) {
    console.error('Database initialization failed:', error)
    return {
      success: false,
      message: `Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export async function checkDatabaseStatus(): Promise<{ initialized: boolean; tables: string[] }> {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE 'olympiad_%' OR table_name = 'question_bank' 
           OR table_name = 'exam_configurations' OR table_name = 'exam_sessions'
           OR table_name = 'exam_answers' OR table_name = 'marking_queue'
           OR table_name = 'stage_progression' OR table_name = 'final_venues'
           OR table_name = 'final_results')
      ORDER BY table_name
    `
    
    const tableNames = tables.map(t => t.table_name)
    const expectedTables = [
      'olympiad_editions', 'olympiad_participants', 'question_bank',
      'exam_configurations', 'exam_sessions', 'exam_answers',
      'marking_queue', 'stage_progression', 'final_venues', 'final_results'
    ]
    
    const initialized = expectedTables.every(table => tableNames.includes(table))
    
    return {
      initialized,
      tables: tableNames
    }
  } catch (error) {
    console.error('Database status check failed:', error)
    return {
      initialized: false,
      tables: []
    }
  }
}
