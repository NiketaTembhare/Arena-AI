import React, { useState } from 'react';
import { UserCheck, ArrowRight, ShieldAlert } from 'lucide-react';

export const RegistrationView = ({ onStart, onBack }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your player name to enter the arena!');
      return;
    }
    setError('');
    onStart(trimmed);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10">
      
      <div className="glass-panel-glow p-8 rounded-3xl w-full border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(0,240,255,0.3)]">
        
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 mx-auto mb-6 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
          <UserCheck className="w-8 h-8" />
        </div>

        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-center text-white mb-2 tracking-wide">
          ENTER THE ARENA
        </h2>
        <p className="text-slate-300 text-sm text-center mb-8">
          Register your callsign for the Expo Leaderboard
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-left">
            <label htmlFor="playerName" className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Player / Callsign Name:
            </label>
            <input
              id="playerName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Alex, Rahul, TechHero"
              maxLength={24}
              autoFocus
              className="w-full px-5 py-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-white font-mono text-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all placeholder:text-slate-600"
            />
            {error && (
              <span className="text-xs text-rose-400 font-mono flex items-center gap-1 mt-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {error}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-cyber-primary w-full text-base py-4"
          >
            <span>START GAME</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
          >
            ← Cancel & Return to Home
          </button>
        </div>

      </div>

    </div>
  );
};
