import { supabase, isSupabaseConfigured } from './supabase';

const SESSION_STORAGE_KEY = 'ai_arena_current_session_v1';

// Create a new game session & record assigned 15 questions
export const createGameSession = async (playerName, selectedQuestions) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newSession = {
    id: sessionId,
    player_name: playerName,
    status: 'in_progress',
    started_at: now,
    total_score: 0,
    challenge_1_score: 0,
    challenge_2_score: 0,
    challenge_3_score: 0,
    correct_answers: 0,
    wrong_answers: 0,
    timeouts: 0,
    accuracy: 0,
    max_streak: 0
  };

  // Attempt Supabase Insertion
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert([{
          player_name: playerName,
          status: 'in_progress',
          started_at: now
        }])
        .select()
        .single();

      if (!error && data) {
        newSession.id = data.id;

        // Insert 15 session_questions mapping
        const sessionQuestionRows = selectedQuestions.all15Questions.map((q, idx) => ({
          session_id: data.id,
          question_id: q.id.includes('_') ? null : q.id, // Handles UUID vs text fallbacks
          challenge_id: q.challenge_id,
          question_order: idx + 1
        })).filter(row => row.question_id !== null);

        if (sessionQuestionRows.length > 0) {
          await supabase.from('session_questions').insert(sessionQuestionRows);
        }
      }
    } catch (e) {
      console.warn("Supabase session creation error, proceeding locally:", e);
    }
  }

  // Save to browser sessionStorage for crash/refresh recovery
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    session: newSession,
    questions: selectedQuestions,
    timestamp: Date.now()
  }));

  return newSession;
};

// Update session score and stats
export const updateGameSession = async (sessionId, updates) => {
  if (isSupabaseConfigured() && supabase && !sessionId.startsWith('session_')) {
    try {
      await supabase
        .from('game_sessions')
        .update({
          ...updates,
          completed_at: updates.status === 'completed' ? new Date().toISOString() : undefined
        })
        .eq('id', sessionId);
    } catch (e) {
      console.warn("Supabase session update failed:", e);
    }
  }

  // Sync to local sessionStorage
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.session = { ...parsed.session, ...updates };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (e) {}
};

// Recover active session from sessionStorage
export const getActiveSessionFromStorage = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Ignore sessions older than 2 hours
    if (Date.now() - parsed.timestamp > 2 * 60 * 60 * 1000) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
};

export const clearActiveSessionStorage = () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};
