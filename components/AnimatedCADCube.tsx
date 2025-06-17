import React from 'react';

export default function AnimatedCADCube() {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
      <div className="w-48 h-48 perspective-1000">
        <div className="cube-container animate-rotate-3d">
          {/* 3D Cube made with CSS */}
          <div className="cube">
            <div className="face front border border-blue-400/30"></div>
            <div className="face back border border-blue-400/30"></div>
            <div className="face right border border-purple-400/30"></div>
            <div className="face left border border-purple-400/30"></div>
            <div className="face top border border-cyan-400/30"></div>
            <div className="face bottom border border-cyan-400/30"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 