import React, { useState, useEffect } from 'react';
import { audioEngine } from '../game/audioEngine';
import { GAME_CONFIG } from '../game/config';
import { recordPlayerAnswer } from '../services/answerService';
import { CheckCircle, XCircle, ArrowRight, Zap, MoveUp, MoveDown, Lock } from 'lucide-react';

export const Challenge3View = ({
  questions, // 5 questions selected for Challenge 3
  sessionId,
  onCompleteChallenge,
  updateScore,
  updateStreak,
  streak,
  timerSeconds,
  onPlayerSubmit
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackInfo, setFeedbackInfo] = useState({ isCorrect: false, pointsEarned: 0, explanation: "" });
  
  // Ordering puzzle state (for pipeline ordering)
  const [orderedItems, setOrderedItems] = useState([]);
  const [isOrderingValid, setIsOrderingValid] = useState(null);

  const [isChallengeDone, setIsChallengeDone] = useState(false);
  const [challengeTotalScore, setChallengeTotalScore] = useState(0);
  const [timeBonusEarned, setTimeBonusEarned] = useState(0);

  const config = GAME_CONFIG.challenge3;
  const currentQ = questions[currentIndex];

  // Initialize Ordering items when an ordering question loads
  useEffect(() => {
    if (currentQ && currentQ.question_type === 'interactive_ordering' && currentQ.content && currentQ.content.items) {
      const scrambled = [...currentQ.content.items].sort(() => Math.random() - 0.5);
      setOrderedItems(scrambled);
    }
  }, [currentIndex, currentQ]);

  // Handle continuous 75s timer timeout
  useEffect(() => {
    if (timerSeconds === 0 && !isChallengeDone) {
      audioEngine.playWrong();
      finishEscapeRoom(challengeTotalScore, 0);
    }
  }, [timerSeconds]);

  // Move ordering item (Touch & Mouse friendly)
  const moveItem = (fromIdx, toIdx) => {
    if (showFeedback) return;
    audioEngine.playClick();
    const updated = [...orderedItems];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setOrderedItems(updated);
  };

  const handleMultipleChoiceSelect = (optionItem, optionIdx) => {
    if (showFeedback || isChallengeDone) return;

    setSelectedOption(optionIdx);
    setShowFeedback(true);

    const selectedVal = typeof optionItem === 'object' ? optionItem.id : optionItem;
    const isCorrect = selectedVal === currentQ.correct_answer || optionItem.isCorrect;
    const earned = isCorrect ? config.basePointsPerPuzzle : 0;

    if (isCorrect) {
      setChallengeTotalScore(prev => prev + earned);
      updateScore(earned);
      updateStreak(true);
      audioEngine.playCorrect();

      setFeedbackInfo({
        isCorrect: true,
        pointsEarned: earned,
        explanation: currentQ.explanation
      });
    } else {
      updateStreak(false);
      audioEngine.playWrong();

      setFeedbackInfo({
        isCorrect: false,
        pointsEarned: 0,
        explanation: `INCORRECT! ${currentQ.explanation}`
      });
    }

    recordPlayerAnswer({
      sessionId,
      questionId: currentQ.id,
      challengeId: 3,
      selectedAnswer: selectedVal,
      correctAnswer: currentQ.correct_answer,
      isCorrect,
      pointsEarned: earned,
      timeTaken: 15
    });

    if (onPlayerSubmit) {
      onPlayerSubmit({
        questionId: currentQ.id,
        selectedOption: selectedVal,
        isCorrect,
        basePoints: config.basePointsPerPuzzle,
        roundNum: 3
      });
    }

    setTimeout(() => {
      advancePuzzle();
    }, 1800);
  };

  const handleSubmitOrdering = () => {
    if (showFeedback || isChallengeDone) return;

    setShowFeedback(true);
    const currentOrderIds = orderedItems.map(item => item.id);
    const expectedOrder = currentQ.content?.correct_order_ids || [];
    const isCorrect = JSON.stringify(currentOrderIds) === JSON.stringify(expectedOrder);

    const earned = isCorrect ? config.basePointsPerPuzzle : 0;
    setIsOrderingValid(isCorrect);

    if (isCorrect) {
      setChallengeTotalScore(prev => prev + earned);
      updateScore(earned);
      updateStreak(true);
      audioEngine.playCorrect();

      setFeedbackInfo({
        isCorrect: true,
        pointsEarned: earned,
        explanation: currentQ.explanation
      });
    } else {
      updateStreak(false);
      audioEngine.playWrong();

      setFeedbackInfo({
        isCorrect: false,
        pointsEarned: 0,
        explanation: `SEQUENCE MISMATCH! ${currentQ.explanation}`
      });
    }

    recordPlayerAnswer({
      sessionId,
      questionId: currentQ.id,
      challengeId: 3,
      selectedAnswer: currentOrderIds.join(','),
      correctAnswer: expectedOrder.join(','),
      isCorrect,
      pointsEarned: earned,
      timeTaken: 15
    });

    if (onPlayerSubmit) {
      onPlayerSubmit({
        questionId: currentQ.id,
        selectedOption: currentOrderIds.join(','),
        isCorrect,
        basePoints: config.basePointsPerPuzzle,
        roundNum: 3
      });
    }

    setTimeout(() => {
      advancePuzzle();
    }, 2000);
  };

  const advancePuzzle = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setIsOrderingValid(null);
    } else {
      let timeBonus = 0;
      if (timerSeconds >= config.timeBonusTier2.thresholdRemainingSec) {
        timeBonus = config.timeBonusTier2.bonus;
      } else if (timerSeconds >= config.timeBonusTier1.thresholdRemainingSec) {
        timeBonus = config.timeBonusTier1.bonus;
      }

      finishEscapeRoom(challengeTotalScore, timeBonus);
    }
  };

  const finishEscapeRoom = (baseTotal, timeBonus) => {
    const finalStageTotal = baseTotal + timeBonus;
    setTimeBonusEarned(timeBonus);
    if (timeBonus > 0) {
      updateScore(timeBonus);
    }
    audioEngine.playVictory();
    setIsChallengeDone(true);
  };

  if (isChallengeDone) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10">
        <div className="glass-panel-glow p-8 rounded-3xl w-full text-center border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)]">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 text-3xl mx-auto mb-4">
            🔐
          </div>
          <span className="text-xs font-mono text-rose-400 uppercase tracking-widest">
            AI ESCAPE ROOM UNLOCKED!
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white my-2">
            ESCAPE COMPLETE
          </h2>
          
          <div className="my-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center gap-3">
            <span className="text-xs font-mono text-slate-400">ESCAPE ROOM STAGE SCORE</span>
            <span className="font-heading font-black text-4xl text-rose-400">
              {challengeTotalScore + timeBonusEarned} / {questions.length * config.basePointsPerPuzzle + 200}
            </span>

            {timeBonusEarned > 0 && (
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-400/40 font-mono font-bold">
                <Zap className="w-3.5 h-3.5" />+{timeBonusEarned} FAST ESCAPE TIME BONUS!
              </span>
            )}
          </div>

          <button
            onClick={() => onCompleteChallenge(challengeTotalScore + timeBonusEarned)}
            className="btn-cyber-primary w-full text-base py-4"
          >
            <span>CALCULATE FINAL ARENA RESULT</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const displayOptions = currentQ.shuffledOptions || currentQ.options || [];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6 relative z-10">
      
      {/* Header Bar */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
            PUZZLE {currentIndex + 1} OF {questions.length}
          </span>
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-400/40">
            75s CONTINUOUS TIMER
          </span>
        </div>

        <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide uppercase">
          AI ESCAPE ROOM
        </h2>
        <p className="text-xs sm:text-sm text-cyan-300 font-sub font-semibold">
          "CAN YOU OUTSMART THE SYSTEM?"
        </p>
      </div>

      {/* Main Puzzle Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-rose-500/40 flex flex-col gap-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
        
        {/* Scenario Display */}
        {currentQ.scenario && (
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs sm:text-sm text-cyan-300 leading-relaxed whitespace-pre-wrap relative overflow-hidden">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              SYSTEM SCENARIO LOG
            </div>
            {currentQ.scenario}
          </div>
        )}

        {/* Question Text */}
        <h3 className="font-heading font-bold text-lg sm:text-xl text-white text-center">
          {currentQ.question_text || currentQ.question}
        </h3>

        {/* MULTIPLE CHOICE PUZZLES */}
        {currentQ.question_type !== 'interactive_ordering' && (
          <div className="grid grid-cols-1 gap-3 w-full">
            {displayOptions.map((opt, idx) => {
              const optText = typeof opt === 'object' ? opt.text : opt;
              const isThisSelected = selectedOption === idx;
              const isThisCorrect = (typeof opt === 'object' ? opt.id : opt) === currentQ.correct_answer || opt.isCorrect;

              let optionStyle = "bg-slate-900/90 border-slate-700 hover:border-rose-400 text-white";

              if (showFeedback) {
                if (isThisCorrect) {
                  optionStyle = "bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.4)]";
                } else if (isThisSelected && !isThisCorrect) {
                  optionStyle = "bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.4)]";
                } else {
                  optionStyle = "bg-slate-950/50 border-slate-900 opacity-40 text-slate-500";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={showFeedback}
                  onClick={() => handleMultipleChoiceSelect(opt, idx)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 font-heading font-bold text-sm sm:text-base text-left transition-all duration-200 flex items-center justify-between min-h-[56px] ${optionStyle} ${
                    showFeedback ? 'cursor-default' : 'cursor-pointer hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-xs font-mono text-rose-400 shrink-0">
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
        )}

        {/* INTERACTIVE ORDERING PUZZLE */}
        {currentQ.question_type === 'interactive_ordering' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {orderedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 bg-slate-950/90 flex items-center justify-between gap-3 transition-all ${
                    showFeedback && isOrderingValid
                      ? 'border-emerald-400 bg-emerald-950/40 text-emerald-100'
                      : showFeedback && !isOrderingValid
                      ? 'border-rose-500 bg-rose-950/40 text-rose-100'
                      : 'border-slate-700 hover:border-cyan-400 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-sm font-mono font-bold text-cyan-300">
                      {idx + 1}
                    </span>
                    <span className="font-heading text-sm sm:text-base">{item.text}</span>
                  </div>

                  {!showFeedback && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, idx - 1)}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 disabled:opacity-30"
                        title="Move Up"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={idx === orderedItems.length - 1}
                        onClick={() => moveItem(idx, idx + 1)}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 disabled:opacity-30"
                        title="Move Down"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!showFeedback && (
              <button
                onClick={handleSubmitOrdering}
                className="btn-cyber-primary w-full text-base py-4 mt-2"
              >
                <span>VERIFY PIPELINE SEQUENCE</span>
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

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
                {feedbackInfo.isCorrect ? 'PUZZLE SOLVED!' : 'SYSTEM ALERT!'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                {feedbackInfo.explanation}
              </p>
            </div>
          </div>

          {feedbackInfo.isCorrect && (
            <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-emerald-400/40 shrink-0 font-mono font-bold text-emerald-300">
              <span>+{feedbackInfo.pointsEarned}</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
