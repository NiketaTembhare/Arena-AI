import React, { useState, useEffect, useRef } from 'react';
import { Play, Users, Trophy, Clock, ArrowRight, RefreshCw, Zap, Shield, Sparkles } from 'lucide-react';
import { createRoom, getHostRoomFromStorage, startRoomRound, updateRoomStatus, getRoomPlayers, fetchRoomAnswers, subscribeToRoomPlayers, subscribeToRoomAnswers } from '../services/roomService';
import { GAME_CONFIG } from '../game/config';
import { audioEngine } from '../game/audioEngine';

export const HostView = ({ onBackHome }) => {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const timerRef = useRef(null);

  // Restore existing host room on mount from DB / storage
  useEffect(() => {
    const stored = getHostRoomFromStorage();
    if (stored && stored.room_code) {
      getRoomByCode(stored.room_code).then(rm => {
        const activeRoom = rm || stored;
        setRoom(activeRoom);
        getRoomPlayers(activeRoom.id).then(setPlayers);
        fetchRoomAnswers(activeRoom.id).then(setAnswers);
      });
    }
  }, []);


  // Subscriptions for player join & answer submission
  useEffect(() => {
    if (!room) return;

    const unsubscribePlayers = subscribeToRoomPlayers(room.id, (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    const unsubscribeAnswers = subscribeToRoomAnswers(room.id, (updatedAnswers) => {
      setAnswers(updatedAnswers);
    });

    return () => {
      if (unsubscribePlayers) unsubscribePlayers();
      if (unsubscribeAnswers) unsubscribeAnswers();
    };
  }, [room?.id]);

  // Server-Authoritative Timer Countdown calculation
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (room && (room.status === 'round1' || room.status === 'round2' || room.status === 'round3')) {
      const startedAt = new Date(room.round_started_at).getTime();
      const duration = room.round_duration_seconds;

      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        setTimerRemaining(remaining);

        if (remaining <= 4 && remaining > 0) {
          audioEngine.playTick();
        }

        // Auto advance to results 2s after timer ends
        if (remaining === 0) {
          clearInterval(timerRef.current);
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.status, room?.round_started_at, room?.round_duration_seconds]);

  const handleCreateRoom = async () => {
    audioEngine.playClick();
    setIsStarting(true);
    try {
      const newRoom = await createRoom();
      setRoom(newRoom);
      setPlayers([]);
      setAnswers([]);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartRound = async (roundNum) => {
    if (!room) return;
    audioEngine.playClick();
    setIsStarting(true);
    try {
      const updated = await startRoomRound(room.id, roundNum);
      if (updated) setRoom(updated);
    } finally {
      setIsStarting(false);
    }
  };

  const handleAdvanceStatus = async (nextStatus) => {
    if (!room) return;
    audioEngine.playClick();
    setIsStarting(true);
    try {
      const updated = await updateRoomStatus(room.id, nextStatus);
      if (updated) setRoom(updated);
    } finally {
      setIsStarting(false);
    }
  };

  // Calculate Leaderboard from answers
  const calculateLeaderboard = () => {
    const scores = {};
    players.forEach(p => {
      scores[p.id] = { id: p.id, name: p.display_name, totalScore: 0, answersCount: 0 };
    });

    answers.forEach(ans => {
      if (!scores[ans.player_id]) {
        scores[ans.player_id] = { id: ans.player_id, name: ans.room_players?.display_name || 'Agent', totalScore: 0, answersCount: 0 };
      }
      scores[ans.player_id].totalScore += ans.points_earned || 0;
      scores[ans.player_id].answersCount += 1;
    });

    return Object.values(scores).sort((a, b) => b.totalScore - a.totalScore);
  };

  const leaderboard = calculateLeaderboard();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center min-h-[calc(100vh-100px)] relative z-10">
      <div className="glass-panel p-6 sm:p-10 rounded-3xl w-full border border-cyan-500/40 flex flex-col gap-8 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-2xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide">
                  HOST CONTROL CONSOLE
                </h2>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase">
                  EXPO BOOTH LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Synchronous Multiplayer Room Controller
              </p>
            </div>
          </div>

          <button onClick={onBackHome} className="btn-cyber-secondary text-xs py-2 px-4">
            ← ARENA HOME
          </button>
        </div>

        {/* Room Creation Panel if no room active */}
        {!room ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 text-4xl shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              👑
            </div>
            <div>
              <h3 className="font-heading font-bold text-2xl text-white">Create a Multiplayer Room</h3>
              <p className="text-sm text-slate-300 max-w-md mt-1">
                Generate a short room code for players to join on their mobile phones.
              </p>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isStarting}
              className="btn-cyber-primary py-4 px-8 text-base shadow-[0_0_30px_rgba(6,182,212,0.4)]"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isStarting ? "CREATING ROOM..." : "CREATE EXPO ROOM"}</span>
            </button>
          </div>
        ) : (
          /* Active Room Management Console */
          <div className="flex flex-col gap-8">
            
            {/* Top Bar: Room Code & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-center md:text-left items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">ROOM CODE</span>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="font-heading font-black text-4xl text-cyan-300 tracking-wider">
                    {room.room_code}
                  </span>
                  <a
                    href={`?mode=screen&room=${room.room_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-cyber-secondary text-xs py-1.5 px-3 flex items-center gap-1 border-cyan-400/40 text-cyan-300"
                  >
                    <span>OPEN BIG SCREEN ↗</span>
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-start justify-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">JOINED PLAYERS</span>
                <span className="font-heading font-bold text-2xl text-emerald-400 flex items-center gap-2">
                  <Users className="w-5 h-5" /> {players.length} Players
                </span>
              </div>

              <div className="flex flex-col items-center md:items-end justify-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">CURRENT STATUS</span>
                <span className="font-mono text-sm font-bold text-amber-300 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  {room.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Stage Action Controllers */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
              <h4 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" /> STAGE CONTROLS
              </h4>

              {/* LOBBY CONTROLS */}
              {room.status === 'lobby' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <h5 className="font-bold text-white">Lobby Phase Active</h5>
                    <p className="text-xs text-slate-400">Wait for players to join, then start Round 1.</p>
                  </div>

                  <button
                    onClick={() => handleStartRound(1)}
                    disabled={isStarting || players.length === 0}
                    className="btn-cyber-primary py-3 px-6 text-sm"
                  >
                    <Play className="w-4 h-4" />
                    <span>START ROUND 1 (AI OR REAL?)</span>
                  </button>
                </div>
              )}

              {/* ROUND 1 ACTIVE CONTROLS */}
              {room.status === 'round1' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-cyan-400 animate-pulse" />
                    <div>
                      <h5 className="font-bold text-white">Round 1 In Progress</h5>
                      <span className="font-heading font-black text-2xl text-cyan-300">
                        {timerRemaining}s Remaining
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdvanceStatus('round1_results')}
                    disabled={isStarting}
                    className="btn-cyber-secondary py-3 px-5 text-xs"
                  >
                    <span>SHOW ROUND 1 RESULTS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ROUND 1 RESULTS CONTROLS */}
              {room.status === 'round1_results' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <h5 className="font-bold text-white">Round 1 Results Displayed</h5>
                    <p className="text-xs text-slate-400">Review standings on screen, then launch Round 2.</p>
                  </div>

                  <button
                    onClick={() => handleStartRound(2)}
                    disabled={isStarting}
                    className="btn-cyber-primary py-3 px-6 text-sm"
                  >
                    <Play className="w-4 h-4" />
                    <span>START ROUND 2 (DECODE TECH)</span>
                  </button>
                </div>
              )}

              {/* ROUND 2 ACTIVE CONTROLS */}
              {room.status === 'round2' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-purple-950/40 border border-purple-500/40">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-purple-400 animate-pulse" />
                    <div>
                      <h5 className="font-bold text-white">Round 2 In Progress</h5>
                      <span className="font-heading font-black text-2xl text-purple-300">
                        {timerRemaining}s Remaining
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdvanceStatus('round2_results')}
                    disabled={isStarting}
                    className="btn-cyber-secondary py-3 px-5 text-xs"
                  >
                    <span>SHOW ROUND 2 RESULTS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ROUND 2 RESULTS CONTROLS */}
              {room.status === 'round2_results' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <h5 className="font-bold text-white">Round 2 Results Displayed</h5>
                    <p className="text-xs text-slate-400">Ready for the final AI Escape Room puzzle!</p>
                  </div>

                  <button
                    onClick={() => handleStartRound(3)}
                    disabled={isStarting}
                    className="btn-cyber-primary py-3 px-6 text-sm"
                  >
                    <Play className="w-4 h-4" />
                    <span>START ROUND 3 (AI ESCAPE ROOM)</span>
                  </button>
                </div>
              )}

              {/* ROUND 3 ACTIVE CONTROLS */}
              {room.status === 'round3' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-rose-400 animate-pulse" />
                    <div>
                      <h5 className="font-bold text-white">Round 3 AI Escape Room In Progress</h5>
                      <span className="font-heading font-black text-2xl text-rose-300">
                        {timerRemaining}s Remaining
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdvanceStatus('final_results')}
                    disabled={isStarting}
                    className="btn-cyber-primary py-3 px-5 text-xs bg-rose-600 border-rose-400"
                  >
                    <span>SHOW FINAL CHAMPION PODIUM</span>
                    <Trophy className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* FINAL RESULTS CONTROLS */}
              {room.status === 'final_results' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40">
                  <div>
                    <h5 className="font-bold text-amber-300">Match Completed!</h5>
                    <p className="text-xs text-slate-300">Final scores are live on the Big Screen.</p>
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    disabled={isStarting}
                    className="btn-cyber-primary py-3 px-6 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>CREATE NEW MATCH ROOM</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Joined Players & Leaderboard Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Joined Roster */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h5 className="font-heading font-bold text-white flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-cyan-400" /> JOINED ROSTER ({players.length})
                  </h5>
                  <span className="text-[10px] font-mono text-slate-400">REALTIME SYNC</span>
                </div>

                {players.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 font-mono">
                    Waiting for players to join with code <span className="text-cyan-400 font-bold">{room.room_code}</span>...
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1">
                    {players.map((p, idx) => (
                      <div key={p.id || idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-200">{p.display_name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">CONNECTED</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Standings */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h5 className="font-heading font-bold text-white flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-amber-400" /> LIVE STANDINGS
                  </h5>
                  <span className="text-[10px] font-mono text-slate-400">{answers.length} Answers</span>
                </div>

                {leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 font-mono">
                    Scores will update in real-time as answers arrive.
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1">
                    {leaderboard.map((entry, idx) => (
                      <div key={entry.id || idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <span className="text-cyan-400 font-mono text-xs">#{idx + 1}</span>
                          <span className="text-white">{entry.name}</span>
                        </div>
                        <span className="font-heading font-bold text-amber-300 text-base">
                          {entry.totalScore} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
