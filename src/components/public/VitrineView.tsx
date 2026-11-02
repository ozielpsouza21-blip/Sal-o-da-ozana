import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, Star, ShoppingBag, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Service, Product, Professional } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface VitrineViewProps {
  services: Service[];
  products: Product[];
  professionals: Professional[];
  onOpenBookingModal: (serviceId?: string, professionalId?: string) => void;
}

export const VitrineView: React.FC<VitrineViewProps> = ({
  services,
  products,
  professionals,
  onOpenBookingModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const categories = ['Todos', 'Cabelos', 'Unhas', 'Estética', 'Noivas'];

  // Banner Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const bannerSlides = [
    {
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
      title: 'Vitrine Comercial & Procedimentos de Alta Gestão',
      subtitle: 'Conheça nossos rituais capilares, estética avançada e a boutique Home Care exclusiva.',
    },
    {
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
      title: 'Balayage & Morena Iluminada Signature',
      subtitle: 'Especialistas em mechas de alto padrão com preservação absoluta da fibra capilar.',
    },
    {
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1600&q=80',
      title: 'Nail Couture & Spa Champagne',
      subtitle: 'Tratamentos de unhas com cutilagem russa e acabamento duradouro.',
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, bannerSlides.length]);

  const filteredServices = selectedCategory === 'Todos'
    ? services
    : services.filter(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col pb-16">
      {/* 1. TOP CAROUSEL BANNER FOR VITRINE */}
      <section 
        className="relative w-full h-[380px] sm:h-[460px] overflow-hidden bg-[#08080a] mb-12 border-b border-white/10"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {bannerSlides.map((slide, idx) => (
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
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-[#08080a]/30" />

            <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center z-10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[#d4af37] uppercase">
                <Sparkles size={15} />
                <span>Cardápio & Boutique Sra. Bela Mulher</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal text-white max-w-3xl">
                {slide.title}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl font-light">
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Carousel controls */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((currentSlide - 1 + bannerSlides.length) % bannerSlides.length)}
            className="p-2.5 rounded-full bg-[#121217]/80 hover:bg-[#1a1a24] text-neutral-200 hover:text-[#f3e5ab] border border-white/10 transition-colors cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121217]/80 border border-white/10">
            {bannerSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === currentSlide ? 'w-5 h-1.5 bg-[#d4af37]' : 'w-1.5 h-1.5 bg-neutral-600'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((currentSlide + 1) % bannerSlides.length)}
            className="p-2.5 rounded-full bg-[#121217]/80 hover:bg-[#1a1a24] text-neutral-200 hover:text-[#f3e5ab] border border-white/10 transition-colors cursor-pointer"
            aria-label="Próximo"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-16">
        
        {/* 2. SERVICES SECTION */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
                Procedimentos & Rituais
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1">
                Serviços Exclusivos
              </h2>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-[#121217] border border-white/10 rounded-xl overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#d4af37] text-black font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <Card
                key={service.id}
                hoverable
                padding="none"
                className="overflow-hidden group flex flex-col h-full bg-[#111116] border border-white/[0.08] hover:border-[#d4af37]/40"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#181820]">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-medium text-neutral-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                    <Clock size={12} className="text-[#d4af37]" />
                    <span>{service.durationMinutes} min</span>
                  </div>

                  {service.popular && (
                    <div className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider text-black bg-[#d4af37] px-2.5 py-1 rounded-md shadow-md">
                      Destaque
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[#d4af37] font-medium mb-1">
                      {service.category}
                    </div>
                    <h3 className="text-lg font-serif font-semibold text-white group-hover:text-[#f3e5ab] transition-colors leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase font-medium">A partir de</span>
                      <span className="text-lg font-semibold text-[#f3e5ab] font-mono tabular-nums">
                        R$ {service.priceBRL.toFixed(2)}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onOpenBookingModal(service.id)}
                      icon={<Calendar size={13} />}
                    >
                      Agendar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. PRODUCTS / HOME CARE BOUTIQUE */}
        <section className="space-y-8 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
                Manutenção em Casa
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1">
                Boutique Home Care
              </h2>
            </div>
            <p className="text-xs text-neutral-400 max-w-md">
              Prolongue o brilho, a maciez e a saúde dos fios com formulações profissionais selecionadas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Card
                key={product.id}
                hoverable
                padding="none"
                className="overflow-hidden bg-[#111116] border border-white/[0.08] flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full bg-[#181820] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 text-[10px] uppercase font-semibold text-neutral-400 bg-black/60 px-2 py-0.5 rounded">
                    {product.category}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] text-neutral-400 font-medium">{product.brand}</div>
                    <h4 className="text-sm font-semibold text-white mt-1 line-clamp-2">
                      {product.name}
                    </h4>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-base font-semibold text-[#f3e5ab] font-mono tabular-nums">
                      R$ {product.salePriceBRL.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        alert(`Produto "${product.name}" reservado! Retire na recepção do atelier.`);
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/30 hover:bg-[#d4af37] hover:text-black transition-colors cursor-pointer"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 4. PROFESSIONALS TEAM */}
        <section className="space-y-8 pt-6 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#d4af37]">
              Talentos do Atelier
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1">
              Corpo de Especialistas
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Profissionais dedicadas à excelência técnica e visagismo personalizado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {professionals.map(pro => (
              <Card
                key={pro.id}
                hoverable
                padding="md"
                className="bg-[#111116] border border-white/[0.08] text-center flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#d4af37]/40 mb-4 shadow-lg shadow-black">
                  <img
                    src={pro.avatarUrl}
                    alt={pro.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <h4 className="text-base font-serif font-semibold text-white">
                  {pro.name}
                </h4>
                <div className="text-xs text-[#d4af37] font-medium mt-0.5">
                  {pro.roleTitle}
                </div>

                <div className="flex items-center gap-1 text-xs text-amber-300 mt-2">
                  <Star size={13} fill="currentColor" />
                  <span className="font-semibold">{pro.rating.toFixed(2)}</span>
                  <span className="text-neutral-500">({pro.reviewsCount})</span>
                </div>

                <p className="text-xs text-neutral-400 mt-3 line-clamp-3 leading-relaxed">
                  {pro.bio}
                </p>

                <div className="w-full pt-4 mt-auto">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs"
                    onClick={() => onOpenBookingModal(undefined, pro.id)}
                  >
                    Agendar com {pro.name.split(' ')[0]}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
