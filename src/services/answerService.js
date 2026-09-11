import { supabase, isSupabaseConfigured } from './supabase';

export const recordPlayerAnswer = async ({
  sessionId,
  questionId,
  challengeId,
  selectedAnswer,
  correctAnswer,
  isCorrect,
  pointsEarned,
  timeTaken
}) => {
  if (isSupabaseConfigured() && supabase && !sessionId.startsWith('session_') && !questionId.includes('_')) {
    try {
      await supabase.from('player_answers').insert([{
        session_id: sessionId,
        question_id: questionId,
        challenge_id: challengeId,
        selected_answer: String(selectedAnswer),
        correct_answer: String(correctAnswer),
        is_correct: isCorrect,
        points_earned: pointsEarned,
        time_taken: timeTaken
      }]);
    } catch (e) {
      console.warn("Supabase record answer error:", e);
    }
  }
};
