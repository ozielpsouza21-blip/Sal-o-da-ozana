import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Crown,
  Sparkles,
  User,
  History,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Scissors,
  Save,
  Camera,
  Coffee,
  X,
} from 'lucide-react';
import { Appointment, ClientProfile, ClientTab, Professional, Service } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StorageService } from '../../services/storage';

interface ClientPortalProps {
  currentClient: ClientProfile;
  clients: ClientProfile[];
  onSelectClient: (client: ClientProfile) => void;
  services: Service[];
  professionals: Professional[];
  appointments: Appointment[];
  onRefreshData: () => void;
  onBackToPublic: () => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  currentClient,
  clients,
  onSelectClient,
  services,
  professionals,
  appointments,
  onRefreshData,
  onBackToPublic,
}) => {
  const [activeTab, setActiveTab] = useState<ClientTab>('agendamentos');

  // Booking Wizard state
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedProId, setSelectedProId] = useState<string>(professionals[0]?.id || '');
  const [bookingDate, setBookingDate] = useState<string>('2026-11-04');
  const [bookingTime, setBookingTime] = useState<string>('14:00');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Profile Edit state
  const [editName, setEditName] = useState(currentClient.name);
  const [editPhone, setEditPhone] = useState(currentClient.phone);
  const [editPreferences, setEditPreferences] = useState(currentClient.preferences || '');
  const [editAllergies, setEditAllergies] = useState(currentClient.allergies || '');
  const [editDrink, setEditDrink] = useState(currentClient.favoriteDrink || '');
  const [saveProfileSuccess, setSaveProfileSuccess] = useState(false);

  // Chat in portal state
  const [chatInput, setChatInput] = useState('');

  // Filter client's appointments
  const myAppointments = appointments.filter(a => a.clientId === currentClient.id);
  const upcomingAppointments = myAppointments.filter(
    a => a.status === 'agendado' || a.status === 'confirmado' || a.status === 'em_atendimento'
  );
  const pastAppointments = myAppointments.filter(
    a => a.status === 'concluido' || a.status === 'cancelado'
  );

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedPro = professionals.find(p => p.id === selectedProId);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedPro) return;

    StorageService.addAppointment({
      clientId: currentClient.id,
      clientName: currentClient.name,
      clientPhone: currentClient.phone,
      clientAvatar: currentClient.avatarUrl,
      professionalId: selectedPro.id,
      professionalName: selectedPro.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date: bookingDate,
      time: bookingTime,
      durationMinutes: selectedService.durationMinutes,
      priceBRL: selectedService.priceBRL,
      status: 'confirmado',
      paymentMethod: 'pendente',
      notes: bookingNotes || 'Agendado pelo Portal Exclusivo da Cliente',
    });

    onRefreshData();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveTab('agendamentos');
      setBookingStep(1);
    }, 1800);
  };

  const handleCancelAppointment = (id: string) => {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      StorageService.updateAppointmentStatus(id, 'cancelado');
      onRefreshData();
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateClient(currentClient.id, {
      name: editName,
      phone: editPhone,
      preferences: editPreferences,
      allergies: editAllergies,
      favoriteDrink: editDrink,
    });
    onRefreshData();
    setSaveProfileSuccess(true);
    setTimeout(() => setSaveProfileSuccess(false), 2500);
  };

  const getVipBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Diamante':
        return 'from-cyan-400 via-sky-200 to-indigo-400 text-black';
      case 'Ouro':
        return 'from-[#d4af37] via-[#f3e5ab] to-[#aa8422] text-black';
      case 'Prata':
        return 'from-slate-200 via-slate-300 to-slate-400 text-black';
      default:
        return 'from-amber-700 via-amber-600 to-amber-800 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col">
      {/* Top Banner and Client Switcher */}
      <div className="relative bg-[#0d0d12] border-b border-white/[0.08]">
        {/* Customizable Banner Image */}
        <div className="h-36 sm:h-48 w-full relative overflow-hidden bg-[#14141c]">
          <img
            src={currentClient.bannerUrl || '/src/assets/images/hero_salon_luxury_interior_1793577409043.jpg'}
            alt="Banner de Capa"
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/40 to-transparent" />

          {/* Client Profile Selector (demo test switcher) */}
          <div className="absolute top-3 right-4 max-w-7xl mx-auto flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs z-10">
            <span className="text-neutral-400 hidden sm:inline">Perfil Ativo:</span>
            <select
              value={currentClient.id}
              onChange={e => {
                const found = clients.find(c => c.id === e.target.value);
                if (found) {
                  onSelectClient(found);
                  setEditName(found.name);
                  setEditPhone(found.phone);
                  setEditPreferences(found.preferences || '');
                  setEditAllergies(found.allergies || '');
                  setEditDrink(found.favoriteDrink || '');
                }
              }}
              className="bg-transparent text-[#f3e5ab] font-medium focus:outline-none cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-[#121216] text-white">
                  {c.name} ({c.vipTier})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 pb-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-2xl bg-[#1a1a24] shrink-0">
                <img
                  src={currentClient.avatarUrl}
                  alt={currentClient.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-3xl font-serif font-bold text-white">
                    {currentClient.name}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r shadow-sm ${getVipBadgeColor(
                      currentClient.vipTier
                    )}`}
                  >
                    VIP {currentClient.vipTier}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  {currentClient.phone} · Cliente desde {currentClient.createdAt}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#d4af37] pt-0.5">
                  <Sparkles size={13} />
                  <span>{currentClient.vipPoints} Pontos de Fidelidade Acumulados</span>
                </div>
              </div>
            </div>

            {/* Quick Action: New Appointment */}
            <div className="pt-2 sm:pt-0">
              <Button
                size="md"
                onClick={() => {
                  setActiveTab('novo');
                  setBookingStep(1);
                }}
                icon={<Plus size={16} />}
              >
                Novo Agendamento
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 border-b border-white/[0.08] overflow-x-auto">
            <button
              onClick={() => setActiveTab('agendamentos')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'agendamentos'
                  ? 'border-[#d4af37] text-[#f3e5ab]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar size={15} />
              <span>Meus Agendamentos ({upcomingAppointments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('novo')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'novo'
                  ? 'border-[#d4af37] text-[#f3e5ab]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Plus size={15} />
              <span>Agendar Horário</span>
            </button>

            <button
              onClick={() => setActiveTab('vip')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'vip'
                  ? 'border-[#d4af37] text-[#f3e5ab]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Crown size={15} />
              <span>Selo VIP & Benefícios</span>
            </button>

            <button
              onClick={() => setActiveTab('historico')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'historico'
                  ? 'border-[#d4af37] text-[#f3e5ab]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <History size={15} />
              <span>Histórico & Fórmulas</span>
            </button>

            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'perfil'
                  ? 'border-[#d4af37] text-[#f3e5ab]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <User size={15} />
              <span>Meu Perfil</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: MEUS AGENDAMENTOS */}
        {activeTab === 'agendamentos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-semibold text-white">
                  Próximos Atendimentos
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Acompanhe seus horários marcados e status em tempo real.
                </p>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setActiveTab('novo')}
                icon={<Plus size={14} />}
              >
                Agendar Novo
              </Button>
            </div>

            {upcomingAppointments.length === 0 ? (
              <Card className="text-center py-12">
                <Calendar size={36} className="mx-auto text-neutral-500 mb-3" />
                <h4 className="text-base font-semibold text-white">
                  Nenhum agendamento futuro
                </h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  Você não tem nenhum atendimento agendado no momento. Que tal reservar um ritual revigorante?
                </p>
                <div className="mt-5">
                  <Button onClick={() => setActiveTab('novo')}>
                    Escolher Serviço
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAppointments.map(apt => (
                  <Card
                    key={apt.id}
                    borderGold={apt.status === 'confirmado'}
                    padding="md"
                    className="flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37]">
                          {apt.serviceName}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                            apt.status === 'confirmado'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/50'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                          }`}
                        >
                          {apt.status === 'confirmado' ? 'Confirmado' : 'Aguardando'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                        <div className="p-2.5 bg-[#14141c] rounded-lg">
                          <span className="text-neutral-500 block text-[10px]">Data & Horário</span>
                          <span className="font-semibold text-white">
                            {apt.date.split('-').reverse().join('/')} às {apt.time}
                          </span>
                        </div>
                        <div className="p-2.5 bg-[#14141c] rounded-lg">
                          <span className="text-neutral-500 block text-[10px]">Profissional</span>
                          <span className="font-semibold text-white truncate block">
                            {apt.professionalName}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-neutral-400 flex items-center justify-between">
                        <span>Duração: ~{apt.durationMinutes} min</span>
                        <span className="font-mono font-semibold text-[#f3e5ab]">
                          R$ {apt.priceBRL.toFixed(2)}
                        </span>
                      </div>

                      {apt.notes && (
                        <p className="text-[11px] text-neutral-400 mt-2 bg-[#14141a] p-2 rounded border border-white/5">
                          Nota: {apt.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Cancelar Horário
                      </button>

                      <button
                        onClick={() => {
                          alert(`Para remarcar o horário do dia ${apt.date.split('-').reverse().join('/')}, fale diretamente com o concierge pelo chat online.`);
                        }}
                        className="text-xs text-[#d4af37] hover:underline"
                      >
                        Solicitar Remarcação
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: NOVO AGENDAMENTO WIZARD */}
        {activeTab === 'novo' && (
          <div className="max-w-3xl mx-auto">
            <Card padding="lg" borderGold className="space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                  Reserva Online Imediata
                </span>
                <h3 className="text-2xl font-serif font-normal text-white mt-1">
                  Agendar Novo Procedimento
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Ambiente de agendamento em tempo real do atelier Sra. Bela Mulher.
                </p>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-serif font-semibold text-white">
                    Agendamento Confirmado com Sucesso!
                  </h4>
                  <p className="text-xs text-neutral-300">
                    Seu horário foi inserido na agenda da profissional e sua confirmação foi gerada.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateAppointment} className="space-y-6">
                  {/* Step 1: Escolha do Serviço */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] block">
                      1. Selecione o Serviço Desejado
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                      {services.map(s => (
                        <div
                          key={s.id}
                          onClick={() => setSelectedServiceId(s.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedServiceId === s.id
                              ? 'bg-[#181824] border-[#d4af37] shadow-md shadow-[#d4af37]/15'
                              : 'bg-[#121217] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-white">{s.name}</span>
                            <span className="text-xs font-mono font-semibold text-[#f3e5ab]">
                              R$ {s.priceBRL.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{s.description}</p>
                          <span className="text-[10px] text-neutral-500 mt-2 block">Duração: ~{s.durationMinutes} min</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Escolha da Profissional */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] block">
                      2. Selecione a Especialista
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {professionals.map(p => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProId(p.id)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                            selectedProId === p.id
                              ? 'bg-[#181824] border-[#d4af37] shadow-md shadow-[#d4af37]/15'
                              : 'bg-[#121217] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/40"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-white block truncate">{p.name}</span>
                            <span className="text-[11px] text-[#d4af37] block truncate">{p.roleTitle}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Data e Hora */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] block mb-2">
                        3. Escolha a Data
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={e => setBookingDate(e.target.value)}
                        className="w-full bg-[#14141c] border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] block mb-2">
                        4. Horário Preferencial
                      </label>
                      <select
                        value={bookingTime}
                        onChange={e => setBookingTime(e.target.value)}
                        className="w-full bg-[#14141c] border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      >
                        <option value="09:00">09:00</option>
                        <option value="10:30">10:30</option>
                        <option value="12:00">12:00</option>
                        <option value="14:00">14:00</option>
                        <option value="15:30">15:30</option>
                        <option value="17:00">17:00</option>
                        <option value="18:30">18:30</option>
                      </select>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Alguma observação especial para a equipe? (Opcional)
                    </label>
                    <input
                      type="text"
                      value={bookingNotes}
                      onChange={e => setBookingNotes(e.target.value)}
                      placeholder="Ex: Gostaria de avaliação de cor prévia ou café expresso..."
                      className="w-full bg-[#14141c] border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  {/* Resumo & Confirmação */}
                  {selectedService && selectedPro && (
                    <div className="p-4 bg-[#14141d] rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Total Previsto:</span>
                        <span className="text-lg font-mono font-bold text-[#f3e5ab]">
                          R$ {selectedService.priceBRL.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        * Pagamento realizado com tranquilidade no salão após a finalização do seu atendimento.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('agendamentos')}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" size="lg" icon={<CheckCircle2 size={16} />}>
                      Confirmar Reserva Agora
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        )}

        {/* TAB 3: SELO VIP & VANTAGENS */}
        {activeTab === 'vip' && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* VIP Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a24] via-[#14141c] to-[#0d0d12] border-2 border-[#d4af37]/60 p-6 sm:p-8 shadow-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs tracking-[0.2em] uppercase text-[#d4af37] font-semibold">
                      Programa de Alta Fidelidade
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                      Selo VIP {currentClient.vipTier}
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1">
                      Membro exclusiva · Acesso a privilégios e experiências sob medida
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8d7122] flex items-center justify-center text-black font-bold shadow-lg shadow-[#d4af37]/30">
                    <Crown size={28} />
                  </div>
                </div>

                {/* Points and Progress */}
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-neutral-400">Pontos Acumulados</span>
                    <div className="text-3xl font-serif font-bold text-[#f3e5ab] mt-0.5">
                      {currentClient.vipPoints} pts
                    </div>
                    <span className="text-[11px] text-[#d4af37]">Equivale a R$ {(currentClient.vipPoints * 0.1).toFixed(2)} em créditos</span>
                  </div>

                  <div>
                    <span className="text-xs text-neutral-400">Próxima Categoria</span>
                    <div className="text-sm font-semibold text-white mt-1">
                      VIP Diamante (requer 5.000 pts)
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] h-full rounded-full"
                        style={{ width: `${Math.min(100, (currentClient.vipPoints / 5000) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Perks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card padding="md" className="border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center mb-3">
                    <Coffee size={16} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Menu Gourmet Cortesia</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Degustação de espumante gelado, cafés visagistas especiais e pâtisserie fina em toda visita.
                  </p>
                </Card>

                <Card padding="md" className="border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center mb-3">
                    <Calendar size={16} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Prioridade de Agenda aos Sábados</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Reserva antecipada garantida mesmo nos horários mais concorridos de fim de semana.
                  </p>
                </Card>

                <Card padding="md" className="border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center mb-3">
                    <Sparkles size={16} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">10% de Cashback em Pontos</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Cada serviço realizado acumula créditos para abater em novos tratamentos ou produtos da boutique.
                  </p>
                </Card>

                <Card padding="md" className="border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center mb-3">
                    <Crown size={16} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Suíte Privativa & Lavatório Zen</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Atendimento reservado para reuniões telefônicas com privacidade e cromoterapia no lavatório.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HISTÓRICO & FÓRMULAS */}
        {activeTab === 'historico' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-serif font-semibold text-white">
                Ficha Técnica & Histórico de Procedimentos
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Segurança e precisão: registro exato de tons, misturas e químicas já realizadas no salão.
              </p>
            </div>

            {/* Formula Record Card */}
            <Card borderGold padding="md" className="bg-[#121218]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#d4af37] uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                <span>Minha Fórmula Capilar Registrada</span>
              </div>
              <p className="text-sm font-mono text-[#f3e5ab] bg-[#0c0c10] p-3 rounded-lg border border-white/10">
                {currentClient.formulaNote || 'Nenhuma fórmula química registrada até o momento.'}
              </p>
              <div className="flex items-center justify-between text-xs text-neutral-400 mt-3 pt-2 border-t border-white/5">
                <span>Última atualização registrada pela especialista Juliana Montenegro</span>
                <span className="text-[#d4af37]">Garantia de Fidelidade de Cor</span>
              </div>
            </Card>

            {/* Past Appointments List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">
                Atendimentos Passados
              </h3>

              {pastAppointments.length === 0 ? (
                <Card className="text-center py-8 text-neutral-400 text-xs">
                  Nenhum atendimento anterior registrado.
                </Card>
              ) : (
                pastAppointments.map(a => (
                  <Card key={a.id} padding="md" className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-white">{a.serviceName}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Realizado em {a.date.split('-').reverse().join('/')} com {a.professionalName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-semibold text-[#f3e5ab]">
                        R$ {a.priceBRL.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-emerald-400 uppercase font-medium">
                        Concluído
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: MEU PERFIL PERSONALIZÁVEL */}
        {activeTab === 'perfil' && (
          <div className="max-w-2xl mx-auto">
            <Card padding="lg" borderGold className="space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <h3 className="text-2xl font-serif font-normal text-white">
                  Personalização de Perfil & Preferências
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Configure suas preferências para que a equipe recepcione você de forma única a cada visita.
                </p>
              </div>

              {saveProfileSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Perfil e preferências atualizados com sucesso!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    WhatsApp para Confirmação de Horários
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Bebida & Mimo Favorito no Atelier
                  </label>
                  <input
                    type="text"
                    value={editDrink}
                    onChange={e => setEditDrink(e.target.value)}
                    placeholder="Ex: Espumante brut gelado, café espresso com canela..."
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Alergias ou Restrições a Cosméticos
                  </label>
                  <input
                    type="text"
                    value={editAllergies}
                    onChange={e => setEditAllergies(e.target.value)}
                    placeholder="Ex: Sensibilidade a amônia, fragrâncias fortes..."
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Preferências Gerais de Atendimento
                  </label>
                  <textarea
                    rows={3}
                    value={editPreferences}
                    onChange={e => setEditPreferences(e.target.value)}
                    placeholder="Ex: Prefere lavatório silencioso, revistas de arquitetura..."
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <Button type="submit" size="md" icon={<Save size={15} />}>
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};
