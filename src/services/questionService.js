import { supabase, isSupabaseConfigured } from './supabase';
import { OFFLINE_QUESTION_BANK } from '../data/offlineQuestionBank';

// Randomize array items helper
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Fetch 5 random active questions for a given challenge
export const fetchRandomQuestionsForChallenge = async (challengeId, count = 5) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('is_active', true);

      if (!error && data && data.length >= count) {
        const shuffled = shuffleArray(data).slice(0, count);
        return shuffled.map(q => formatAndRandomizeQuestion(q));
      }
    } catch (e) {
      console.warn("Supabase fetch failed, utilizing offline fallback dataset:", e);
    }
  }

  // Fallback to local 90-question bank
  const key = `challenge${challengeId}`;
  const bank = OFFLINE_QUESTION_BANK[key] || [];
  const activeBank = bank.filter(q => q.is_active);
  const selected = shuffleArray(activeBank).slice(0, count);
  return selected.map(q => formatAndRandomizeQuestion(q));
};

// Process & Randomize question display while preserving correct answer
export const formatAndRandomizeQuestion = (q) => {
  const formatted = { ...q };

  // Challenge 1: Image comparison position randomization (A vs B)
  if (q.question_type === 'image_comparison' && q.content) {
    const swap = Math.random() > 0.5;
    if (swap) {
      formatted.displayImageA = q.content.image_b;
      formatted.displayImageB = q.content.image_a;
      // If original correct answer was B, swapping puts AI in A
      formatted.displayCorrectPos = q.correct_answer === 'B' ? 'A' : 'B';
    } else {
      formatted.displayImageA = q.content.image_a;
      formatted.displayImageB = q.content.image_b;
      formatted.displayCorrectPos = q.correct_answer;
    }
  }

  // Challenge 2 & 3: MCQ Option Shuffling
  if ((q.question_type === 'visual_mcq' || q.question_type === 'scenario_mcq' || q.question_type === 'prompt_injection' || q.question_type === 'hallucination') && q.options) {
    const originalOptions = q.options.map((opt, idx) => ({
      ...opt,
      originalIndex: idx,
      isCorrect: (typeof opt === 'object' ? opt.id : opt) === q.correct_answer || idx === q.correct_answer
    }));
    formatted.shuffledOptions = shuffleArray(originalOptions);
  }

  return formatted;
};

// Fetch complete 15 session questions (5 per challenge)
export const fetchFullSessionQuestions = async () => {
  const [c1, c2, c3] = await Promise.all([
    fetchRandomQuestionsForChallenge(1, 5),
    fetchRandomQuestionsForChallenge(2, 5),
    fetchRandomQuestionsForChallenge(3, 5)
  ]);

  return {
    challenge1: c1,
    challenge2: c2,
    challenge3: c3,
    all15Questions: [...c1, ...c2, ...c3]
  };
};
