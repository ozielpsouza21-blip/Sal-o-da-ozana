import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  CheckCircle,
  Play,
  XCircle,
  User,
  Scissors,
  CheckCheck,
} from 'lucide-react';
import { Appointment, AppointmentStatus, ClientProfile, Professional, Service } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';

interface ScheduleModuleProps {
  appointments: Appointment[];
  professionals: Professional[];
  services: Service[];
  clients: ClientProfile[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onOpenNewAppointment: () => void;
}

export const ScheduleModule: React.FC<ScheduleModuleProps> = ({
  appointments,
  professionals,
  services,
  clients,
  onUpdateStatus,
  onOpenNewAppointment,
}) => {
  const [selectedProFilter, setSelectedProFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('2026-11-02');

  const filteredAppointments = appointments.filter(a => {
    if (selectedProFilter !== 'all' && a.professionalId !== selectedProFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (dateFilter && a.date !== dateFilter) return false;
    return true;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmado':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/50">Confirmado</span>;
      case 'em_atendimento':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-black">Na Cadeira</span>;
      case 'concluido':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-950 text-sky-400">Concluído</span>;
      case 'cancelado':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-400">Cancelado</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-800 text-neutral-300">Agendado</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-white">
            Agenda Geral & Escalas do Atelier
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gerencie os horários de todas as bancadas e especialistas em tempo real.
          </p>
        </div>

        <Button onClick={onOpenNewAppointment} icon={<Plus size={16} />}>
          Novo Agendamento
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[#121217] border border-white/10 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-neutral-400 block mb-1 font-medium">Filtrar por Data:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="w-full bg-[#181822] border border-white/10 rounded-lg p-2 text-white focus:border-[#d4af37] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-neutral-400 block mb-1 font-medium">Profissional:</label>
          <select
            value={selectedProFilter}
            onChange={e => setSelectedProFilter(e.target.value)}
            className="w-full bg-[#181822] border border-white/10 rounded-lg p-2 text-white focus:border-[#d4af37] focus:outline-none"
          >
            <option value="all">Todas as Especialistas</option>
            {professionals.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.roleTitle.split('&')[0]})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-neutral-400 block mb-1 font-medium">Status do Atendimento:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-[#181822] border border-white/10 rounded-lg p-2 text-white focus:border-[#d4af37] focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="agendado">Apenas Agendados</option>
            <option value="confirmado">Apenas Confirmados</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="concluido">Concluídos</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Appointments List / Grid */}
      {filteredAppointments.length === 0 ? (
        <Card className="text-center py-12 text-neutral-400 text-xs">
          <CalendarIcon size={36} className="mx-auto text-neutral-600 mb-2" />
          <p>Nenhum agendamento encontrado para os filtros selecionados.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map(apt => (
            <Card
              key={apt.id}
              padding="md"
              borderGold={apt.status === 'em_atendimento'}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              {/* Left Info */}
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-[#161622] border border-white/10 flex flex-col items-center justify-center font-mono shrink-0">
                  <span className="font-bold text-[#f3e5ab] text-sm">{apt.time}</span>
                  <span className="text-[10px] text-neutral-500">{apt.durationMinutes}m</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{apt.clientName}</span>
                    {getStatusBadge(apt.status)}
                  </div>
                  <div className="text-[#d4af37] font-medium">{apt.serviceName}</div>
                  <div className="text-neutral-400 text-[11px]">
                    Especialista: <strong className="text-white">{apt.professionalName}</strong> · Tel: {apt.clientPhone}
                  </div>
                  {apt.notes && (
                    <div className="text-[11px] text-neutral-400 bg-[#14141a] p-1.5 rounded border border-white/5">
                      {apt.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 justify-end">
                <span className="font-mono text-base font-semibold text-[#f3e5ab] mr-3">
                  R$ {apt.priceBRL.toFixed(2)}
                </span>

                {apt.status === 'agendado' && (
                  <button
                    onClick={() => onUpdateStatus(apt.id, 'confirmado')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-700/50 flex items-center gap-1 font-medium"
                  >
                    <CheckCircle size={13} />
                    <span>Confirmar</span>
                  </button>
                )}

                {apt.status === 'confirmado' && (
                  <button
                    onClick={() => onUpdateStatus(apt.id, 'em_atendimento')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1 font-semibold"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Iniciar Atendimento</span>
                  </button>
                )}

                {apt.status === 'em_atendimento' && (
                  <button
                    onClick={() => onUpdateStatus(apt.id, 'concluido')}
                    className="px-3 py-1.5 rounded-lg bg-[#d4af37] hover:brightness-110 text-black flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck size={14} />
                    <span>Concluir</span>
                  </button>
                )}

                {apt.status !== 'cancelado' && apt.status !== 'concluido' && (
                  <button
                    onClick={() => onUpdateStatus(apt.id, 'cancelado')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#181822] hover:bg-red-950 text-neutral-400 hover:text-red-300 border border-white/10"
                    title="Cancelar agendamento"
                  >
                    <XCircle size={14} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
