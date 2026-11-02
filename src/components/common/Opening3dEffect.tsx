import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Sparkles, X } from 'lucide-react';

interface Opening3dEffectProps {
  onDismiss?: () => void;
  showDismissButton?: boolean;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
}

export const Opening3dEffect: React.FC<Opening3dEffectProps> = ({
  onDismiss,
  showDismissButton = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const updateSize = () => {
      if (!canvas.parentElement) return;
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth || parent.offsetWidth || window.innerWidth;
      canvas.height = parent.clientHeight || parent.offsetHeight || window.innerHeight;
    };

    updateSize();

    const handleResize = () => {
      updateSize();
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const w = canvas.width;
      const h = canvas.height;
      mouseRef.current = {
        x: (e.clientX - rect.left - w / 2) * 0.05,
        y: (e.clientY - rect.top - h / 2) * 0.05,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Generate champagne and golden particles with 3D depth (z coordinate)
    const particleCount = 75;
    const particles: Particle[] = [];
    const colors = ['#f3e5ab', '#d4af37', '#ffd700', '#ffffff', '#e6be8a'];

    const initParticles = (w: number, h: number) => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: (Math.random() - 0.5) * w * 1.5,
          y: (Math.random() - 0.5) * h * 1.5,
          z: Math.random() * 800 + 100, // 3D depth plane
          radius: Math.random() * 2.5 + 0.8,
          alpha: Math.random() * 0.6 + 0.2,
          baseAlpha: Math.random() * 0.5 + 0.2,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.5 - 0.2, // gentle upward drift
          vz: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initParticles(canvas.width, canvas.height);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const fov = 350; // Field of view projection
      const centerX = width / 2;
      const centerY = height / 2;

      // Draw subtle champagne ambient glow at the center
      const radialGradient = ctx.createRadialGradient(
        centerX + mouseRef.current.x * 2,
        centerY + mouseRef.current.y * 2,
        10,
        centerX,
        centerY,
        width * 0.6
      );
      radialGradient.addColorStop(0, 'rgba(212, 175, 55, 0.08)');
      radialGradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.03)');
      radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGradient;
      ctx.fillRect(0, 0, width, height);

      // Render 3D projected particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Reset if drifted beyond bounds
        if (p.y < -height) p.y = height * 0.8;
        if (p.z <= 20) p.z = 800;
        if (p.z > 900) p.z = 100;

        // 3D Perspective Projection formula: X' = (X * fov) / Z
        const scale = fov / p.z;
        const projX = (p.x + mouseRef.current.x * (p.z * 0.05)) * scale + centerX;
        const projY = (p.y + mouseRef.current.y * (p.z * 0.05)) * scale + centerY;
        const projRadius = Math.max(0.5, p.radius * scale);

        if (projX > -50 && projX < width + 50 && projY > -50 && projY < height + 50) {
          ctx.beginPath();
          ctx.arc(projX, projY, projRadius, 0, Math.PI * 2);

          // Sparkling halo
          ctx.shadowBlur = 10 * scale;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(1, p.alpha * (scale * 1.5));
          ctx.fill();

          // Reset shadow
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isActive]);

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
      {isActive && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
        />
      )}

      {/* Control overlay */}
      {showDismissButton && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#121216]/90 border border-[#d4af37]/35 text-[#f3e5ab] hover:bg-[#1a1a22] transition-colors shadow-lg backdrop-blur-md cursor-pointer"
            title={isActive ? 'Desativar efeito 3D de partículas' : 'Ativar efeito 3D de partículas'}
          >
            <Sparkles size={13} className="text-[#d4af37]" />
            <span>Efeito 3D Champagne</span>
            {isActive ? <Eye size={12} className="ml-1 text-[#d4af37]" /> : <EyeOff size={12} className="ml-1 text-neutral-400" />}
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-full bg-[#121216]/90 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar destaque visual"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
