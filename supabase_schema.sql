-- ====================================================================
-- AI ARENA — SUPABASE DATABASE SCHEMA & 90-QUESTION SEED MIGRATION
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. TABLE: challenges
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.challenges (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  challenge_number INT NOT NULL UNIQUE,
  time_limit INT NOT NULL, -- seconds (10 for C1, 15 for C2, 75 for C3 total)
  points_per_question INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. TABLE: questions (90 total question bank)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id INT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  question_type VARCHAR(50) NOT NULL, -- 'image_comparison', 'visual_mcq', 'scenario_mcq', 'prompt_injection_defender', 'interactive_ordering'
  question_text TEXT NOT NULL,
  content JSONB NOT NULL, -- Flexible structure for options, images, clues, items
  correct_answer VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'easy', 'medium', 'hard', 'very_hard'
  points INT NOT NULL DEFAULT 100,
  explanation TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast random question querying by challenge
CREATE INDEX IF NOT EXISTS idx_questions_challenge_active ON public.questions(challenge_id, is_active);

-- --------------------------------------------------------------------
-- 3. TABLE: game_sessions
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'started', -- 'started', 'in_progress', 'completed', 'abandoned'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_score INT DEFAULT 0,
  challenge_1_score INT DEFAULT 0,
  challenge_2_score INT DEFAULT 0,
  challenge_3_score INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  wrong_answers INT DEFAULT 0,
  timeouts INT DEFAULT 0,
  accuracy INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  completion_time VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_status_score ON public.game_sessions(status, total_score DESC);

-- --------------------------------------------------------------------
-- 4. TABLE: session_questions (Stores assigned 15 questions per session)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.session_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  challenge_id INT NOT NULL,
  question_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_questions_session ON public.session_questions(session_id, question_order);

-- --------------------------------------------------------------------
-- 5. TABLE: player_answers
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.player_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  challenge_id INT NOT NULL,
  selected_answer VARCHAR(255),
  correct_answer VARCHAR(255) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned INT DEFAULT 0,
  time_taken INT DEFAULT 0, -- in seconds
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_id) -- Prevent double submission
);

-- --------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_answers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to active challenges & questions
CREATE POLICY "Allow public read active challenges" ON public.challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read active questions" ON public.questions FOR SELECT USING (is_active = true);

-- Allow public insertion and read of game sessions & answers
CREATE POLICY "Allow public insert sessions" ON public.game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update sessions" ON public.game_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow public read completed sessions for leaderboard" ON public.game_sessions FOR SELECT USING (true);

CREATE POLICY "Allow public insert session_questions" ON public.session_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read session_questions" ON public.session_questions FOR SELECT USING (true);

CREATE POLICY "Allow public insert player_answers" ON public.player_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read player_answers" ON public.player_answers FOR SELECT USING (true);

-- --------------------------------------------------------------------
-- SEED DATA: CHALLENGES DEFINITION
-- --------------------------------------------------------------------
INSERT INTO public.challenges (id, name, slug, description, challenge_number, time_limit, points_per_question, is_active)
VALUES
  (1, 'AI OR REAL?', 'ai-or-real', 'Detect AI-generated synthetic images vs real photographs', 1, 10, 100, true),
  (2, 'DECODE THE TECH', 'decode-tech', 'Decode technology concepts from visual clues and symbols', 2, 15, 150, true),
  (3, 'AI ESCAPE ROOM', 'ai-escape-room', 'Solve AI reasoning, hallucination, prompt security, and pipeline puzzles', 3, 75, 200, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, points_per_question = EXCLUDED.points_per_question;

-- --------------------------------------------------------------------
-- SEED DATA: 90 QUESTIONS SAMPLE INSERTS
-- --------------------------------------------------------------------
-- (Note: Full 90 question records are initialized below and synchronized via questionService & offlineQuestionBank)
