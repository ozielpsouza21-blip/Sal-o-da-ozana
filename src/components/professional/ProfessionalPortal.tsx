import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Scissors,
  CheckCircle,
  Play,
  ArrowLeft,
  FileText,
  Star,
  Sparkles,
  Phone,
  MessageSquare,
  Shield,
  Send,
  LogOut,
} from 'lucide-react';
import { Appointment, Professional, ProfessionalTab } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { StorageService } from '../../services/storage';

interface ProfessionalPortalProps {
  currentPro: Professional;
  professionals: Professional[];
  onSelectPro: (pro: Professional) => void;
  appointments: Appointment[];
  onRefreshData: () => void;
  onBackToPublic: () => void;
}

export const ProfessionalPortal: React.FC<ProfessionalPortalProps> = ({
  currentPro,
  professionals,
  onSelectPro,
  appointments,
  onRefreshData,
  onBackToPublic,
}) => {
  const [activeTab, setActiveTab] = useState<ProfessionalTab>('agenda');
  const [selectedAptForNotes, setSelectedAptForNotes] = useState<Appointment | null>(null);
  const [formulaInput, setFormulaInput] = useState<string>('');

  // Internal chat state
  const [internalChatText, setInternalChatText] = useState('');
  const [internalMessages, setInternalMessages] = useState<Array<{ id: string; sender: string; text: string; time: string }>>([
    {
      id: 'im-1',
      sender: 'Recepção',
      text: 'Olá Juliana! A cliente Isabela Rossi acabou de chegar na recepção e já está sendo servida com o espresso com canela.',
      time: '09:50',
    },
    {
      id: 'im-2',
      sender: 'Você (Juliana)',
      text: 'Obrigada! A bancada já está pronta, pode encaminhá-la para a cadeira 1 em 5 minutos.',
      time: '09:52',
    },
  ]);

  // Appointments for this professional
  const myAppointments = appointments.filter(a => a.professionalId === currentPro.id);
  const activeQueue = myAppointments.filter(a => a.status !== 'cancelado');

  // Commissions summary
  const completedApts = myAppointments.filter(a => a.status === 'concluido');
  const totalProducedBRL = completedApts.reduce((acc, curr) => acc + curr.priceBRL, 0);
  const commissionEarnedBRL = (totalProducedBRL * currentPro.commissionRate) / 100;

  const handleStartService = (aptId: string) => {
    StorageService.updateAppointmentStatus(aptId, 'em_atendimento');
    onRefreshData();
  };

  const handleFinishService = (apt: Appointment) => {
    setSelectedAptForNotes(apt);
    setFormulaInput(apt.formulaRecord || '');
  };

  const handleConfirmFinish = () => {
    if (!selectedAptForNotes) return;
    StorageService.updateAppointmentStatus(selectedAptForNotes.id, 'concluido', formulaInput);
    onRefreshData();
    setSelectedAptForNotes(null);
  };

  const handleSendInternalChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalChatText.trim()) return;

    const newMsg = {
      id: `im-${Date.now()}`,
      sender: `Você (${currentPro.name.split(' ')[0]})`,
      text: internalChatText.trim(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setInternalMessages(prev => [...prev, newMsg]);
    setInternalChatText('');
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col">
      {/* Top Header Strip */}
      <div className="bg-[#0e0e13] border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#d4af37]/50 shadow-md shrink-0">
              <img
                src={currentPro.avatarUrl}
                alt={currentPro.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif font-bold text-white">
                  {currentPro.name}
                </h1>
                <span className="text-[10px] font-semibold text-[#d4af37] bg-[#d4af37]/15 px-2 py-0.5 rounded-full border border-[#d4af37]/30">
                  Comissão {currentPro.commissionRate}%
                </span>
              </div>
              <p className="text-xs text-neutral-400">{currentPro.roleTitle}</p>
            </div>
          </div>

          {/* Switch Active Professional & Sair */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-[#14141c] px-3 py-1.5 rounded-lg border border-white/10 text-xs">
              <span className="text-neutral-400">Trocar Especialista:</span>
              <select
                value={currentPro.id}
                onChange={e => {
                  const found = professionals.find(p => p.id === e.target.value);
                  if (found) onSelectPro(found);
                }}
                className="bg-transparent text-[#f3e5ab] font-medium focus:outline-none cursor-pointer"
              >
                {professionals.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#121216] text-white">
                    {p.name} ({p.roleTitle.split('&')[0]})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onBackToPublic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#14141c] hover:bg-[#1a1a26] text-red-400 border border-red-500/20 transition-colors cursor-pointer"
              title="Encerrar sessão e retornar à tela pública"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-5 border-t border-white/[0.06] pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'agenda'
                ? 'bg-[#181822] text-[#f3e5ab] border border-[#d4af37]/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar size={14} />
            <span>Minha Agenda ({activeQueue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comissoes')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'comissoes'
                ? 'bg-[#181822] text-[#f3e5ab] border border-[#d4af37]/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <DollarSign size={14} />
            <span>Minhas Comissões</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-[#181822] text-[#f3e5ab] border border-[#d4af37]/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare size={14} />
            <span>Chat com Recepção</span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'perfil'
                ? 'bg-[#181822] text-[#f3e5ab] border border-[#d4af37]/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User size={14} />
            <span>Ficha & Avaliações</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: AGENDA INDIVIDUAL */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-semibold text-white">
                  Fila de Atendimentos
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Controle o fluxo dos seus atendimentos na cadeira em tempo real.
                </p>
              </div>

              <div className="text-xs text-[#d4af37] font-medium bg-[#14141c] px-3 py-1.5 rounded-lg border border-white/10">
                {activeQueue.length} cliente(s) agendados hoje
              </div>
            </div>

            {activeQueue.length === 0 ? (
              <Card className="text-center py-12 text-neutral-400 text-xs">
                Nenhum atendimento na fila no momento para esta profissional.
              </Card>
            ) : (
              <div className="space-y-4">
                {activeQueue.map(apt => (
                  <Card
                    key={apt.id}
                    borderGold={apt.status === 'em_atendimento'}
                    padding="md"
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#181822] border border-white/10 flex flex-col items-center justify-center font-mono shrink-0">
                        <span className="text-xs font-bold text-[#f3e5ab]">{apt.time}</span>
                        <span className="text-[10px] text-neutral-500">{apt.durationMinutes}m</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-white">{apt.clientName}</h4>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              apt.status === 'em_atendimento'
                                ? 'bg-amber-500 text-black font-semibold'
                                : apt.status === 'confirmado'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                                : 'bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {apt.status === 'em_atendimento'
                              ? 'Na Cadeira'
                              : apt.status === 'confirmado'
                              ? 'Confirmado'
                              : 'Agendado'}
                          </span>
                        </div>
                        <p className="text-xs text-[#d4af37] font-medium">{apt.serviceName}</p>
                        <p className="text-xs text-neutral-400">
                          Data: {apt.date.split('-').reverse().join('/')} · Tel: {apt.clientPhone}
                        </p>
                        {apt.notes && (
                          <p className="text-[11px] text-neutral-400 bg-[#14141a] p-1.5 rounded border border-white/5">
                            Preferência: {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 justify-end">
                      <div className="text-right mr-3 hidden sm:block">
                        <span className="text-[10px] text-neutral-500 block uppercase">Comissão Estimada</span>
                        <span className="text-sm font-mono font-semibold text-[#f3e5ab]">
                          R$ {((apt.priceBRL * currentPro.commissionRate) / 100).toFixed(2)}
                        </span>
                      </div>

                      {apt.status !== 'em_atendimento' && apt.status !== 'concluido' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStartService(apt.id)}
                          icon={<Play size={13} />}
                        >
                          Iniciar Atendimento
                        </Button>
                      )}

                      {apt.status === 'em_atendimento' && (
                        <Button
                          size="sm"
                          onClick={() => handleFinishService(apt)}
                          icon={<CheckCircle size={14} />}
                        >
                          Concluir & Ficha
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMISSÕES */}
        {activeTab === 'comissoes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card padding="md" className="border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-medium">
                  Taxa de Repasse
                </span>
                <div className="text-3xl font-mono font-bold text-white mt-1">
                  {currentPro.commissionRate}%
                </div>
                <span className="text-xs text-neutral-500 mt-1 block">Contrato Profissional Parceiro</span>
              </Card>

              <Card padding="md" className="border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-medium">
                  Produção Bruta (Concluídos)
                </span>
                <div className="text-3xl font-mono font-bold text-white mt-1">
                  R$ {totalProducedBRL.toFixed(2)}
                </div>
                <span className="text-xs text-neutral-500 mt-1 block">{completedApts.length} atendimento(s) finalizados</span>
              </Card>

              <Card padding="md" borderGold className="bg-[#121219]">
                <span className="text-[11px] uppercase tracking-wider text-[#d4af37] block font-medium">
                  Comissão Líquida a Receber
                </span>
                <div className="text-3xl font-mono font-bold text-[#f3e5ab] mt-1">
                  R$ {commissionEarnedBRL.toFixed(2)}
                </div>
                <span className="text-xs text-emerald-400 mt-1 block">Cálculo exato de repasse</span>
              </Card>
            </div>

            <Card padding="md" className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Extrato de Atendimentos Faturados
              </h3>
              {completedApts.length === 0 ? (
                <div className="text-xs text-neutral-500 py-4 text-center">
                  Nenhum atendimento concluído registrado no período atual.
                </div>
              ) : (
                <div className="space-y-2">
                  {completedApts.map(c => (
                    <div
                      key={c.id}
                      className="p-3 bg-[#14141c] rounded-lg border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">{c.clientName}</span>
                        <span className="text-neutral-400 text-[11px]">{c.serviceName} · {c.date.split('-').reverse().join('/')}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[#f3e5ab] block font-semibold">
                          + R$ {((c.priceBRL * currentPro.commissionRate) / 100).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          Total bruto: R$ {c.priceBRL.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 3: CHAT INTERNO COM A RECEPÇÃO */}
        {activeTab === 'chat' && (
          <div className="max-w-2xl mx-auto">
            <Card padding="lg" borderGold className="space-y-4">
              <div>
                <h3 className="text-lg font-serif font-semibold text-white">
                  Intercomunicador com a Recepção
                </h3>
                <p className="text-xs text-neutral-400">
                  Comunique avisos de chegada de clientes, reposição de produtos ou suporte na bancada.
                </p>
              </div>

              {/* Chat messages */}
              <div className="h-64 overflow-y-auto bg-[#0b0b0e] p-4 rounded-xl space-y-3 border border-white/5">
                {internalMessages.map(msg => (
                  <div key={msg.id} className="text-xs">
                    <div className="text-[10px] text-neutral-500 mb-0.5">{msg.sender} · {msg.time}</div>
                    <div className="bg-[#181822] text-neutral-200 p-2.5 rounded-lg border border-white/10">
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Send box */}
              <form onSubmit={handleSendInternalChat} className="flex gap-2">
                <input
                  type="text"
                  value={internalChatText}
                  onChange={e => setInternalChatText(e.target.value)}
                  placeholder="Avisar recepção sobre cadeira livre ou pedido..."
                  className="flex-1 bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
                <Button type="submit" size="sm" icon={<Send size={14} />}>
                  Enviar
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* TAB 4: PERFIL & AVALIAÇÕES */}
        {activeTab === 'perfil' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card padding="lg" borderGold className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={currentPro.avatarUrl}
                  alt={currentPro.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#d4af37]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">{currentPro.name}</h3>
                  <p className="text-xs text-[#d4af37] font-medium">{currentPro.roleTitle}</p>
                  <div className="flex items-center gap-1 text-xs text-amber-300 mt-1">
                    <Star size={13} fill="currentColor" />
                    <span className="font-bold">{currentPro.rating.toFixed(2)}</span>
                    <span className="text-neutral-400">({currentPro.reviewsCount} avaliações 5 estrelas)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-3 text-xs">
                <div>
                  <span className="text-neutral-400 font-medium block">Biografia Profissional:</span>
                  <p className="text-neutral-200 mt-1 leading-relaxed">{currentPro.bio}</p>
                </div>

                <div>
                  <span className="text-neutral-400 font-medium block">Especialidades Certificadas:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {currentPro.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-[#181822] text-[#f3e5ab] border border-white/10 text-[11px]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-neutral-400 font-medium block">Contatos de Trabalho:</span>
                  <p className="text-neutral-300 mt-1">
                    {currentPro.phone} · {currentPro.email}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* MODAL: CONCLUIR ATENDIMENTO & REGISTRAR FÓRMULA */}
      {selectedAptForNotes && (
        <Modal
          isOpen={Boolean(selectedAptForNotes)}
          onClose={() => setSelectedAptForNotes(null)}
          title="Concluir Atendimento & Registrar Ficha"
          subtitle={`Cliente: ${selectedAptForNotes.clientName} · ${selectedAptForNotes.serviceName}`}
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setSelectedAptForNotes(null)}
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirmFinish}
                icon={<CheckCircle size={15} />}
              >
                Confirmar Conclusão
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-neutral-300">
              Ao concluir o atendimento, o serviço será marcado como realizado e entrará no fechamento financeiro do dia.
            </p>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] block mb-1">
                Fórmula / Detalhes Químicos (Opcional)
              </label>
              <textarea
                rows={3}
                value={formulaInput}
                onChange={e => setFormulaInput(e.target.value)}
                placeholder="Ex: Tonalizante 8.31 com 7.13 raiz esfumada, 10 vol, tempo de pausa 25min..."
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Essa fórmula ficará salva na ficha técnica da cliente para os próximos atendimentos.
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
