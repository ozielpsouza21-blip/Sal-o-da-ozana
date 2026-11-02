import React, { useState } from 'react';
import {
  Scissors,
  Plus,
  Clock,
  DollarSign,
  Sparkles,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle,
} from 'lucide-react';
import { Service } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { SupabaseDataService } from '../../../services/supabaseDataService';

interface ServicesModuleProps {
  services: Service[];
  onRefreshData: () => void;
}

export const ServicesModule: React.FC<ServicesModuleProps> = ({
  services,
  onRefreshData,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Service['category']>('Cabelos');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [priceBRL, setPriceBRL] = useState('200.00');
  const [description, setDescription] = useState('');
  const [featuredInVitrine, setFeaturedInVitrine] = useState(true);

  // Feedback & Delete Confirmation states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const handleOpenCreate = () => {
    setEditingServiceId(null);
    setName('');
    setCategory('Cabelos');
    setDurationMinutes('60');
    setPriceBRL('200.00');
    setDescription('');
    setFeaturedInVitrine(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingServiceId(service.id);
    setName(service.name);
    setCategory(service.category);
    setDurationMinutes(service.durationMinutes.toString());
    setPriceBRL(service.priceBRL.toFixed(2));
    setDescription(service.description);
    setFeaturedInVitrine(Boolean(service.featuredInVitrine));
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('O nome do procedimento é obrigatório.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const parsedDuration = parseInt(durationMinutes) || 60;
      const parsedPrice = parseFloat(priceBRL) || 150.0;

      if (editingServiceId) {
        // Update existing
        await SupabaseDataService.updateService(editingServiceId, {
          name: name.trim(),
          category,
          durationMinutes: parsedDuration,
          priceBRL: parsedPrice,
          description: description.trim(),
          featuredInVitrine,
        });
        setSuccessMessage('Procedimento atualizado com sucesso!');
      } else {
        // Create new
        await SupabaseDataService.createService({
          name: name.trim(),
          category,
          durationMinutes: parsedDuration,
          priceBRL: parsedPrice,
          description: description.trim() || 'Serviço com produtos nobres e acabamento profissional.',
          image: '/src/assets/images/service_luxury_haircare_1793577408044.jpg',
          popular: featuredInVitrine,
          featuredInVitrine,
          active: true,
        });
        setSuccessMessage('Novo procedimento cadastrado com sucesso!');
      }

      await onRefreshData();
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error('Erro ao salvar serviço:', err);
      setErrorMessage(err?.message || 'Erro ao salvar procedimento. Verifique a conexão com o Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!serviceToDelete) return;

    setErrorMessage(null);
    try {
      await SupabaseDataService.deleteService(serviceToDelete.id);
      await onRefreshData();
      setServiceToDelete(null);
      setSuccessMessage('Procedimento excluído com sucesso.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error('Erro ao excluir serviço:', err);
      setErrorMessage(err?.message || 'Falha ao excluir procedimento no Supabase.');
      setServiceToDelete(null);
    }
  };

  const handleToggleVitrine = async (service: Service) => {
    try {
      await SupabaseDataService.updateService(service.id, {
        featuredInVitrine: !service.featuredInVitrine,
      });
      await onRefreshData();
    } catch (err: any) {
      console.warn('Falha ao alternar status na vitrine:', err);
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
            Gerencie rituais, precificação em BRL, tempos estimados e exibição na Vitrine.
          </p>
        </div>

        <Button onClick={handleOpenCreate} icon={<Plus size={16} />}>
          Novo Procedimento
        </Button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle size={16} className="shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && !isModalOpen && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(srv => (
          <Card
            key={srv.id}
            padding="md"
            borderGold={srv.featuredInVitrine}
            className="flex flex-col justify-between space-y-3 bg-[#111116] border border-white/10 relative group"
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVitrine(srv)}
                  className={`text-[11px] px-2 py-1 rounded transition-colors font-medium ${
                    srv.featuredInVitrine
                      ? 'bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40'
                      : 'bg-[#181822] text-neutral-500 hover:text-white'
                  }`}
                  title="Alternar destaque na Vitrine"
                >
                  {srv.featuredInVitrine ? 'Na Vitrine' : '+ Vitrine'}
                </button>

                <button
                  onClick={() => handleOpenEdit(srv)}
                  className="p-1.5 bg-[#181822] hover:bg-white/10 text-neutral-300 rounded transition-colors"
                  title="Editar Procedimento"
                >
                  <Edit2 size={13} />
                </button>

                <button
                  onClick={() => setServiceToDelete(srv)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded transition-colors border border-red-500/20"
                  title="Excluir Procedimento"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL: CADASTRO / EDIÇÃO DE PROCEDIMENTO */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingServiceId ? 'Editar Procedimento' : 'Cadastrar Novo Procedimento'}
          subtitle="Preencha as informações comerciais, preço e duração do serviço"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveService} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Procedimento'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveService} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-lg text-xs text-red-300">
                {errorMessage}
              </div>
            )}

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

      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO */}
      {serviceToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setServiceToDelete(null)}
          title="Confirmar Exclusão de Procedimento"
          subtitle="Esta ação removerá permanentemente o serviço do catálogo"
          footer={
            <>
              <Button variant="outline" onClick={() => setServiceToDelete(null)}>
                Cancelar
              </Button>
              <Button
                onClick={handleExecuteDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir Definitivamente
              </Button>
            </>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300 flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Tem certeza que deseja excluir?</p>
                <p className="text-neutral-300 mt-1">
                  Procedimento: <span className="text-[#f3e5ab] font-semibold">{serviceToDelete.name}</span>
                </p>
                <p className="text-neutral-400 mt-0.5">
                  Categoria: {serviceToDelete.category} | Preço: R$ {serviceToDelete.priceBRL.toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-neutral-400">
              O procedimento deixará de ser exibido na Vitrine e nos formulários de agendamento online.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
