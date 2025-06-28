'use client';

import React, { useState, useEffect, ReactNode } from 'react';

// Doodle component props interface
interface DoodleProps {
  size?: number;
  opacity?: number;
  rotation?: number;
  className?: string;
}

// Individual doodle components
const DoodleComponents = {
  Pencil: ({ size = 48, opacity = 0.2, rotation = 0, className = '' }: DoodleProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, transform: `rotate(${rotation}deg)` }}
    >
      <rect x="8" y="20" width="28" height="8" fill="currentColor" rx="2"/>
      <polygon points="36,20 44,24 36,28" fill="currentColor"/>
      <circle cx="12" cy="24" r="2" fill="white"/>
    </svg>
  ),
  
  Star: ({ size = 48, opacity = 0.2, rotation = 0, className = '' }: DoodleProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, transform: `rotate(${rotation}deg)` }}
    >
      <polygon points="24,4 28,16 40,16 31,24 35,36 24,29 13,36 17,24 8,16 20,16" fill="currentColor"/>
      <polygon points="24,8 26,14 32,14 28,18 30,24 24,21 18,24 20,18 16,14 22,14" fill="white"/>
    </svg>
  ),
  
  Heart: ({ size = 48, opacity = 0.2, rotation = 0, className = '' }: DoodleProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, transform: `rotate(${rotation}deg)` }}
    >
      <path d="M24 42 C24 42 8 30 8 18 C8 12 12 8 18 8 C21 8 24 11 24 11 C24 11 27 8 30 8 C36 8 40 12 40 18 C40 30 24 42 24 42 Z" fill="currentColor"/>
      <circle cx="18" cy="16" r="3" fill="white"/>
    </svg>
  ),
  
  Paintbrush: ({ size = 48, opacity = 0.2, rotation = 0, className = '' }: DoodleProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, transform: `rotate(${rotation}deg)` }}
    >
      <rect x="20" y="6" width="8" height="24" fill="currentColor" rx="2"/>
      <ellipse cx="24" cy="34" rx="6" ry="8" fill="currentColor"/>
      <rect x="22" y="8" width="4" height="3" fill="white"/>
    </svg>
  ),
  
  Crayon: ({ size = 48, opacity = 0.2, rotation = 0, className = '' }: DoodleProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, transform: `rotate(${rotation}deg)` }}
    >
      <rect x="18" y="16" width="8" height="24" fill="currentColor" rx="2"/>
      <polygon points="18,16 26,16 22,8" fill="currentColor"/>
      <rect x="20" y="18" width="4" height="3" fill="white"/>
    </svg>
  ),
  
  Spiral: ({ size = 48, opacity = 0.2, rotation = 0, className = '' }: DoodleProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, transform: `rotate(${rotation}deg)` }}
    >
      <path d="M24 8 Q40 8 40 24 Q40 40 24 40 Q8 40 8 24 Q8 16 16 16 Q24 16 24 24 Q24 28 22 28" stroke="currentColor" strokeWidth="3" fill="none"/>
    </svg>
  ),
  
  Lightning: ({ size = 48, opacity = 0.2, rotation = 0, className = '' }: DoodleProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, transform: `rotate(${rotation}deg)` }}
    >
      <polygon points="26,6 18,22 24,22 22,42 30,26 24,26" fill="currentColor"/>
    </svg>
  ),
  
  Sun: ({ size = 48, opacity = 0.2, rotation = 0, className = '' }: DoodleProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, transform: `rotate(${rotation}deg)` }}
    >
      <circle cx="24" cy="24" r="8" fill="currentColor"/>
      <circle cx="24" cy="24" r="4" fill="white"/>
      <line x1="24" y1="4" x2="24" y2="12" stroke="currentColor" strokeWidth="2"/>
      <line x1="24" y1="36" x2="24" y2="44" stroke="currentColor" strokeWidth="2"/>
      <line x1="4" y1="24" x2="12" y2="24" stroke="currentColor" strokeWidth="2"/>
      <line x1="36" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="2"/>
      <line x1="9.86" y1="9.86" x2="15.51" y2="15.51" stroke="currentColor" strokeWidth="2"/>
      <line x1="32.49" y1="32.49" x2="38.14" y2="38.14" stroke="currentColor" strokeWidth="2"/>
      <line x1="38.14" y1="9.86" x2="32.49" y2="15.51" stroke="currentColor" strokeWidth="2"/>
      <line x1="15.51" y1="32.49" x2="9.86" y2="38.14" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  
  Squiggle: ({ size = 48, opacity = 0.2, rotation = 0, className = '' }: DoodleProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, transform: `rotate(${rotation}deg)` }}
    >
      <path d="M6 24 Q12 12 24 24 T42 24" stroke="currentColor" strokeWidth="3" fill="none"/>
      <path d="M6 30 Q12 18 24 30 T42 30" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
  
  Circle: ({ size = 48, opacity = 0.2, rotation = 0, className = '' }: DoodleProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, transform: `rotate(${rotation}deg)` }}
    >
      <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="3"/>
      <circle cx="24" cy="24" r="8" fill="currentColor"/>
      <circle cx="24" cy="24" r="4" fill="white"/>
    </svg>
  ),
  
  Triangle: ({ size = 48, opacity = 0.2, rotation = 0, className = '' }: DoodleProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, transform: `rotate(${rotation}deg)` }}
    >
      <polygon points="24,6 42,38 6,38" fill="currentColor"/>
      <polygon points="24,14 34,30 14,30" fill="white"/>
    </svg>
  )
};

// Animation classes using Tailwind's built-in animations and custom ones
const animations = [
  'animate-bounce',
  'animate-pulse',
  'animate-spin',
  'animate-ping',
  'animate-float',
  'animate-float-slow',
  'animate-bounce-slow'
];

// Doodle data interface
interface DoodleData {
  id: number;
  type: keyof typeof DoodleComponents;
  size: number;
  opacity: number;
  rotation: number;
  x: number;
  y: number;
  animation: string;
  delay: number;
}

// Generate random doodles function - FIXED to ensure proper containment
const generateRandomDoodles = (
  count: number = 15, 
  containerWidth: number = 800, 
  containerHeight: number = 600
): DoodleData[] => {
  const doodleTypes = Object.keys(DoodleComponents) as Array<keyof typeof DoodleComponents>;
  const doodles: DoodleData[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = doodleTypes[Math.floor(Math.random() * doodleTypes.length)];
    const size = Math.random() * 32 + 24; // 24-56px
    const opacity = Math.random() * 0.15 + 0.1; // 0.1-0.25
    const rotation = Math.random() * 360;
    
    // FIXED: Account for doodle size when positioning to ensure they stay within bounds
    const maxX = Math.max(0, containerWidth - size);
    const maxY = Math.max(0, containerHeight - size);
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    
    const animation = animations[Math.floor(Math.random() * animations.length)];
    const delay = Math.random() * 5; // 0-5s delay
    
    doodles.push({
      id: i,
      type,
      size,
      opacity,
      rotation,
      x,
      y,
      animation,
      delay
    });
  }
  
  return doodles;
};

// Props interfaces
interface CreativeDoodleBackgroundProps {
  children: ReactNode;
  doodleCount?: number;
  className?: string;
  style?: React.CSSProperties;
  regenerateInterval?: number | null;
  color?: string;
}

interface DoodleOverlayProps {
  doodleCount?: number;
  className?: string;
  color?: string;
  containerWidth?: number;
  containerHeight?: number;
}

// Main component for full background doodles
export const CreativeDoodleBackground: React.FC<CreativeDoodleBackgroundProps> = ({ 
  children, 
  doodleCount = 15, 
  className = "", 
  style = {},
  regenerateInterval = null,
  color = "text-black"
}) => {
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [doodles, setDoodles] = useState<DoodleData[]>([]);
  
  // Generate initial doodles
  useEffect(() => {
    setDoodles(generateRandomDoodles(doodleCount, containerSize.width, containerSize.height));
  }, [doodleCount, containerSize]);
  
  // Auto-regenerate doodles if interval is set
  useEffect(() => {
    if (!regenerateInterval) return;
    
    const interval = setInterval(() => {
      setDoodles(generateRandomDoodles(doodleCount, containerSize.width, containerSize.height));
    }, regenerateInterval);
    
    return () => clearInterval(interval);
  }, [regenerateInterval, doodleCount, containerSize]);
  
  // Update container size on window resize
  useEffect(() => {
    const updateSize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(-3deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
      
      {/* Doodle background - FIXED: Added proper clipping */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {doodles.map((doodle) => {
          const DoodleComponent = DoodleComponents[doodle.type];
          return (
            <div
              key={doodle.id}
              className={`absolute ${doodle.animation} ${color}`}
              style={{
                left: doodle.x,
                top: doodle.y,
                animationDelay: `${doodle.delay}s`
              }}
            >
              <DoodleComponent
                size={doodle.size}
                opacity={doodle.opacity}
                rotation={doodle.rotation}
              />
            </div>
          );
        })}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Compact version for smaller areas - FIXED
export const DoodleOverlay: React.FC<DoodleOverlayProps> = ({ 
  doodleCount = 8, 
  className = "",
  color = "text-black",
  containerWidth = 400,
  containerHeight = 300
}) => {
  const [doodles, setDoodles] = useState<DoodleData[]>([]);
  
  useEffect(() => {
    setDoodles(generateRandomDoodles(doodleCount, containerWidth, containerHeight));
  }, [doodleCount, containerWidth, containerHeight]);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(-3deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
      
      {doodles.map((doodle) => {
        const DoodleComponent = DoodleComponents[doodle.type];
        return (
          <div
            key={doodle.id}
            className={`absolute pointer-events-none ${doodle.animation} ${color} ${className}`}
            style={{
              left: doodle.x,
              top: doodle.y,
              animationDelay: `${doodle.delay}s`
            }}
          >
            <DoodleComponent
              size={doodle.size}
              opacity={doodle.opacity}
              rotation={doodle.rotation}
            />
          </div>
        );
      })}
    </div>
  );
};

// Hook for manual doodle generation
export const useDoodles = (
  count: number = 15,
  containerWidth: number = 800,
  containerHeight: number = 600
) => {
  const [doodles, setDoodles] = useState<DoodleData[]>([]);
  
  const regenerateDoodles = () => {
    setDoodles(generateRandomDoodles(count, containerWidth, containerHeight));
  };
  
  useEffect(() => {
    regenerateDoodles();
  }, [count, containerWidth, containerHeight]);
  
  return { doodles, regenerateDoodles };
};

// Export individual doodle components for custom use
export { DoodleComponents };

// Default export
export default CreativeDoodleBackground;