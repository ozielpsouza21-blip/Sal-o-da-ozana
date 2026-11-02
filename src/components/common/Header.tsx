import React, { useState } from 'react';
import { Sparkles, Menu, X, Shield, User, Scissors, Calendar } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full bg-[#08080a]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            onSelectRole('visitor');
            onSelectPublicTab?.('home');
          }}
          className="flex items-center gap-3 text-left whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa8422] flex items-center justify-center text-black font-bold shadow-md shadow-[#d4af37]/20 group-hover:scale-105 transition-transform">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-serif font-bold tracking-wider text-white group-hover:text-[#f3e5ab] transition-colors">
              Sra. Bela Mulher
            </span>
            <span className="hidden sm:block text-[10px] tracking-[0.2em] text-[#d4af37] font-sans uppercase">
              Atelier de Beleza & Gestão
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs tracking-wider uppercase font-medium">
          <button
            onClick={() => {
              onSelectRole('visitor');
              onSelectPublicTab?.('home');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentRole === 'visitor' && activePublicTab === 'home'
                ? 'text-[#f3e5ab] border-b border-[#d4af37] pb-1'
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
                ? 'text-[#f3e5ab] border-b border-[#d4af37] pb-1'
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
                ? 'text-[#f3e5ab] border-b border-[#d4af37] pb-1'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Serviços
          </button>

          <button
            onClick={() => onSelectRole('client')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              currentRole === 'client'
                ? 'text-[#f3e5ab] border-b border-[#d4af37] pb-1'
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
                ? 'text-[#f3e5ab] border-b border-[#d4af37] pb-1'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Scissors size={13} className="text-[#d4af37]" />
            <span>Área do Profissional</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectRole('admin')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentRole === 'admin'
                ? 'bg-[#d4af37] text-black font-semibold shadow-md shadow-[#d4af37]/20'
                : 'bg-[#15151c] text-neutral-300 border border-white/10 hover:border-[#d4af37]/50 hover:text-[#f3e5ab]'
            }`}
            title="Acessar Painel Administrativo do Salão"
          >
            <Shield size={14} className={currentRole === 'admin' ? 'text-black' : 'text-[#d4af37]'} />
            <span>Painel Admin</span>
          </button>

          <button
            onClick={onOpenBookingModal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8422] text-[#0a0a0c] shadow-md shadow-[#d4af37]/20 hover:brightness-105 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Calendar size={14} />
            <span>Agendar Horário</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-400 hover:text-white rounded-lg lg:hidden"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0e0e12] border-b border-white/[0.08] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/[0.08]">
            <button
              onClick={() => {
                onSelectRole('visitor');
                onSelectPublicTab?.('home');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-left text-xs font-medium rounded-lg ${
                currentRole === 'visitor' && activePublicTab === 'home'
                  ? 'bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/30'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => {
                onSelectRole('visitor');
                onSelectPublicTab?.('vitrine');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-left text-xs font-medium rounded-lg ${
                currentRole === 'visitor' && activePublicTab === 'vitrine'
                  ? 'bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/30'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              Vitrine de Produtos
            </button>
            <button
              onClick={() => {
                onSelectRole('visitor');
                onSelectPublicTab?.('servicos');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-left text-xs font-medium rounded-lg ${
                currentRole === 'visitor' && activePublicTab === 'servicos'
                  ? 'bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/30'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              Serviços & Rituais
            </button>
            <button
              onClick={() => {
                onSelectRole('client');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-left text-xs font-medium rounded-lg flex items-center gap-1.5 ${
                currentRole === 'client'
                  ? 'bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/30'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <User size={13} className="text-[#d4af37]" />
              <span>Área da Cliente</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => {
                onSelectRole('professional');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 text-left text-xs font-medium rounded-lg flex items-center gap-2 ${
                currentRole === 'professional'
                  ? 'bg-[#1a1a24] text-[#f3e5ab] border border-[#d4af37]/30'
                  : 'bg-[#14141a] text-neutral-300 hover:bg-white/5'
              }`}
            >
              <Scissors size={14} className="text-[#d4af37]" />
              <span>Acessar Área do Profissional</span>
            </button>

            <button
              onClick={() => {
                onSelectRole('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 text-left text-xs font-medium rounded-lg flex items-center gap-2 ${
                currentRole === 'admin'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'bg-[#14141a] text-neutral-300 hover:bg-white/5 border border-[#d4af37]/30'
              }`}
            >
              <Shield size={14} className={currentRole === 'admin' ? 'text-black' : 'text-[#d4af37]'} />
              <span>Acessar Painel de Gestão Administrativa</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
