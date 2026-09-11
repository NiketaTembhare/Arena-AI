// LocalStorage Leaderboard Manager for AI ARENA

const LEADERBOARD_KEY = "ai_arena_leaderboard_v1";

// Initial sample leaderboard for initial expo setup
const INITIAL_LEADERBOARD = [
  { id: "1", name: "Rahul Sharma", score: 2180, accuracy: 95, timeTaken: "2m 14s", rankTitle: "AI MASTER", date: "2026-09-11" },
  { id: "2", name: "Sneha Patel", score: 2050, accuracy: 90, timeTaken: "2m 28s", rankTitle: "AI MASTER", date: "2026-09-11" },
  { id: "3", name: "Amit Verma", score: 1890, accuracy: 85, timeTaken: "2m 45s", rankTitle: "AI EXPERT", date: "2026-09-11" },
  { id: "4", name: "Priya Nair", score: 1720, accuracy: 80, timeTaken: "3m 02s", rankTitle: "AI EXPERT", date: "2026-09-11" },
  { id: "5", name: "Arjun Gupta", score: 1560, accuracy: 78, timeTaken: "3m 15s", rankTitle: "AI EXPERT", date: "2026-09-11" }
];

export const getLeaderboard = () => {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    if (!data) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(INITIAL_LEADERBOARD));
      return INITIAL_LEADERBOARD;
    }
    return JSON.parse(data);
  } catch (e) {
    console.warn("Failed to load leaderboard from localStorage", e);
    return INITIAL_LEADERBOARD;
  }
};

export const saveScoreToLeaderboard = (playerResult) => {
  try {
    const current = getLeaderboard();
    const newEntry = {
      id: Date.now().toString(),
      name: playerResult.playerName || "Anonymous Agent",
      score: playerResult.score || 0,
      accuracy: playerResult.accuracy || 0,
      timeTaken: playerResult.timeTakenFormatted || "3m 00s",
      rankTitle: playerResult.rank?.title || "AI ROOKIE",
      date: new Date().toISOString().split("T")[0]
    };

    const updated = [...current, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Keep top 50 scores

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Failed to save score to localStorage", e);
    return getLeaderboard();
  }
};

export const clearLeaderboard = () => {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(INITIAL_LEADERBOARD));
    return INITIAL_LEADERBOARD;
  } catch (e) {
    return INITIAL_LEADERBOARD;
  }
};
