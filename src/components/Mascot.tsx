import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface MascotProps {
  onClick?: () => void;
}

export function Mascot({ onClick }: MascotProps) {
  const [isBouncing, setIsBouncing] = useState(false);

  const handleClick = () => {
    setIsBouncing(true);
    onClick?.();
    setTimeout(() => setIsBouncing(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full shadow-lg',
        'bg-gradient-to-br from-blue-400 to-purple-500',
        'flex items-center justify-center',
        'transition-all duration-300',
        'hover:scale-110 hover:shadow-xl',
        'active:scale-95',
        isBouncing && 'animate-bounce'
      )}
      title="无限吉祥物"
    >
      {/* Mascot character - cute infinity symbol */}
      <div className="relative w-10 h-10">
        {/* Main body - infinity shape */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-full h-full text-white"
          fill="currentColor"
        >
          <path d="M12 2C6.5 2 4 6 4 8s2.5 6 8 6 8-4 8-6-2.5-6-8-6z" />
          <path d="M12 22c5.5 0 8-4 8-6s-2.5-6-8-6-8 4-8 6 2.5 6 8 6z" />
        </svg>
        {/* Sparkle effect */}
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
      </div>
    </button>
  );
}

import { cn } from '@/lib/utils';
