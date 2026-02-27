import { useMemo } from 'react';

export const ParticleLayer: React.FC = () => {
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
