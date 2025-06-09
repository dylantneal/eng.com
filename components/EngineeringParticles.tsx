'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  type: 'circuit' | 'gear' | 'code' | 'dot';
  color: string;
}

interface EngineeringParticlesProps {
  count?: number;
  className?: string;
}

export default function EngineeringParticles({ 
  count = 15, 
  className = '' 
}: EngineeringParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initialize particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        type: ['circuit', 'gear', 'code', 'dot'][Math.floor(Math.random() * 4)] as Particle['type'],
        color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 4)]
      });
    }
    setParticles(newParticles);

    // Animation loop
    const animate = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + 100) % 100,
        y: (particle.y + particle.vy + 100) % 100,
      })));
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [count]);

  if (!mounted) return null;

  const renderParticle = (particle: Particle) => {
    const baseStyle = {
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      opacity: particle.opacity,
      color: particle.color,
    };

    switch (particle.type) {
      case 'circuit':
        return (
          <div 
            key={particle.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={baseStyle}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="2" cy="2" r="1" />
              <circle cx="10" cy="2" r="1" />
              <circle cx="2" cy="10" r="1" />
              <circle cx="10" cy="10" r="1" />
              <path d="M2 2 L10 2 L10 10 L2 10 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M6 2 L6 10" stroke="currentColor" strokeWidth="0.5" />
              <path d="M2 6 L10 6" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
        );
      
      case 'gear':
        return (
          <div 
            key={particle.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow"
            style={baseStyle}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l1.5 4.5L18 4.5l-1.5 4.5L21 7.5l-4.5 1.5L18 13.5l-4.5-1.5L15 16.5l-3-3L9 16.5l1.5-4.5L6 13.5l1.5-4.5L3 7.5l4.5-1.5L6 4.5l4.5 1.5L12 2z" />
            </svg>
          </div>
        );
      
      case 'code':
        return (
          <div 
            key={particle.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 font-mono text-xs animate-pulse"
            style={baseStyle}
          >
            {['</', '{', '}', '[]', '()'][Math.floor(Math.random() * 5)]}
          </div>
        );
      
      default: // dot
        return (
          <div 
            key={particle.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
            style={{
              ...baseStyle,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
            }}
          />
        );
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map(renderParticle)}
    </div>
  );
}

// Specialized component for code rain effect
export function CodeRainEffect({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const codeChars = ['0', '1', '{', '}', '<', '>', '/', '*', '+', '-', '=', ';', '(', ')', '[', ']'];
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-xs font-mono text-blue-400/20 animate-bounce-slow"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          {codeChars[Math.floor(Math.random() * codeChars.length)]}
        </div>
      ))}
    </div>
  );
} 