import React, { useState } from 'react';
import {
  Scissors,
  Plus,
  Clock,
  DollarSign,
  Sparkles,
  CheckCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { Service } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { StorageService } from '../../../services/storage';

interface ServicesModuleProps {
  services: Service[];
  onRefreshData: () => void;
}

export const ServicesModule: React.FC<ServicesModuleProps> = ({
  services,
  onRefreshData,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Service['category']>('Cabelos');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [priceBRL, setPriceBRL] = useState('200.00');
  const [description, setDescription] = useState('');
  const [featuredInVitrine, setFeaturedInVitrine] = useState(true);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    StorageService.addService({
      name: name.trim(),
      category,
      durationMinutes: parseInt(durationMinutes) || 60,
      priceBRL: parseFloat(priceBRL) || 150,
      description: description.trim() || 'Serviço com produtos nobres e acabamento profissional.',
      image: '/src/assets/images/service_luxury_haircare_1793577408044.jpg',
      popular: featuredInVitrine,
      featuredInVitrine,
      active: true,
    });

    onRefreshData();
    setIsModalOpen(false);
    setName('');
    setDescription('');
  };

  const handleToggleVitrine = (serviceId: string) => {
    const list = [...services];
    const item = list.find(s => s.id === serviceId);
    if (item) {
      item.featuredInVitrine = !item.featuredInVitrine;
      StorageService.saveServices(list);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-white">
            Catálogo & Tabela de Procedimentos
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cadastre novos rituais, precificação em BRL e tempos estimados de atendimento.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
          Novo Procedimento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(srv => (
          <Card
            key={srv.id}
            padding="md"
            borderGold={srv.featuredInVitrine}
            className="flex flex-col justify-between space-y-3 bg-[#111116] border border-white/10"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37]">
                  {srv.category}
                </span>
                <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                  <Clock size={12} className="text-[#d4af37]" />
                  <span>{srv.durationMinutes} min</span>
                </span>
              </div>

              <h4 className="text-base font-semibold text-white mt-1 leading-snug">
                {srv.name}
              </h4>
              <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                {srv.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-lg font-mono font-bold text-[#f3e5ab]">
                R$ {srv.priceBRL.toFixed(2)}
              </span>

              <button
                onClick={() => handleToggleVitrine(srv.id)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors font-medium ${
                  srv.featuredInVitrine
                    ? 'bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40'
                    : 'bg-[#181822] text-neutral-500 hover:text-white'
                }`}
              >
                {srv.featuredInVitrine ? 'Na Vitrine' : '+ Add à Vitrine'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL: NOVO SERVIÇO */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title="Cadastrar Novo Procedimento"
          subtitle="Defina nome, categoria, tempo e preço do serviço"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateService}>
                Salvar Procedimento
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateService} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Nome do Procedimento *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Terapia de Couro Cabeludo & Peeling Tricológico"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Cabelos">Cabelos</option>
                  <option value="Unhas">Unhas</option>
                  <option value="Estética">Estética</option>
                  <option value="Noivas">Noivas</option>
                  <option value="Sobrancelhas & Cílios">Sobrancelhas & Cílios</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Duração Estimada (min) *
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                  placeholder="60"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Preço Base em BRL (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={priceBRL}
                onChange={e => setPriceBRL(e.target.value)}
                placeholder="250.00"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Descrição do Procedimento
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detalhes sobre a experiência, produtos usados e resultados esperados..."
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="featVitrine"
                checked={featuredInVitrine}
                onChange={e => setFeaturedInVitrine(e.target.checked)}
                className="rounded text-[#d4af37] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="featVitrine" className="text-xs text-neutral-300 cursor-pointer">
                Exibir este procedimento em destaque na Vitrine pública
              </label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
