import React, { useState, useEffect, useRef } from 'react';
import { ParticleBackground } from './components/ParticleBackground';
import { ArenaHeader } from './components/ArenaHeader';
import { Preloader } from './components/Preloader';
import { HomeView } from './pages/HomeView';
import { RegistrationView } from './pages/RegistrationView';
import { HowToPlayView } from './pages/HowToPlayView';
import { Challenge1View } from './challenges/Challenge1View';
import { Challenge2View } from './challenges/Challenge2View';
import { Challenge3View } from './challenges/Challenge3View';
import { ResultsView } from './pages/ResultsView';
import { LeaderboardView } from './pages/LeaderboardView';

import { GAME_CONFIG } from './game/config';
import { audioEngine } from './game/audioEngine';
import { fetchFullSessionQuestions } from './services/questionService';
import { createGameSession, updateGameSession, getActiveSessionFromStorage, clearActiveSessionStorage } from './services/sessionService';
import { submitFinalSessionScore } from './services/leaderboardService';

export default function App() {
  // Navigation View State: 'home' | 'register' | 'preloader' | 'how_to_play' | 'challenge_1' | 'challenge_2' | 'challenge_3' | 'results' | 'leaderboard'
  const [currentView, setCurrentView] = useState('home');

  // Active Game & Session State
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [score, setScore] = useState(0);
  const [challenge1Score, setChallenge1Score] = useState(0);
  const [challenge2Score, setChallenge2Score] = useState(0);
  const [challenge3Score, setChallenge3Score] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  
  // Active Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  // Audio & Expo Mode Controls
  const [isMuted, setIsMuted] = useState(false);
  const [expoMode, setExpoMode] = useState(false);
  const inactivityTimerRef = useRef(null);

  // 15 Prefetched Session Questions (5 per Challenge)
  const [sessionQuestions, setSessionQuestions] = useState({ challenge1: [], challenge2: [], challenge3: [], all15Questions: [] });

  // Completion metrics
  const [startTime, setStartTime] = useState(null);
  const [finalGameSummary, setFinalGameSummary] = useState(null);

  // Session Recovery on Mount
  useEffect(() => {
    const recovered = getActiveSessionFromStorage();
    if (recovered && recovered.session && recovered.questions) {
      setCurrentSessionId(recovered.session.id);
      setPlayerName(recovered.session.player_name || '');
      setScore(recovered.session.total_score || 0);
      setChallenge1Score(recovered.session.challenge_1_score || 0);
      setChallenge2Score(recovered.session.challenge_2_score || 0);
      setChallenge3Score(recovered.session.challenge_3_score || 0);
      setSessionQuestions(recovered.questions);
    }
  }, []);

  // Expo Mode 60s Inactivity Reset
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (expoMode && currentView !== 'home') {
      inactivityTimerRef.current = setTimeout(() => {
        handleResetToHome();
      }, GAME_CONFIG.expoMode.inactivityTimeoutSec * 1000);
    }
  };

  useEffect(() => {
    const handleUserActivity = () => resetInactivityTimer();
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [expoMode, currentView]);

  // Challenge Timers
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentView === 'challenge_1' || currentView === 'challenge_2' || currentView === 'challenge_3') {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          if (prev <= 4) audioEngine.playTick();
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentView, sessionQuestions]);

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  // Initialize New Supabase Game Session
  const initializeNewGameSession = async (name) => {
    audioEngine.playClick();
    setPlayerName(name);
    setScore(0);
    setChallenge1Score(0);
    setChallenge2Score(0);
    setChallenge3Score(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalCorrect(0);
    setTotalAnswered(0);
    setStartTime(Date.now());

    // Show Preloader while sampling questions & creating session
    setCurrentView('preloader');

    // Fetch 15 random active questions (5 per challenge) from Supabase / fallback
    const selected = await fetchFullSessionQuestions();
    setSessionQuestions(selected);

    // Create session record in Supabase & local storage
    const session = await createGameSession(name, selected);
    setCurrentSessionId(session.id);

    // Small smooth transition pause
    setTimeout(() => {
      setCurrentView('how_to_play');
    }, 800);
  };

  // Score & Streak update handlers
  const handleUpdateScore = (points) => {
    setScore(prev => {
      const next = prev + points;
      if (currentSessionId) {
        updateGameSession(currentSessionId, { total_score: next });
      }
      return next;
    });
  };

  const handleUpdateStreak = (isCorrect) => {
    setTotalAnswered(prev => prev + 1);
    if (isCorrect) {
      setTotalCorrect(prev => prev + 1);
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        if (next >= GAME_CONFIG.streak.minStreakForBonus) {
          audioEngine.playStreak();
        }
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  // Progression from Stage to Stage
  const startChallenge1 = () => {
    audioEngine.playClick();
    setCurrentView('challenge_1');
    setTimerSeconds(GAME_CONFIG.challenge1.timerSeconds);
    if (currentSessionId) {
      updateGameSession(currentSessionId, { status: 'in_progress' });
    }
  };

  const completeChallenge1 = (c1Score) => {
    audioEngine.playClick();
    setChallenge1Score(c1Score);
    if (currentSessionId) {
      updateGameSession(currentSessionId, { challenge_1_score: c1Score });
    }
    setCurrentView('challenge_2');
    setTimerSeconds(GAME_CONFIG.challenge2.timerSeconds);
  };

  const completeChallenge2 = (c2Score) => {
    audioEngine.playClick();
    setChallenge2Score(c2Score);
    if (currentSessionId) {
      updateGameSession(currentSessionId, { challenge_2_score: c2Score });
    }
    setCurrentView('challenge_3');
    setTimerSeconds(GAME_CONFIG.challenge3.totalTimerSeconds);
  };

  const completeChallenge3 = async (c3Score) => {
    audioEngine.playClick();
    const finalC3 = c3Score;
    setChallenge3Score(finalC3);

    const now = Date.now();
    const durationSec = Math.max(Math.floor((now - (startTime || now)) / 1000), 45);
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    const timeTakenFormatted = `${mins}m ${String(secs).padStart(2, '0')}s`;

    const totalScore = score + finalC3;
    const accuracyPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 100;

    const matchedRank = GAME_CONFIG.ranks.find(r => totalScore >= r.minScore && totalScore <= r.maxScore) || GAME_CONFIG.ranks[0];

    const summary = {
      playerName,
      score: totalScore,
      challenge1Score,
      challenge2Score,
      challenge3Score: finalC3,
      maxStreak,
      accuracy: accuracyPct,
      timeTakenFormatted,
      rank: matchedRank
    };

    setFinalGameSummary(summary);

    // Save final completion status to Supabase & Leaderboard
    if (currentSessionId) {
      await updateGameSession(currentSessionId, {
        status: 'completed',
        total_score: totalScore,
        challenge_3_score: finalC3,
        correct_answers: totalCorrect,
        wrong_answers: totalAnswered - totalCorrect,
        accuracy: accuracyPct,
        max_streak: maxStreak,
        completion_time: timeTakenFormatted
      });
    }

    await submitFinalSessionScore(summary);
    clearActiveSessionStorage();
    setCurrentView('results');
  };

  const handleResetToHome = () => {
    audioEngine.playClick();
    clearActiveSessionStorage();
    setCurrentView('home');
  };

  let activeChallengeNum = null;
  if (currentView === 'challenge_1') activeChallengeNum = 1;
  if (currentView === 'challenge_2') activeChallengeNum = 2;
  if (currentView === 'challenge_3') activeChallengeNum = 3;

  return (
    <div className="min-h-screen flex flex-col relative text-white selection:bg-cyan-500 selection:text-black">
      <ParticleBackground />

      {/* Global Arena Top Bar Header */}
      <ArenaHeader
        currentChallenge={activeChallengeNum}
        score={score}
        timerSeconds={timerSeconds}
        streak={streak}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        expoMode={expoMode}
        onToggleExpoMode={() => setExpoMode(!expoMode)}
        playerName={playerName}
      />

      {/* Main View Routing */}
      <main className="flex-1 flex flex-col justify-center">
        {currentView === 'home' && (
          <HomeView
            onPlayNow={() => {
              audioEngine.playClick();
              setCurrentView('register');
            }}
            onHowToPlay={() => {
              audioEngine.playClick();
              setCurrentView('how_to_play');
            }}
            onLeaderboard={() => {
              audioEngine.playClick();
              setCurrentView('leaderboard');
            }}
          />
        )}

        {currentView === 'register' && (
          <RegistrationView
            onStart={(name) => initializeNewGameSession(name)}
            onBack={() => handleResetToHome()}
          />
        )}

        {currentView === 'preloader' && (
          <Preloader message="PREPARING YOUR ARENA..." />
        )}

        {currentView === 'how_to_play' && (
          <HowToPlayView
            playerName={playerName || "Agent"}
            onEnterArena={() => startChallenge1()}
          />
        )}

        {currentView === 'challenge_1' && (
          <Challenge1View
            questions={sessionQuestions.challenge1}
            sessionId={currentSessionId}
            onCompleteChallenge={(c1Score) => completeChallenge1(c1Score)}
            updateScore={handleUpdateScore}
            updateStreak={handleUpdateStreak}
            streak={streak}
            timerSeconds={timerSeconds}
          />
        )}

        {currentView === 'challenge_2' && (
          <Challenge2View
            questions={sessionQuestions.challenge2}
            sessionId={currentSessionId}
            onCompleteChallenge={(c2Score) => completeChallenge2(c2Score)}
            updateScore={handleUpdateScore}
            updateStreak={handleUpdateStreak}
            streak={streak}
            timerSeconds={timerSeconds}
          />
        )}

        {currentView === 'challenge_3' && (
          <Challenge3View
            questions={sessionQuestions.challenge3}
            sessionId={currentSessionId}
            onCompleteChallenge={(c3Score) => completeChallenge3(c3Score)}
            updateScore={handleUpdateScore}
            updateStreak={handleUpdateStreak}
            streak={streak}
            timerSeconds={timerSeconds}
          />
        )}

        {currentView === 'results' && finalGameSummary && (
          <ResultsView
            gameSummary={finalGameSummary}
            onViewLeaderboard={() => {
              audioEngine.playClick();
              setCurrentView('leaderboard');
            }}
            onPlayAgain={() => {
              audioEngine.playClick();
              setCurrentView('register');
            }}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView
            onBackHome={() => handleResetToHome()}
            onPlayAgain={() => {
              audioEngine.playClick();
              setCurrentView('register');
            }}
          />
        )}
      </main>
    </div>
  );
}
