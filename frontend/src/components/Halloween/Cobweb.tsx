import React from 'react';

interface CobwebProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'small' | 'medium' | 'large';
}

const Cobweb: React.FC<CobwebProps> = ({ 
  position = 'top-left',
  size = 'medium' 
}) => {
  const sizeMap = {
    small: 80,
    medium: 120,
    large: 160,
  };

  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 scale-x-[-1]',
    'bottom-left': 'bottom-0 left-0 scale-y-[-1]',
    'bottom-right': 'bottom-0 right-0 scale-[-1]',
  };

  const dimension = sizeMap[size];

  return (
    <div className={`fixed pointer-events-none z-10 opacity-30 ${positionClasses[position]}`}>
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Radial web lines */}
        <line x1="0" y1="0" x2="60" y2="60" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="0" y1="0" x2="80" y2="40" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="0" y1="0" x2="100" y2="20" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="0" y1="0" x2="120" y2="0" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="0" y1="0" x2="100" y2="-20" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="0" y1="0" x2="40" y2="80" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="0" y1="0" x2="20" y2="100" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="120" stroke="#9CA3AF" strokeWidth="1" />
        
        {/* Circular web lines */}
        <path
          d="M 20 20 Q 30 15 40 20 Q 45 30 40 40 Q 30 45 20 40 Q 15 30 20 20"
          stroke="#9CA3AF"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M 35 35 Q 50 28 65 35 Q 72 50 65 65 Q 50 72 35 65 Q 28 50 35 35"
          stroke="#9CA3AF"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M 50 50 Q 70 40 90 50 Q 100 70 90 90 Q 70 100 50 90 Q 40 70 50 50"
          stroke="#9CA3AF"
          strokeWidth="1"
          fill="none"
        />
        
        {/* Spider */}
        <circle cx="60" cy="60" r="4" fill="#3D0C4F" />
        <circle cx="60" cy="55" r="3" fill="#3D0C4F" />
      </svg>
    </div>
  );
};

export default Cobweb;
