import React from 'react';

export default function FloatingGeometry() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated geometric shapes */}
      <div className="absolute top-1/4 left-1/4 w-20 h-20 border border-blue-500/20 rotate-45 animate-spin-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-purple-500/20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/3 w-12 h-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rotate-12 animate-bounce-slow"></div>
      
      {/* Circuit pattern */}
      <svg className="absolute top-1/2 right-1/6 w-24 h-24 text-blue-400/10 animate-pulse" viewBox="0 0 100 100">
        <circle cx="20" cy="20" r="3" fill="currentColor" />
        <circle cx="80" cy="20" r="3" fill="currentColor" />
        <circle cx="20" cy="80" r="3" fill="currentColor" />
        <circle cx="80" cy="80" r="3" fill="currentColor" />
        <path d="M20 20 L80 20 L80 80 L20 80 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M50 20 L50 80" stroke="currentColor" strokeWidth="1" />
        <path d="M20 50 L80 50" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
} 