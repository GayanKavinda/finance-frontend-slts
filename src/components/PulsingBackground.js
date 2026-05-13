// src/components/PulsingBackground.js
"use client";

export default function PulsingBackground() {
  return (
    <div className="pulsing-bg">
      <div className="pulsing-blob blob-1"></div>
      <div className="pulsing-blob blob-2"></div>
      <div className="pulsing-blob blob-3"></div>
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)' , backgroundSize: '32px 32px' }}>
      </div>
    </div>
  );
}
