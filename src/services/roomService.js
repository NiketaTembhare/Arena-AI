import { supabase, isSupabaseConfigured } from './supabase';
import { GAME_CONFIG } from '../game/config';
import { fetchRandomQuestionsForChallenge, formatAndRandomizeQuestion } from './questionService';
import { OFFLINE_QUESTION_BANK } from '../data/offlineQuestionBank';

const HOST_STORAGE_KEY = 'ai_arena_host_room_v1';
const PLAYER_STORAGE_KEY = 'ai_arena_player_session_v1';

// Helper: Shuffle array items
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate a short 5-character uppercase human-readable room code
export const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new Host Room
export const createRoom = async () => {
  const roomCode = generateRoomCode();
  const hostId = `host_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newRoom = {
    id: `room_${Date.now()}`,
    room_code: roomCode,
    host_id: hostId,
    status: 'lobby',
    current_round: 0,
    round_started_at: null,
    round_duration_seconds: 0,
    created_at: now
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      // Single Active Room Enforcer: Archive any previous unfinished rooms to final_results
      await supabase
        .from('game_rooms')
        .update({ status: 'final_results' })
        .neq('status', 'final_results');

      const { data, error } = await supabase
        .from('game_rooms')
        .insert([{
          room_code: roomCode,
          host_id: hostId,
          status: 'lobby',
          current_round: 0
        }])
        .select()
        .single();

      if (!error && data) {
        newRoom.id = data.id;
      }
    } catch (e) {
      console.warn("Supabase createRoom error, proceeding locally:", e);
    }
  }

  // Persist host room in localStorage
  try {
    localStorage.setItem(HOST_STORAGE_KEY, JSON.stringify(newRoom));
  } catch (e) {}

  return newRoom;
};

// Fetch most recently created room for Big Screen auto-connection
export const getLatestRoom = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase getLatestRoom error:", e);
    }
  }

  const storedHost = localStorage.getItem(HOST_STORAGE_KEY);
  if (storedHost) {
    try {
      return JSON.parse(storedHost);
    } catch (e) {}
  }
  return null;
};

// Fetch Room by Code
export const getRoomByCode = async (roomCode) => {
  const cleanCode = roomCode.trim().toUpperCase();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', cleanCode)
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase getRoomByCode error:", e);
    }
  }

  // Local fallback
  const storedHost = localStorage.getItem(HOST_STORAGE_KEY);
  if (storedHost) {
    const parsed = JSON.parse(storedHost);
    if (parsed.room_code === cleanCode) return parsed;
  }
  return null;
};

// Host recovery from storage
export const getHostRoomFromStorage = () => {
  try {
    const raw = localStorage.getItem(HOST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

// Join Room as a Player (Device Token persistent identity)
export const joinRoom = async (roomCode, displayName) => {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new Error("Room code not found. Please verify the code.");

  let deviceToken = localStorage.getItem('ai_arena_device_token');
  if (!deviceToken) {
    deviceToken = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('ai_arena_device_token', deviceToken);
  }

  const playerObj = {
    id: `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    room_id: room.id,
    display_name: displayName,
    device_token: deviceToken,
    joined_at: new Date().toISOString()
  };

  if (isSupabaseConfigured() && supabase && !room.id.startsWith('room_')) {
    try {
      // Check if player already exists in room
      const { data: existing } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', room.id)
        .eq('device_token', deviceToken)
        .maybeSingle();

      if (existing) {
        // Update display name if changed
        const { data: updated } = await supabase
          .from('room_players')
          .update({ display_name: displayName })
          .eq('id', existing.id)
          .select()
          .single();
        playerObj.id = updated ? updated.id : existing.id;
      } else {
        const { data, error } = await supabase
          .from('room_players')
          .insert([{
            room_id: room.id,
            display_name: displayName,
            device_token: deviceToken
          }])
          .select()
          .single();

        if (!error && data) playerObj.id = data.id;
      }
    } catch (e) {
      console.warn("Supabase joinRoom error:", e);
    }
  }

  // Save active player session
  localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify({
    roomCode: room.room_code,
    roomId: room.id,
    player: playerObj,
    deviceToken
  }));

  return { room, player: playerObj };
};

// Fetch list of joined players in a room
export const getRoomPlayers = async (roomId) => {
  if (isSupabaseConfigured() && supabase && !roomId.startsWith('room_')) {
    try {
      const { data, error } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase getRoomPlayers error:", e);
    }
  }

  // Fallback to local storage
  const stored = localStorage.getItem(PLAYER_STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.roomId === roomId) return [parsed.player];
  }
  return [];
};

// Host: Start Round & Sample 5-of-20 Questions Server-side Per Player
export const startRoomRound = async (roomId, roundNumber) => {
  const players = await getRoomPlayers(roomId);
  
  let roundDuration = GAME_CONFIG.challenge1.timerSeconds;
  if (roundNumber === 2) roundDuration = GAME_CONFIG.challenge2.timerSeconds;
  if (roundNumber === 3) roundDuration = GAME_CONFIG.challenge3.totalTimerSeconds;

  // 1. Fetch 20-question pool for this round
  let pool = await fetchRandomQuestionsForChallenge(roundNumber, 20);
  if (!pool || pool.length < 5) {
    const key = `challenge${roundNumber}`;
    pool = (OFFLINE_QUESTION_BANK[key] || []).map(q => formatAndRandomizeQuestion(q));
  }

  // Server-Timed 3s Countdown: round_started_at is set 3 seconds into the future
  const roundStartedAt = new Date(Date.now() + 3000).toISOString();

  // 2. For each player, generate a unique random 5-question selection & ordering
  if (isSupabaseConfigured() && supabase && !roomId.startsWith('room_')) {
    try {
      const roundQuestionRows = [];
      players.forEach(player => {
        const player5 = shuffleArray(pool).slice(0, 5);
        player5.forEach((q, idx) => {
          // Format & randomize image/option order per player
          const formatted = formatAndRandomizeQuestion(q);
          roundQuestionRows.push({
            room_id: roomId,
            player_id: player.id,
            round: roundNumber,
            question_id: String(q.id),
            question_data: formatted,
            position: idx + 1
          });
        });
      });

      if (roundQuestionRows.length > 0) {
        // Delete previous round questions for this round if any, then insert
        await supabase.from('room_round_questions').delete().eq('room_id', roomId).eq('round', roundNumber);
        await supabase.from('room_round_questions').insert(roundQuestionRows);
      }

      // Update room status
      const { data: updatedRoom } = await supabase
        .from('game_rooms')
        .update({
          status: `round${roundNumber}`,
          current_round: roundNumber,
          round_started_at: roundStartedAt,
          round_duration_seconds: roundDuration
        })
        .eq('id', roomId)
        .select()
        .single();

      return updatedRoom;
    } catch (e) {
      console.warn("Supabase startRoomRound error:", e);
    }
  }

  // Local state update fallback
  const storedHost = localStorage.getItem(HOST_STORAGE_KEY);
  if (storedHost) {
    const parsed = JSON.parse(storedHost);
    parsed.status = `round${roundNumber}`;
    parsed.current_round = roundNumber;
    parsed.round_started_at = roundStartedAt;
    parsed.round_duration_seconds = roundDuration;
    localStorage.setItem(HOST_STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  }

  return null;
};

// Host: Update Room Status (e.g. 'round1_results', 'round2', 'final_results')
export const updateRoomStatus = async (roomId, newStatus) => {
  if (isSupabaseConfigured() && supabase && !roomId.startsWith('room_')) {
    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .update({ status: newStatus })
        .eq('id', roomId)
        .select()
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase updateRoomStatus error:", e);
    }
  }

  const storedHost = localStorage.getItem(HOST_STORAGE_KEY);
  if (storedHost) {
    const parsed = JSON.parse(storedHost);
    parsed.status = newStatus;
    localStorage.setItem(HOST_STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  }
  return null;
};

// Player: Fetch assigned 5 questions for a given round
export const getPlayerRoundQuestions = async (roomId, playerId, roundNumber) => {
  if (isSupabaseConfigured() && supabase && !roomId.startsWith('room_')) {
    try {
      const { data, error } = await supabase
        .from('room_round_questions')
        .select('*')
        .eq('room_id', roomId)
        .eq('player_id', playerId)
        .eq('round', roundNumber)
        .order('position', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(row => row.question_data);
      }
    } catch (e) {
      console.warn("Supabase getPlayerRoundQuestions error:", e);
    }
  }

  // Fallback: Sample 5 from offline bank
  const key = `challenge${roundNumber}`;
  const bank = OFFLINE_QUESTION_BANK[key] || [];
  return shuffleArray(bank).slice(0, 5).map(q => formatAndRandomizeQuestion(q));
};

// Player: Submit an answer to room_answers
export const submitRoomAnswer = async ({
  roomId,
  playerId,
  round,
  questionId,
  selectedOption,
  isCorrect,
  pointsEarned,
  responseTimeMs
}) => {
  if (isSupabaseConfigured() && supabase && !roomId.startsWith('room_')) {
    try {
      await supabase.from('room_answers').insert([{
        room_id: roomId,
        player_id: playerId,
        round,
        question_id: String(questionId),
        selected_option: String(selectedOption),
        is_correct: isCorrect,
        points_earned: pointsEarned,
        response_time_ms: responseTimeMs
      }]);
    } catch (e) {
      console.warn("Supabase submitRoomAnswer error:", e);
    }
  }
};

// Fetch live room answers for leaderboard calculations
export const fetchRoomAnswers = async (roomId) => {
  if (isSupabaseConfigured() && supabase && !roomId.startsWith('room_')) {
    try {
      const { data, error } = await supabase
        .from('room_answers')
        .select('*, room_players(display_name)')
        .eq('room_id', roomId);

      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase fetchRoomAnswers error:", e);
    }
  }
  return [];
};

// Supabase Realtime Subscriptions
export const subscribeToRoom = (roomId, onUpdate) => {
  if (!isSupabaseConfigured() || !supabase || roomId.startsWith('room_')) return () => {};

  const channel = supabase
    .channel(`room_${roomId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'game_rooms',
      filter: `id=eq.${roomId}`
    }, payload => {
      if (payload.new) onUpdate(payload.new);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToRoomPlayers = (roomId, onUpdate) => {
  if (!isSupabaseConfigured() || !supabase || roomId.startsWith('room_')) return () => {};

  const channel = supabase
    .channel(`players_${roomId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'room_players',
      filter: `room_id=eq.${roomId}`
    }, () => {
      getRoomPlayers(roomId).then(onUpdate);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToRoomAnswers = (roomId, onUpdate) => {
  if (!isSupabaseConfigured() || !supabase || roomId.startsWith('room_')) return () => {};

  const channel = supabase
    .channel(`answers_${roomId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'room_answers',
      filter: `room_id=eq.${roomId}`
    }, () => {
      fetchRoomAnswers(roomId).then(onUpdate);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Admin Question Management CRUD
export const fetchAdminQuestions = async (roundFilter = null) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('questions').select('*').order('round', { ascending: true }).order('created_at', { ascending: true });
      if (roundFilter && roundFilter !== 'all') {
        query = query.eq('round', parseInt(roundFilter, 10));
      }
      const { data, error } = await query;
      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase fetchAdminQuestions error:", e);
    }
  }
  return [];
};

export const createQuestion = async (questionData) => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  return { id: `q_local_${Date.now()}`, ...questionData };
};

export const updateQuestion = async (id, questionData) => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('questions')
      .update(questionData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  return { id, ...questionData };
};

export const toggleQuestionActive = async (id, currentIsActive) => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('questions')
      .update({ is_active: !currentIsActive })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  return { id, is_active: !currentIsActive };
};

