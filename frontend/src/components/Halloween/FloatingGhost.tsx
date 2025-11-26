import React from 'react';

interface FloatingGhostProps {
  delay?: number;
  duration?: number;
  left?: string;
}

const FloatingGhost: React.FC<FloatingGhostProps> = ({ 
  delay = 0, 
  duration = 4,
  left = '10%' 
}) => {
  return (
    <div
      className="fixed pointer-events-none z-10 opacity-20"
      style={{
        left,
        top: '-50px',
        animation: `floatDown ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg
        width="40"
        height="50"
        viewBox="0 0 40 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-float"
      >
        {/* Ghost body */}
        <path
          d="M20 5C11.7157 5 5 11.7157 5 20V40C5 42 7 44 9 44C11 44 12 42 12 40C12 42 14 44 16 44C18 44 20 42 20 40C20 42 22 44 24 44C26 44 28 42 28 40C28 42 29 44 31 44C33 44 35 42 35 40V20C35 11.7157 28.2843 5 20 5Z"
          fill="white"
        />
        {/* Eyes */}
        <circle cx="15" cy="20" r="2" fill="#1A1A1D" />
        <circle cx="25" cy="20" r="2" fill="#1A1A1D" />
        {/* Mouth */}
        <path
          d="M15 28C15 28 17 30 20 30C23 30 25 28 25 28"
          stroke="#1A1A1D"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default FloatingGhost;
