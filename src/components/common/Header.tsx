import React, { useState } from 'react';
import { Sparkles, Menu, X, Shield, User, Scissors, Calendar, Home, ShoppingBag, Layers } from 'lucide-react';
import { AppRole, PublicTab } from '../../types';

interface HeaderProps {
  currentRole: AppRole;
  onSelectRole: (role: AppRole) => void;
  activePublicTab?: PublicTab;
  onSelectPublicTab?: (tab: PublicTab) => void;
  onOpenBookingModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  activePublicTab = 'home',
  onSelectPublicTab,
  onOpenBookingModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080a]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Zone 1: Logo & Wordmark */}
        <button
          onClick={() => {
            onSelectRole('visitor');
            onSelectPublicTab?.('home');
          }}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa8422] flex items-center justify-center text-black font-bold shadow-md shadow-[#d4af37]/20 group-hover:scale-105 transition-transform">
            <Sparkles size={18} className="sm:hidden" />
            <Sparkles size={20} className="hidden sm:block" />
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-serif font-bold tracking-wider text-white group-hover:text-[#f3e5ab] transition-colors">
              Sra. Bela Mulher
            </span>
            <span className="hidden sm:block text-[10px] tracking-[0.2em] text-[#d4af37] font-sans uppercase">
              Atelier de Beleza & Gestão
            </span>
          </div>
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs tracking-wider uppercase font-medium">
          <button
            onClick={() => {
              onSelectRole('visitor');
              onSelectPublicTab?.('home');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentRole === 'visitor' && activePublicTab === 'home'
                ? 'text-[#f3e5ab] border-b border-[#d4af37] pb-1 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Início
          </button>

          <button
            onClick={() => {
              onSelectRole('visitor');
              onSelectPublicTab?.('vitrine');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentRole === 'visitor' && activePublicTab === 'vitrine'
                ? 'text-[#f3e5ab] border-b border-[#d4af37] pb-1 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Vitrine
          </button>

          <button
            onClick={() => {
              onSelectRole('visitor');
              onSelectPublicTab?.('servicos');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentRole === 'visitor' && activePublicTab === 'servicos'
                ? 'text-[#f3e5ab] border-b border-[#d4af37] pb-1 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Serviços
          </button>

          <button
            onClick={() => onSelectRole('client')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              currentRole === 'client'
                ? 'text-[#f3e5ab] border-b border-[#d4af37] pb-1 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User size={13} className="text-[#d4af37]" />
            <span>Área da Cliente</span>
          </button>

          <button
            onClick={() => onSelectRole('professional')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              currentRole === 'professional'
                ? 'text-[#f3e5ab] border-b border-[#d4af37] pb-1 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Scissors size={13} className="text-[#d4af37]" />
            <span>Área do Profissional</span>
          </button>
        </nav>

        {/* Zone 3: Essential Actions (Logo, Menu ☰ & Agendar Horário) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => onSelectRole('admin')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentRole === 'admin'
                ? 'bg-[#d4af37] text-black font-semibold shadow-md shadow-[#d4af37]/20'
                : 'bg-[#15151c] text-neutral-300 border border-white/10 hover:border-[#d4af37]/50 hover:text-[#f3e5ab]'
            }`}
            title="Acessar Painel Administrativo do Salão"
          >
            <Shield size={14} className={currentRole === 'admin' ? 'text-black' : 'text-[#d4af37]'} />
            <span>Painel Admin</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenBookingModal}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8422] text-[#0a0a0c] shadow-md shadow-[#d4af37]/20 hover:brightness-105 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Calendar size={14} />
            <span>Agendar <span className="hidden sm:inline">Horário</span></span>
          </button>

          {/* Mobile hamburger menu button ☰ */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-[#f3e5ab] rounded-lg lg:hidden border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Abrir menu lateral"
            title="Menu de Navegação"
          >
            {mobileMenuOpen ? <X size={22} className="text-[#d4af37]" /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Vertical Mobile Drawer Overlay (Menu Lateral Vertical 9:16) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c0c10]/98 backdrop-blur-xl border-b border-[#d4af37]/30 px-4 py-5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37] mb-3 px-1">
            Menu do Atelier Sra. Bela Mulher
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onSelectRole('visitor');
                onSelectPublicTab?.('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 text-left text-xs font-medium rounded-xl flex items-center gap-3 transition-colors ${
                currentRole === 'visitor' && activePublicTab === 'home'
                  ? 'bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/40 shadow-sm'
                  : 'bg-[#121217] text-neutral-200 border border-white/5 hover:bg-white/5'
              }`}
            >
              <Home size={16} className="text-[#d4af37]" />
              <span>Início - Página Principal</span>
            </button>

            <button
              onClick={() => {
                onSelectRole('visitor');
                onSelectPublicTab?.('vitrine');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 text-left text-xs font-medium rounded-xl flex items-center gap-3 transition-colors ${
                currentRole === 'visitor' && activePublicTab === 'vitrine'
                  ? 'bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/40 shadow-sm'
                  : 'bg-[#121217] text-neutral-200 border border-white/5 hover:bg-white/5'
              }`}
            >
              <ShoppingBag size={16} className="text-[#d4af37]" />
              <span>Vitrine de Produtos Home Care</span>
            </button>

            <button
              onClick={() => {
                onSelectRole('visitor');
                onSelectPublicTab?.('servicos');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 text-left text-xs font-medium rounded-xl flex items-center gap-3 transition-colors ${
                currentRole === 'visitor' && activePublicTab === 'servicos'
                  ? 'bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/40 shadow-sm'
                  : 'bg-[#121217] text-neutral-200 border border-white/5 hover:bg-white/5'
              }`}
            >
              <Layers size={16} className="text-[#d4af37]" />
              <span>Serviços & Rituais de Luxo</span>
            </button>

            <div className="my-1 border-t border-white/[0.08]" />

            <button
              onClick={() => {
                onSelectRole('client');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 text-left text-xs font-medium rounded-xl flex items-center gap-3 transition-colors ${
                currentRole === 'client'
                  ? 'bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/40 shadow-sm'
                  : 'bg-[#121217] text-neutral-200 border border-white/5 hover:bg-white/5'
              }`}
            >
              <User size={16} className="text-[#d4af37]" />
              <div>
                <span className="block font-semibold">Área Exclusiva da Cliente</span>
                <span className="text-[10px] text-neutral-400">Selo VIP, histórico e agendamentos</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectRole('professional');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 text-left text-xs font-medium rounded-xl flex items-center gap-3 transition-colors ${
                currentRole === 'professional'
                  ? 'bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/40 shadow-sm'
                  : 'bg-[#121217] text-neutral-200 border border-white/5 hover:bg-white/5'
              }`}
            >
              <Scissors size={16} className="text-[#d4af37]" />
              <div>
                <span className="block font-semibold">Área da Profissional</span>
                <span className="text-[10px] text-neutral-400">Agenda de cadeira e comissões</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectRole('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-3 text-left text-xs font-medium rounded-xl flex items-center gap-3 transition-colors ${
                currentRole === 'admin'
                  ? 'bg-[#d4af37] text-black font-semibold shadow-md'
                  : 'bg-[#161622] text-[#f3e5ab] border border-[#d4af37]/40 hover:bg-[#1a1a28]'
              }`}
            >
              <Shield size={16} className={currentRole === 'admin' ? 'text-black' : 'text-[#d4af37]'} />
              <div>
                <span className="block font-semibold">Painel Administrativo (11 Módulos)</span>
                <span className={`text-[10px] ${currentRole === 'admin' ? 'text-black/70' : 'text-neutral-400'}`}>
                  Financeiro, Caixa, Agenda, Estoque e CRM
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
