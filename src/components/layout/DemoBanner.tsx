import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-8 flex items-center justify-between
      px-4 bg-accent-yellow/5 border-b border-accent-yellow/20"
      style={{ borderBottom: '1px solid rgba(255,217,61,0.2)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Zap size={10} className="text-accent-yellow shrink-0 animate-pulse" />
        <p className="font-mono text-2xs text-accent-yellow truncate">
          DEMO MODE &nbsp;·&nbsp; All data simulated and stored only in your browser.
          No real tokens. No real transactions. &nbsp;·&nbsp; Built for LabLab.ai Hackathon
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 ml-3 text-accent-yellow/60 hover:text-accent-yellow transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
};
