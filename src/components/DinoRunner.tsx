import { useEffect, useState } from 'react';

export const DinoRunner = () => {
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    const jumpInterval = setInterval(() => {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
    }, 2000);

    return () => clearInterval(jumpInterval);
  }, []);

  return (
    <div className="relative w-full max-w-md h-24 overflow-hidden">
      {/* Ground line */}
      <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Running dots/dust */}
      <div className="absolute bottom-5 left-1/4 flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full bg-primary/40 animate-bounce"
            style={{ animationDelay: `${i * 100}ms`, animationDuration: '0.6s' }}
          />
        ))}
      </div>

      {/* Dino */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-out ${
          isJumping ? 'bottom-16' : 'bottom-5'
        }`}
      >
        <svg
          width="48"
          height="52"
          viewBox="0 0 48 52"
          fill="none"
          className="drop-shadow-lg"
        >
          {/* Body */}
          <rect x="16" y="16" width="20" height="20" rx="2" className="fill-primary" />
          
          {/* Head */}
          <rect x="28" y="8" width="16" height="14" rx="2" className="fill-primary" />
          
          {/* Eye */}
          <rect x="36" y="12" width="4" height="4" rx="1" className="fill-background" />
          <rect x="37" y="13" width="2" height="2" className="fill-foreground" />
          
          {/* Mouth */}
          <rect x="40" y="18" width="4" height="2" className="fill-accent" />
          
          {/* Spikes */}
          <rect x="18" y="12" width="4" height="4" className="fill-accent" />
          <rect x="24" y="10" width="4" height="6" className="fill-accent" />
          <rect x="30" y="4" width="4" height="4" className="fill-secondary" />
          
          {/* Tail */}
          <rect x="4" y="20" width="12" height="8" rx="1" className="fill-primary" />
          <rect x="0" y="22" width="6" height="4" rx="1" className="fill-accent" />
          
          {/* Arms */}
          <rect x="28" y="24" width="4" height="8" rx="1" className="fill-primary" />
          <rect x="30" y="30" width="4" height="2" className="fill-accent" />
          
          {/* Legs - animated */}
          <g className={isJumping ? '' : 'animate-dino-run'}>
            <rect x="18" y="36" width="6" height="12" rx="1" className="fill-primary" />
            <rect x="18" y="46" width="8" height="4" rx="1" className="fill-accent" />
          </g>
          <g className={isJumping ? '' : 'animate-dino-run-alt'}>
            <rect x="28" y="36" width="6" height="12" rx="1" className="fill-primary" />
            <rect x="26" y="46" width="8" height="4" rx="1" className="fill-accent" />
          </g>
        </svg>
      </div>

      {/* Clouds */}
      <div className="absolute top-2 left-8 animate-cloud-float">
        <div className="flex gap-1">
          <div className="w-6 h-3 rounded-full bg-muted-foreground/20" />
          <div className="w-4 h-2 rounded-full bg-muted-foreground/20 mt-1" />
        </div>
      </div>
      <div className="absolute top-4 right-12 animate-cloud-float-slow">
        <div className="flex gap-1">
          <div className="w-4 h-2 rounded-full bg-muted-foreground/15" />
          <div className="w-6 h-3 rounded-full bg-muted-foreground/15 -mt-1" />
        </div>
      </div>

      {/* Cacti obstacles */}
      <div className="absolute bottom-5 right-4 animate-obstacle">
        <svg width="16" height="24" viewBox="0 0 16 24" className="fill-secondary/60">
          <rect x="6" y="4" width="4" height="20" rx="1" />
          <rect x="0" y="8" width="6" height="4" rx="1" />
          <rect x="10" y="12" width="6" height="4" rx="1" />
        </svg>
      </div>
      <div className="absolute bottom-5 right-24 animate-obstacle-slow">
        <svg width="12" height="16" viewBox="0 0 12 16" className="fill-accent/50">
          <rect x="4" y="2" width="4" height="14" rx="1" />
          <rect x="0" y="6" width="4" height="3" rx="1" />
        </svg>
      </div>
    </div>
  );
};
