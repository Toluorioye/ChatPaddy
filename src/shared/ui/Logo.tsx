import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Original SVG Logo: Two overlapping rounded speech bubbles forming a stylized "P" with amber spark */}
      <div className={`relative shrink-0 flex items-center justify-center ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="paddy-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="paddy-grad-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <filter id="paddy-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#4338CA" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Rounded background base */}
          <rect width="48" height="48" rx="14" fill="url(#paddy-grad-primary)" filter="url(#paddy-glow)" />

          {/* Base vertical speech stem of the 'P' */}
          <rect x="13" y="12" width="6.5" height="24" rx="3.25" fill="#FFFFFF" />

          {/* Upper overlapping bubble loop forming the head of the 'P' */}
          <path
            d="M17 12H27.5C32.7467 12 37 16.2533 37 21.5C37 26.7467 32.7467 31 27.5 31H17V12Z"
            fill="url(#paddy-grad-secondary)"
            opacity="0.95"
          />

          {/* Inner cutout of the P */}
          <path
            d="M19.5 17.5H27C29.2091 17.5 31 19.2909 31 21.5C31 23.7091 29.2091 25.5 27 25.5H19.5V17.5Z"
            fill="#FFFFFF"
          />

          {/* Little speech tail hint */}
          <path
            d="M13 32L10 37C9.5 37.8 10.5 38.6 11.2 38L16 35V32H13Z"
            fill="#FFFFFF"
          />

          {/* Spark Amber Accent Dot */}
          <circle cx="37.5" cy="11.5" r="4" fill="#F59E0B" />
          <path
            d="M37.5 8.5L38.2 10.7L40.5 11.5L38.2 12.3L37.5 14.5L36.8 12.3L34.5 11.5L36.8 10.7L37.5 8.5Z"
            fill="#FFFBEB"
          />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-heading font-extrabold tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}>
              Chat<span className="text-[#4F46E5] dark:text-[#818CF8]">Paddy</span>
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#F59E0B]" />
          </div>
          {showTagline && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Chat like friends. Build like pros.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
