import React, { useMemo } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar }      from '@/components/layout/Navbar';
import Sidebar         from '@/components/layout/Sidebar';
import { DemoBanner }  from '@/components/layout/DemoBanner';
import { LiveTicker }  from '@/components/layout/LiveTicker';
import { Dashboard }   from '@/pages/Dashboard';
import { Agents }      from '@/pages/Agents';
import { Trade }       from '@/pages/Trade';
import { Payments }    from '@/pages/Payments';
import { Leaderboard } from '@/pages/Leaderboard';

const ParticleLayer: React.FC = () => {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id:       i,
      x:        `${Math.random() * 100}%`,
      duration: `${6 + Math.random() * 10}s`,
      delay:    `${Math.random() * 8}s`,
      size:     Math.random() > 0.7 ? 3 : 2,
    })),
  []);

  return (
    <div className="particles" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            '--x':        p.x,
            '--duration': p.duration,
            '--delay':    p.delay,
            width:        p.size,
            height:       p.size,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-base text-text-primary">

        <div className="scanline-overlay" aria-hidden="true" />
        <ParticleLayer />

        <DemoBanner />
        <Navbar />
        <LiveTicker />

        <div className="flex">
          <Sidebar />
          <main className="flex-1 md:ml-56 min-h-[calc(100vh-56px)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
              <Routes>
                <Route path="/"            element={<Dashboard />}   />
                <Route path="/agents"      element={<Agents />}      />
                <Route path="/trade"       element={<Trade />}       />
                <Route path="/payments"    element={<Payments />}    />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center
                    min-h-[60vh] text-center gap-4">
                    <p className="font-display font-bold text-5xl text-glow-cyan">404</p>
                    <p className="font-mono text-text-secondary text-sm">
                      Page not found in the MotiP network.
                    </p>
                  </div>
                } />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
