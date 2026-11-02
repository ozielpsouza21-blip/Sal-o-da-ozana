import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Crown,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Eye,
  Edit2,
  FileText,
} from 'lucide-react';
import { ClientProfile, VipTier, Appointment } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { StorageService } from '../../../services/storage';

interface ClientsModuleProps {
  clients: ClientProfile[];
  appointments: Appointment[];
  onRefreshData: () => void;
}

export const ClientsModule: React.FC<ClientsModuleProps> = ({
  clients,
  appointments,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedClientDetail, setSelectedClientDetail] = useState<ClientProfile | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // New Client Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTier, setNewTier] = useState<VipTier>('Prata');
  const [newPreferences, setNewPreferences] = useState('');
  const [newFormula, setNewFormula] = useState('');

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || c.vipTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    StorageService.addClient({
      name: newName.trim(),
      email: newEmail.trim() || 'cliente@srabélamulher.com.br',
      phone: newPhone.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      vipTier: newTier,
      vipPoints: newTier === 'Diamante' ? 5000 : newTier === 'Ouro' ? 2500 : 1000,
      formulaNote: newFormula.trim() || undefined,
      preferences: newPreferences.trim() || undefined,
      favoriteDrink: 'Espresso Gourmet',
    });

    onRefreshData();
    setIsNewClientModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewFormula('');
    setNewPreferences('');
  };

  const getVipBadgeColor = (tier: VipTier) => {
    switch (tier) {
      case 'Diamante':
        return 'from-cyan-400 to-indigo-400 text-black';
      case 'Ouro':
        return 'from-[#d4af37] to-[#aa8422] text-black';
      case 'Prata':
        return 'from-slate-200 to-slate-400 text-black';
      default:
        return 'from-amber-700 to-amber-800 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and New Client Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-white">
            Base de Clientes & CRM Personalizado
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Registro detalhado de preferências, fórmulas químicas de cor e pontuação VIP.
          </p>
        </div>

        <Button onClick={() => setIsNewClientModalOpen(true)} icon={<Plus size={16} />}>
          Cadastrar Nova Cliente
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-[#121217] border border-white/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail..."
            className="w-full bg-[#181822] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white placeholder-neutral-500 focus:border-[#d4af37] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'Diamante', 'Ouro', 'Prata', 'Bronze'].map(tier => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                tierFilter === tier
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-neutral-400 hover:text-white bg-[#181822] border border-white/5'
              }`}
            >
              {tier === 'all' ? 'Todas' : `VIP ${tier}`}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <Card
            key={client.id}
            padding="md"
            hoverable
            className="flex flex-col justify-between space-y-4 bg-[#111116] border border-white/10"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#d4af37]/40 shrink-0">
                    <img
                      src={client.avatarUrl}
                      alt={client.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{client.name}</h4>
                    <span className="text-[11px] text-neutral-400 block">{client.phone}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${getVipBadgeColor(
                    client.vipTier
                  )}`}
                >
                  VIP {client.vipTier}
                </span>
              </div>

              {client.formulaNote && (
                <div className="mt-3 p-2 bg-[#161620] rounded-lg border border-white/5 text-[11px]">
                  <span className="text-[#d4af37] font-semibold block mb-0.5">Fórmula Capilar:</span>
                  <span className="text-neutral-300 font-mono line-clamp-2">{client.formulaNote}</span>
                </div>
              )}

              {client.preferences && (
                <p className="text-[11px] text-neutral-400 mt-2 line-clamp-1">
                  Mimo: {client.preferences}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-mono">
                {client.vipPoints} pts acumulados
              </span>

              <button
                onClick={() => setSelectedClientDetail(client)}
                className="text-[#d4af37] hover:underline flex items-center gap-1 font-medium"
              >
                <Eye size={13} />
                <span>Ver Ficha Completa</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL: FICHA COMPLETA DA CLIENTE */}
      {selectedClientDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedClientDetail(null)}
          title={`Ficha Técnica · ${selectedClientDetail.name}`}
          subtitle={`Categoria: VIP ${selectedClientDetail.vipTier} · ${selectedClientDetail.vipPoints} Pontos`}
          footer={
            <Button onClick={() => setSelectedClientDetail(null)}>
              Fechar Ficha
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#161622] rounded-xl border border-white/10">
              <div>
                <span className="text-neutral-500 block text-[10px]">Telefone</span>
                <span className="font-semibold text-white">{selectedClientDetail.phone}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">E-mail</span>
                <span className="font-semibold text-white">{selectedClientDetail.email}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Membro Desde</span>
                <span className="font-semibold text-white">{selectedClientDetail.createdAt}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Bebida / Mimo</span>
                <span className="font-semibold text-[#f3e5ab]">{selectedClientDetail.favoriteDrink || 'Espresso'}</span>
              </div>
            </div>

            <div className="p-3 bg-[#12121a] rounded-xl border border-white/10">
              <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider block mb-1">
                Fórmula Técnica & Procedimentos Realizados
              </span>
              <p className="font-mono text-neutral-200 bg-[#0a0a0e] p-2.5 rounded border border-white/5 leading-relaxed">
                {selectedClientDetail.formulaNote || 'Nenhuma fórmula química registrada para esta cliente.'}
              </p>
            </div>

            {selectedClientDetail.allergies && (
              <div className="p-3 bg-red-950/30 rounded-xl border border-red-800/40 text-red-300">
                <span className="font-semibold block mb-0.5">Alergias ou Sensibilidades:</span>
                <p>{selectedClientDetail.allergies}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL: CADASTRAR NOVA CLIENTE */}
      {isNewClientModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsNewClientModalOpen(false)}
          title="Cadastrar Nova Cliente no Atelier"
          subtitle="Preencha os dados e preferências para inaugurar a ficha técnica"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsNewClientModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateClient}>
                Salvar Cliente
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Carolina Almeida"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  WhatsApp *
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Selo VIP Inicial
                </label>
                <select
                  value={newTier}
                  onChange={e => setNewTier(e.target.value as VipTier)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Bronze">VIP Bronze</option>
                  <option value="Prata">VIP Prata</option>
                  <option value="Ouro">VIP Ouro</option>
                  <option value="Diamante">VIP Diamante</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="carolina.almeida@email.com"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Fórmula Capilar Inicial (Opcional)
              </label>
              <input
                type="text"
                value={newFormula}
                onChange={e => setNewFormula(e.target.value)}
                placeholder="Ex: Morena iluminada tom avelã e caramelo..."
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Mimos & Preferências
              </label>
              <input
                type="text"
                value={newPreferences}
                onChange={e => setNewPreferences(e.target.value)}
                placeholder="Ex: Aprecia café com canela, atendimento rápido..."
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
