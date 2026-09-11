// Central Game Configuration for AI ARENA Expo & Supabase Architecture

export const GAME_CONFIG = {
  // Challenge 1: AI OR REAL?
  challenge1: {
    totalQuestions: 5,
    timerSeconds: 10,
    basePoints: 100,
    speedBonusTier1: { thresholdSec: 5, bonus: 25 },
    speedBonusTier2: { thresholdSec: 3, bonus: 50 },
  },

  // Challenge 2: DECODE THE TECH
  challenge2: {
    totalQuestions: 5,
    timerSeconds: 15,
    basePoints: 150,
    speedBonusTier1: { thresholdSec: 7, bonus: 30 },
    speedBonusTier2: { thresholdSec: 4, bonus: 60 },
  },

  // Challenge 3: AI ESCAPE ROOM
  challenge3: {
    totalQuestions: 5,
    totalTimerSeconds: 75, // 75 seconds total for all 5 questions
    basePointsPerPuzzle: 200,
    timeBonusTier1: { thresholdRemainingSec: 25, bonus: 100 },
    timeBonusTier2: { thresholdRemainingSec: 40, bonus: 200 },
  },

  // Streak Multipliers & Bonuses
  streak: {
    minStreakForBonus: 2,
    bonusPerStreakLevel: 20, // +20 * currentStreak
  },

  // Rank Definitions (Based on Total Base Score ~2250 + bonuses)
  ranks: [
    { minScore: 0, maxScore: 500, title: "AI ROOKIE", color: "#a0aec0", badge: "🌱", tagline: "Initiating AI Neural Path" },
    { minScore: 501, maxScore: 1000, title: "AI EXPLORER", color: "#38bdf8", badge: "🔍", tagline: "Decoding Synthetic Knowledge" },
    { minScore: 1001, maxScore: 1500, title: "AI CHALLENGER", color: "#a855f7", badge: "⚡", tagline: "Mastering Cyber Prompting" },
    { minScore: 1501, maxScore: 2000, title: "AI EXPERT", color: "#f43f5e", badge: "🔥", tagline: "Outsmarting Complex Models" },
    { minScore: 2001, maxScore: 99999, title: "AI MASTER", color: "#eab308", badge: "🏆", tagline: "Supreme Arena Champion" },
  ],

  // Expo Settings
  expoMode: {
    inactivityTimeoutSec: 60, // Auto reset to Home if idle
  }
};
