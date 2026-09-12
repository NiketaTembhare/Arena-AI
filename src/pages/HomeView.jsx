import React from 'react';
import { Play, Trophy, Settings, Sparkles } from 'lucide-react';
import { audioEngine } from '../game/audioEngine';

export const HomeView = ({ onHostConsole, onLeaderboard, onAdminConfig }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center relative z-10">
      
      {/* Expo Hero Badge */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/50 text-cyan-300 font-mono text-xs sm:text-sm tracking-widest uppercase mb-8 shadow-[0_0_25px_rgba(0,240,255,0.25)]">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        TCS GLOBAL ENGINEERING & TECH EXPO
      </div>

      {/* Main Gaming Title */}
      <h1 className="font-heading font-black text-5xl sm:text-7xl md:text-8xl tracking-wider mb-4 text-white drop-shadow-[0_0_35px_rgba(0,240,255,0.6)]">
        AI ARENA
      </h1>

      {/* Tagline */}
      <p className="font-sub font-bold text-xl sm:text-2xl text-cyan-300 tracking-widest uppercase mb-12 max-w-2xl">
        LIVE SYNCHRONOUS MULTIPLAYER TRIVIA
      </p>

      {/* 3 Primary Action Buttons Only (No clutter, no extra buttons) */}
      <div className="flex flex-col gap-5 w-full max-w-md">
        
        {/* 1. Host Game */}
        <button
          onClick={() => {
            audioEngine.playClick();
            onHostConsole();
          }}
          className="btn-cyber-primary w-full py-5 text-lg sm:text-xl shadow-[0_0_35px_rgba(0,240,255,0.5)] flex items-center justify-center gap-3"
        >
          <Play className="w-6 h-6 fill-current text-slate-950" />
          <span>HOST GAME</span>
        </button>

        {/* 2. Hall of Fame */}
        <button
          onClick={() => {
            audioEngine.playClick();
            onLeaderboard();
          }}
          className="btn-cyber-secondary w-full py-4 text-base flex items-center justify-center gap-3 border-amber-400/40 text-amber-300 hover:bg-amber-500/20"
        >
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>HALL OF FAME</span>
        </button>

        {/* 3. Game Config */}
        <button
          onClick={() => {
            audioEngine.playClick();
            onAdminConfig();
          }}
          className="btn-cyber-secondary w-full py-4 text-base flex items-center justify-center gap-3 border-purple-400/40 text-purple-300 hover:bg-purple-500/20"
        >
          <Settings className="w-5 h-5 text-purple-400" />
          <span>GAME CONFIG</span>
        </button>

      </div>

    </div>
  );
};
