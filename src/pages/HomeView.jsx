import React from 'react';
import { Play, HelpCircle, Trophy, Sparkles, Shield, Cpu, Lock } from 'lucide-react';

export const HomeView = ({ onPlayNow, onHowToPlay, onLeaderboard, onHostConsole, onScreenDisplay }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center relative z-10">
      
      {/* Expo Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-mono text-xs sm:text-sm tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-pulse">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        TCS GLOBAL ENGINEERING & TECH EXPO
      </div>

      {/* Main Title */}
      <h1 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl tracking-wider mb-4 text-white drop-shadow-[0_0_25px_rgba(0,240,255,0.5)]">
        AI ARENA
      </h1>

      {/* Official Tagline */}
      <p className="font-sub font-bold text-xl sm:text-3xl text-gradient-cyan tracking-widest uppercase mb-10 max-w-3xl">
        "SEE IT. DECODE IT. OUTSMART IT."
      </p>

      {/* 3 Main Challenge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12 text-left">

        {/* Challenge 1 Preview Card */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 group hover:-translate-y-1">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 text-2xl mb-4 group-hover:scale-110 transition-transform">
            👁️
          </div>
          <span className="text-xs font-mono text-cyan-400 tracking-wider">CHALLENGE 1</span>
          <h3 className="font-heading font-bold text-xl text-white mb-2">AI OR REAL?</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Detect AI-generated synthetic images vs real photography across 5 rounds.
          </p>
        </div>

        {/* Challenge 2 Preview Card */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300 group hover:-translate-y-1">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 text-2xl mb-4 group-hover:scale-110 transition-transform">
            🧩
          </div>
          <span className="text-xs font-mono text-purple-400 tracking-wider">CHALLENGE 2</span>
          <h3 className="font-heading font-bold text-xl text-white mb-2">DECODE THE TECH</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Decode complex tech concepts and AI architectures from visual emoji clues.
          </p>
        </div>

        {/* Challenge 3 Preview Card */}
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 hover:border-rose-400 transition-all duration-300 group hover:-translate-y-1">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-300 text-2xl mb-4 group-hover:scale-110 transition-transform">
            🔐
          </div>
          <span className="text-xs font-mono text-rose-400 tracking-wider">CHALLENGE 3</span>
          <h3 className="font-heading font-bold text-xl text-white mb-2">AI ESCAPE ROOM</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Outsmart AI hallucinations, prompt injections, and rebuild AI pipelines in 90s.
          </p>
        </div>

      </div>

      {/* 3 Primary Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        <button
          onClick={onHostConsole}
          className="btn-cyber-primary py-4 text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <Shield className="w-5 h-5 text-purple-300" />
          <span>HOST A ROOM</span>
        </button>

        <button
          onClick={onScreenDisplay}
          className="btn-cyber-secondary py-4 text-sm sm:text-base flex items-center justify-center gap-2 border-amber-400/40 text-amber-300 hover:bg-amber-500/20"
        >
          <Cpu className="w-5 h-5 text-amber-400" />
          <span>BIG SCREEN DISPLAY</span>
        </button>

        <button
          onClick={onLeaderboard}
          className="btn-cyber-secondary py-4 text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <Trophy className="w-5 h-5 text-cyan-400" />
          <span>HALL OF FAME</span>
        </button>
      </div>


    </div>
  );
};
