'use client';

import { useEffect, useState } from 'react';

interface FloatingObject {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
  type: 'chip' | 'gear' | 'resistor' | 'capacitor' | 'inductor';
  color: string;
}

interface MatrixChar {
  id: number;
  x: number;
  y: number;
  speed: number;
  char: string;
  opacity: number;
}

interface OscilloscopePoint {
  x: number;
  y: number;
}

export default function EngineeringBackground() {
  const [floatingObjects, setFloatingObjects] = useState<FloatingObject[]>([]);
  const [matrixChars, setMatrixChars] = useState<MatrixChar[]>([]);
  const [oscilloscopeData, setOscilloscopeData] = useState<OscilloscopePoint[]>([]);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Initialize floating engineering objects
    const newObjects: FloatingObject[] = [];
    for (let i = 0; i < 8; i++) {
      newObjects.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.001,
        vy: (Math.random() - 0.5) * 0.001,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.005,
        size: Math.random() * 30 + 8,
        opacity: Math.random() * 0.3 + 0.1,
        type: ['chip', 'gear', 'resistor', 'capacitor', 'inductor'][Math.floor(Math.random() * 5)] as FloatingObject['type'],
        color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
      });
    }
    setFloatingObjects(newObjects);

    // Initialize matrix rain
    const newChars: MatrixChar[] = [];
    const matrixCharacters = '0123456789ABCDEF{}[]()<>/\\+=*-|;:.,?!@#$%^&';
    for (let i = 0; i < 15; i++) {
      newChars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: Math.random() * 0.002 + 0.0005,
        char: matrixCharacters[Math.floor(Math.random() * matrixCharacters.length)],
        opacity: Math.random() * 0.3 + 0.15
      });
    }
    setMatrixChars(newChars);

    // Initialize oscilloscope wave
    const wavePoints: OscilloscopePoint[] = [];
    for (let i = 0; i <= 100; i++) {
      wavePoints.push({ x: i, y: 50 });
    }
    setOscilloscopeData(wavePoints);

    // Animation loop
    const animate = () => {
      setTime(prev => prev + 0.0001);
      
      // Update floating objects
      setFloatingObjects(prev => prev.map(obj => ({
        ...obj,
        x: (obj.x + obj.vx + 100) % 100,
        y: (obj.y + obj.vy + 100) % 100,
        rotation: obj.rotation + obj.rotationSpeed,
      })));

      // Update matrix characters
      setMatrixChars(prev => prev.map(char => ({
        ...char,
        y: char.y + char.speed > 100 ? -5 : char.y + char.speed,
        char: Math.random() < 0.001 ? 
          matrixCharacters[Math.floor(Math.random() * matrixCharacters.length)] : 
          char.char
      })));

      // Update oscilloscope wave
      setOscilloscopeData(prev => prev.map((point, index) => ({
        x: point.x,
        y: 50 + Math.sin((index * 0.1) + (time * 0.05)) * 4 + Math.sin((index * 0.05) + (time * 0.02)) * 2
      })));
    };

    const interval = setInterval(animate, 1000);
    return () => clearInterval(interval);
  }, [time]);

  if (!mounted) return null;

  const renderFloatingObject = (obj: FloatingObject) => {
    const style = {
      left: `${obj.x}%`,
      top: `${obj.y}%`,
      transform: `translate(-50%, -50%) rotate(${obj.rotation}deg)`,
      opacity: obj.opacity,
      color: obj.color,
      fontSize: `${obj.size}px`,
    };

    switch (obj.type) {
      case 'chip':
        return (
          <div key={obj.id} className="absolute" style={style}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.2"/>
              <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="0.5" fill="none"/>
              <circle cx="8" cy="8" r="1" fill="currentColor"/>
              <circle cx="16" cy="8" r="1" fill="currentColor"/>
              <circle cx="8" cy="16" r="1" fill="currentColor"/>
              <circle cx="16" cy="16" r="1" fill="currentColor"/>
              <path d="M2 8h2M2 12h2M2 16h2M20 8h2M20 12h2M20 16h2M8 2v2M12 2v2M16 2v2M8 20v2M12 20v2M16 20v2" stroke="currentColor" strokeWidth="0.5"/>
            </svg>
          </div>
        );
      
      case 'gear':
        return (
          <div key={obj.id} className="absolute" style={style}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
            </svg>
          </div>
        );
      
      case 'resistor':
        return (
          <div key={obj.id} className="absolute" style={style}>
            <svg width="30" height="12" viewBox="0 0 30 12" fill="currentColor">
              <rect x="5" y="3" width="20" height="6" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.3"/>
              <path d="M0 6h5M25 6h5" stroke="currentColor" strokeWidth="1"/>
              <path d="M8 3v6M12 3v6M16 3v6M20 3v6" stroke="currentColor" strokeWidth="0.5"/>
            </svg>
          </div>
        );
      
      case 'capacitor':
        return (
          <div key={obj.id} className="absolute" style={style}>
            <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
              <path d="M6 2v16M10 2v16M0 10h6M10 10h6" stroke="currentColor" strokeWidth="2"/>
              <rect x="6" y="8" width="1" height="4" fill="currentColor"/>
              <rect x="9" y="8" width="1" height="4" fill="currentColor"/>
            </svg>
          </div>
        );
      
      case 'inductor':
        return (
          <div key={obj.id} className="absolute" style={style}>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M0 6h2"/>
              <path d="M22 6h2"/>
              <path d="M2 6c0-2 2-4 4-4s4 2 4 4-2 4-4 4"/>
              <path d="M6 6c0-2 2-4 4-4s4 2 4 4-2 4-4 4"/>
              <path d="M10 6c0-2 2-4 4-4s4 2 4 4-2 4-4 4"/>
              <path d="M14 6c0-2 2-4 4-4s4 2 4 4-2 4-4 4"/>
            </svg>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="h-full w-full" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, ${0.12 + Math.sin(time * 0.01) * 0.005}) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, ${0.12 + Math.cos(time * 0.008) * 0.005}) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Subtle Circuit Pattern Overlay */}
      <div className="absolute inset-0 opacity-2">
        <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="circuit" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="#3b82f6" opacity="0.3"/>
              <circle cx="120" cy="30" r="1" fill="#8b5cf6" opacity="0.3"/>
              <circle cx="30" cy="120" r="1" fill="#06b6d4" opacity="0.3"/>
              <circle cx="120" cy="120" r="1" fill="#10b981" opacity="0.3"/>
              <path d="M30 30 L120 30 L120 120 L30 120 Z" stroke="#3b82f6" strokeWidth="0.2" fill="none" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)"/>
        </svg>
      </div>

      {/* Floating Engineering Objects */}
      <div className="absolute inset-0">
        {floatingObjects.map(renderFloatingObject)}
      </div>

      {/* Matrix Rain Effect */}
      <div className="absolute inset-0">
        {matrixChars.map(char => (
          <div
            key={char.id}
            className="absolute font-mono text-xs select-none transition-all duration-500 ease-in-out"
            style={{
              left: `${char.x}%`,
              top: `${char.y}%`,
              opacity: char.opacity,
              color: '#00ff41',
              textShadow: '0 0 5px #00ff41',
            }}
          >
            {char.char}
          </div>
        ))}
      </div>

      {/* Subtle Oscilloscope Wave */}
      <div className="absolute inset-0 flex items-center justify-center opacity-8">
        <svg width="40%" height="120" viewBox="0 0 100 100" className="stroke-cyan-400" fill="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0"/>
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path
            d={`M ${oscilloscopeData.map(point => `${point.x} ${point.y}`).join(' L ')}`}
            stroke="url(#waveGradient)"
            strokeWidth="0.3"
            fill="none"
          />
        </svg>
      </div>

      {/* Subtle Geometric Shapes - Reduced and Slower */}
      <div className="absolute inset-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`geo-${i}`}
            className="absolute"
            style={{
              left: `${25 + (i * 25)}%`,
              top: `${30 + Math.sin(time * 0.005 + i) * 2}%`,
              opacity: 0.06,
            }}
          >
            <div 
              className="w-3 h-3 border border-purple-400/20 rotate-45"
              style={{
                transform: `rotate(${time * 0.05 + i * 45}deg)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Static Engineering Icons - Much More Subtle */}
      <div className="absolute top-10 right-10 opacity-5">
        <div className="flex flex-col gap-6">
          {['⚙️', '🖥️', '🔬'].map((icon, i) => (
            <div
              key={`icon-${i}`}
              className="text-xl"
              style={{
                opacity: 0.2 + Math.sin(time * 0.005 + i) * 0.01,
              }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 