import React, { useState } from 'react';
import { Menu, X, Download, ShieldCheck, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface ExternalSideMenuProps {
  onOpenAdmin: () => void;
}

export const ExternalSideMenu: React.FC<ExternalSideMenuProps> = ({ onOpenAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstalled) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 3000);
      return;
    }
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (isInstallable) {
      await install();
      return;
    }
    // Fallback guidance if not promptable directly
    setShowIOSGuide(true);
  };

  return (
    <>
      {/* Floating External Menu Button (Accessible outside footer) */}
      <div className="fixed top-20 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0f0f15]/90 border border-[#d4af37]/40 text-[#f3e5ab] shadow-xl hover:bg-[#181822] transition-all cursor-pointer backdrop-blur-md"
          title="Menu de Opções e Instalação PWA"
          aria-label="Menu Externo"
        >
          <Menu size={18} className="text-[#d4af37]" />
          <span className="text-xs font-semibold tracking-wider uppercase hidden sm:inline">Menu PWA / ADM</span>
        </button>
      </div>

      {/* Side Menu Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-[#0c0c10] border-l border-[#d4af37]/30 h-full flex flex-col p-6 shadow-2xl relative overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa8422] flex items-center justify-center text-black">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-white">Sra. Bela Mulher</h3>
                  <span className="text-[10px] text-[#d4af37] tracking-widest uppercase">Atelier Menu</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Options */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase px-1">
                Aplicativo & Instalação
              </div>

              <button
                onClick={handleInstallClick}
                className="w-full p-3.5 rounded-xl bg-[#15151f] border border-[#d4af37]/30 hover:border-[#d4af37] text-left flex items-center gap-3 transition-all group cursor-pointer shadow-md"
              >
                <div className="p-2 rounded-lg bg-[#d4af37]/10 text-[#d4af37] group-hover:scale-110 transition-transform">
                  <Download size={18} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-white">
                    {isInstalled ? 'Aplicativo Instalado' : 'Instalar Aplicativo (PWA)'}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {isInstalled ? 'Executando em modo nativo' : 'Adicione à tela inicial do celular'}
                  </span>
                </div>
              </button>

              {installedNotice && (
                <div className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>O aplicativo já está instalado no seu dispositivo!</span>
                </div>
              )}

              <div className="my-2 border-t border-white/10" />

              <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase px-1">
                Gestão Administrativa
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdmin();
                }}
                className="w-full p-3.5 rounded-xl bg-gradient-to-r from-[#1a1a24] to-[#12121a] border border-[#d4af37]/40 hover:border-[#d4af37] text-left flex items-center gap-3 transition-all group cursor-pointer shadow-md"
              >
                <div className="p-2 rounded-lg bg-[#d4af37] text-black group-hover:scale-110 transition-transform font-bold">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-white">Acesso ADM</span>
                  <span className="text-[10px] text-[#d4af37]">Painel restrito à administração</span>
                </div>
              </button>
            </div>

            {/* Footer note */}
            <div className="mt-auto pt-6 border-t border-white/10 text-center text-[10px] text-neutral-500">
              Sra. Bela Mulher Atelier &copy; 2026<br />Segurança e Elegância em cada detalhe.
            </div>

          </div>
        </div>
      )}

      {/* iOS / Direct Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f0f15] border border-[#d4af37]/40 p-6 shadow-2xl text-center relative">
            <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 text-[#f3e5ab] flex items-center justify-center mx-auto mb-3 border border-[#d4af37]/30">
              <Smartphone size={24} />
            </div>
            <h3 className="text-base font-serif font-bold text-white">Instalação no Dispositivo</h3>
            <p className="text-xs text-neutral-300 mt-2 mb-4 leading-relaxed">
              Para instalar o Sra. Bela Mulher Atelier na tela inicial do seu celular ou tablet:
            </p>
            <div className="bg-[#15151f] rounded-xl p-3 text-left text-xs text-neutral-200 space-y-2 border border-white/10 mb-4">
              <p><strong>1.</strong> Toque no ícone de <strong>Compartilhar</strong> (no Safari) ou no <strong>Menu (3 pontos)</strong> (no Chrome).</p>
              <p><strong>2.</strong> Selecione <strong>"Adicionar à Tela Inicial"</strong> ou <strong>"Instalar Aplicativo"</strong>.</p>
              <p><strong>3.</strong> Confirme para ter acesso rápido com um toque.</p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8422] text-black font-semibold text-xs shadow-md cursor-pointer hover:brightness-105"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
