import React, { useState, useEffect, useRef } from 'react';
import { Play, Users, Trophy, Clock, ArrowRight, RefreshCw, Zap, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createRoom, getLatestRoom, getHostRoomFromStorage, startRoomRound, updateRoomStatus, getRoomPlayers, fetchRoomAnswers, subscribeToRoom, subscribeToRoomPlayers, subscribeToRoomAnswers } from '../services/roomService';
import { GAME_CONFIG } from '../game/config';
import { audioEngine } from '../game/audioEngine';

export const HostView = ({ onBackHome }) => {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [prevStatus, setPrevStatus] = useState(null);
  const timerRef = useRef(null);

  // DB Refresh Resilience: Restore host room from storage & re-fetch current status from DB
  const refreshRoomData = async (targetRoomId) => {
    if (!targetRoomId) return;
    const currentPlayers = await getRoomPlayers(targetRoomId);
    setPlayers(currentPlayers || []);
    const currentAnswers = await fetchRoomAnswers(targetRoomId);
    setAnswers(currentAnswers || []);
  };

  useEffect(() => {
    let isMounted = true;
    const initRoom = async () => {
      const stored = getHostRoomFromStorage();
      const latest = await getLatestRoom();
      const activeRoom = latest || stored;

      if (isMounted && activeRoom) {
        setRoom(activeRoom);
        refreshRoomData(activeRoom.id);
      }
    };

    initRoom();

    return () => {
      isMounted = false;
    };
  }, []);

  // Subscriptions for room changes, players, and answers
  useEffect(() => {
    if (!room?.id) return;

    const unsubRoom = subscribeToRoom(room.id, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    const unsubPlayers = subscribeToRoomPlayers(room.id, (updatedPlayers) => {
      setPlayers(updatedPlayers || []);
    });

    const unsubAnswers = subscribeToRoomAnswers(room.id, (updatedAnswers) => {
      setAnswers(updatedAnswers || []);
    });

    return () => {
      if (unsubRoom) unsubRoom();
      if (unsubPlayers) unsubPlayers();
      if (unsubAnswers) unsubAnswers();
    };
  }, [room?.id]);

  // Audio cue triggers strictly on room status transition
  useEffect(() => {
    if (!room || !isAudioUnlocked) return;
    if (prevStatus !== room.status) {
      if (room.status === 'round1' || room.status === 'round2' || room.status === 'round3') {
        audioEngine.playChallengeComplete();
      } else if (room.status.endsWith('_results')) {
        audioEngine.playVictory();
      }
      setPrevStatus(room.status);
    }
  }, [room?.status, isAudioUnlocked, prevStatus]);

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

  // Calculate Cumulative Leaderboard from players and answers
  const calculateLeaderboard = () => {
    const playerMap = {};
    players.forEach(p => {
      const name = p.display_name || p.name || 'Player';
      playerMap[p.id] = { id: p.id, name, score: 0, correctCount: 0, totalAns: 0 };
    });

    answers.forEach(ans => {
      const pName = ans.room_players?.display_name || playerMap[ans.player_id]?.name || 'Player';
      if (!playerMap[ans.player_id]) {
        playerMap[ans.player_id] = { id: ans.player_id, name: pName, score: 0, correctCount: 0, totalAns: 0 };
      }
      playerMap[ans.player_id].score += (ans.points_earned || 0);
      playerMap[ans.player_id].totalAns += 1;
      if (ans.is_correct) playerMap[ans.player_id].correctCount += 1;
    });

    return Object.values(playerMap).sort((a, b) => b.score - a.score);
  };

  const leaderboard = calculateLeaderboard();
  const joinUrl = room ? `${window.location.origin}${window.location.pathname.replace(/\/host\/?$/, '')}?room=${room.room_code}` : '';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6 relative z-10 min-h-screen text-white">
      
      {/* Top Header Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-2xl">
            ⚡
          </div>
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-wider">
              TCS EXPO • AI ARENA HOST CONSOLE
            </h1>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              LIVE AUDIENCE & PROJECTOR VIEW
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {room && (room.status === 'round1' || room.status === 'round2' || room.status === 'round3') && (
            <div className="flex items-center gap-3 bg-slate-950/90 px-6 py-2.5 rounded-2xl border-2 border-cyan-400">
              <Clock className="w-6 h-6 text-cyan-400 animate-pulse" />
              <span className="font-heading font-black text-2xl sm:text-3xl text-cyan-300 font-mono">
                {timerRemaining}s
              </span>
            </div>
          )}

          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              const nextState = !isAudioUnlocked;
              setIsAudioUnlocked(nextState);
              if (nextState) audioEngine.playClick();
            }}
            className="p-3 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center justify-center"
            title={isAudioUnlocked ? "Mute Sound" : "Enable Sound"}
          >
            {isAudioUnlocked ? <Volume2 className="w-6 h-6 text-cyan-400" /> : <VolumeX className="w-6 h-6 text-rose-400" />}
          </button>

          <button onClick={onBackHome} className="btn-cyber-secondary text-xs py-2.5 px-4">
            ← HOME
          </button>
        </div>
      </div>

      {/* STATE A — NO ACTIVE ROOM */}
      {!room ? (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-6 glass-panel p-10 rounded-3xl border border-cyan-500/40 my-auto">
          <div className="w-24 h-24 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 text-5xl shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            👑
          </div>
          <div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">START A NEW BOOTH EVENT</h2>
            <p className="text-sm text-slate-300 max-w-md mt-2">
              Archives any active room and initializes a new live multiplayer arena session for booth visitors.
            </p>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={isStarting}
            className="btn-cyber-primary py-5 px-10 text-lg shadow-[0_0_40px_rgba(6,182,212,0.5)] flex items-center gap-3"
          >
            <Sparkles className="w-6 h-6" />
            <span>{isStarting ? "STARTING EVENT..." : "START NEW EVENT"}</span>
          </button>
        </div>
      ) : (
        /* ACTIVE ROOM HOST & PROJECTOR VIEW */
        <div className="flex flex-col gap-6">

          {/* HOST CONTROL BAR (ALWAY VISIBLE TOP BANNER) */}
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border-2 border-cyan-400 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">BOOTH ROOM CODE</span>
                <span className="font-heading font-black text-3xl text-cyan-300 tracking-wider">
                  {room.room_code}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">STATUS</span>
                <span className="font-mono text-xs font-bold text-amber-300 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  {room.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* STAGE ACTION CONTROLLER BUTTONS */}
            <div className="flex items-center gap-3">
              {room.status === 'lobby' && (
                <button
                  onClick={() => handleStartRound(1)}
                  disabled={isStarting || players.length === 0}
                  className="btn-cyber-primary py-3 px-6 text-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>START ROUND 1 (AI OR REAL?)</span>
                </button>
              )}

              {room.status === 'round1' && (
                <button
                  onClick={() => handleAdvanceStatus('round1_results')}
                  disabled={isStarting}
                  className="btn-cyber-secondary py-3 px-6 text-xs flex items-center gap-2 border-cyan-400 text-cyan-300"
                >
                  <span>SHOW ROUND 1 RESULTS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {room.status === 'round1_results' && (
                <button
                  onClick={() => handleStartRound(2)}
                  disabled={isStarting}
                  className="btn-cyber-primary py-3 px-6 text-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>START ROUND 2 (DECODE TECH)</span>
                </button>
              )}

              {room.status === 'round2' && (
                <button
                  onClick={() => handleAdvanceStatus('round2_results')}
                  disabled={isStarting}
                  className="btn-cyber-secondary py-3 px-6 text-xs flex items-center gap-2 border-purple-400 text-purple-300"
                >
                  <span>SHOW ROUND 2 RESULTS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {room.status === 'round2_results' && (
                <button
                  onClick={() => handleStartRound(3)}
                  disabled={isStarting}
                  className="btn-cyber-primary py-3 px-6 text-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>START ROUND 3 (AI ESCAPE ROOM)</span>
                </button>
              )}

              {room.status === 'round3' && (
                <button
                  onClick={() => handleAdvanceStatus('final_results')}
                  disabled={isStarting}
                  className="btn-cyber-primary py-3 px-6 text-xs bg-rose-600 border-rose-400 flex items-center gap-2"
                >
                  <span>SHOW FINAL CHAMPION PODIUM</span>
                  <Trophy className="w-4 h-4" />
                </button>
              )}

              {room.status === 'final_results' && (
                <button
                  onClick={handleCreateRoom}
                  disabled={isStarting}
                  className="btn-cyber-primary py-3 px-6 text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>START NEW MATCH</span>
                </button>
              )}
            </div>
          </div>

          {/* 1. LOBBY VIEW (PROJECTOR QR CODE + REALTIME JOINED PLAYERS ROSTER) */}
          {room.status === 'lobby' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center my-auto">
              
              {/* High Contrast Pure Black & White QR Code */}
              <div className="glass-panel p-8 sm:p-12 rounded-3xl border-2 border-cyan-400 flex flex-col items-center text-center gap-6 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-400/40">
                  SCAN TO JOIN GAME ON PHONE
                </span>

                <div className="p-4 rounded-3xl bg-white border-4 border-cyan-400 shadow-[0_0_40px_rgba(255,255,255,0.8)]">
                  <QRCodeSVG value={joinUrl} size={250} fgColor="#000000" bgColor="#ffffff" level="H" className="rounded-xl" />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-slate-400">TROUBLESHOOTING FALLBACK TEXT ONLY</span>
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    If camera won't scan, open: ?room={room.room_code}
                  </span>
                </div>
              </div>

              {/* Joined Players Roster with Real Display Names */}
              <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-heading font-black text-3xl text-white">PLAYERS JOINED</h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">Click "START ROUND 1" above to launch</p>
                  </div>
                  <span className="font-heading font-black text-4xl text-emerald-400 flex items-center gap-2">
                    <Users className="w-8 h-8" /> {players.length}
                  </span>
                </div>

                {players.length === 0 ? (
                  <div className="p-12 text-center text-sm text-slate-500 font-mono animate-pulse">
                    SCAN QR CODE ABOVE TO JOIN ROSTER...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {players.map((p, idx) => (
                      <div key={p.id || idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0 animate-ping" />
                          <span className="font-bold text-base text-white truncate">
                            {p.display_name || p.name || 'Player'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                          JOINED
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 2. ROUND IN PROGRESS (LIVE RE-SORTING LEADERBOARD) */}
          {(room.status === 'round1' || room.status === 'round2' || room.status === 'round3') && (
            <div className="glass-panel p-8 rounded-3xl border border-cyan-500/40 flex flex-col gap-6 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                    STAGE {room.current_round} IN PROGRESS
                  </span>
                  <h2 className="font-heading font-black text-3xl text-white mt-1">
                    {room.status === 'round1' && "ROUND 1: AI OR REAL?"}
                    {room.status === 'round2' && "ROUND 2: DECODE THE TECH"}
                    {room.status === 'round3' && "ROUND 3: AI ESCAPE ROOM"}
                  </h2>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  LIVE REALTIME UPDATES
                </span>
              </div>

              <div className="overflow-x-auto w-full rounded-2xl border border-slate-800 bg-slate-950/90">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 text-cyan-400 font-mono text-xs uppercase tracking-wider border-b border-slate-800">
                      <th className="py-4 px-6 text-center">RANK</th>
                      <th className="py-4 px-6">PLAYER NAME</th>
                      <th className="py-4 px-6 text-right">TOTAL SCORE</th>
                      <th className="py-4 px-6 text-center">CORRECT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-body text-base text-slate-200">
                    {leaderboard.slice(0, 10).map((entry, index) => {
                      const rankNum = index + 1;
                      let rankBadge = `#${rankNum}`;
                      let rowStyle = "hover:bg-slate-900/60";

                      if (rankNum === 1) {
                        rankBadge = "🥇 1ST";
                        rowStyle = "bg-amber-500/10 text-amber-200 font-bold border-l-4 border-amber-400";
                      } else if (rankNum === 2) {
                        rankBadge = "🥈 2ND";
                        rowStyle = "bg-slate-400/10 text-slate-200 font-semibold border-l-4 border-slate-400";
                      } else if (rankNum === 3) {
                        rankBadge = "🥉 3RD";
                        rowStyle = "bg-amber-700/10 text-amber-300 font-semibold border-l-4 border-amber-600";
                      }

                      return (
                        <tr key={entry.id || index} className={`transition-all ${rowStyle}`}>
                          <td className="py-4 px-6 text-center font-heading font-black text-xl">
                            {rankBadge}
                          </td>
                          <td className="py-4 px-6 font-heading font-bold text-xl text-white">
                            {entry.name}
                          </td>
                          <td className="py-4 px-6 text-right font-heading font-black text-2xl text-cyan-300">
                            {entry.score} pts
                          </td>
                          <td className="py-4 px-6 text-center font-mono text-sm text-emerald-400">
                            {entry.correctCount} / {entry.totalAns}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {leaderboard.length > 10 && (
                  <div className="p-3 text-center bg-slate-900/90 text-cyan-300 font-mono text-xs border-t border-slate-800">
                    + {leaderboard.length - 10} MORE PLAYERS COMPETING LIVE
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. ROUND RESULTS & FINAL PODIUM VIEW */}
          {(room.status.endsWith('_results')) && (
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border-2 border-amber-400 flex flex-col gap-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-400/40">
                  {room.status === 'final_results' ? "FINAL ARENA MATCH STANDINGS" : `ROUND ${room.current_round} COMPLETE`}
                </span>
                <h2 className="font-heading font-black text-4xl sm:text-5xl text-white mt-3">
                  {room.status === 'final_results' ? "SUPREME ARENA CHAMPIONS" : "ROUND SCOREBOARD"}
                </h2>
              </div>

              {/* TOP 3 PODIUM HIGHLIGHT */}
              {leaderboard.length >= 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
                  {/* 2nd Place */}
                  {leaderboard[1] && (
                    <div className="order-2 md:order-1 p-6 rounded-3xl bg-slate-900/80 border-2 border-slate-400 flex flex-col items-center gap-2 transform md:translate-y-4">
                      <span className="text-4xl">🥈</span>
                      <span className="text-xs font-mono text-slate-400">2ND PLACE</span>
                      <h3 className="font-heading font-bold text-xl text-white">{leaderboard[1].name}</h3>
                      <span className="font-heading font-black text-2xl text-slate-300">{leaderboard[1].score} pts</span>
                    </div>
                  )}

                  {/* 1st Place Gold */}
                  <div className="order-1 md:order-2 p-8 rounded-3xl bg-amber-500/10 border-4 border-amber-400 flex flex-col items-center gap-3 shadow-[0_0_40px_rgba(245,158,11,0.3)] transform md:-translate-y-4">
                    <span className="text-6xl animate-bounce">🏆</span>
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">1ST PLACE CHAMPION</span>
                    <h3 className="font-heading font-black text-3xl text-amber-200">{leaderboard[0].name}</h3>
                    <span className="font-heading font-black text-4xl text-amber-300">{leaderboard[0].score} pts</span>
                  </div>

                  {/* 3rd Place */}
                  {leaderboard[2] && (
                    <div className="order-3 p-6 rounded-3xl bg-slate-900/80 border-2 border-amber-700 flex flex-col items-center gap-2 transform md:translate-y-4">
                      <span className="text-4xl">🥉</span>
                      <span className="text-xs font-mono text-amber-600">3RD PLACE</span>
                      <h3 className="font-heading font-bold text-xl text-white">{leaderboard[2].name}</h3>
                      <span className="font-heading font-black text-2xl text-amber-400">{leaderboard[2].score} pts</span>
                    </div>
                  )}
                </div>
              )}

              {/* Full Rankings Table */}
              <div className="overflow-x-auto w-full rounded-2xl border border-slate-800 bg-slate-950/90 text-left">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 text-cyan-400 font-mono text-xs uppercase tracking-wider border-b border-slate-800">
                      <th className="py-4 px-6 text-center">RANK</th>
                      <th className="py-4 px-6">PLAYER NAME</th>
                      <th className="py-4 px-6 text-right">TOTAL SCORE</th>
                      <th className="py-4 px-6 text-center">RANK TITLE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-body text-base text-slate-200">
                    {leaderboard.map((entry, index) => {
                      const rankTitle = GAME_CONFIG.ranks.find(r => entry.score >= r.minScore && entry.score <= r.maxScore) || GAME_CONFIG.ranks[0];
                      return (
                        <tr key={entry.id || index} className="hover:bg-slate-900/60">
                          <td className="py-4 px-6 text-center font-heading font-bold text-lg">#{index + 1}</td>
                          <td className="py-4 px-6 font-bold text-white">{entry.name}</td>
                          <td className="py-4 px-6 text-right font-heading font-black text-xl text-cyan-300">{entry.score} pts</td>
                          <td className="py-4 px-6 text-center font-mono text-xs text-amber-300">{rankTitle.badge} {rankTitle.title}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
