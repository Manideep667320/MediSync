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
        size: Math.random() * 3 + 1,
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
            linear-gradient(rgba(96, 165, 250, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(96, 165, 250, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          transform: rotateX(60deg) translateZ(-100px);
          transform-style: preserve-3d;
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: 0.3,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
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
        {/* Floating sphere */}
        <div
          className="absolute top-40 right-20 w-96 h-96 bg3d-float"
          style={{
            transform: `translateZ(${scrollY * 0.2}px) translateX(${mousePosition.x * 50}px) translateY(${mousePosition.y * 50}px)`,
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />
        </div>

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
