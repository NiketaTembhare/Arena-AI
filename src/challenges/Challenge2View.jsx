import React, { useState, useEffect } from 'react';
import { audioEngine } from '../game/audioEngine';
import { GAME_CONFIG } from '../game/config';
import { recordPlayerAnswer } from '../services/answerService';
import { CheckCircle, XCircle, ArrowRight, Zap } from 'lucide-react';

export const Challenge2View = ({
  questions, // 5 randomly selected questions
  sessionId,
  onCompleteChallenge,
  updateScore,
  updateStreak,
  streak,
  onTickTimer,
  timerSeconds,
  onPlayerSubmit
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackInfo, setFeedbackInfo] = useState({ isCorrect: false, pointsEarned: 0, speedBonus: 0, explanation: "" });
  const [isChallengeDone, setIsChallengeDone] = useState(false);
  const [challengeTotalScore, setChallengeTotalScore] = useState(0);

  const currentQ = questions[currentIndex];
  const config = GAME_CONFIG.challenge2;

  // Handle timeout
  useEffect(() => {
    if (timerSeconds === 0 && !showFeedback && !isChallengeDone && currentQ) {
      handleAnswerSelect(null, true);
    }
  }, [timerSeconds]);

  const handleAnswerSelect = (optionItem, isTimeout = false) => {
    if (showFeedback || isChallengeDone) return;

    setSelectedOption(optionItem);
    setShowFeedback(true);

    const selectedVal = optionItem ? (typeof optionItem === 'object' ? optionItem.id : optionItem) : 'TIMEOUT';
    const isCorrect = selectedVal === currentQ.correct_answer || (optionItem && optionItem.isCorrect);
    let earned = 0;
    let speedBonus = 0;

    if (isCorrect) {
      earned = config.basePoints;
      
      const elapsed = config.timerSeconds - timerSeconds;
      if (elapsed <= config.speedBonusTier2.thresholdSec) {
        speedBonus = config.speedBonusTier2.bonus;
      } else if (elapsed <= config.speedBonusTier1.thresholdSec) {
        speedBonus = config.speedBonusTier1.bonus;
      }

      const totalEarned = earned + speedBonus;
      setChallengeTotalScore(prev => prev + totalEarned);
      updateScore(totalEarned);
      updateStreak(true);
      audioEngine.playCorrect();

      setFeedbackInfo({
        isCorrect: true,
        pointsEarned: earned,
        speedBonus,
        explanation: currentQ.explanation
      });
    } else {
      updateStreak(false);
      audioEngine.playWrong();

      setFeedbackInfo({
        isCorrect: false,
        pointsEarned: 0,
        speedBonus: 0,
        explanation: isTimeout
          ? `TIMEOUT! ${currentQ.explanation}`
          : `INCORRECT! ${currentQ.explanation}`
      });
    }

    recordPlayerAnswer({
      sessionId,
      questionId: currentQ.id,
      challengeId: 2,
      selectedAnswer: selectedVal,
      correctAnswer: currentQ.correct_answer,
      isCorrect,
      pointsEarned: earned + speedBonus,
      timeTaken: config.timerSeconds - timerSeconds
    });

    if (onPlayerSubmit) {
      onPlayerSubmit({
        questionId: currentQ.id,
        selectedOption: selectedVal,
        isCorrect,
        basePoints: config.basePoints,
        roundNum: 2
      });
    }

    // Auto advance after 1.8s
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        audioEngine.playChallengeComplete();
        setIsChallengeDone(true);
      }
    }, 1800);
  };

  if (isChallengeDone) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10">
        <div className="glass-panel-glow p-8 rounded-3xl w-full text-center border-2 border-purple-400">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300 text-3xl mx-auto mb-4">
            🧩
          </div>
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">
            CHALLENGE 2 COMPLETE
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white my-2">
            DECODE THE TECH
          </h2>
          
          <div className="my-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-slate-400">STAGE SCORE</span>
            <span className="font-heading font-black text-4xl text-purple-300">
              {challengeTotalScore} / {questions.length * config.basePoints}
            </span>
          </div>

          <button
            onClick={() => onCompleteChallenge(challengeTotalScore)}
            className="btn-cyber-primary w-full text-base py-4"
          >
            <span>CONTINUE TO FINAL CHALLENGE</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const displayOptions = currentQ.shuffledOptions || currentQ.options || [];
  const clues = currentQ.clues || currentQ.content?.clues || ["🧠", "🔍", "🤖"];
  const clueLabels = currentQ.clueLabels || currentQ.content?.clueLabels || [];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6 relative z-10">
      
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30">
            QUESTION {currentIndex + 1} OF {questions.length}
          </span>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border uppercase ${
            (currentQ.difficulty || "").includes("hard")
              ? "bg-rose-500/20 text-rose-300 border-rose-400"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-400"
          }`}>
            {currentQ.difficulty || "medium"}
          </span>
        </div>

        <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide">
          DECODE THE VISUAL CLUES
        </h2>
      </div>

      {/* Clues Box */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border-2 border-purple-400/50 flex flex-col items-center justify-center gap-6 shadow-[0_0_30px_rgba(157,78,221,0.2)]">
        
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 my-2">
          {clues.map((clueEmoji, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950/90 border border-purple-400/40 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_20px_rgba(157,78,221,0.3)] transform transition-transform group-hover:scale-110">
                  {clueEmoji}
                </div>
                {clueLabels[idx] && (
                  <span className="text-[10px] font-mono text-purple-300/80 uppercase">
                    {clueLabels[idx]}
                  </span>
                )}
              </div>
              {idx < clues.length - 1 && (
                <span className="font-heading font-bold text-2xl text-purple-400">+</span>
              )}
            </div>
          ))}
        </div>

        <p className="font-sub font-bold text-lg sm:text-xl text-center text-cyan-200">
          "{currentQ.question_text || currentQ.question}"
        </p>

      </div>

      {/* 4 Multiple Choice Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {displayOptions.map((opt, idx) => {
          const optText = typeof opt === 'object' ? opt.text : opt;
          const isThisSelected = selectedOption === opt;
          const isThisCorrect = (typeof opt === 'object' ? opt.id : opt) === currentQ.correct_answer || opt.isCorrect;

          let optionStyle = "bg-slate-900/80 border-slate-700 hover:border-purple-400 hover:bg-slate-800/90 text-white";

          if (showFeedback) {
            if (isThisCorrect) {
              optionStyle = "bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.4)]";
            } else if (isThisSelected && !isThisCorrect) {
              optionStyle = "bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.4)]";
            } else {
              optionStyle = "bg-slate-950/50 border-slate-900 opacity-50 text-slate-500";
            }
          }

          return (
            <button
              key={idx}
              disabled={showFeedback}
              onClick={() => handleAnswerSelect(opt)}
              className={`p-4 sm:p-5 rounded-2xl border-2 font-heading font-bold text-base sm:text-lg text-left transition-all duration-200 flex items-center justify-between min-h-[64px] ${optionStyle} ${
                showFeedback ? 'cursor-default' : 'cursor-pointer hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-xs font-mono text-purple-300">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{optText}</span>
              </div>

              {showFeedback && isThisCorrect && <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />}
              {showFeedback && isThisSelected && !isThisCorrect && <XCircle className="w-6 h-6 text-rose-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {showFeedback && (
        <div className={`p-5 rounded-2xl border-2 backdrop-blur-xl animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${
          feedbackInfo.isCorrect
            ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
            : 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
        }`}>
          <div className="flex items-center gap-3">
            {feedbackInfo.isCorrect ? (
              <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
            )}
            <div>
              <h4 className="font-heading font-bold text-lg">
                {feedbackInfo.isCorrect ? 'TECH DECODED!' : 'SYSTEM MISMATCH!'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                {feedbackInfo.explanation}
              </p>
            </div>
          </div>

          {feedbackInfo.isCorrect && (
            <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-emerald-400/40 shrink-0 font-mono font-bold text-emerald-300">
              <span>+{feedbackInfo.pointsEarned}</span>
              {feedbackInfo.speedBonus > 0 && (
                <span className="text-amber-300 text-xs flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />+{feedbackInfo.speedBonus} SPEED
                </span>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
