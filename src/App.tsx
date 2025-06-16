import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Hammer, Zap, Flame, Bomb, RotateCcw, Target } from 'lucide-react';
import DesktopEnvironment from './components/DesktopEnvironment';
import ToolSidebar from './components/ToolSidebar';
import ParticleSystem from './components/ParticleSystem';
import { useSoundEffects } from './hooks/useSoundEffects';
import { Tool, DamageEffect } from './types/game';

function App() {
  const [selectedTool, setSelectedTool] = useState<Tool>('hammer');
  const [damageEffects, setDamageEffects] = useState<DamageEffect[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const desktopRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSoundEffects();

  const tools: { id: Tool; icon: React.ComponentType; name: string; color: string }[] = [
    { id: 'hammer', icon: Hammer, name: 'Hammer', color: 'text-yellow-400' },
    { id: 'gun', icon: Target, name: 'Gun', color: 'text-red-400' },
    { id: 'fire', icon: Flame, name: 'Fire', color: 'text-orange-400' },
    { id: 'laser', icon: Zap, name: 'Laser', color: 'text-blue-400' },
    { id: 'bomb', icon: Bomb, name: 'Bomb', color: 'text-purple-400' },
  ];

  const handleDesktopClick = useCallback((event: React.MouseEvent) => {
    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Play sound effect
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
    const particleCount = selectedTool === 'bomb' ? 20 : selectedTool === 'fire' ? 15 : 8;
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
  }, [selectedTool, soundEnabled, playSound]);

  const resetDesktop = () => {
    setDamageEffects([]);
    setParticles([]);
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  useEffect(() => {
    // Clean up old damage effects periodically
    const cleanup = setInterval(() => {
      const now = Date.now();
      setDamageEffects(prev => prev.filter(effect => now - effect.timestamp < 300000)); // Keep for 5 minutes
    }, 60000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-900 overflow-hidden relative">
      {/* Tool Sidebar */}
      <ToolSidebar
        tools={tools}
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        onReset={resetDesktop}
        soundEnabled={soundEnabled}
        onSoundToggle={toggleSound}
      />

      {/* Desktop Environment */}
      <div className="flex-1 relative">
        <DesktopEnvironment
          ref={desktopRef}
          onClick={handleDesktopClick}
          damageEffects={damageEffects}
          selectedTool={selectedTool}
        />
        
        {/* Particle System */}
        <ParticleSystem particles={particles} />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
        Click anywhere on the desktop to destroy it with the selected tool! {soundEnabled ? '🔊' : '🔇'}
      </div>
    </div>
  );
}

export default App;