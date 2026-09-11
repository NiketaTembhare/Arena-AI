import { supabase, isSupabaseConfigured } from './supabase';
import { getLeaderboard as getLocalLeaderboard, saveScoreToLeaderboard as saveLocalLeaderboard } from '../game/storage';

export const fetchGlobalLeaderboard = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('status', 'completed')
        .order('total_score', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        return data.map((row, idx) => ({
          id: row.id,
          name: row.player_name,
          score: row.total_score,
          accuracy: row.accuracy || 0,
          timeTaken: row.completion_time || '3m 00s',
          rankTitle: getRankTitleByScore(row.total_score),
          date: row.completed_at ? row.completed_at.split('T')[0] : new Date().toISOString().split('T')[0]
        }));
      }
    } catch (e) {
      console.warn("Supabase leaderboard query failed, utilizing local fallback:", e);
    }
  }

  return getLocalLeaderboard();
};

export const submitFinalSessionScore = async (summary) => {
  saveLocalLeaderboard(summary);
  return await fetchGlobalLeaderboard();
};

const getRankTitleByScore = (score) => {
  if (score >= 2001) return "AI MASTER";
  if (score >= 1501) return "AI EXPERT";
  if (score >= 1001) return "AI CHALLENGER";
  if (score >= 501) return "AI EXPLORER";
  return "AI ROOKIE";
};
