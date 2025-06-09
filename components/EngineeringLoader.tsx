'use client';

import { useEffect, useState } from 'react';

interface EngineeringLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function EngineeringLoader({ 
  size = 'md', 
  text = 'Initializing...', 
  className = '' 
}: EngineeringLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  
  const stages = [
    'Booting systems...',
    'Loading CAD engine...',
    'Connecting to servers...',
    'Syncing data...',
    'Ready!'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    const stageInterval = setInterval(() => {
      setStage(prev => (prev + 1) % stages.length);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(stageInterval);
    };
  }, []);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Main loading animation */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-spin">
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-400 rounded-full -translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Inner circuit pattern */}
        <div className="absolute inset-2 rounded-full border border-cyan-500/50 animate-spin-slow">
          <svg className="w-full h-full" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400/30" />
            <circle cx="24" cy="8" r="1.5" fill="currentColor" className="text-yellow-400 animate-pulse" />
            <circle cx="24" cy="40" r="1.5" fill="currentColor" className="text-yellow-400 animate-pulse" />
            <circle cx="8" cy="24" r="1.5" fill="currentColor" className="text-yellow-400 animate-pulse" />
            <circle cx="40" cy="24" r="1.5" fill="currentColor" className="text-yellow-400 animate-pulse" />
            
            {/* Connection lines */}
            <path d="M24 8 L24 16" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400/50" />
            <path d="M24 32 L24 40" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400/50" />
            <path d="M8 24 L16 24" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400/50" />
            <path d="M32 24 L40 24" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400/50" />
          </svg>
        </div>

        {/* Central gear */}
        <div className="absolute inset-1/3 flex items-center justify-center">
          <svg className="w-full h-full animate-spin text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.5 6.5h6.5l-5.5 4 2 6.5-5.5-4-5.5 4 2-6.5-5.5-4h6.5z" />
          </svg>
        </div>

        {/* Progress indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs font-mono text-white/80">
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <div className="text-sm font-medium text-white mb-1">{text}</div>
        <div className="text-xs text-gray-400 font-mono">
          {stages[stage]}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Technical readout */}
      <div className="text-xs font-mono text-gray-500 space-y-1 text-center">
        <div>SYSTEM: ONLINE</div>
        <div>ENGINE: {progress > 30 ? 'READY' : 'LOADING'}</div>
        <div>STATUS: {progress >= 100 ? 'OPERATIONAL' : 'INITIALIZING'}</div>
      </div>
    </div>
  );
}

// Simple pulse loader for buttons and small elements
export function PulseLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
}

// Circuit trace loader
export function CircuitLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-12 h-12 ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 48 48">
        <defs>
          <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Main circuit path */}
        <path 
          d="M4 24 L12 24 L12 12 L36 12 L36 36 L12 36 L12 24 L44 24" 
          fill="none" 
          stroke="url(#circuit-gradient)" 
          strokeWidth="2"
          strokeDasharray="4,2"
          className="animate-pulse"
        />
        
        {/* Circuit nodes */}
        <circle cx="12" cy="24" r="2" fill="#3b82f6" className="animate-ping" />
        <circle cx="36" cy="12" r="2" fill="#8b5cf6" className="animate-ping" style={{ animationDelay: '0.5s' }} />
        <circle cx="36" cy="36" r="2" fill="#06b6d4" className="animate-ping" style={{ animationDelay: '1s' }} />
      </svg>
    </div>
  );
} 