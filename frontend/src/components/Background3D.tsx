import { useEffect, useState } from 'react';

export const Background3D = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; size: number; speed: number }>
  >([]);

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 15,
        speed: Math.random() * 0.5 + 0.1,
      });
    }
    setParticles(newParticles);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          y: p.y + p.speed > 100 ? 0 : p.y + p.speed,
        }))
      );
    }, 50);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes float-3d {
          0%   { transform: translateZ(0px) rotateX(0deg) rotateY(0deg); }
          25%  { transform: translateZ(50px) rotateX(5deg) rotateY(5deg); }
          50%  { transform: translateZ(100px) rotateX(10deg) rotateY(10deg); }
          75%  { transform: translateZ(50px) rotateX(5deg) rotateY(5deg); }
          100% { transform: translateZ(0px) rotateX(0deg) rotateY(0deg); }
        }

        .bg3d-float    { animation: float-3d 8s ease-in-out infinite; transform-style: preserve-3d; }

        .bg3d-grid {
          background-image:
            linear-gradient(rgba(80, 137, 145, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(80, 137, 145, 0.3) 1px, transparent 1px);
          background-size: 50px 50px;
          transform: rotateX(60deg) translateZ(-100px);
          transform-style: preserve-3d;
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-brand-900"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: 0.4,
              boxShadow: '0 0 10px rgba(13, 27, 42, 0.5)',
              transition: 'top 0.05s linear',
            }}
          />
        ))}
      </div>

      {/* 3D animated elements */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ perspective: '3000px' }}
      >

        {/* 3D grid floor */}
        <div
          className="absolute inset-0 bg3d-grid"
          style={{
            transform: `rotateX(60deg) translateZ(${scrollY * 0.5}px) translateY(${scrollY * 0.1}px)`,
            opacity: 0.3,
          }}
        />

      </div>
    </>
  );
};

export default Background3D;
