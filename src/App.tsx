import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar }     from '@/components/layout/Navbar';
import Sidebar        from '@/components/layout/Sidebar';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { Dashboard }  from '@/pages/Dashboard';
import { Agents }     from '@/pages/Agents';
import { Trade }      from '@/pages/Trade';
import { Payments }   from '@/pages/Payments';
import { Leaderboard } from '@/pages/Leaderboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-base text-text-primary">

        {/* ── Scanline overlay (subtle CRT effect) ── */}
        <div className="scanline-overlay" aria-hidden="true" />

        {/* ── Sticky top bar ── */}
        <DemoBanner />
        <Navbar />

        {/* ── Body layout ── */}
        <div className="flex">

          {/* Fixed sidebar — only visible md+ */}
          <Sidebar />

          {/* Main content — offset by sidebar width on md+ */}
          <main className="flex-1 md:ml-56 min-h-[calc(100vh-56px)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
              <Routes>
                <Route path="/"            element={<Dashboard />}  />
                <Route path="/agents"      element={<Agents />}     />
                <Route path="/trade"       element={<Trade />}      />
                <Route path="/payments"    element={<Payments />}   />
                <Route path="/leaderboard" element={<Leaderboard />}/>
                {/* 404 fallback */}
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center
                    min-h-[60vh] text-center gap-4">
                    <p className="font-display font-bold text-5xl text-accent-cyan
                      text-glow-cyan">
                      404
                    </p>
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
