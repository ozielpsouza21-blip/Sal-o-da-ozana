import React, { useState } from 'react';
import {
  Sparkles,
  Eye,
  CheckCircle,
  XCircle,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Service } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { StorageService } from '../../../services/storage';

interface ShowcaseModuleProps {
  services: Service[];
  products: Product[];
  onRefreshData: () => void;
  onPreviewPublic: () => void;
}

export const ShowcaseModule: React.FC<ShowcaseModuleProps> = ({
  services,
  products,
  onRefreshData,
  onPreviewPublic,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');

  const toggleServiceVitrine = (id: string) => {
    const list = [...services];
    const s = list.find(item => item.id === id);
    if (s) {
      s.featuredInVitrine = !s.featuredInVitrine;
      StorageService.saveServices(list);
      onRefreshData();
    }
  };

  const toggleProductVitrine = (id: string) => {
    const list = [...products];
    const p = list.find(item => item.id === id);
    if (p) {
      p.featuredInVitrine = !p.featuredInVitrine;
      StorageService.saveProducts(list);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-white">
            Curadoria da Vitrine Pública
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Defina quais procedimentos e cosméticos aparecem para as visitantes na página principal.
          </p>
        </div>

        <Button onClick={onPreviewPublic} variant="secondary" icon={<Eye size={15} />}>
          Visualizar Vitrine Pública
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
            activeTab === 'services'
              ? 'bg-[#d4af37] text-black'
              : 'text-neutral-400 hover:text-white bg-[#14141c]'
          }`}
        >
          Procedimentos em Destaque ({services.filter(s => s.featuredInVitrine).length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
            activeTab === 'products'
              ? 'bg-[#d4af37] text-black'
              : 'text-neutral-400 hover:text-white bg-[#14141c]'
          }`}
        >
          Boutique Home Care ({products.filter(p => p.featuredInVitrine).length})
        </button>
      </div>

      {/* Services List */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map(s => (
            <Card
              key={s.id}
              padding="sm"
              borderGold={s.featuredInVitrine}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-semibold text-white">{s.name}</h4>
                  <div className="text-neutral-400 text-[11px]">
                    {s.category} · R$ {s.priceBRL.toFixed(2)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleServiceVitrine(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  s.featuredInVitrine
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                    : 'bg-[#181822] text-neutral-400 hover:text-white'
                }`}
              >
                {s.featuredInVitrine ? 'Ativo na Vitrine' : 'Oculto na Vitrine'}
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Products List */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map(p => (
            <Card
              key={p.id}
              padding="sm"
              borderGold={p.featuredInVitrine}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-semibold text-white">{p.name}</h4>
                  <div className="text-neutral-400 text-[11px]">
                    {p.brand} · R$ {p.salePriceBRL.toFixed(2)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleProductVitrine(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  p.featuredInVitrine
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                    : 'bg-[#181822] text-neutral-400 hover:text-white'
                }`}
              >
                {p.featuredInVitrine ? 'Ativo na Vitrine' : 'Oculto na Vitrine'}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
