import React from 'react';
import { Volume2, VolumeX, Flame, Clock, Trophy, Maximize2, Shield } from 'lucide-react';
import { audioEngine } from '../game/audioEngine';

export const ArenaHeader = ({
  currentChallenge, // 1, 2, 3 or null (if home/results)
  currentQuestionIndex = 0,
  totalQuestions = 5,
  score = 0,
  timerSeconds = 0,
  streak = 0,
  isMuted = false,
  onToggleMute,
  expoMode = false,
  onToggleExpoMode,
  playerName = "",
  onBackHome
}) => {
  const challengeTitles = {
    1: "AI OR REAL?",
    2: "DECODE THE TECH",
    3: "AI ESCAPE ROOM"
  };

  const isLowTime = timerSeconds <= 3 && timerSeconds > 0;

  return (
    <header className="w-full glass-panel border-b border-cyan-500/30 px-4 py-3 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Brand / Title */}
        <div
          onClick={onBackHome}
          className={`flex items-center gap-3 ${onBackHome ? 'cursor-pointer group select-none' : ''}`}
          title="Return to Home"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-lg sm:text-xl tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                AI ARENA
              </h1>
              {expoMode && (
                <span className="bg-purple-500/30 text-purple-300 text-xs px-2 py-0.5 rounded border border-purple-400/50 font-mono">
                  EXPO MODE
                </span>
              )}
            </div>
            {playerName && (
              <p className="text-xs text-cyan-400/80 font-sub flex items-center gap-1">
                AGENT: <span className="text-white font-semibold">{playerName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Center: Current Challenge Progress (Only during challenge view) */}
        {currentChallenge && (
          <div className="flex flex-col items-center justify-center bg-slate-900/60 px-4 py-1.5 rounded-xl border border-cyan-500/20">
            <span className="text-xs font-mono text-cyan-300 tracking-widest uppercase">
              CHALLENGE {currentChallenge} OF 3
            </span>
            <span className="font-heading text-sm sm:text-base font-bold text-white tracking-wide">
              {challengeTitles[currentChallenge]}
            </span>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden w-28 sm:w-36">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Right: Metrics & Controls */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">

          {/* Streak Indicator */}
          {streak >= 2 && (
            <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold animate-streak">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>STREAK ×{streak}</span>
            </div>
          )}

          {/* Score Counter */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-cyan-500/40 px-3 py-1.5 rounded-lg">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono leading-none">SCORE</span>
              <span className="font-heading font-extrabold text-sm sm:text-lg text-cyan-300 leading-none">
                {score}
              </span>
            </div>
          </div>

          {/* Timer Display */}
          {currentChallenge && (
            <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg transition-colors ${
              isLowTime
                ? 'bg-rose-950/80 border-rose-500/80 animate-timer-critical'
                : 'bg-slate-900/80 border-slate-700'
            }`}>
              <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-400' : 'text-slate-300'}`} />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-mono leading-none">TIME</span>
                <span className={`font-mono font-bold text-sm sm:text-lg ${
                  isLowTime ? 'text-rose-400' : 'text-slate-100'
                }`}>
                  {String(timerSeconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          )}

          {/* Mute / Unmute Button */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Expo Mode Button */}
          {onToggleExpoMode && (
            <button
              onClick={onToggleExpoMode}
              className={`p-2 rounded-lg border transition-all ${
                expoMode
                  ? 'bg-purple-600/30 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={expoMode ? "Exit Expo Mode" : "Enter Expo Mode"}
              aria-label="Toggle Expo Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
