import React from 'react';

export default function GridPattern() {
  return (
    <div className="absolute inset-0 opacity-20">
      <div className="h-full w-full bg-gray-900" style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}></div>
    </div>
  );
} 