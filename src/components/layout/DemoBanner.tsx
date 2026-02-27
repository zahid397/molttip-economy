import React, { useState } from 'react';
import { Zap, X } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-50 flex items-center justify-center gap-3
      px-4 py-2 border-b border-accent-yellow/20
      bg-accent-yellow/5 backdrop-blur-sm">

      {/* Scrolling ticker text */}
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="flex items-center gap-1.5 shrink-0">
          <Zap size={12} className="text-accent-yellow animate-pulse" />
          <span className="text-xs font-mono font-bold text-accent-yellow uppercase tracking-widest">
            Demo Mode
          </span>
          <span className="text-xs text-border-bright font-mono mx-1">·</span>
        </span>

        <p className="text-xs font-mono text-text-secondary whitespace-nowrap">
          All data is simulated and stored only in your browser.
          No real tokens. No real transactions.
        </p>

        {/* Repeated for seamless ticker feel on small screens */}
        <span className="text-xs text-border-bright font-mono mx-3 shrink-0">·</span>
        <p className="text-xs font-mono text-text-secondary whitespace-nowrap shrink-0 hidden sm:block">
          Built for LabLab.ai Hackathon
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2
          text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss banner"
      >
        <X size={13} />
      </button>
    </div>
  );
};
