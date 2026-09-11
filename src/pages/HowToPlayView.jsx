import React from 'react';
import { ShieldCheck, Zap, Clock, Flame, Award, Play } from 'lucide-react';

export const HowToPlayView = ({ onEnterArena, playerName }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10">
      
      <div className="glass-panel p-6 sm:p-8 rounded-3xl w-full border border-cyan-500/40 text-center">
        
        <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mb-2 tracking-wide">
          ARENA BRIEFING
        </h2>
        <p className="text-cyan-300 font-sub text-lg mb-8">
          Welcome Agent <span className="font-bold text-white uppercase">{playerName}</span>! Here is your mission briefing:
        </p>

        {/* 3 Challenge Progression Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
          
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-cyan-500/30 flex flex-col gap-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 1 • 5 ROUNDS</span>
            <h4 className="font-heading font-bold text-lg text-white">1. AI OR REAL?</h4>
            <p className="text-xs text-slate-300">
              Inspect 2 side-by-side images and pick the AI-generated one.
            </p>
            <div className="text-[11px] font-mono text-cyan-400/80 mt-auto pt-2">⏱️ 10 sec / question</div>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-purple-500/30 flex flex-col gap-2">
            <span className="text-xs font-mono text-purple-400 font-bold">STAGE 2 • 5 ROUNDS</span>
            <h4 className="font-heading font-bold text-lg text-white">2. DECODE THE TECH</h4>
            <p className="text-xs text-slate-300">
              Identify AI architectures and IT concepts from visual emoji clues.
            </p>
            <div className="text-[11px] font-mono text-purple-400/80 mt-auto pt-2">⏱️ 15 sec / question</div>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-rose-500/30 flex flex-col gap-2">
            <span className="text-xs font-mono text-rose-400 font-bold">STAGE 3 • 3 PUZZLES</span>
            <h4 className="font-heading font-bold text-lg text-white">3. AI ESCAPE ROOM</h4>
            <p className="text-xs text-slate-300">
              Detect hallucinations, block prompt injections, and rebuild AI pipelines.
            </p>
            <div className="text-[11px] font-mono text-rose-400/80 mt-auto pt-2">⏱️ 90 sec continuous timer</div>
          </div>

        </div>

        {/* Scoring Rules List */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 text-left mb-8">
          <h4 className="font-heading font-bold text-sm text-cyan-300 uppercase tracking-wider mb-3">
            SCORING & ARENA RULES
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-200">
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Correct answers award base points (+100 to +250)</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Faster answers receive bonus speed points (+25 to +60)</span>
            </li>
            <li className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Consecutive correct answers trigger 🔥 STREAK multipliers</span>
            </li>
            <li className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Complete all 3 stages to unlock your global AI Arena Rank</span>
            </li>
          </ul>
        </div>

        {/* Start Challenge Button */}
        <button
          onClick={onEnterArena}
          className="btn-cyber-primary text-lg py-4 px-12 shadow-[0_0_35px_rgba(0,240,255,0.6)]"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>ENTER ARENA</span>
        </button>

      </div>

    </div>
  );
};
