import { useState, useEffect, useRef } from 'react';
import { Trophy, Users, Clock, Volume2, VolumeX, Sparkles, Zap, Award, Flame, Hourglass } from 'lucide-react';
import { getRoomByCode, getLatestRoom, getRoomPlayers, fetchRoomAnswers, subscribeToRoom, subscribeToRoomPlayers, subscribeToRoomAnswers } from '../services/roomService';
import { audioEngine } from '../game/audioEngine';
import { GAME_CONFIG } from '../game/config';

export const ScreenView = ({ defaultRoomCode = '', onBackHome }) => {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [prevStatus, setPrevStatus] = useState(null);

  const timerRef = useRef(null);

  // Auto-connect to room: Check defaultRoomCode, or get latest room
  useEffect(() => {
    let isMounted = true;
    
    const resolveRoom = async () => {
      if (defaultRoomCode) {
        const rm = await getRoomByCode(defaultRoomCode);
        if (isMounted && rm) setRoom(rm);
      } else {
        const latest = await getLatestRoom();
        if (isMounted && latest) setRoom(latest);
      }
    };

    resolveRoom();

    // Poll for new rooms if no room connected yet
    const pollInterval = setInterval(() => {
      if (!room && isMounted) {
        resolveRoom();
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [defaultRoomCode, room?.id]);

  // Subscriptions to room updates, players, and answers
  useEffect(() => {
    if (!room?.id) return;

    getRoomPlayers(room.id).then(setPlayers);
    fetchRoomAnswers(room.id).then(setAnswers);

    const unsubRoom = subscribeToRoom(room.id, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    const unsubPlayers = subscribeToRoomPlayers(room.id, (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    const unsubAnswers = subscribeToRoomAnswers(room.id, (updatedAnswers) => {
      setAnswers(updatedAnswers);
    });

    return () => {
      if (unsubRoom) unsubRoom();
      if (unsubPlayers) unsubPlayers();
      if (unsubAnswers) unsubAnswers();
    };
  }, [room?.id]);

  // Audio Cue Triggers strictly on STATUS CHANGES
  useEffect(() => {
    if (!room || !isAudioUnlocked) return;

    if (prevStatus !== room.status) {
      if (room.status === 'round1' || room.status === 'round2' || room.status === 'round3') {
        audioEngine.playChallengeComplete(); // Round start fanfare
      } else if (room.status.endsWith('_results')) {
        audioEngine.playVictory(); // Round end fanfare
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
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.status, room?.round_started_at, room?.round_duration_seconds]);

  const unlockAudio = () => {
    audioEngine.playClick();
    setIsAudioUnlocked(true);
  };

  // Calculate Cumulative Leaderboard from answers
  const calculateLeaderboard = () => {
    const playerMap = {};
    players.forEach(p => {
      playerMap[p.id] = {
        id: p.id,
        name: p.display_name,
        score: 0,
        correctCount: 0,
        totalAns: 0
      };
    });

    answers.forEach(ans => {
      if (!playerMap[ans.player_id]) {
        playerMap[ans.player_id] = {
          id: ans.player_id,
          name: ans.room_players?.display_name || 'Agent',
          score: 0,
          correctCount: 0,
          totalAns: 0
        };
      }
      playerMap[ans.player_id].score += (ans.points_earned || 0);
      playerMap[ans.player_id].totalAns += 1;
      if (ans.is_correct) playerMap[ans.player_id].correctCount += 1;
    });

    return Object.values(playerMap).sort((a, b) => b.score - a.score);
  };

  const leaderboard = calculateLeaderboard();
  const joinUrl = `${window.location.origin}${window.location.pathname}?room=${room?.room_code || ''}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(joinUrl)}&color=06b6d4&bgcolor=020617`;

  if (!room) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10 text-center">
        <div className="glass-panel p-8 rounded-3xl w-full border border-cyan-400 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-3xl">
            <Hourglass className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h2 className="font-heading font-black text-2xl text-white">WAITING FOR HOST TO CREATE A ROOM...</h2>
            <p className="text-xs text-slate-300 font-mono mt-2">
              This display will auto-connect instantly as soon as a room is created.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6 relative z-10 min-h-screen">
      
      {/* Audio Unlock Overlay if sound not enabled */}
      {!isAudioUnlocked && (
        <div
          onClick={unlockAudio}
          className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center cursor-pointer p-6 text-center select-none"
        >
          <div className="w-24 h-24 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 text-4xl mb-6 shadow-[0_0_50px_rgba(6,182,212,0.5)] animate-bounce">
            <VolumeX className="w-12 h-12" />
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-wide">
            TAP ANYWHERE TO ENABLE SOUND
          </h2>
          <p className="text-sm sm:text-base text-cyan-300 font-mono mt-3">
            Required for venue audio & victory cues
          </p>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-2xl">
            🏆
          </div>
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-wider">
              TCS EXPO • AI ARENA
            </h1>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              LIVE SYNCHRONOUS MULTIPLAYER MATCH
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {(room.status === 'round1' || room.status === 'round2' || room.status === 'round3') && (
            <div className="flex items-center gap-3 bg-slate-950/90 px-6 py-3 rounded-2xl border-2 border-cyan-400">
              <Clock className="w-7 h-7 text-cyan-400 animate-pulse" />
              <span className="font-heading font-black text-3xl text-cyan-300 font-mono">
                {timerRemaining}s
              </span>
            </div>
          )}

          <div className="flex flex-col text-right font-mono">
            <span className="text-[10px] text-slate-400">ROOM CODE (TROUBLESHOOTING)</span>
            <span className="font-heading font-black text-2xl text-cyan-300">{room.room_code}</span>
          </div>
        </div>
      </div>

      {/* 1. LOBBY VIEW (Big QR Code & Joined Player Roster) */}
      {room.status === 'lobby' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center my-auto">
          
          {/* Join QR Card */}
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border-2 border-cyan-400 flex flex-col items-center text-center gap-6 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-400/40">
              SCAN TO JOIN GAME ON PHONE
            </span>

            <div className="p-4 rounded-3xl bg-slate-950 border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <img src={qrCodeUrl} alt="Join QR Code" className="w-56 h-56 rounded-2xl" />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-500">OR OPEN URL (TROUBLESHOOTING ONLY)</span>
              <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                {window.location.host}/?room={room.room_code}
              </span>
            </div>
          </div>

          {/* Joined Players Count & Grid */}
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-heading font-black text-3xl text-white">PLAYERS JOINED</h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">Waiting for Host to start Round 1...</p>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {players.map((p, idx) => (
                  <div key={p.id || idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="font-bold text-sm text-white truncate">{p.display_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. ROUND ACTIVE LIVE LEADERBOARD VIEW */}
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
                      <td className="py-4 px-6 font-heading font-bold text-lg text-white">
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
  );
};
