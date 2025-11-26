import React from 'react';

interface FloatingBatProps {
  delay?: number;
  duration?: number;
  right?: string;
}

const FloatingBat: React.FC<FloatingBatProps> = ({ 
  delay = 0, 
  duration = 5,
  right = '15%' 
}) => {
  return (
    <div
      className="fixed pointer-events-none z-10 opacity-25"
      style={{
        right,
        top: '-50px',
        animation: `floatDown ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg
        width="50"
        height="30"
        viewBox="0 0 50 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-pulse-slow"
      >
        {/* Bat wings and body */}
        <path
          d="M25 15C25 15 20 10 15 10C10 10 5 12 5 17C5 20 7 22 10 22C10 22 8 18 10 15C12 12 15 12 17 14C17 14 20 10 25 10C30 10 33 14 33 14C35 12 38 12 40 15C42 18 40 22 40 22C43 22 45 20 45 17C45 12 40 10 35 10C30 10 25 15 25 15Z"
          fill="#6A0572"
        />
        {/* Bat head */}
        <circle cx="25" cy="15" r="3" fill="#3D0C4F" />
        {/* Ears */}
        <path d="M23 12L22 10L24 11Z" fill="#3D0C4F" />
        <path d="M27 12L28 10L26 11Z" fill="#3D0C4F" />
      </svg>
    </div>
  );
};

export default FloatingBat;
