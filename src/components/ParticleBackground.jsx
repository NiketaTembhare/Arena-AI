import React from 'react';

export const ParticleBackground = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050811]"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 85% 90%, rgba(112, 0, 255, 0.06) 0%, transparent 50%)
        `
      }}
    />
  );
};

