import React, { useEffect, useState } from 'react';

interface IdleAnimationsProps {
  idleTimeout?: number; // milliseconds before triggering (default 60000 = 1 minute)
}

const IdleAnimations: React.FC<IdleAnimationsProps> = ({ idleTimeout = 60000 }) => {
  const [isIdle, setIsIdle] = useState(false);
  const [showBat, setShowBat] = useState(false);
  const [showGhost, setShowGhost] = useState(false);
  const [showEyes, setShowEyes] = useState(false);

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
      const effects = ['bat', 'ghost', 'eyes'];
      const randomEffect = effects[Math.floor(Math.random() * effects.length)];

      switch (randomEffect) {
        case 'bat':
          setShowBat(true);
          setTimeout(() => setShowBat(false), 8000);
          break;
        case 'ghost':
          setShowGhost(true);
          setTimeout(() => setShowGhost(false), 10000);
          break;
        case 'eyes':
          setShowEyes(true);
          setTimeout(() => setShowEyes(false), 5000);
          break;
      }

      // Schedule next effect if still idle
      setTimeout(() => {
        if (isIdle) {
          triggerRandomEffect();
        }
      }, 15000); // Wait 15 seconds between effects
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
    </>
  );
};

export default IdleAnimations;
