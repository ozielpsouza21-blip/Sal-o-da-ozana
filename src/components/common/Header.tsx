import React from 'react';
import { Sparkles, User, Scissors, LogOut, ShoppingBag } from 'lucide-react';
import { AppRole, PublicTab } from '../../types';

interface HeaderProps {
  currentRole: AppRole;
  onSelectRole: (role: AppRole) => void;
  activePublicTab?: PublicTab;
  onSelectPublicTab?: (tab: PublicTab) => void;
  onOpenBookingModal: () => void;
  authUserEmail?: string | null;
  authUserName?: string | null;
  onOpenAuthView?: (mode?: 'login' | 'signup') => void;
  onLogout?: () => void;
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  activePublicTab = 'home',
  onSelectPublicTab,
  authUserEmail,
  authUserName,
  onLogout,
  cartItemCount = 0,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080a]/95 backdrop-blur-md border-b border-white/[0.08]">
      {/* Top Tagline Strip (Reorganizada da área do banner para o topo junto ao cabeçalho) */}
      <div className="bg-gradient-to-r from-[#08080a] via-[#14141c] to-[#08080a] border-b border-[#d4af37]/20 py-1.5 px-4 text-center">
        <p className="text-[11px] sm:text-xs text-[#f3e5ab] font-serif tracking-wider flex items-center justify-center gap-2">
          <Sparkles size={12} className="text-[#d4af37]" />
          <span>A Arte da Transformação com Precisão e Luxo · Jardins, São Paulo</span>
          <Sparkles size={12} className="text-[#d4af37]" />
        </p>
      </div>

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

        {/* Zone 3: Essential Actions (Cart & Supabase User Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 pr-12 sm:pr-16">
          {/* Shopping Cart Trigger */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-[#14141c] hover:bg-[#d4af37] text-neutral-300 hover:text-black border border-white/10 hover:border-[#d4af37] transition-all cursor-pointer flex items-center justify-center"
              title="Abrir Carrinho de Compras"
            >
              <ShoppingBag size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#d4af37] text-black text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#08080a] animate-in zoom-in duration-200">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {authUserEmail && (
            <div className="hidden sm:flex items-center gap-2 bg-[#14141c] border border-[#d4af37]/30 rounded-xl px-3 py-1.5 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] flex items-center justify-center font-bold text-[10px]">
                {(authUserName || authUserEmail).charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white font-medium truncate max-w-[120px]">
                  {authUserName || authUserEmail.split('@')[0]}
                </span>
                <span className="text-[10px] text-[#d4af37] uppercase font-semibold">
                  {currentRole}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="ml-1 p-1 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Sair da Conta (Supabase SignOut)"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
