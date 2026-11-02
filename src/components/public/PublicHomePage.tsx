import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Star,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Heart,
  Instagram,
  MapPin,
  Phone,
} from 'lucide-react';
import { AppRole, PublicTab, Service, Product, Professional } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Opening3dEffect } from '../common/Opening3dEffect';

interface PublicHomePageProps {
  services: Service[];
  products: Product[];
  professionals: Professional[];
  activeTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
  onSelectRole: (role: AppRole) => void;
  onOpenBookingModal: (serviceId?: string, professionalId?: string) => void;
  show3dParticles: boolean;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  services,
  products,
  professionals,
  activeTab,
  onSelectTab,
  onSelectRole,
  onOpenBookingModal,
  show3dParticles,
}) => {
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const slides = [
    {
      image: '/src/assets/images/hero_salon_luxury_interior_1793577409043.jpg',
      tag: 'Atelier de Alta Beleza & Gestão',
      title: 'A Arte da Transformação com Precisão e Luxo',
      description: 'Um espaço de refúgio e sofisticação nos Jardins. Vivencie tratamentos capilares, estética de vanguarda e spa de unhas com produtos internacionais.',
      actionText: 'Agendar Experiência',
      category: 'Cabelos',
    },
    {
      image: '/src/assets/images/service_luxury_haircare_1793577408044.jpg',
      tag: 'Técnica Autoral de Mechas',
      title: 'Balayage Dourada & Morena Iluminada',
      description: 'Clareamento saudável com esfumado sem marcas e infusão de peptídeos. Luminosidade sob medida para harmonizar com o seu tom de pele.',
      actionText: 'Conhecer Mechas',
      category: 'Cabelos',
    },
    {
      image: '/src/assets/images/service_nail_art_champagne_1793577410058.jpg',
      tag: 'Nail Couture & Spa',
      title: 'Spa de Unhas Champagne & Cutilagem Russa',
      description: 'Tratamentos minuciosos com esmaltação duradoura, folhas de ouro sutis e hidratação profunda à base de cristais de quartzo.',
      actionText: 'Ver Cuidados de Unhas',
      category: 'Unhas',
    },
    {
      image: '/src/assets/images/service_aesthetic_facial_1793577409868.jpg',
      tag: 'Estética Avançada',
      title: 'Revitalização Facial Peptídeos Dourados',
      description: 'Procedimentos não-invasivos de estímulo de colágeno, drenagem facial relaxante e máscara tensora para viço imediato e duradouro.',
      actionText: 'Conhecer Estética',
      category: 'Estética',
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

  const categories = ['Todos', 'Cabelos', 'Unhas', 'Estética', 'Noivas'];
  const filteredServices = selectedCategory === 'Todos'
    ? services
    : services.filter(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const featuredProducts = products.filter(p => p.featuredInVitrine);

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col">
      {/* 1. HERO CAROUSEL BANNER */}
      <section 
        className="relative w-full h-[540px] sm:h-[620px] lg:h-[700px] overflow-hidden bg-black"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Optional 3D Golden Particles Effect */}
        {show3dParticles && <Opening3dEffect />}

        {/* Carousel Slides */}
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with Measured Scrim for WCAG AA readability */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/65 to-[#08080a]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08080a]/90 via-[#08080a]/40 to-transparent" />

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
                    Agendar Horário Online
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      const el = document.getElementById('vitrine-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Explorar Vitrine
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        <div className="absolute bottom-8 right-4 sm:right-8 z-20 flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)}
            className="p-3 rounded-full bg-[#121217]/80 hover:bg-[#1a1a24] text-neutral-200 hover:text-[#f3e5ab] border border-white/10 transition-colors cursor-pointer"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Dots Indicator */}
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

      {/* 2. QUICK BOOKING & HIGHLIGHT STRIP */}
      <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-[#101015] border border-[#d4af37]/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/80">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Column 1: Informative lead */}
            <div className="md:border-r border-white/10 md:pr-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37]">
                Atendimento Rápido
              </span>
              <h3 className="text-lg font-serif font-semibold text-white mt-0.5">
                Reserve em 1 Minuto
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Sem filas ou espera telefônica.
              </p>
            </div>

            {/* Column 2: Service pick preview */}
            <div className="md:border-r border-white/10 md:pr-4">
              <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                Procedimento Desejado
              </label>
              <select
                id="quick-service-select"
                className="w-full bg-[#16161f] border border-white/10 rounded-lg text-xs text-white p-2.5 focus:border-[#d4af37] focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>Escolha um serviço...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (R$ {s.priceBRL.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Column 3: Professional pick */}
            <div className="md:border-r border-white/10 md:pr-4">
              <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                Especialista de Preferência
              </label>
              <select
                id="quick-pro-select"
                className="w-full bg-[#16161f] border border-white/10 rounded-lg text-xs text-white p-2.5 focus:border-[#d4af37] focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>Qualquer profissional disponível</option>
                {professionals.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.roleTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Column 4: Submit action */}
            <div>
              <Button
                size="md"
                className="w-full"
                onClick={() => {
                  const sSelect = document.getElementById('quick-service-select') as HTMLSelectElement;
                  const pSelect = document.getElementById('quick-pro-select') as HTMLSelectElement;
                  onOpenBookingModal(sSelect?.value || undefined, pSelect?.value || undefined);
                }}
                icon={<Calendar size={15} />}
              >
                Ver Horários Disponíveis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VITRINE DE SERVIÇOS & RITUAIS */}
      <section id="vitrine-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#d4af37] mb-2">
              <Sparkles size={14} />
              <span>Cardápio de Experiências</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-white">
              Vitrine de Serviços de Luxo
            </h2>
            <p className="text-sm text-neutral-400 mt-2 max-w-xl">
              Cada atendimento é um ritual sob medida. Usamos dermocosméticos e formulações de prestígio internacional.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#121217] border border-white/10 rounded-xl overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
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

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map(service => (
            <Card
              key={service.id}
              hoverable
              padding="none"
              className="overflow-hidden group flex flex-col h-full bg-[#111116] border border-white/[0.08] hover:border-[#d4af37]/40"
            >
              {/* Image with Aspect Ratio 4:3 */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#181820]">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent opacity-80" />
                
                {/* Duration Tag */}
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

              {/* Card Body */}
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

      {/* 4. EXPERIÊNCIA & O ESPAÇO */}
      <section className="py-16 bg-[#0c0c10] border-y border-white/[0.06]">
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

            {/* Showcase Image */}
            <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/30 shadow-2xl">
              <img
                src="/src/assets/images/hero_salon_luxury_interior_1793577409043.jpg"
                alt="Interior Atelier Sra. Bela Mulher"
                className="w-full h-[420px] object-cover"
                referrerPolicy="no-referrer"
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

      {/* 5. VITRINE DE PRODUTOS HOME CARE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[#d4af37]">
              Boutique Exclusiva
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-white mt-1">
              Produtos Home Care Selecionados
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Prolongue o efeito do salão com fórmulas ricas em ativos nobres e óleos essenciais.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectTab('vitrine')}
          >
            Ver Toda a Linha
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
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
                      alert(`Produto "${product.name}" adicionado à sua lista de reserva do salão! Você pode retirá-lo durante seu atendimento.`);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/30 hover:bg-[#d4af37] hover:text-black transition-colors"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. EQUIPE DE PROFISSIONAIS */}
      <section className="py-16 bg-[#0c0c10] border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#d4af37]">
              Corpo de Especialistas
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-white mt-2">
              Profissionais Certificadas
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              Talentos dedicados ao visagismo com treinamento continuado nas principais capitais de beleza do mundo.
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
        </div>
      </section>

      {/* 7. RODAPÉ DE LUXO (Início, Vitrine, Área da Cliente, Área do Profissional, Contatos) */}
      <footer className="mt-auto bg-[#060608] border-t border-white/[0.08] pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
            {/* Col 1: Brand & Bio */}
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

            {/* Col 2: Navegação Pública & Vitrine */}
            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#d4af37] mb-4">
                Navegação
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                <li>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="hover:text-white transition-colors"
                  >
                    Início
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const el = document.getElementById('vitrine-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Vitrine de Serviços
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectTab('vitrine')}
                    className="hover:text-white transition-colors"
                  >
                    Boutique de Produtos Home Care
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenBookingModal()}
                    className="hover:text-[#f3e5ab] transition-colors"
                  >
                    Agendamento Online
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Portais Exclusivos */}
            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#d4af37] mb-4">
                Portais do Atelier
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                <li>
                  <button
                    onClick={() => onSelectRole('client')}
                    className="hover:text-[#f3e5ab] transition-colors flex items-center gap-1.5"
                  >
                    <span>Área Exclusiva da Cliente (Selo VIP)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectRole('professional')}
                    className="hover:text-[#f3e5ab] transition-colors flex items-center gap-1.5"
                  >
                    <span>Área da Profissional (Agenda & Comissões)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectRole('admin')}
                    className="hover:text-[#f3e5ab] transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck size={13} className="text-[#d4af37]" />
                    <span>Painel Administrativo do Salão</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Localização & Atendimento */}
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
