import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar }        from '@/components/layout/Navbar';
import Sidebar           from '@/components/layout/Sidebar';
import { DemoBanner }    from '@/components/layout/DemoBanner';
import { LiveTicker }    from '@/components/layout/LiveTicker';
import { ParticleLayer } from '@/components/layout/ParticleLayer';
import { Dashboard }     from '@/pages/Dashboard';
import { Agents }        from '@/pages/Agents';
import { Trade }         from '@/pages/Trade';
import { Payments }      from '@/pages/Payments';
import { Leaderboard }   from '@/pages/Leaderboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-base text-text-primary">

        {/* Background layers */}
        <div className="scanline-overlay" aria-hidden="true" />
        <ParticleLayer />

        {/* Top chrome */}
        <DemoBanner />
        <Navbar />
        <LiveTicker />

        {/* Body */}
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
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
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
