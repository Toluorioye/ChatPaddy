import React from 'react';
import { sanitizeUrl } from '../utils/security';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  showOnlineStatus?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = React.memo(({
  src,
  name = 'User',
  size = 'md',
  isOnline,
  showOnlineStatus = false,
  className = '',
}) => {
  const [hasError, setHasError] = React.useState(false);

  const safeSrc = sanitizeUrl(src);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const badgeSizes = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border-[1.5px]',
    md: 'w-3 h-3 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4.5 h-4.5 border-2',
  };

  // Generate deterministic gentle background color for initials
  const getInitialBg = (str: string) => {
    const colors = [
      'bg-indigo-600 text-white',
      'bg-blue-600 text-white',
      'bg-violet-600 text-white',
      'bg-emerald-600 text-white',
      'bg-amber-600 text-white',
      'bg-rose-600 text-white',
      'bg-teal-600 text-white',
      'bg-cyan-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      {safeSrc && !hasError ? (
        <img
          src={safeSrc}
          alt={name}
          onError={() => setHasError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10`}
          loading="lazy"
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${getInitialBg(name)} rounded-full flex items-center justify-center font-heading font-medium uppercase shadow-xs`}
          aria-label={name}
        >
          {initials || 'CP'}
        </div>
      )}

      {showOnlineStatus && isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-white dark:border-[#131A2E] ${badgeSizes[size]} ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
          aria-label={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';
