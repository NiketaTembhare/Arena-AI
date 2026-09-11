import React, { useState } from 'react';
import { ZoomIn, Sparkles, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const Challenge1ImageCard = ({
  optionLabel, // 'A' or 'B'
  imageData,
  isSelected,
  isCorrect,
  showResult,
  onSelect,
  disabled
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  // Render SVG visual cards representing photographic scenarios
  const renderVisualContent = () => {
    const vType = imageData.visualType || "executive_real";

    return (
      <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-4 border border-slate-800">
        
        {/* Synthetic Cyber / Photographic Illustration Scene */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 opacity-90" />
        
        {/* Dynamic Decorative Patterns depending on category */}
        <svg className="w-full h-full absolute inset-0 text-cyan-500/20" preserveAspectRatio="none" viewBox="0 0 400 300">
          <defs>
            <linearGradient id={`grad-${optionLabel}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={imageData.type === 'ai' ? '#9d4edd' : '#00f0ff'} stopOpacity="0.3" />
              <stop offset="100%" stopColor="#050811" stopOpacity="0.8" />
            </linearGradient>
            <pattern id={`grid-${optionLabel}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grad-${optionLabel})`} />
          <rect width="100%" height="100%" fill={`url(#grid-${optionLabel})`} />
        </svg>

        {/* Central Photographic Graphic Illustration */}
        <div className="relative z-10 text-center flex flex-col items-center justify-center gap-2 max-w-xs">
          <div className="w-16 h-16 rounded-full bg-slate-900/90 border border-cyan-400/40 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            {vType.includes("executive") ? "👨‍💼" :
             vType.includes("office") ? "🏢" :
             vType.includes("building") ? "🏙️" :
             vType.includes("food") ? "☕" :
             vType.includes("nature") ? "🦅" :
             vType.includes("street") ? "🏮" :
             vType.includes("car") ? "🏎️" :
             vType.includes("tech") ? "🛜" :
             vType.includes("fashion") ? "👗" :
             vType.includes("animal") ? "🐶" :
             vType.includes("energy") ? "⚡" :
             vType.includes("medical") ? "🩺" :
             vType.includes("landscape") ? "🏔️" :
             vType.includes("watch") ? "⌚" :
             vType.includes("soc") ? "🛡️" :
             vType.includes("robot") ? "🤖" : "📸"}
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-cyan-300/80 bg-slate-900/80 px-2.5 py-1 rounded border border-cyan-500/30">
            {imageData.label || `SCENE OPTION ${optionLabel}`}
          </span>

          <p className="text-xs text-slate-300 leading-tight line-clamp-3 italic px-2">
            "{imageData.description}"
          </p>
        </div>

        {/* Zoom Inspection Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-500/20 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors z-20"
          title="Inspect Details"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoomed Modal inspection */}
        {isZoomed && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <div className="bg-slate-900 border border-cyan-400 p-6 rounded-2xl max-w-md text-center flex flex-col items-center gap-4">
              <div className="text-5xl">{renderVisualContent().props.children[2].props.children[0].props.children}</div>
              <h4 className="font-heading text-lg text-cyan-300 font-bold">INSPECTING IMAGE {optionLabel}</h4>
              <p className="text-sm text-slate-200">{imageData.description}</p>
              <span className="text-xs text-slate-400 font-mono">(Tap anywhere to close inspection)</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Status Styling after user submits answer
  let borderStyle = "border-slate-800 hover:border-cyan-400/80";
  let bgStyle = "bg-slate-900/80";

  if (showResult) {
    if (imageData.type === 'ai') {
      borderStyle = "border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]";
      bgStyle = "bg-emerald-950/40";
    } else if (isSelected && imageData.type === 'real') {
      borderStyle = "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.5)]";
      bgStyle = "bg-rose-950/40";
    } else {
      borderStyle = "border-slate-800 opacity-60";
    }
  } else if (isSelected) {
    borderStyle = "border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)]";
  }

  return (
    <div
      onClick={() => !disabled && onSelect(optionLabel)}
      className={`glass-panel cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group ${borderStyle} ${bgStyle} ${
        disabled ? 'cursor-not-allowed' : 'hover:-translate-y-1'
      }`}
    >
      {/* Top Card Banner Header */}
      <div className="flex items-center justify-between">
        <span className="font-heading font-extrabold text-xl text-cyan-400 bg-slate-950 px-3 py-1 rounded-lg border border-cyan-500/40">
          IMAGE {optionLabel}
        </span>

        {showResult && imageData.type === 'ai' && (
          <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>AI GENERATED</span>
          </div>
        )}

        {showResult && isSelected && imageData.type === 'real' && (
          <div className="flex items-center gap-1 bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-lg border border-rose-400">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>REAL PHOTO</span>
          </div>
        )}
      </div>

      {/* Main Visual Image Content */}
      {renderVisualContent()}

      {/* Select Button */}
      <button
        disabled={disabled}
        className={`w-full font-heading font-bold text-base py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
          showResult && imageData.type === 'ai'
            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
            : showResult && isSelected && imageData.type === 'real'
            ? 'bg-rose-600 text-white border-rose-500'
            : isSelected
            ? 'bg-cyan-400 text-slate-950 border-cyan-300'
            : 'bg-slate-950/80 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/40 group-hover:border-cyan-400'
        }`}
      >
        <span>SELECT IMAGE {optionLabel}</span>
      </button>
    </div>
  );
};
