import React from 'react';
import {
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  Scissors,
} from 'lucide-react';
import { Appointment, CashRegisterStatus, ClientProfile, Professional, Service } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';

interface OverviewModuleProps {
  appointments: Appointment[];
  clients: ClientProfile[];
  professionals: Professional[];
  services: Service[];
  cashStatus: CashRegisterStatus;
  onNavigateToModule: (module: string) => void;
  onUpdateAptStatus: (id: string, status: any) => void;
  onOpenNewAppointment: () => void;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({
  appointments,
  clients,
  professionals,
  services,
  cashStatus,
  onNavigateToModule,
  onUpdateAptStatus,
  onOpenNewAppointment,
}) => {
  const todayApts = appointments.filter(a => a.status !== 'cancelado');
  const projectedRevenueBRL = todayApts.reduce((acc, curr) => acc + curr.priceBRL, 0);
  const avgTicketBRL = todayApts.length > 0 ? projectedRevenueBRL / todayApts.length : 0;
  const vipClientsCount = clients.filter(c => c.vipTier === 'Ouro' || c.vipTier === 'Diamante').length;

  return (
    <div className="space-y-8">
      {/* Simulation Disclaimer Banner */}
      <div className="p-3.5 bg-[#14141d] border border-[#d4af37]/30 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 text-neutral-300">
          <Sparkles size={16} className="text-[#d4af37] shrink-0" />
          <span>
            <strong>Ambiente Operacional do Salão</strong>: Métricas e demonstrativos para suporte à tomada de decisão executiva.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-neutral-400">Caixa {cashStatus.isOpen ? 'Aberto' : 'Fechado'}</span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card padding="md" className="border border-white/10 hover:border-[#d4af37]/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Atendimentos do Dia</span>
            <Calendar size={16} className="text-[#d4af37]" />
          </div>
          <div className="text-3xl font-serif font-bold text-white mt-2 font-mono tabular-nums">
            {todayApts.length}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {todayApts.filter(a => a.status === 'confirmado').length} confirmados · {todayApts.filter(a => a.status === 'concluido').length} finalizados
          </span>
        </Card>

        {/* Metric 2 */}
        <Card padding="md" className="border border-white/10 hover:border-[#d4af37]/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Faturamento Previsto</span>
            <DollarSign size={16} className="text-[#d4af37]" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#f3e5ab] mt-2 font-mono tabular-nums">
            R$ {projectedRevenueBRL.toFixed(2)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Em caixa atual: R$ {cashStatus.currentBalanceBRL.toFixed(2)}
          </span>
        </Card>

        {/* Metric 3 */}
        <Card padding="md" className="border border-white/10 hover:border-[#d4af37]/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Ticket Médio</span>
            <TrendingUp size={16} className="text-[#d4af37]" />
          </div>
          <div className="text-3xl font-serif font-bold text-white mt-2 font-mono tabular-nums">
            R$ {avgTicketBRL.toFixed(2)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Média por procedimento realizado
          </span>
        </Card>

        {/* Metric 4 */}
        <Card padding="md" className="border border-white/10 hover:border-[#d4af37]/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Clientes de Alto Valor (VIP)</span>
            <Users size={16} className="text-[#d4af37]" />
          </div>
          <div className="text-3xl font-serif font-bold text-white mt-2 font-mono tabular-nums">
            {vipClientsCount}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Clientes Ouro e Diamante ativos
          </span>
        </Card>
      </div>

      {/* Main Grid: Agenda do Dia + Status do Caixa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Hoje na Agenda */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-semibold text-white">
                Próximos Clientes do Dia
              </h3>
              <p className="text-xs text-neutral-400">
                Acompanhamento e alteração de status imediata.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={onOpenNewAppointment}
              >
                + Agendar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigateToModule('agenda')}
              >
                Ver Agenda Completa
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {todayApts.length === 0 ? (
              <Card className="text-center py-10 text-neutral-500 text-xs">
                Nenhum agendamento para hoje.
              </Card>
            ) : (
              todayApts.map(apt => (
                <Card
                  key={apt.id}
                  padding="md"
                  borderGold={apt.status === 'em_atendimento'}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#181822] border border-white/10 flex flex-col items-center justify-center font-mono shrink-0">
                      <span className="font-bold text-[#f3e5ab] text-xs">{apt.time}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{apt.clientName}</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            apt.status === 'em_atendimento'
                              ? 'bg-amber-400 text-black'
                              : apt.status === 'confirmado'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                              : apt.status === 'concluido'
                              ? 'bg-sky-950 text-sky-400'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {apt.status === 'em_atendimento'
                            ? 'Atendendo'
                            : apt.status === 'confirmado'
                            ? 'Confirmado'
                            : apt.status === 'concluido'
                            ? 'Concluído'
                            : 'Agendado'}
                        </span>
                      </div>
                      <div className="text-neutral-400 text-[11px] mt-0.5">
                        {apt.serviceName} · Especialista: <strong className="text-neutral-200">{apt.professionalName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="font-mono text-[#f3e5ab] font-semibold mr-2">
                      R$ {apt.priceBRL.toFixed(2)}
                    </span>

                    {apt.status === 'agendado' && (
                      <button
                        onClick={() => onUpdateAptStatus(apt.id, 'confirmado')}
                        className="px-2.5 py-1 rounded bg-[#181822] hover:bg-[#20202c] text-emerald-400 border border-emerald-800/40 text-[11px]"
                      >
                        Confirmar
                      </button>
                    )}

                    {apt.status === 'confirmado' && (
                      <button
                        onClick={() => onUpdateAptStatus(apt.id, 'em_atendimento')}
                        className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px]"
                      >
                        Iniciar
                      </button>
                    )}

                    {apt.status === 'em_atendimento' && (
                      <button
                        onClick={() => onUpdateAptStatus(apt.id, 'concluido')}
                        className="px-2.5 py-1 rounded bg-emerald-500 text-black font-semibold text-[11px]"
                      >
                        Concluir
                      </button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Col 3: Resumo do Caixa & Ações Rápidas */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-semibold text-white">
            Situação do Caixa
          </h3>

          <Card padding="md" borderGold className="space-y-4 bg-[#121218]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Saldo Atual em Dinheiro</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                {cashStatus.isOpen ? 'Caixa Aberto' : 'Fechado'}
              </span>
            </div>

            <div className="text-3xl font-mono font-bold text-[#f3e5ab]">
              R$ {cashStatus.currentBalanceBRL.toFixed(2)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
              <div>
                <span className="text-[10px] text-neutral-500 block">Total Entradas</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  + R$ {cashStatus.totalEntradas.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">Total Saídas</span>
                <span className="font-mono text-red-400 font-semibold">
                  - R$ {cashStatus.totalSaidas.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => onNavigateToModule('caixa')}
              >
                Gerenciar Caixa & Lançamentos
              </Button>
            </div>
          </Card>

          {/* Quick Shortcuts */}
          <Card padding="md" className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-2">
              Atalhos de Gestão
            </h4>

            <button
              onClick={() => onNavigateToModule('clientes')}
              className="w-full p-2.5 rounded-lg bg-[#14141c] hover:bg-[#1a1a24] text-xs text-neutral-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#d4af37]" />
                <span>Base de Clientes & Fórmulas</span>
              </div>
              <ArrowRight size={14} className="text-neutral-500" />
            </button>

            <button
              onClick={() => onNavigateToModule('produtos')}
              className="w-full p-2.5 rounded-lg bg-[#14141c] hover:bg-[#1a1a24] text-xs text-neutral-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#d4af37]" />
                <span>Estoque de Home Care</span>
              </div>
              <ArrowRight size={14} className="text-neutral-500" />
            </button>

            <button
              onClick={() => onNavigateToModule('personalizacao')}
              className="w-full p-2.5 rounded-lg bg-[#14141c] hover:bg-[#1a1a24] text-xs text-neutral-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#d4af37]" />
                <span>Personalizar Cores & Identidade</span>
              </div>
              <ArrowRight size={14} className="text-neutral-500" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};
