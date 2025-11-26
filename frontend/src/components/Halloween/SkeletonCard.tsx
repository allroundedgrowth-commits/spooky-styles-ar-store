import React from 'react';

interface SkeletonCardProps {
  variant?: 'product' | 'order' | 'inspiration';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'product' }) => {
  if (variant === 'product') {
    return (
      <div className="card-halloween animate-pulse">
        {/* Image skeleton */}
        <div className="w-full h-48 bg-halloween-purple/30 rounded-lg mb-4"></div>
        
        {/* Title skeleton */}
        <div className="h-6 bg-halloween-purple/30 rounded w-3/4 mb-2"></div>
        
        {/* Price skeleton */}
        <div className="h-5 bg-halloween-purple/30 rounded w-1/2 mb-4"></div>
        
        {/* Button skeleton */}
        <div className="h-10 bg-halloween-purple/30 rounded w-full"></div>
      </div>
    );
  }

  if (variant === 'order') {
    return (
      <div className="card-halloween animate-pulse">
        {/* Order header */}
        <div className="flex justify-between mb-4">
          <div className="h-5 bg-halloween-purple/30 rounded w-1/3"></div>
          <div className="h-5 bg-halloween-purple/30 rounded w-1/4"></div>
        </div>
        
        {/* Order items */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-halloween-purple/30 rounded w-full"></div>
          <div className="h-4 bg-halloween-purple/30 rounded w-5/6"></div>
        </div>
        
        {/* Total */}
        <div className="h-6 bg-halloween-purple/30 rounded w-1/2"></div>
      </div>
    );
  }

  // inspiration variant
  return (
    <div className="card-halloween animate-pulse">
      {/* Large image skeleton */}
      <div className="w-full h-64 bg-halloween-purple/30 rounded-lg mb-4"></div>
      
      {/* Title skeleton */}
      <div className="h-7 bg-halloween-purple/30 rounded w-2/3 mb-3"></div>
      
      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-halloween-purple/30 rounded w-full"></div>
        <div className="h-4 bg-halloween-purple/30 rounded w-4/5"></div>
      </div>
      
      {/* Button skeleton */}
      <div className="h-10 bg-halloween-purple/30 rounded w-full"></div>
    </div>
  );
};

export default SkeletonCard;
