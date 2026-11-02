import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Save,
  CheckCircle2,
  Sliders,
  Store,
  Layers,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { ThemeConfig, ThemePalette } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { StorageService } from '../../../services/storage';

interface CustomizationModuleProps {
  themeConfig: ThemeConfig;
  onRefreshData: () => void;
}

export const CustomizationModule: React.FC<CustomizationModuleProps> = ({
  themeConfig,
  onRefreshData,
}) => {
  const [selectedPalette, setSelectedPalette] = useState<ThemePalette>(themeConfig.palette);
  const [customHex, setCustomHex] = useState<string>(themeConfig.primaryAccent);
  const [salonName, setSalonName] = useState(themeConfig.salonName);
  const [salonTagline, setSalonTagline] = useState(themeConfig.salonTagline);
  const [contactPhone, setContactPhone] = useState(themeConfig.contactPhone);
  const [instagramHandle, setInstagramHandle] = useState(themeConfig.instagramHandle);
  const [address, setAddress] = useState(themeConfig.address);
  const [show3dParticles, setShow3dParticles] = useState(themeConfig.show3dParticles);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const palettes = [
    {
      id: 'champagne' as ThemePalette,
      name: 'Champagne Clássico (Padrão)',
      primary: '#d4af37',
      light: '#f3e5ab',
      subtle: 'rgba(212, 175, 55, 0.12)',
      border: 'rgba(212, 175, 55, 0.3)',
      desc: 'Dourado nobre com reflexo suave e fundo ônix.',
    },
    {
      id: 'rosegold' as ThemePalette,
      name: 'Rosé Gold Imperial',
      primary: '#e09891',
      light: '#f8d7da',
      subtle: 'rgba(224, 152, 145, 0.12)',
      border: 'rgba(224, 152, 145, 0.3)',
      desc: 'Toque feminino contemporâneo de joalheria rosada.',
    },
    {
      id: 'bronze' as ThemePalette,
      name: 'Bronze Patinado',
      primary: '#cd7f32',
      light: '#edd0be',
      subtle: 'rgba(205, 127, 50, 0.12)',
      border: 'rgba(205, 127, 50, 0.3)',
      desc: 'Calor e sobriedade em tonalidade bronze metálica.',
    },
    {
      id: 'amber' as ThemePalette,
      name: 'Royal Amber Solar',
      primary: '#f59e0b',
      light: '#fde68a',
      subtle: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      desc: 'Luminosidade intensa com matizes de mel e âmbar.',
    },
    {
      id: 'emerald' as ThemePalette,
      name: 'Esmeralda Nobre',
      primary: '#2ecc71',
      light: '#a3e4d7',
      subtle: 'rgba(46, 204, 113, 0.12)',
      border: 'rgba(46, 204, 113, 0.3)',
      desc: 'Harmonia botânica e spa de frescor orgânico.',
    },
  ];

  const handleSelectPreset = (p: typeof palettes[0]) => {
    setSelectedPalette(p.id);
    setCustomHex(p.primary);
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();

    const activePreset = palettes.find(p => p.id === selectedPalette) || {
      primary: customHex,
      light: '#f3e5ab',
      subtle: 'rgba(212, 175, 55, 0.12)',
      border: 'rgba(212, 175, 55, 0.3)',
    };

    const updatedTheme: ThemeConfig = {
      ...themeConfig,
      palette: selectedPalette,
      primaryAccent: customHex,
      accentLight: activePreset.light,
      accentSubtle: activePreset.subtle,
      accentBorder: activePreset.border,
      salonName,
      salonTagline,
      contactPhone,
      instagramHandle,
      address,
      show3dParticles,
    };

    StorageService.saveTheme(updatedTheme);
    onRefreshData();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-serif font-semibold text-white">
          Personalização Visual & Identidade do Atelier
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Configure a cor de destaque, detalhes dourados/champagne, dados institucionais e efeitos visuais 3D.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-700/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Identidade visual e paleta salvas com sucesso! As alterações já estão ativas em todo o sistema.</span>
        </div>
      )}

      <form onSubmit={handleSaveTheme} className="space-y-6">
        {/* 1. SELEÇÃO DE PALETAS DE CORES */}
        <Card padding="md" className="space-y-4 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#d4af37] uppercase tracking-wider">
            <Palette size={16} />
            <span>1. Paletas Nobres de Destaque</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {palettes.map(p => {
              const isSelected = selectedPalette === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#181824] border-[#d4af37] shadow-lg shadow-black'
                      : 'bg-[#121217] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-6 h-6 rounded-full shadow-md shrink-0 border border-white/20"
                      style={{ backgroundColor: p.primary }}
                    />
                    <span className="text-xs font-semibold text-white">{p.name}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">{p.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Custom Hex Color Picker */}
          <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs text-neutral-300 font-medium">
              Ou escolha uma cor personalizada (Hexadecimal):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customHex}
                onChange={e => {
                  setCustomHex(e.target.value);
                  setSelectedPalette('custom');
                }}
                className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-white/10"
              />
              <input
                type="text"
                value={customHex}
                onChange={e => {
                  setCustomHex(e.target.value);
                  setSelectedPalette('custom');
                }}
                className="w-28 bg-[#14141c] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>
        </Card>

        {/* 2. EFEITO 3D DE PARTÍCULAS NA PÁGINA PÚBLICA */}
        <Card padding="md" className="space-y-3 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#d4af37] uppercase tracking-wider">
            <Sparkles size={16} />
            <span>2. Efeito Visual 3D de Partículas de Ouro</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#14141c] rounded-xl border border-white/5">
            <div>
              <span className="text-xs font-semibold text-white block">
                Ativar Partículas Champagne 3D no Banner Principal
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Projeção matemática com profundidade no eixo Z, parallax com o cursor e iluminação dinâmica.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={show3dParticles}
                onChange={e => setShow3dParticles(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
            </label>
          </div>
        </Card>

        {/* 3. DADOS INSTITUCIONAIS DO SALÃO */}
        <Card padding="md" className="space-y-4 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#d4af37] uppercase tracking-wider">
            <Store size={16} />
            <span>3. Dados Institucionais & Rodapé</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-neutral-400 block mb-1 font-medium">Nome do Salão</label>
              <input
                type="text"
                value={salonName}
                onChange={e => setSalonName(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1 font-medium">Slogan / Tagline</label>
              <input
                type="text"
                value={salonTagline}
                onChange={e => setSalonTagline(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1 font-medium">Telefone / WhatsApp</label>
              <input
                type="text"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1 font-medium">Instagram Oficial</label>
              <input
                type="text"
                value={instagramHandle}
                onChange={e => setInstagramHandle(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-neutral-400 block mb-1 font-medium">Endereço Completo</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" size="lg" icon={<Save size={16} />}>
            Salvar e Aplicar Identidade Visual
          </Button>
        </div>
      </form>
    </div>
  );
};
