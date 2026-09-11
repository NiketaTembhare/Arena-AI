import React, { useEffect, useState } from 'react';
import { Trophy, Award, Flame, Target, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { GAME_CONFIG } from '../game/config';
import { audioEngine } from '../game/audioEngine';
import confetti from 'canvas-confetti';

export const ResultsView = ({
  gameSummary,
  onViewLeaderboard,
  onPlayAgain
}) => {
  const [isCalculating, setIsCalculating] = useState(true);

  const {
    playerName,
    score,
    challenge1Score,
    challenge2Score,
    challenge3Score,
    maxStreak,
    accuracy,
    rank
  } = gameSummary;

  useEffect(() => {
    // Reveal rank animation & confetti
    const timer = setTimeout(() => {
      setIsCalculating(false);
      audioEngine.playVictory();
      
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback gracefully
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (isCalculating) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center relative z-10">
        <div className="w-20 h-20 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mb-6 shadow-[0_0_30px_rgba(0,240,255,0.5)]" />
        <h3 className="font-heading font-black text-2xl text-cyan-300 tracking-wider animate-pulse">
          CALCULATING RESULT...
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-2">
          Evaluating neural accuracy & arena performance metrics
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10">
      
      <div className="glass-panel-glow p-6 sm:p-10 rounded-3xl w-full border-2 border-cyan-400/60 text-center flex flex-col items-center gap-8 shadow-[0_0_50px_rgba(0,240,255,0.3)]">
        
        {/* Title */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-mono text-xs mb-3">
            <Sparkles className="w-3.5 h-3.5" /> ARENA CHALLENGE COMPLETE
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-wide">
            AI ARENA COMPLETE!
          </h2>
          <p className="font-sub font-bold text-lg text-slate-300 mt-1">
            PLAYER: <span className="text-cyan-300 uppercase">{playerName}</span>
          </p>
        </div>

        {/* Central Rank Badge Card */}
        <div className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/60 flex flex-col items-center justify-center gap-3 shadow-[0_0_30px_rgba(234,179,8,0.25)]">
          <span className="text-5xl animate-bounce">{rank.badge}</span>
          <h3 className="font-heading font-black text-3xl sm:text-4xl text-gradient-gold tracking-wider">
            {rank.title}
          </h3>
          <p className="text-xs font-mono text-amber-200/90 italic">
            "{rank.tagline}"
          </p>
        </div>

        {/* Total Score Display */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">FINAL ARENA SCORE</span>
          <span className="font-heading font-black text-5xl sm:text-6xl text-cyan-300 drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]">
            {score}
          </span>
          <span className="text-xs text-slate-400 font-mono">OUT OF 2000+ MAXIMUM POINTS</span>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">CHALLENGE 1</span>
            <span className="font-heading text-sm text-white font-bold">AI OR REAL?</span>
            <span className="font-heading text-2xl text-cyan-300 font-extrabold mt-1">{challenge1Score}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-purple-400 font-bold uppercase">CHALLENGE 2</span>
            <span className="font-heading text-sm text-white font-bold">DECODE THE TECH</span>
            <span className="font-heading text-2xl text-purple-300 font-extrabold mt-1">{challenge2Score}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-rose-400 font-bold uppercase">CHALLENGE 3</span>
            <span className="font-heading text-sm text-white font-bold">AI ESCAPE ROOM</span>
            <span className="font-heading text-2xl text-rose-300 font-extrabold mt-1">{challenge3Score}</span>
          </div>

        </div>

        {/* Secondary Metrics */}
        <div className="flex flex-wrap items-center justify-center gap-6 w-full pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-amber-300 font-sub font-bold text-base sm:text-lg">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>MAX STREAK: {maxStreak}</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-300 font-sub font-bold text-base sm:text-lg">
            <Target className="w-5 h-5 text-cyan-400" />
            <span>ACCURACY: {accuracy}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md pt-2">
          <button
            onClick={onViewLeaderboard}
            className="btn-cyber-primary w-full text-base py-4"
          >
            <Trophy className="w-5 h-5" />
            <span>VIEW LEADERBOARD</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="btn-cyber-secondary w-full text-base py-4"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>
        </div>

      </div>

    </div>
  );
};
