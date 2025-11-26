import React from 'react';

interface PumpkinSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const PumpkinSpinner: React.FC<PumpkinSpinnerProps> = ({ size = 'medium' }) => {
  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80,
  };

  const dimension = sizeMap[size];

  return (
    <div className="flex items-center justify-center">
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin-slow"
      >
        {/* Pumpkin body */}
        <circle cx="30" cy="30" r="25" fill="#FF6B35" />
        <ellipse cx="20" cy="30" rx="8" ry="25" fill="#FF8C5A" />
        <ellipse cx="30" cy="30" rx="8" ry="25" fill="#FF8C5A" />
        <ellipse cx="40" cy="30" rx="8" ry="25" fill="#FF8C5A" />
        
        {/* Stem */}
        <rect x="28" y="5" width="4" height="8" rx="2" fill="#4E9F3D" />
        
        {/* Eyes */}
        <path d="M20 22L23 25L20 28L17 25Z" fill="#1A1A1D" />
        <path d="M40 22L43 25L40 28L37 25Z" fill="#1A1A1D" />
        
        {/* Mouth */}
        <path
          d="M18 35C18 35 22 40 30 40C38 40 42 35 42 35"
          stroke="#1A1A1D"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M22 35L24 38L22 40Z" fill="#1A1A1D" />
        <path d="M28 35L30 39L28 41Z" fill="#1A1A1D" />
        <path d="M34 35L36 39L34 41Z" fill="#1A1A1D" />
        <path d="M40 35L42 38L40 40Z" fill="#1A1A1D" />
      </svg>
    </div>
  );
};

export default PumpkinSpinner;
