import React, { useState, useEffect, useRef } from 'react';
import { ParticleBackground } from './components/ParticleBackground';
import { ArenaHeader } from './components/ArenaHeader';
import { HomeView } from './pages/HomeView';
import { LeaderboardView } from './pages/LeaderboardView';
import { HostView } from './pages/HostView';
import { ScreenView } from './pages/ScreenView';
import { PlayerView } from './pages/PlayerView';

import { GAME_CONFIG } from './game/config';
import { audioEngine } from './game/audioEngine';

export default function App() {
  // Navigation View State: 'home' | 'player' | 'host' | 'screen' | 'leaderboard'
  const [currentView, setCurrentView] = useState('home');
  const [urlRoomCode, setUrlRoomCode] = useState('');

  // Audio & Expo Mode Controls
  const [isMuted, setIsMuted] = useState(false);

  // Check URL query params on mount for mode selection (?mode=host, ?mode=screen, ?room=CODE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    const roomParam = params.get('room');
    const path = window.location.pathname.toLowerCase();

    if (roomParam) setUrlRoomCode(roomParam.toUpperCase());

    if (modeParam === 'host' || path.endsWith('/host')) {
      setCurrentView('host');
    } else if (modeParam === 'screen' || path.endsWith('/screen')) {
      setCurrentView('screen');
    } else if (roomParam || modeParam === 'player') {
      setCurrentView('player');
    }
  }, []);

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleResetToHome = () => {
    audioEngine.playClick();
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen flex flex-col relative text-white selection:bg-cyan-500 selection:text-black">
      <ParticleBackground />

      {/* Global Arena Top Bar Header */}
      <ArenaHeader
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main View Routing */}
      <main className="flex-1 flex flex-col justify-center">
        {currentView === 'home' && (
          <HomeView
            onPlayNow={() => {
              audioEngine.playClick();
              setCurrentView('player');
            }}
            onLeaderboard={() => {
              audioEngine.playClick();
              setCurrentView('leaderboard');
            }}
            onHostConsole={() => {
              audioEngine.playClick();
              setCurrentView('host');
            }}
            onScreenDisplay={() => {
              audioEngine.playClick();
              setCurrentView('screen');
            }}
          />
        )}

        {currentView === 'player' && (
          <PlayerView
            defaultRoomCode={urlRoomCode}
            onBackHome={() => handleResetToHome()}
          />
        )}

        {currentView === 'host' && (
          <HostView
            onBackHome={() => handleResetToHome()}
          />
        )}

        {currentView === 'screen' && (
          <ScreenView
            defaultRoomCode={urlRoomCode}
            onBackHome={() => handleResetToHome()}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView
            onBackHome={() => handleResetToHome()}
          />
        )}
      </main>
    </div>
  );
}

