import React, { useEffect, useState } from 'react';
import { Hammer, Zap, Flame, Paintbrush, Target, Fan } from 'lucide-react';
import DesktopContainer from './components/desktop/DesktopContainer';
import ToolSidebar from './components/tools/ToolSidebar';
import ParticleSystem from './components/tools/ParticleSystem';
import GameModeSelector from './components/game/GameModeSelector';
import PestControlOverlay from './components/game/PestControlOverlay';
import LoginButton from './components/auth/LoginButton';
import LeaderboardModal from './components/auth/LeaderboardModal';
import AuthGuard from './components/auth/AuthGuard';
import { InstructionText } from './components/ui/InstructionText';
import { GameClockProvider } from './components/effects/GameClockProvider'
import { useGameState } from './hooks/useGameState';
import { useAuth } from './hooks/useAuth';
import { Tool } from './types/game';

function App() {
  console.log('App component is loading...'); // Debug log
  
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { isAuthenticated } = useAuth();

  const {
    // State
    selectedTool,
    gameMode,
    damageEffects,
    chainsawPaths,
    particles,
    soundEnabled,
    volume,
    mousePosition,
    isMouseDown,
    chainsawPath,
    lastFlamethrowerDamage,
    bugs,
    gameStarted,
    gameEnded,
    score,
    timeLeft,
    missedAttempts,
    userHighScore,
    wave,
    PEST_WEAPON_MAP,
    mutedWeapons,
    pestDamageEffects,
    
    
    // Setters
    setSelectedTool,
    setDamageEffects,
    setChainsawPaths,
    setParticles,
    setSoundEnabled,
    setVolume,
    setMousePosition,
    setIsMouseDown,
    setChainsawPath,
    setPestDamageEffects,
    
    // Actions
    resetDesktop,
    handleModeChange,
    startGame,
    killBug,
    attemptKill,
    toggleWeaponMute,
    isWeaponMuted,
    resetGame,
  } = useGameState();

  const tools: { id: Tool; icon: React.ComponentType; name: string; color: string; keyBinding: string }[] = [
    { id: 'hammer', icon: Hammer, name: 'Hammer', color: 'text-yellow-400', keyBinding: '1' },
    { id: 'gun', icon: Target, name: 'Gun', color: 'text-red-400', keyBinding: '2' },
    { id: 'flamethrower', icon: Flame, name: 'flamethrower', color: 'text-orange-400', keyBinding: '3' },
    { id: 'laser', icon: Zap, name: 'Laser', color: 'text-blue-400', keyBinding: '4' },
    { id: 'paintball', icon: Paintbrush, name: 'Paintball', color: 'text-pink-400', keyBinding: '5' },
    { id: 'chainsaw', icon: Fan, name: 'Chainsaw', color: 'text-green-400', keyBinding: '6' },
  ];

  const toggleSound = () => setSoundEnabled(prev => !prev);

  // Determine if we should hide UI elements (during active pest control gameplay AND when endless mode is started)
  const shouldHideUI = (gameMode === 'pest-control' && gameStarted && !gameEnded) || 
                       (gameMode === 'endless-mode' && gameStarted && !gameEnded);

  // Check if pest control mode requires authentication (endless mode does NOT require auth)
  const isPestControlModeRestricted = gameMode === 'pest-control' && !isAuthenticated;

  // Format time for endless mode (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Clean up old damage effects periodically
    const cleanup = setInterval(() => {
      const now = Date.now();
      setDamageEffects(prev => prev.filter(effect => now - effect.timestamp < 300000)); // Keep for 5 minutes
    }, 60000);

    return () => clearInterval(cleanup);
  }, [setDamageEffects]);

  // Add CSS to prevent text selection
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      input, textarea {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <GameClockProvider>
      <div className="h-screen w-screen bg-gray-900 overflow-hidden relative">
        {/* Fixed background image */}
        <div className="bg-fixed-cover" />
        
        {/* Login Button - Hide during active pest control AND endless mode when started */}
        {!shouldHideUI && (
          <LoginButton onShowLeaderboard={() => setShowLeaderboard(true)} />
        )}
        
        {/* Leaderboard Modal */}
        <LeaderboardModal 
          isOpen={showLeaderboard} 
          onClose={() => setShowLeaderboard(false)} 
        />
        
        {/* Game Mode Selector - Hide during active pest control AND endless mode when started */}
        {!shouldHideUI && (
          <GameModeSelector currentMode={gameMode} onModeChange={handleModeChange} />
        )}
        
        {/* Tool Sidebar - Hide during active pest control only */}
        {!(gameMode === 'pest-control' && gameStarted && !gameEnded) && (
          <ToolSidebar
            tools={tools}
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            onReset={resetDesktop}
            soundEnabled={soundEnabled}
            onSoundToggle={toggleSound}
            volume={volume}
            onVolumeChange={setVolume}
            mutedWeapons={mutedWeapons}
            onWeaponMuteToggle={toggleWeaponMute}
          />
        )}
        
        {/* Timer UI for Endless Mode - Top left corner with Exit button */}
        {gameMode === 'endless-mode' && gameStarted && !gameEnded && (
          <div className="absolute top-4 left-4 z-50">
            <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 shadow-2xl border border-gray-700 min-w-[180px]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl font-bold text-white">
                  {formatTime(timeLeft)}
                </div>
                <button
                  onClick={resetGame}
                  className="px-2 py-1 rounded bg-red-600/20 hover:bg-red-600/40 transition-colors duration-200 group text-xs"
                  title="Exit Game"
                >
                  <span className="text-red-400 group-hover:text-red-300 font-medium">Exit</span>
                </button>
              </div>
              <div className="text-sm font-semibold text-green-400">
                Score: {score}
              </div>
              <div className="text-xs text-purple-400">
                Bugs: {bugs.length}
              </div>
            </div>
          </div>
        )}
        
        {/* Desktop Environment */}
        <div className="flex-1 relative">
          {/* Show auth guard only for pest control mode when not authenticated */}
          {isPestControlModeRestricted ? (
            <AuthGuard
              fallback={
                <div className="flex items-center justify-center h-full bg-gray-900 md-p-16">
                  <div className="text-center max-w-md mx-auto p-8">
                    <div className="text-6xl mb-6">🐛</div>
                    <h2 className="text-2xl font-bold text-white mb-4">Pest Protocol Mode</h2>
                    <p className="text-gray-400 mb-8">
                      Sign in with your Google account to play Pest Protocol mode and compete on the global leaderboard!
                    </p>
                    <div className="text-sm text-gray-500">
                      Desktop Destroyer and Endless Mode are available without signing in.
                    </div>
                  </div>
                </div>
              }
            >
              <DesktopContainer
                selectedTool={selectedTool}
                gameMode={gameMode}
                mousePosition={mousePosition}
                isMouseDown={isMouseDown}
                chainsawPath={chainsawPath}
                bugs={bugs}
                gameStarted={gameStarted}
                damageEffects={damageEffects}
                pestDamageEffects={pestDamageEffects}
                chainsawPaths={chainsawPaths}
                setMousePosition={setMousePosition}
                setIsMouseDown={setIsMouseDown}
                setChainsawPath={setChainsawPath}
                setChainsawPaths={setChainsawPaths}
                setDamageEffects={setDamageEffects}
                setPestDamageEffects={setPestDamageEffects}
                setParticles={setParticles}
                setSelectedTool={setSelectedTool}
                killBug={killBug}
                attemptKill={attemptKill}
                volume={volume}
                soundEnabled={soundEnabled}
                isWeaponMuted={isWeaponMuted}
                lastFlamethrowerDamage={lastFlamethrowerDamage}
              />
            </AuthGuard>
          ) : (
            <DesktopContainer
              selectedTool={selectedTool}
              gameMode={gameMode}
              mousePosition={mousePosition}
              isMouseDown={isMouseDown}
              chainsawPath={chainsawPath}
              bugs={bugs}
              gameStarted={gameStarted}
              damageEffects={damageEffects}
              pestDamageEffects={pestDamageEffects}
              chainsawPaths={chainsawPaths}
              setMousePosition={setMousePosition}
              setIsMouseDown={setIsMouseDown}
              setChainsawPath={setChainsawPath}
              setChainsawPaths={setChainsawPaths}
              setDamageEffects={setDamageEffects}
              setPestDamageEffects={setPestDamageEffects}
              setParticles={setParticles}
              setSelectedTool={setSelectedTool}
              killBug={killBug}
              attemptKill={attemptKill}
              volume={volume}
              soundEnabled={soundEnabled}
              isWeaponMuted={isWeaponMuted}
              lastFlamethrowerDamage={lastFlamethrowerDamage}
            />
          )}
          
          {/* Pest Control/Endless Mode Overlay - Only show when authenticated for pest-control, always show for endless-mode */}
          {((gameMode === 'pest-control' && !isPestControlModeRestricted) || gameMode === 'endless-mode') && (
            <PestControlOverlay
              bugs={bugs}
              gameStarted={gameStarted}
              gameEnded={gameEnded}
              score={score}
              timeLeft={timeLeft}
              missedAttempts={missedAttempts}
              userHighScore={userHighScore}
              onStartGame={startGame}
              onBugClick={() => {}} // Handled in desktop interaction
              selectedTool={selectedTool}
              mousePosition={mousePosition}
              PEST_WEAPON_MAP={PEST_WEAPON_MAP}
              onExitGame={resetGame}
              gameMode={gameMode}
              wave={wave}
            />
          )}
          
          {/* Particle System */}
          <ParticleSystem particles={particles} />
        </div>
        
        {/* Instructions - Always show */}
        <InstructionText
          gameMode={gameMode}
          gameStarted={gameStarted}
          score={score}
          soundEnabled={soundEnabled}
        />
      </div>
    </GameClockProvider>
  );
}

export default App;