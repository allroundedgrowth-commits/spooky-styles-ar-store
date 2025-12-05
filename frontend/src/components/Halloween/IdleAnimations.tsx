import React, { useEffect, useState } from 'react';

interface IdleAnimationsProps {
  idleTimeout?: number; // milliseconds before triggering (default 60000 = 1 minute)
}

const IdleAnimations: React.FC<IdleAnimationsProps> = ({ idleTimeout = 60000 }) => {
  const [isIdle, setIsIdle] = useState(false);
  const [showBat, setShowBat] = useState(false);
  const [showGhost, setShowGhost] = useState(false);
  const [showEyes, setShowEyes] = useState(false);
  const [fallingMasks, setFallingMasks] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsIdle(true);
        triggerRandomEffect();
      }, idleTimeout);
    };

    const triggerRandomEffect = () => {
      const effects = ['bat', 'ghost', 'eyes', 'masks'];
      const randomEffect = effects[Math.floor(Math.random() * effects.length)];

      switch (randomEffect) {
        case 'bat':
          setShowBat(true);
          playSound('bat');
          setTimeout(() => setShowBat(false), 8000);
          break;
        case 'ghost':
          setShowGhost(true);
          playSound('ghost');
          setTimeout(() => setShowGhost(false), 10000);
          break;
        case 'eyes':
          setShowEyes(true);
          playSound('creepy');
          setTimeout(() => setShowEyes(false), 5000);
          break;
        case 'masks':
          triggerFallingMasks();
          playSound('whoosh');
          break;
      }

      // Schedule next effect if still idle
      setTimeout(() => {
        if (isIdle) {
          triggerRandomEffect();
        }
      }, 15000); // Wait 15 seconds between effects
    };

    const triggerFallingMasks = () => {
      const maskCount = Math.floor(Math.random() * 5) + 3; // 3-7 masks
      const newMasks = Array.from({ length: maskCount }, (_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 90 + 5, // 5-95% from left
        delay: Math.random() * 2, // 0-2s delay
        duration: Math.random() * 3 + 4, // 4-7s duration
      }));
      
      setFallingMasks(newMasks);
      
      // Clear masks after animation
      setTimeout(() => {
        setFallingMasks([]);
      }, 8000);
    };

    const playSound = (type: string) => {
      // Create audio context for sound effects
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sound patterns for different effects
      switch (type) {
        case 'bat':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
        case 'ghost':
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 1);
          gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 1);
          break;
        case 'creepy':
          oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
          gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          break;
        case 'whoosh':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.4);
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.4);
          break;
      }
    };

    // Events that reset the idle timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, resetIdleTimer);
    });

    // Initialize timer
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [idleTimeout, isIdle]);

  return (
    <>
      {/* Flying Bat */}
      {showBat && (
        <div
          className="fixed top-1/4 left-0 pointer-events-none z-50"
          style={{
            animation: 'batFly 8s linear forwards',
          }}
        >
          <div className="text-6xl transform">
            🦇
          </div>
        </div>
      )}

      {/* Floating Ghost */}
      {showGhost && (
        <div
          className="fixed top-1/3 left-0 pointer-events-none z-50"
          style={{
            animation: 'ghostFloat 10s ease-in-out forwards',
          }}
        >
          <div className="text-7xl opacity-60">
            👻
          </div>
        </div>
      )}

      {/* Creepy Eyes */}
      {showEyes && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div
            className="flex gap-8 text-8xl"
            style={{
              animation: 'eyeBlink 5s ease-in-out infinite',
              textShadow: '0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.6)',
            }}
          >
            <span className="text-red-600">👁️</span>
            <span className="text-red-600">👁️</span>
          </div>
        </div>
      )}

      {/* Falling White Masks */}
      {fallingMasks.map((mask) => (
        <div
          key={mask.id}
          className="fixed pointer-events-none z-50"
          style={{
            top: '-100px',
            left: `${mask.left}%`,
            animation: `maskFall ${mask.duration}s linear ${mask.delay}s forwards`,
          }}
        >
          <div 
            className="text-6xl filter drop-shadow-lg"
            style={{
              animation: `maskSpin ${mask.duration}s linear infinite`,
              filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
            }}
          >
            🎭
          </div>
        </div>
      ))}

      {/* Add keyframe animations */}
      <style>{`
        @keyframes maskFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes maskSpin {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default IdleAnimations;
