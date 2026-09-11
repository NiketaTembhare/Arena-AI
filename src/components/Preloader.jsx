import React from 'react';
import { Cpu, ShieldCheck, Sparkles } from 'lucide-react';

export const Preloader = ({ message = "PREPARING YOUR ARENA..." }) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center relative z-10">
      
      {/* Central Spinning Glowing AI Core */}
      <div className="relative w-24 h-24 flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 border-r-purple-400 animate-spin shadow-[0_0_35px_rgba(0,240,255,0.5)]" />
        <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          <Cpu className="w-8 h-8 animate-pulse text-cyan-400" />
        </div>
      </div>

      <h3 className="font-heading font-black text-2xl text-cyan-300 tracking-wider mb-2 animate-pulse">
        {message}
      </h3>
      <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        Randomizing 15 Arena Challenges from Supabase Question Bank
      </p>

    </div>
  );
};
