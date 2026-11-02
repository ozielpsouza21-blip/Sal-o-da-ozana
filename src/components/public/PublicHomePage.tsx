import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Heart,
  Instagram,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AppRole, PublicTab } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
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
  activeTab,
  onSelectTab,
  onSelectRole,
  onOpenBookingModal,
  show3dParticles,
}) => {
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
      tag: 'Atelier de Alta Beleza & Gestão',
      title: 'A Arte da Transformação com Precisão e Luxo',
      description: 'Um espaço de refúgio e sofisticação nos Jardins. Vivencie tratamentos capilares, estética de vanguarda e spa de unhas com produtos internacionais.',
      actionText: 'Agendar Experiência',
    },
    {
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
      tag: 'Técnica Autoral de Mechas',
      title: 'Balayage Dourada & Morena Iluminada',
      description: 'Clareamento saudável com esfumado sem marcas e infusão de peptídeos. Luminosidade sob medida para harmonizar com o seu tom de pele.',
      actionText: 'Conhecer Mechas',
    },
    {
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1600&q=80',
      tag: 'Nail Couture & Spa',
      title: 'Spa de Unhas Champagne & Cutilagem Russa',
      description: 'Tratamentos minuciosos com esmaltação duradoura, folhas de ouro sutis e hidratação profunda à base de cristais de quartzo.',
      actionText: 'Ver Cuidados de Unhas',
    },
    {
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80',
      tag: 'Estética Avançada',
      title: 'Revitalização Facial Peptídeos Dourados',
      description: 'Procedimentos não-invasivos de estímulo de colágeno, drenagem facial relaxante e máscara tensora para viço imediato e duradouro.',
      actionText: 'Conhecer Estética',
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col">
      {/* 1. HERO CAROUSEL BANNER */}
      <section 
        className="relative w-full h-[540px] sm:h-[620px] lg:h-[700px] overflow-hidden bg-[#08080a]"
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
              alt={slide.title}
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/70 to-[#08080a]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08080a]/90 via-[#08080a]/50 to-transparent" />

            {/* Slide Content */}
            <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start z-10">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[#d4af37] uppercase">
                  <span>{slide.tag}</span>
                  <span aria-hidden="true">·</span>
                  <span>São Paulo</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-white leading-tight" style={{ textWrap: 'balance' }}>
                  {slide.title}
                </h1>

                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
                  {slide.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Button
                    size="lg"
                    onClick={() => onOpenBookingModal()}
                    icon={<Calendar size={18} />}
                  >
                    Agendar Experiência
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => onSelectTab('vitrine')}
                  >
                    Explorar Vitrine & Serviços
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows & Dots */}
        <div className="absolute bottom-8 right-4 sm:right-8 z-20 flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)}
            className="p-3 rounded-full bg-[#121217]/80 hover:bg-[#1a1a24] text-neutral-200 hover:text-[#f3e5ab] border border-white/10 transition-colors cursor-pointer"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#121217]/80 border border-white/10">
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
            className="p-3 rounded-full bg-[#121217]/80 hover:bg-[#1a1a24] text-neutral-200 hover:text-[#f3e5ab] border border-white/10 transition-colors cursor-pointer"
            aria-label="Próximo slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* 2. 3D GOLDEN PARTICLES ANIMATION (LOGO ABAIXO DO BANNER) */}
      {show3dParticles && (
        <section className="relative w-full h-44 sm:h-52 bg-gradient-to-b from-[#08080a] via-[#121218] to-[#08080a] border-y border-[#d4af37]/30 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Opening3dEffect />
          </div>
          <div className="relative z-10 text-center px-4 space-y-1.5 pointer-events-none">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
              <Sparkles size={15} />
              <span>Experiência Visual 3D Exclusiva</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 font-serif">
              Sra. Bela Mulher Atelier · Partículas Douradas & Profundidade Sensorial
            </p>
          </div>
        </section>
      )}

      {/* 3. EXPERIENCE & THE SANCTUARY */}
      <section className="py-24 bg-[#08080a] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="text-xs font-semibold tracking-widest uppercase text-[#d4af37]">
                Atelier Jardins · Experiência Exclusiva
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-white leading-tight">
                Mais do que um salão, um santuário de autoestima e sofisticação
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed font-light">
                Projetado com iluminação cênica de alta fidelidade para visualização exata de cores, bancadas em mármore nero e espelhos circulares com iluminação difusa.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#14141c] border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] mb-3">
                    <Sparkles size={16} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Suítes Privativas VIP</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Atendimento reservado para noivas, formandas e clientes que necessitam de privacidade.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#14141c] border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] mb-3">
                    <Heart size={16} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Menu Degustação</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Cafés especiais moídos na hora, espumante gelado e pâtisserie artesanal cortesia.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  size="md"
                  onClick={() => onSelectRole('client')}
                  icon={<ArrowRight size={15} />}
                >
                  Criar Conta na Área da Cliente & Ganhar Selo VIP
                </Button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/30 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
                alt="Interior Atelier Sra. Bela Mulher"
                className="w-full h-[440px] object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-xs text-neutral-300">
                  <span className="text-[#f3e5ab] font-semibold block text-sm">Atelier Sra. Bela Mulher</span>
                  Alameda Gabriel Monteiro da Silva, Jardins - São Paulo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PUBLIC FOOTER */}
      <footer className="mt-auto bg-[#060608] border-t border-white/[0.08] pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#aa8422] flex items-center justify-center text-black font-bold">
                  <Sparkles size={16} />
                </div>
                <span className="text-xl font-serif font-bold text-white tracking-wide">
                  Sra. Bela Mulher
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Atelier especializado em gestão e alta experiência para a beleza feminina. Cabelos, unhas de autor, estética facial e produção de noivas.
              </p>
              <div className="flex items-center gap-3 text-neutral-400">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:text-[#d4af37] hover:bg-white/10 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <span className="text-xs font-mono text-[#d4af37]">@sra.belamulher</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#d4af37] mb-4">
                Navegação
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                <li>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Início
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectTab('vitrine')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Vitrine de Serviços & Produtos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenBookingModal()}
                    className="hover:text-[#f3e5ab] transition-colors cursor-pointer"
                  >
                    Agendamento Online
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#d4af37] mb-4">
                Portais do Atelier
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                <li>
                  <button
                    onClick={() => onSelectRole('client')}
                    className="hover:text-[#f3e5ab] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Área Exclusiva da Cliente (Selo VIP)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectRole('professional')}
                    className="hover:text-[#f3e5ab] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Área da Profissional (Agenda & Comissões)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectRole('admin')}
                    className="hover:text-[#f3e5ab] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck size={13} className="text-[#d4af37]" />
                    <span>Painel Administrativo do Salão</span>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#d4af37] mb-4">
                Atendimento
              </h4>
              <div className="space-y-3 text-xs text-neutral-400">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-[#d4af37] shrink-0 mt-0.5" />
                  <span>Alameda Gabriel Monteiro da Silva, 1420 - Jardins, São Paulo - SP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-[#d4af37] shrink-0" />
                  <span>(11) 98765-4321</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#d4af37] shrink-0" />
                  <span>Terça a Sábado: 09h às 20h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div>
              © 2026 Sra. Bela Mulher Atelier. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-4 text-neutral-400">
              <span className="text-[11px] text-neutral-400">Moeda BRL (R$) · Horário de Brasília</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
