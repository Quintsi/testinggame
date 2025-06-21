import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Hammer, Zap, Flame, Bomb, RotateCcw, Target, Fan } from 'lucide-react';
import DesktopEnvironment from './components/DesktopEnvironment';
import ToolSidebar from './components/ToolSidebar';
import ParticleSystem from './components/ParticleSystem';
import GameModeSelector from './components/GameModeSelector';
import PestControlOverlay from './components/PestControlOverlay';
import { useSoundEffects } from './hooks/useSoundEffects';
import { usePestControl } from './hooks/usePestControl';
import { Tool, DamageEffect, GameMode } from './types/game';

function App() {
  const [selectedTool, setSelectedTool] = useState<Tool>('hammer');
  const [gameMode, setGameMode] = useState<GameMode>('desktop-destroyer');
  const [damageEffects, setDamageEffects] = useState<DamageEffect[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(50);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const desktopRef = useRef<HTMLDivElement>(null);
  const { startSound, stopSound, playSound } = useSoundEffects(volume / 100);
  
  // Pest Control game state
  const { bugs, gameStarted, score, startGame, killBug, resetGame } = usePestControl();

  const tools: { id: Tool; icon: React.ComponentType; name: string; color: string; keyBinding: string }[] = [
    { id: 'hammer', icon: Hammer, name: 'Hammer', color: 'text-yellow-400', keyBinding: '1' },
    { id: 'gun', icon: Target, name: 'Gun', color: 'text-red-400', keyBinding: '2' },
    { id: 'flamethrower', icon: Flame, name: 'flamethrower', color: 'text-orange-400', keyBinding: '3' },
    { id: 'laser', icon: Zap, name: 'Laser', color: 'text-blue-400', keyBinding: '4' },
    { id: 'bomb', icon: Bomb, name: 'Bomb', color: 'text-purple-400', keyBinding: '5' },
    { id: 'chainsaw', icon: Fan, name: 'Chainsaw', color: 'text-green-400', keyBinding: '6' },
  ];

  // Keyboard weapon switching
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const keyToTool: { [key: string]: Tool } = {
        '1': 'hammer',
        '2': 'gun',
        '3': 'flamethrower',
        '4': 'laser',
        '5': 'bomb',
        '6': 'chainsaw',
      };

      const tool = keyToTool[event.key];
      if (tool) {
        setSelectedTool(tool);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Track mouse position globally
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = desktopRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Get weapon hitbox based on tool type
  const getWeaponHitbox = (x: number, y: number, tool: Tool) => {
    switch (tool) {
      case 'hammer':
        return { x: x - 20, y: y - 20, width: 40, height: 40 };
      case 'gun':
        return { x: x - 15, y: y - 15, width: 30, height: 30 };
      case 'flamethrower':
        return { x: x - 30, y: y - 30, width: 60, height: 60 };
      case 'laser':
        return { x: x - 25, y: y - 5, width: 50, height: 10 };
      case 'bomb':
        return { x: x - 40, y: y - 40, width: 80, height: 80 };
      case 'chainsaw':
        return { x: x - 25, y: y - 25, width: 50, height: 50 };
      default:
        return { x: x - 15, y: y - 15, width: 30, height: 30 };
    }
  };

  // Check collision between weapon and bug
  const checkCollision = (weaponHitbox: any, bugX: number, bugY: number) => {
    const bugHitbox = { x: bugX - 15, y: bugY - 15, width: 30, height: 30 };
    
    return (
      weaponHitbox.x < bugHitbox.x + bugHitbox.width &&
      weaponHitbox.x + weaponHitbox.width > bugHitbox.x &&
      weaponHitbox.y < bugHitbox.y + bugHitbox.height &&
      weaponHitbox.y + weaponHitbox.height > bugHitbox.y
    );
  };

  const handleDesktopMouseDown = useCallback((event: React.MouseEvent) => {
    // Only handle desktop destruction in desktop-destroyer mode
    if (gameMode !== 'desktop-destroyer') return;

    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Start continuous sound effect
    if (soundEnabled) {
      try {
        startSound(selectedTool);
      } catch (error) {
        console.warn('Could not start sound:', error);
      }
    }

    // Create damage effect
    const newDamage: DamageEffect = {
      id: Date.now() + Math.random(),
      x,
      y,
      tool: selectedTool,
      timestamp: Date.now(),
    };

    setDamageEffects(prev => [...prev, newDamage]);

    // Create particles based on tool
    const particleCount = selectedTool === 'bomb' ? 20 : selectedTool === 'flamethrower' ? 15 : 8;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      tool: selectedTool,
      angle: (Math.PI * 2 * i) / particleCount,
      speed: Math.random() * 5 + 2,
      life: 1,
    }));

    setParticles(prev => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 2000);
  }, [selectedTool, soundEnabled, startSound, gameMode]);

  const handleDesktopMouseUp = useCallback(() => {
    // Stop the sound effect when mouse is released
    if (soundEnabled) {
      try {
        stopSound(selectedTool);
      } catch (error) {
        console.warn('Could not stop sound:', error);
      }
    }
  }, [selectedTool, soundEnabled, stopSound]);

  // Legacy click handler for backward compatibility
  const handleDesktopClick = useCallback((event: React.MouseEvent) => {
    // Handle pest control mode
    if (gameMode === 'pest-control' && gameStarted) {
      const rect = desktopRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Get weapon hitbox
      const weaponHitbox = getWeaponHitbox(x, y, selectedTool);

      // Check for bug collisions
      const hitBug = bugs.find(bug => checkCollision(weaponHitbox, bug.x, bug.y));

      if (hitBug) {
        // Play sound effect when hitting a bug
        if (soundEnabled) {
          try {
            playSound(selectedTool);
          } catch (error) {
            console.warn('Could not play sound:', error);
          }
        }

        // Kill the bug
        killBug(hitBug.id);

        // Create particles at bug location
        const particleCount = 8;
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
          id: Date.now() + i,
          x: hitBug.x,
          y: hitBug.y,
          tool: selectedTool,
          angle: (Math.PI * 2 * i) / particleCount,
          speed: Math.random() * 3 + 1,
          life: 1,
        }));

        setParticles(prev => [...prev, ...newParticles]);

        // Remove particles after animation
        setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.includes(p)));
        }, 1500);
      }
      return;
    }

    // Only handle desktop destruction in desktop-destroyer mode
    if (gameMode !== 'desktop-destroyer') return;

    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Play sound effect (single play)
    if (soundEnabled) {
      try {
        playSound(selectedTool);
      } catch (error) {
        console.warn('Could not play sound:', error);
      }
    }

    // Create damage effect
    const newDamage: DamageEffect = {
      id: Date.now() + Math.random(),
      x,
      y,
      tool: selectedTool,
      timestamp: Date.now(),
    };

    setDamageEffects(prev => [...prev, newDamage]);

    // Create particles based on tool
    const particleCount = selectedTool === 'bomb' ? 20 : selectedTool === 'flamethrower' ? 15 : 8;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      tool: selectedTool,
      angle: (Math.PI * 2 * i) / particleCount,
      speed: Math.random() * 5 + 2,
      life: 1,
    }));

    setParticles(prev => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 2000);
  }, [selectedTool, soundEnabled, playSound, gameMode, gameStarted, bugs, killBug]);

  const handleBugClick = useCallback((bugId: number, event: React.MouseEvent) => {
    // This is now handled by the main click handler with proper collision detection
    event.stopPropagation();
  }, []);

  const resetDesktop = () => {
    setDamageEffects([]);
    setParticles([]);
    if (gameMode === 'pest-control') {
      resetGame();
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    // Reset everything when switching modes
    setDamageEffects([]);
    setParticles([]);
    if (mode === 'pest-control') {
      resetGame();
    }
  };

  useEffect(() => {
    // Clean up old damage effects periodically
    const cleanup = setInterval(() => {
      const now = Date.now();
      setDamageEffects(prev => prev.filter(effect => now - effect.timestamp < 300000)); // Keep for 5 minutes
    }, 60000);

    return () => clearInterval(cleanup);
  }, []);

  // Global mouse up handler to stop sounds when mouse is released outside desktop
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (soundEnabled) {
        try {
          stopSound(selectedTool);
        } catch (error) {
          console.warn('Could not stop sound:', error);
        }
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [selectedTool, soundEnabled, stopSound]);

  const getInstructionText = () => {
    if (gameMode === 'pest-control') {
      return gameStarted 
        ? `Hunt the bugs! Score: ${score} | Use keys 1-6 to switch weapons ${soundEnabled ? '🔊' : '🔇'}`
        : `Click START to begin Pest Control! Use keys 1-6 to switch weapons ${soundEnabled ? '🔊' : '🔇'}`;
    }
    return `Click anywhere on the desktop to destroy it! Use keys 1-6 to switch weapons ${soundEnabled ? '🔊' : '🔇'}`;
  };

  return (
    <div className="h-screen w-screen bg-gray-900 overflow-hidden relative">
      {/* Game Mode Selector */}
      <GameModeSelector currentMode={gameMode} onModeChange={handleModeChange} />

      {/* Tool Sidebar */}
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

      {/* Desktop Environment */}
      <div className="flex-1 relative">
        <DesktopEnvironment
          ref={desktopRef}
          onClick={handleDesktopClick}
          onMouseDown={handleDesktopMouseDown}
          onMouseUp={handleDesktopMouseUp}
          damageEffects={damageEffects}
          selectedTool={selectedTool}
          gameMode={gameMode}
          mousePosition={mousePosition}
        />
        
        {/* Pest Control Overlay */}
        {gameMode === 'pest-control' && (
          <PestControlOverlay
            bugs={bugs}
            gameStarted={gameStarted}
            onStartGame={startGame}
            onBugClick={handleBugClick}
            selectedTool={selectedTool}
            mousePosition={mousePosition}
          />
        )}
        
        {/* Particle System */}
        <ParticleSystem particles={particles} />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
        {getInstructionText()}
      </div>
    </div>
  );
}

export default App;