import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Instagram,
  MapPin,
  Phone,
  Clock,
  Mail,
} from 'lucide-react';
import { AppRole, PublicTab } from '../../types';
import { Opening3dEffect } from '../common/Opening3dEffect';

interface PublicHomePageProps {
  services: any[];
  products: any[];
  professionals: any[];
  activeTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
  onSelectRole: (role: AppRole) => void;
  onOpenBookingModal: (serviceId?: string, professionalId?: string) => void;
  show3dParticles: boolean;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  show3dParticles,
}) => {
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
      label: 'Atelier Sra. Bela Mulher · Jardins',
    },
    {
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
      label: 'Balayage Dourada & Morena Iluminada',
    },
    {
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1600&q=80',
      label: 'Spa de Unhas & Cutilagem Russa',
    },
    {
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80',
      label: 'Revitalização Facial & Peptídeos Dourados',
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col">
      {/* 1. HERO CAROUSEL BANNER (DESTAQUE PRINCIPAL LOGO ABAIXO DO CABEÇALHO, SEM TEXTOS OCUPANDO O BANNER) */}
      <section 
        className="relative w-full h-[380px] sm:h-[460px] lg:h-[540px] overflow-hidden bg-[#08080a]"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Carousel Slides */}
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.label}
              className="w-full h-full object-cover object-center scale-100 transition-transform duration-10000"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80';
              }}
            />
            {/* Gradiente sutil apenas na base para leitura do rótulo e controles */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#08080a]/90 via-[#08080a]/40 to-transparent pointer-events-none" />

            {/* Rótulo discreto do trabalho artístico na base */}
            <div className="absolute bottom-6 left-4 sm:left-8 z-10 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-[#d4af37]/30 text-[#f3e5ab] text-xs font-serif tracking-wide backdrop-blur-md">
                <Sparkles size={12} className="text-[#d4af37]" />
                <span>{slide.label}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows & Dots */}
        <div className="absolute bottom-6 right-4 sm:right-8 z-20 flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)}
            className="p-2.5 rounded-full bg-[#121217]/85 hover:bg-[#1a1a24] text-neutral-200 hover:text-[#f3e5ab] border border-white/10 transition-colors cursor-pointer"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#121217]/85 border border-white/10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === currentSlide
                    ? 'w-6 h-1.5 bg-[#d4af37]'
                    : 'w-1.5 h-1.5 bg-neutral-600 hover:bg-neutral-400'
                }`}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
            className="p-2.5 rounded-full bg-[#121217]/85 hover:bg-[#1a1a24] text-neutral-200 hover:text-[#f3e5ab] border border-white/10 transition-colors cursor-pointer"
            aria-label="Próximo slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* 2. ANIMAÇÃO 3D AMPLIADA COM DESTAQUE VISUAL (IMEDIATAMENTE ABAIXO DO BANNER, SEM ESPAÇOS VAZIOS) */}
      {show3dParticles && (
        <section className="relative w-full h-[620px] sm:h-[720px] lg:h-[820px] bg-gradient-to-b from-[#08080a] via-[#101018] to-[#08080a] border-y border-[#d4af37]/35 overflow-hidden flex items-center justify-center">
          {/* Efeito 3D com Partículas Douradas e Profundidade Sensorial */}
          <div className="absolute inset-0 z-0">
            <Opening3dEffect />
          </div>

          {/* Destaque Central Integrado com a Identidade Preta e Dourada */}
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto space-y-4 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-semibold uppercase tracking-[0.3em] backdrop-blur-md shadow-lg shadow-[#d4af37]/10">
              <Sparkles size={15} className="text-[#d4af37]" />
              <span>Sra. Bela Mulher Atelier</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-normal text-white leading-tight">
              A Essência do Cuidado com Arte & Sofisticação
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 font-light max-w-xl mx-auto leading-relaxed">
              Mergulhe em uma atmosfera sensorial única nos Jardins, onde cada detalhe é desenhado para realçar a sua beleza autêntica.
            </p>

            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-4" />
          </div>
        </section>
      )}

      {/* 3. INFORMAÇÕES INSTITUCIONAIS DISCRETAS NA PARTE INFERIOR (CONTATO, ENDEREÇO, REDES E FUNCIONAMENTO) */}
      <footer className="bg-[#060608] border-t border-white/[0.08] pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/[0.06]">
            {/* Institucional / Marca */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#aa8422] flex items-center justify-center text-black font-bold">
                  <Sparkles size={14} />
                </div>
                <span className="text-lg font-serif font-bold text-white tracking-wide">
                  Sra. Bela Mulher
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Atelier de alta beleza e visagismo personalizado. Um espaço exclusivo de bem-estar e sofisticação nos Jardins.
              </p>
              <div className="pt-1">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-[#d4af37] hover:text-[#f3e5ab] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={15} />
                  <span>@sra.belamulher</span>
                </a>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#d4af37] mb-3">
                Localização
              </h4>
              <div className="flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed">
                <MapPin size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span>
                  Alameda Gabriel Monteiro da Silva, 1420<br />
                  Jardins · São Paulo - SP<br />
                  CEP 01442-001
                </span>
              </div>
            </div>

            {/* Contato & Atendimento */}
            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#d4af37] mb-3">
                Canais de Contato
              </h4>
              <div className="space-y-2.5 text-xs text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="text-[#d4af37] shrink-0" />
                  <span>(11) 98765-4321</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="text-[#d4af37] shrink-0" />
                  <span>contato@belamulher.com.br</span>
                </div>
              </div>
            </div>

            {/* Horário de Funcionamento */}
            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#d4af37] mb-3">
                Horário de Atendimento
              </h4>
              <div className="space-y-2 text-xs text-neutral-300">
                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="text-[#d4af37] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-medium text-white">Terça a Sábado</span>
                    <span className="text-neutral-400">09h às 20h</span>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 pl-6">
                  Domingos e Segundas: Fechado para manutenções e eventos privados
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé inferior discreto */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-400">
            <div>
              © 2026 Sra. Bela Mulher Atelier. Todos os direitos reservados.
            </div>
            <div className="text-neutral-400">
              São Paulo · Brasil
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
