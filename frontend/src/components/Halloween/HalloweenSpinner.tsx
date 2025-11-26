import React from 'react';

interface HalloweenSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const HalloweenSpinner: React.FC<HalloweenSpinnerProps> = ({ 
  size = 'medium',
  text = 'Loading...' 
}) => {
  const sizeMap = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${sizeMap[size]} rounded-full border-4 border-halloween-purple border-t-halloween-orange animate-spin`}></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-5 h-5' : 'w-7 h-7'} rounded-full bg-halloween-orange animate-pulse-slow`}></div>
        </div>
      </div>
      
      {text && (
        <p className="mt-4 text-halloween-purple font-semibold animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default HalloweenSpinner;
