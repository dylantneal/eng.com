'use client';

import { useEffect, useState } from 'react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export default function AnimatedLogo({ 
  size = 'md', 
  animated = true, 
  className = '' 
}: AnimatedLogoProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const logoSize = sizeClasses[size];

  return (
    <div className={`relative ${logoSize} ${className}`}>
      {/* Main logo container */}
      <div className={`relative ${logoSize} rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 ${animated ? 'animate-engineering-gradient' : ''} shadow-lg flex items-center justify-center`}>
        
        {/* Animated circuit pattern overlay */}
        {animated && mounted && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="circuit-pattern absolute inset-0 opacity-30 animate-pulse"></div>
          </div>
        )}
        
        {/* Main 'E' letter with engineering styling */}
        <div className="relative z-10 text-white font-bold text-lg flex items-center justify-center">
          <svg 
            viewBox="0 0 24 24" 
            className={`${animated ? 'animate-pulse' : ''} fill-current`}
            style={{ width: '60%', height: '60%' }}
          >
            {/* Engineering-style 'E' with circuit traces */}
            <path d="M3 3h18v3H6v3h12v3H6v3h15v3H3V3z" />
            {/* Circuit nodes */}
            <circle cx="6" cy="6" r="0.5" className="fill-yellow-300" />
            <circle cx="6" cy="12" r="0.5" className="fill-yellow-300" />
            <circle cx="6" cy="18" r="0.5" className="fill-yellow-300" />
            {animated && (
              <>
                {/* Animated connecting lines */}
                <path 
                  d="M6 6 L6 12 L6 18" 
                  stroke="rgb(253 224 71)" 
                  strokeWidth="0.5" 
                  fill="none"
                  className="animate-pulse"
                />
                <path 
                  d="M6 12 L18 12" 
                  stroke="rgb(253 224 71)" 
                  strokeWidth="0.3" 
                  fill="none"
                  className="animate-pulse"
                />
              </>
            )}
          </svg>
        </div>
        
        {/* Floating particles for animation */}
        {animated && mounted && (
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute top-1 left-1 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-3 right-2 w-0.5 h-0.5 bg-yellow-300/60 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-cyan-300/60 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-purple-300/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
        )}
      </div>
      
      {/* Glow effect */}
      {animated && (
        <div className={`absolute inset-0 ${logoSize} rounded-xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20 blur-md animate-pulse -z-10`}></div>
      )}
    </div>
  );
}

// Simplified version for navbar
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md ${className}`}>
      <span className="text-white font-bold text-sm">E</span>
    </div>
  );
} 