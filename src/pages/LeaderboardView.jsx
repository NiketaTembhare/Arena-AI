import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, RotateCcw, Trash2, Globe } from 'lucide-react';
import { fetchGlobalLeaderboard } from '../services/leaderboardService';
import { clearLeaderboard } from '../game/storage';

export const LeaderboardView = ({ onBackHome, onPlayAgain }) => {
  const [board, setBoard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchGlobalLeaderboard().then(data => {
      if (isMounted) {
        setBoard(data);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleReset = () => {
    if (window.confirm("Reset local leaderboard entries back to default sample records?")) {
      const resetData = clearLeaderboard();
      setBoard(resetData);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center min-h-[calc(100vh-100px)] relative z-10">
      
      <div className="glass-panel p-6 sm:p-10 rounded-3xl w-full border border-cyan-500/40 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 text-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide">
                  ARENA LEADERBOARD
                </h2>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                  <Globe className="w-3 h-3" /> GLOBAL SUPABASE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Top TCS Expo AI Arena Agents & Champions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onPlayAgain}
              className="btn-cyber-primary text-sm py-2.5 px-5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY GAME</span>
            </button>
            
            <button
              onClick={onBackHome}
              className="btn-cyber-secondary text-sm py-2.5 px-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>HOME</span>
            </button>
          </div>
        </div>

        {/* Leaderboard Table Container */}
        {isLoading ? (
          <div className="p-12 text-center text-cyan-300 font-mono text-sm animate-pulse">
            LOADING GLOBAL ARENA SCORES FROM SUPABASE...
          </div>
        ) : (
          <div className="overflow-x-auto w-full rounded-2xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-cyan-400 font-mono text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="py-4 px-4 text-center">RANK</th>
                  <th className="py-4 px-4">PLAYER NAME</th>
                  <th className="py-4 px-4 text-right">SCORE</th>
                  <th className="py-4 px-4 text-center">ACCURACY</th>
                  <th className="py-4 px-4 text-center">TIME TAKEN</th>
                  <th className="py-4 px-4 text-center">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-body text-sm text-slate-200">
                {board.map((entry, index) => {
                  const rankNum = index + 1;
                  let rankBadge = `#${rankNum}`;
                  let rowBg = "hover:bg-slate-900/60";

                  if (rankNum === 1) {
                    rankBadge = "🥇 1ST";
                    rowBg = "bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 font-semibold";
                  } else if (rankNum === 2) {
                    rankBadge = "🥈 2ND";
                    rowBg = "bg-slate-400/10 hover:bg-slate-400/20 text-slate-200 font-semibold";
                  } else if (rankNum === 3) {
                    rankBadge = "🥉 3RD";
                    rowBg = "bg-amber-700/10 hover:bg-amber-700/20 text-amber-300 font-semibold";
                  }

                  return (
                    <tr key={entry.id || index} className={`transition-colors ${rowBg}`}>
                      <td className="py-4 px-4 text-center font-heading font-bold text-base">
                        {rankBadge}
                      </td>
                      <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                        <span>{entry.name}</span>
                        {entry.rankTitle && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            {entry.rankTitle}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-heading font-extrabold text-lg text-cyan-300">
                        {entry.score}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-xs text-slate-300">
                        {entry.accuracy}%
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">
                        {entry.timeTaken}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">
                        {entry.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Admin Reset */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-500 font-mono">
            Showing top {board.length} arena records
          </span>
          
          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 font-mono"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset Local Records
          </button>
        </div>

      </div>

    </div>
  );
};
