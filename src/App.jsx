import React, { useState, useEffect } from 'react';
import { ParticleBackground } from './components/ParticleBackground';
import { ArenaHeader } from './components/ArenaHeader';
import { HomeView } from './pages/HomeView';
import { LeaderboardView } from './pages/LeaderboardView';
import { HostView } from './pages/HostView';
import { PlayerView } from './pages/PlayerView';
import { AdminView } from './pages/AdminView';

import { audioEngine } from './game/audioEngine';

export default function App() {
  // Navigation View State: 'home' | 'player' | 'host' | 'leaderboard' | 'admin'
  const [currentView, setCurrentView] = useState('home');
  const [urlRoomCode, setUrlRoomCode] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  // Check URL query params on mount for mode selection (?mode=host, ?mode=admin, ?room=CODE, /host, /admin)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    const roomParam = params.get('room');
    const path = window.location.pathname.toLowerCase();

    if (roomParam) setUrlRoomCode(roomParam.toUpperCase());

    if (modeParam === 'host' || modeParam === 'screen' || path.endsWith('/host') || path.endsWith('/screen')) {
      setCurrentView('host');
    } else if (modeParam === 'admin' || path.endsWith('/admin')) {
      setCurrentView('admin');
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
        onBackHome={handleResetToHome}
      />

      {/* Main View Routing */}
      <main className="flex-1 flex flex-col justify-center">
        {currentView === 'home' && (
          <HomeView
            onHostConsole={() => {
              audioEngine.playClick();
              setCurrentView('host');
            }}
            onLeaderboard={() => {
              audioEngine.playClick();
              setCurrentView('leaderboard');
            }}
            onAdminConfig={() => {
              audioEngine.playClick();
              setCurrentView('admin');
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

        {currentView === 'leaderboard' && (
          <LeaderboardView
            onBackHome={() => handleResetToHome()}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            onBackHome={() => handleResetToHome()}
          />
        )}
      </main>
    </div>
  );
}
