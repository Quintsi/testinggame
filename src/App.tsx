import React, { useEffect } from 'react';
import { Hammer, Zap, Flame, Paintbrush, RotateCcw, Target, Fan } from 'lucide-react';
import DesktopEnvironment from './components/desktop/DesktopEnvironment';
import ToolSidebar from './components/tools/ToolSidebar';
import ParticleSystem from './components/tools/ParticleSystem';
import GameModeSelector from './components/game/GameModeSelector';
import PestControlOverlay from './components/game/PestControlOverlay';
import { InstructionText } from './components/ui/InstructionText';
import { useGameState } from './hooks/useGameState';
import { useDesktopInteraction } from './components/desktop/DesktopInteraction';
import { Tool } from './types/game';

function App() {
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
    
    // Actions
    resetDesktop,
    handleModeChange,
    startGame,
    killBug,
  } = useGameState();

  const {
    desktopRef,
    handleDesktopMouseDown,
    handleDesktopMouseUp,
    handleDesktopClick,
  } = useDesktopInteraction(
    selectedTool,
    gameMode,
    mousePosition,
    isMouseDown,
    chainsawPath,
    bugs,
    gameStarted,
    setMousePosition,
    setIsMouseDown,
    setChainsawPath,
    setChainsawPaths,
    setDamageEffects,
    setParticles,
    setSelectedTool,
    killBug,
    volume,
    soundEnabled
  );

  const tools: { id: Tool; icon: React.ComponentType; name: string; color: string; keyBinding: string }[] = [
    { id: 'hammer', icon: Hammer, name: 'Hammer', color: 'text-yellow-400', keyBinding: '1' },
    { id: 'gun', icon: Target, name: 'Gun', color: 'text-red-400', keyBinding: '2' },
    { id: 'flamethrower', icon: Flame, name: 'flamethrower', color: 'text-orange-400', keyBinding: '3' },
    { id: 'laser', icon: Zap, name: 'Laser', color: 'text-blue-400', keyBinding: '4' },
    { id: 'paintball', icon: Paintbrush, name: 'Paintball', color: 'text-pink-400', keyBinding: '5' },
    { id: 'chainsaw', icon: Fan, name: 'Chainsaw', color: 'text-green-400', keyBinding: '6' },
  ];

  const toggleSound = () => setSoundEnabled(prev => !prev);

  // Determine if we should hide UI elements (during active pest control gameplay)
  const shouldHideUI = gameMode === 'pest-control' && gameStarted && !gameEnded;

  useEffect(() => {
    // Clean up old damage effects periodically
    const cleanup = setInterval(() => {
      const now = Date.now();
      setDamageEffects(prev => prev.filter(effect => now - effect.timestamp < 300000)); // Keep for 5 minutes
    }, 60000);

    return () => clearInterval(cleanup);
  }, [setDamageEffects]);

  return (
    <div className="h-screen w-screen bg-gray-900 overflow-hidden relative">
      {/* Game Mode Selector - Hide during active pest control */}
      {!shouldHideUI && (
        <GameModeSelector currentMode={gameMode} onModeChange={handleModeChange} />
      )}

      {/* Tool Sidebar - Hide during active pest control */}
      {!shouldHideUI && (
        <ToolSidebar
          tools={tools}
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          onReset={resetDesktop}
          soundEnabled={soundEnabled}
          onSoundToggle={toggleSound}
          volume={volume}
          onVolumeChange={setVolume}
        />
      )}

      {/* Desktop Environment */}
      <div className="flex-1 relative">
        <DesktopEnvironment
          ref={desktopRef}
          onClick={handleDesktopClick}
          onMouseDown={handleDesktopMouseDown}
          onMouseUp={handleDesktopMouseUp}
          damageEffects={damageEffects}
          chainsawPaths={chainsawPaths}
          selectedTool={selectedTool}
          gameMode={gameMode}
          mousePosition={mousePosition}
        />
        
        {/* Pest Control Overlay */}
        {gameMode === 'pest-control' && (
          <PestControlOverlay
            bugs={bugs}
            gameStarted={gameStarted}
            gameEnded={gameEnded}
            score={score}
            timeLeft={timeLeft}
            onStartGame={startGame}
            onBugClick={() => {}} // Handled in desktop interaction
            selectedTool={selectedTool}
            mousePosition={mousePosition}
          />
        )}
        
        {/* Particle System */}
        <ParticleSystem particles={particles} />
      </div>

      {/* Instructions - Hide during active pest control */}
      {!shouldHideUI && (
        <InstructionText
          gameMode={gameMode}
          gameStarted={gameStarted}
          score={score}
          soundEnabled={soundEnabled}
        />
      )}
    </div>
  );
}

export default App;