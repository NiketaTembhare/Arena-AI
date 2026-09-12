import { useState, useEffect, useRef } from 'react';
import { User, LogIn, Clock, Trophy, Sparkles, CheckCircle2, Shield, ArrowRight, Hourglass } from 'lucide-react';
import { joinRoom, getRoomByCode, getPlayerRoundQuestions, submitRoomAnswer, subscribeToRoom, fetchRoomAnswers } from '../services/roomService';
import { Challenge1View } from '../challenges/Challenge1View';
import { Challenge2View } from '../challenges/Challenge2View';
import { Challenge3View } from '../challenges/Challenge3View';
import { GAME_CONFIG } from '../game/config';
import { audioEngine } from '../game/audioEngine';

export const PlayerView = ({ defaultRoomCode = '', onBackHome }) => {
  const [roomCode, setRoomCode] = useState(defaultRoomCode);
  const [playerName, setPlayerName] = useState('');
  const [session, setSession] = useState(null); // { room, player }
  const [roomState, setRoomState] = useState(null);
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState([]);
  const [playerAnswers, setPlayerAnswers] = useState([]);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [playerScore, setPlayerScore] = useState(0);
  const [playerStreak, setPlayerStreak] = useState(0);

  // Soft Repeat-Player Deterrent & Host Override State
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [hostPin, setHostPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [showManualCodeInput, setShowManualCodeInput] = useState(false);

  const timerRef = useRef(null);
  const nameInputRef = useRef(null);

  const isRoomPrefilled = Boolean(defaultRoomCode);

  // Check repeat player flag on mount
  useEffect(() => {
    try {
      const played = localStorage.getItem('ai_arena_played_today');
      if (played === 'true') {
        setHasPlayedToday(true);
      }
    } catch (e) {}
  }, []);

  // Restore player session on mount from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_arena_player_session_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.roomCode && parsed.player) {
          getRoomByCode(parsed.roomCode).then(rm => {
            if (rm) {
              setSession({ room: rm, player: parsed.player });
              setRoomState(rm);
            }
          });
        }
      }
    } catch (e) {}
  }, []);

  // Pre-fill room code from props & focus name input
  useEffect(() => {
    if (defaultRoomCode) {
      setRoomCode(defaultRoomCode.toUpperCase());
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [defaultRoomCode]);

  // Set repeat player flag when reaching final results
  useEffect(() => {
    if (roomState?.status === 'final_results') {
      try {
        localStorage.setItem('ai_arena_played_today', 'true');
        setHasPlayedToday(true);
      } catch (e) {}
    }
  }, [roomState?.status]);

  // Subscribe to Room Status Changes via Realtime
  useEffect(() => {
    if (!session?.room?.id) return;

    getRoomByCode(session.room.room_code).then(rm => {
      if (rm) setRoomState(rm);
    });

    const unsubscribe = subscribeToRoom(session.room.id, (updatedRoom) => {
      setRoomState(updatedRoom);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [session?.room?.id]);

  // Fetch Questions & Submitted Answers when Round changes
  useEffect(() => {
    if (!session || !roomState) return;

    const roundNum = roomState.current_round;
    if (roundNum > 0 && (roomState.status === `round${roundNum}` || roomState.status === `round${roundNum}_results`)) {
      getPlayerRoundQuestions(roomState.id, session.player.id, roundNum).then(qs => {
        setCurrentRoundQuestions(qs || []);
      });

      fetchRoomAnswers(roomState.id).then(allAns => {
        const myAns = allAns.filter(a => a.player_id === session.player.id);
        setPlayerAnswers(myAns);

        const total = myAns.reduce((sum, a) => sum + (a.points_earned || 0), 0);
        setPlayerScore(total);
      });
    }
  }, [roomState?.status, roomState?.current_round, session?.player?.id]);

  const [countdownVal, setCountdownVal] = useState(0);

  // 3-Second Round Start Countdown Effect
  useEffect(() => {
    if (roomState && (roomState.status === 'round1' || roomState.status === 'round2' || roomState.status === 'round3')) {
      const startedAt = new Date(roomState.round_started_at).getTime();
      const elapsedMs = Date.now() - startedAt;

      if (elapsedMs < 3000) {
        setCountdownVal(3);
        const cdTimer = setInterval(() => {
          setCountdownVal(prev => {
            if (prev <= 1) {
              clearInterval(cdTimer);
              return 0;
            }
            audioEngine.playTick();
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(cdTimer);
      }
    }
  }, [roomState?.status, roomState?.round_started_at]);

  // SERVER-AUTHORITATIVE TIMER: Compute remaining time directly from round_started_at
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (roomState && (roomState.status === 'round1' || roomState.status === 'round2' || roomState.status === 'round3')) {
      const startedAt = new Date(roomState.round_started_at).getTime();
      const duration = roomState.round_duration_seconds;

      const tickTimer = () => {
        const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
        const remaining = Math.max(0, duration - elapsedSec);
        setTimerRemaining(remaining);

        if (remaining <= 4 && remaining > 0) {
          audioEngine.playTick();
        }
      };

      tickTimer();
      timerRef.current = setInterval(tickTimer, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomState?.status, roomState?.round_started_at, roomState?.round_duration_seconds]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomCode.trim() || !playerName.trim()) return;

    setIsJoining(true);
    setJoinError('');
    audioEngine.playClick();

    try {
      const joined = await joinRoom(roomCode, playerName);
      setSession(joined);
      setRoomState(joined.room);
    } catch (err) {
      setJoinError(err.message || 'Failed to join room. Verify code.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleVerifyHostPin = (e) => {
    e.preventDefault();
    if (hostPin.trim() === '1234' || hostPin.trim() === '7777') {
      audioEngine.playClick();
      setHasPlayedToday(false);
      setShowPinModal(false);
      setHostPin('');
      setPinError('');
    } else {
      setPinError('Invalid Host PIN. Ask booth staff.');
    }
  };

  const handlePlayerSubmitAnswer = async ({ questionId, selectedOption, isCorrect, basePoints, roundNum }) => {
    if (!session || !roomState) return;

    const startedAt = new Date(roomState.round_started_at).getTime();
    const responseTimeMs = Math.max(0, Date.now() - startedAt);
    const elapsedSec = Math.floor(responseTimeMs / 1000);

    let speedBonus = 0;
    let config = GAME_CONFIG.challenge1;
    if (roundNum === 2) config = GAME_CONFIG.challenge2;
    if (roundNum === 3) config = GAME_CONFIG.challenge3;

    if (isCorrect) {
      if (roundNum === 1 || roundNum === 2) {
        if (elapsedSec <= config.speedBonusTier2.thresholdSec) {
          speedBonus = config.speedBonusTier2.bonus;
        } else if (elapsedSec <= config.speedBonusTier1.thresholdSec) {
          speedBonus = config.speedBonusTier1.bonus;
        }
      } else if (roundNum === 3) {
        const remainingSec = Math.max(0, config.totalTimerSeconds - elapsedSec);
        if (remainingSec >= config.timeBonusTier2.thresholdRemainingSec) {
          speedBonus = config.timeBonusTier2.bonus;
        } else if (remainingSec >= config.timeBonusTier1.thresholdRemainingSec) {
          speedBonus = config.timeBonusTier1.bonus;
        }
      }
    }

    const totalEarned = isCorrect ? (basePoints + speedBonus) : 0;

    setPlayerScore(prev => prev + totalEarned);
    if (isCorrect) {
      setPlayerStreak(prev => prev + 1);
      audioEngine.playCorrect();
    } else {
      setPlayerStreak(0);
      audioEngine.playWrong();
    }

    await submitRoomAnswer({
      roomId: session.room.id,
      playerId: session.player.id,
      round: roundNum,
      questionId,
      selectedOption,
      isCorrect,
      pointsEarned: totalEarned,
      responseTimeMs
    });
  };

  // Render Join Form if not in a session
  if (!session) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10">
        
        {/* Soft Repeat-Player Deterrent Card */}
        {hasPlayedToday ? (
          <div className="glass-panel-glow p-8 rounded-3xl w-full text-center border-2 border-amber-400 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 text-3xl">
              ⭐
            </div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">THANKS FOR PLAYING!</span>
            <h2 className="font-heading font-black text-2xl text-white">YOU'VE PLAYED TODAY</h2>
            <p className="text-xs text-slate-300">
              Looks like you've already completed AI Arena today. Ask the booth host if you'd like another turn!
            </p>

            <button
              onClick={() => setShowPinModal(true)}
              className="btn-cyber-secondary w-full py-3 text-xs mt-2 border-amber-400/40 text-amber-300"
            >
              <span>HOST OVERRIDE (ENTER PIN)</span>
            </button>
          </div>
        ) : (
          /* Standard Join Card */
          <div className="glass-panel-glow p-8 rounded-3xl w-full text-center border-2 border-cyan-400">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-3xl mx-auto mb-4">
              📱
            </div>

            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
              {isRoomPrefilled ? 'ENTER YOUR NAME TO JOIN' : 'JOIN ARENA ROOM'}
            </h2>

            {/* Read-Only Banner when Room Code is prefilled via QR Code */}
            {isRoomPrefilled ? (
              <div className="my-4 p-3 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center gap-2 text-cyan-300 font-mono text-sm font-bold">
                <span>JOINING ROOM:</span>
                <span className="font-heading font-black text-xl text-cyan-200">{roomCode}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-300 mt-1 mb-4">
                Scan the QR code displayed on the Big Screen to join automatically.
              </p>
            )}

            {joinError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-mono">
                {joinError}
              </div>
            )}

            <form onSubmit={handleJoin} className="flex flex-col gap-4 text-left">
              {/* Optional Manual Room Code Entry (Hidden by default unless toggled) */}
              {!isRoomPrefilled && showManualCodeInput && (
                <div>
                  <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                    ROOM CODE (MANUAL FALLBACK)
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ARENA"
                    maxLength={8}
                    required
                    className="input-cyber w-full text-center font-heading font-black text-2xl tracking-widest uppercase py-3"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                  PLAYER NAME
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  required
                  className="input-cyber w-full py-3"
                />
              </div>

              {!isRoomPrefilled && !showManualCodeInput && (
                <button
                  type="button"
                  onClick={() => setShowManualCodeInput(true)}
                  className="text-[11px] font-mono text-cyan-400/80 hover:text-cyan-300 underline text-center block my-1"
                >
                  QR not scanning? Tap for manual code entry
                </button>
              )}

              <button type="submit" disabled={isJoining} className="btn-cyber-primary w-full py-4 text-base mt-2">
                <LogIn className="w-5 h-5" />
                <span>{isJoining ? 'JOINING ROOM...' : 'ENTER GAME ROOM'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Host PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl border-2 border-amber-400 max-w-sm w-full text-center flex flex-col gap-4">
              <h3 className="font-heading font-bold text-xl text-white">HOST PIN OVERRIDE</h3>
              <p className="text-xs text-slate-300">Ask booth staff to enter the Host PIN to grant a replay.</p>

              {pinError && (
                <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-mono">
                  {pinError}
                </div>
              )}

              <form onSubmit={handleVerifyHostPin} className="flex flex-col gap-3">
                <input
                  type="password"
                  value={hostPin}
                  onChange={(e) => setHostPin(e.target.value)}
                  placeholder="4-Digit PIN (e.g. 1234)"
                  maxLength={4}
                  required
                  className="input-cyber text-center font-heading font-black text-2xl tracking-widest py-2"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="btn-cyber-secondary flex-1 py-2 text-xs"
                  >
                    CANCEL
                  </button>
                  <button type="submit" className="btn-cyber-primary flex-1 py-2 text-xs">
                    CONFIRM PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // 1. LOBBY STATE
  if (roomState?.status === 'lobby') {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10">
        <div className="glass-panel p-8 rounded-3xl w-full text-center border border-cyan-400/40 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 text-3xl animate-bounce">
            📡
          </div>

          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              CONNECTED TO ROOM {session.room.room_code}
            </span>
            <h2 className="font-heading font-black text-3xl text-white mt-3">
              YOU'RE IN, {session.player.display_name.toUpperCase()}!
            </h2>
            <p className="text-xs text-slate-300 mt-2">
              Look at the Big Screen. The host will start Round 1 shortly.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 w-full flex items-center justify-center gap-3">
            <Hourglass className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="font-mono text-xs text-slate-300">WAITING FOR HOST...</span>
          </div>
        </div>
      </div>
    );
  }

  // 3-SECOND COUNTDOWN OVERLAY
  if (countdownVal > 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-400/40 mb-6">
          GET READY! STAGE {roomState?.current_round} STARTING
        </span>
        <div className="w-32 h-32 rounded-full bg-cyan-500/20 border-4 border-cyan-400 flex items-center justify-center font-heading font-black text-7xl text-cyan-300 shadow-[0_0_60px_rgba(0,240,255,0.6)] animate-bounce">
          {countdownVal}
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-widest mt-8 animate-pulse">
          ARENA GO!
        </h2>
      </div>
    );
  }

  // 2. ROUND 1 ACTIVE
  if (roomState?.status === 'round1') {
    return (
      <Challenge1View
        questions={currentRoundQuestions}
        sessionId={session.room.id}
        onCompleteChallenge={() => {}}
        updateScore={() => {}}
        updateStreak={() => {}}
        streak={playerStreak}
        timerSeconds={timerRemaining}
        onPlayerSubmit={handlePlayerSubmitAnswer}
      />
    );
  }

  // 3. ROUND 1 RESULTS WAITING
  if (roomState?.status === 'round1_results') {
    const r1Ans = playerAnswers.filter(a => a.round === 1);
    const r1Score = r1Ans.reduce((s, a) => s + (a.points_earned || 0), 0);

    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10">
        <div className="glass-panel-glow p-8 rounded-3xl w-full text-center border-2 border-cyan-400 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-3xl">
            👁️
          </div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">ROUND 1 COMPLETE</span>
          <h3 className="font-heading font-black text-2xl text-white">AI OR REAL?</h3>

          <div className="my-4 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 w-full flex flex-col items-center">
            <span className="text-xs font-mono text-slate-400">YOUR ROUND 1 SCORE</span>
            <span className="font-heading font-black text-4xl text-cyan-300 mt-1">{r1Score} pts</span>
          </div>

          <p className="text-xs text-slate-300">Look at the Big Screen for live rankings. Host will start Round 2 soon.</p>
        </div>
      </div>
    );
  }

  // 4. ROUND 2 ACTIVE
  if (roomState?.status === 'round2') {
    return (
      <Challenge2View
        questions={currentRoundQuestions}
        sessionId={session.room.id}
        onCompleteChallenge={() => {}}
        updateScore={() => {}}
        updateStreak={() => {}}
        streak={playerStreak}
        timerSeconds={timerRemaining}
        onPlayerSubmit={handlePlayerSubmitAnswer}
      />
    );
  }

  // 5. ROUND 2 RESULTS WAITING
  if (roomState?.status === 'round2_results') {
    const r2Ans = playerAnswers.filter(a => a.round === 2);
    const r2Score = r2Ans.reduce((s, a) => s + (a.points_earned || 0), 0);

    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10">
        <div className="glass-panel-glow p-8 rounded-3xl w-full text-center border-2 border-purple-400 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300 text-3xl">
            🧩
          </div>
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">ROUND 2 COMPLETE</span>
          <h3 className="font-heading font-black text-2xl text-white">DECODE THE TECH</h3>

          <div className="my-4 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 w-full flex flex-col items-center">
            <span className="text-xs font-mono text-slate-400">YOUR ROUND 2 SCORE</span>
            <span className="font-heading font-black text-4xl text-purple-300 mt-1">{r2Score} pts</span>
          </div>

          <p className="text-xs text-slate-300">Get ready for the final AI Escape Room puzzle!</p>
        </div>
      </div>
    );
  }

  // 6. ROUND 3 ACTIVE
  if (roomState?.status === 'round3') {
    return (
      <Challenge3View
        questions={currentRoundQuestions}
        sessionId={session.room.id}
        onCompleteChallenge={() => {}}
        updateScore={() => {}}
        updateStreak={() => {}}
        streak={playerStreak}
        timerSeconds={timerRemaining}
        onPlayerSubmit={handlePlayerSubmitAnswer}
      />
    );
  }

  // 7. FINAL RESULTS
  if (roomState?.status === 'final_results') {
    const matchedRank = GAME_CONFIG.ranks.find(r => playerScore >= r.minScore && playerScore <= r.maxScore) || GAME_CONFIG.ranks[0];

    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10">
        <div className="glass-panel-glow p-8 rounded-3xl w-full text-center border-2 border-amber-400 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 text-3xl">
            {matchedRank.badge}
          </div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">MATCH COMPLETED</span>
          <h3 className="font-heading font-black text-3xl text-white">{session.player.display_name}</h3>

          <div className="my-2 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 w-full flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-slate-400">TOTAL SCORE</span>
            <span className="font-heading font-black text-5xl text-amber-300">{playerScore} pts</span>
            <span className="text-sm font-bold font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30 mt-2">
              {matchedRank.title}
            </span>
          </div>

          <p className="text-xs text-slate-300">Look at the Big Screen for final podium positions!</p>
        </div>
      </div>
    );
  }

  return null;
};
