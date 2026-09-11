import React, { useState, useEffect } from 'react';
import { Challenge1ImageCard } from '../components/Challenge1ImageCard';
import { audioEngine } from '../game/audioEngine';
import { GAME_CONFIG } from '../game/config';
import { recordPlayerAnswer } from '../services/answerService';
import { CheckCircle, XCircle, ArrowRight, Zap } from 'lucide-react';

export const Challenge1View = ({
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
  const [selectedOption, setSelectedOption] = useState(null); // 'A' or 'B'
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackInfo, setFeedbackInfo] = useState({ isCorrect: false, pointsEarned: 0, speedBonus: 0, explanation: "" });
  const [isChallengeDone, setIsChallengeDone] = useState(false);
  const [challengeTotalScore, setChallengeTotalScore] = useState(0);

  const currentQ = questions[currentIndex];
  const config = GAME_CONFIG.challenge1;

  // Auto handle timer timeout
  useEffect(() => {
    if (timerSeconds === 0 && !showFeedback && !isChallengeDone && currentQ) {
      handleAnswerSelect(null, true);
    }
  }, [timerSeconds]);

  const handleAnswerSelect = (option, isTimeout = false) => {
    if (showFeedback || isChallengeDone) return;

    setSelectedOption(option);
    setShowFeedback(true);

    const correctPos = currentQ.displayCorrectPos || currentQ.correct_answer;
    const isCorrect = option === correctPos;
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
      challengeId: 1,
      selectedAnswer: option || 'TIMEOUT',
      correctAnswer: correctPos,
      isCorrect,
      pointsEarned: earned + speedBonus,
      timeTaken: config.timerSeconds - timerSeconds
    });

    if (onPlayerSubmit) {
      onPlayerSubmit({
        questionId: currentQ.id,
        selectedOption: option || 'TIMEOUT',
        isCorrect,
        basePoints: config.basePoints,
        roundNum: 1
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
        <div className="glass-panel-glow p-8 rounded-3xl w-full text-center border-2 border-cyan-400">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 text-3xl mx-auto mb-4">
            👁️
          </div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            CHALLENGE 1 COMPLETE
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white my-2">
            AI OR REAL?
          </h2>
          
          <div className="my-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-slate-400">STAGE SCORE</span>
            <span className="font-heading font-black text-4xl text-cyan-300">
              {challengeTotalScore} / {questions.length * config.basePoints}
            </span>
          </div>

          <button
            onClick={() => onCompleteChallenge(challengeTotalScore)}
            className="btn-cyber-primary w-full text-base py-4"
          >
            <span>CONTINUE TO CHALLENGE 2</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const imageAData = currentQ.displayImageA || currentQ.content?.image_a || { type: 'real', label: 'Image A', description: 'Photo' };
  const imageBData = currentQ.displayImageB || currentQ.content?.image_b || { type: 'ai', label: 'Image B', description: 'AI Render' };
  const correctPos = currentQ.displayCorrectPos || currentQ.correct_answer;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 relative z-10">
      
      {/* Question Header */}
      <div className="text-center flex flex-col items-center gap-1">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
          QUESTION {currentIndex + 1} OF {questions.length} • {currentQ.category || "AI Detection"}
        </span>
        <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-wide">
          WHICH IMAGE IS AI-GENERATED?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
          Inspect visual artifacts, pupil reflections, patterns, and rendering anomalies.
        </p>
      </div>

      {/* Side-by-Side Image Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <Challenge1ImageCard
          optionLabel="A"
          imageData={imageAData}
          isSelected={selectedOption === 'A'}
          isCorrect={correctPos === 'A'}
          showResult={showFeedback}
          onSelect={() => handleAnswerSelect('A')}
          disabled={showFeedback}
        />

        <Challenge1ImageCard
          optionLabel="B"
          imageData={imageBData}
          isSelected={selectedOption === 'B'}
          isCorrect={correctPos === 'B'}
          showResult={showFeedback}
          onSelect={() => handleAnswerSelect('B')}
          disabled={showFeedback}
        />
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
                {feedbackInfo.isCorrect ? 'CORRECT IDENTIFICATION!' : 'INCORRECT MATCH!'}
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
