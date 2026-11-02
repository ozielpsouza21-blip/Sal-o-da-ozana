/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppRole,
  PublicTab,
  Appointment,
  ClientProfile,
  Professional,
  Service,
  Product,
  CashRegisterStatus,
  CashTransaction,
  Conversation,
  ThemeConfig,
} from './types';
import { StorageService } from './services/storage';

// Common Components
import { Header } from './components/common/Header';
import { FloatingChat } from './components/common/FloatingChat';
import { Modal } from './components/common/Modal';
import { Button } from './components/common/Button';

// Main Views
import { PublicHomePage } from './components/public/PublicHomePage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClientPortal } from './components/client/ClientPortal';
import { ProfessionalPortal } from './components/professional/ProfessionalPortal';
import { Calendar, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<AppRole>('visitor');
  const [publicTab, setPublicTab] = useState<PublicTab>('home');

  // Core Data loaded from persistent storage
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cashStatus, setCashStatus] = useState<CashRegisterStatus>(StorageService.getCashStatus());
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(StorageService.getTheme());

  // Active client & professional in session
  const [activeClient, setActiveClient] = useState<ClientProfile | null>(null);
  const [activePro, setActivePro] = useState<Professional | null>(null);

  // Global Quick Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState<string>('');
  const [bookingProId, setBookingProId] = useState<string>('');
  const [bookingClientName, setBookingClientName] = useState<string>('');
  const [bookingClientPhone, setBookingClientPhone] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('2026-11-04');
  const [bookingTime, setBookingTime] = useState<string>('15:00');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const loadAllData = () => {
    const s = StorageService.getServices();
    const p = StorageService.getProfessionals();
    const c = StorageService.getClients();
    const prd = StorageService.getProducts();
    const a = StorageService.getAppointments();
    const cs = StorageService.getCashStatus();
    const tx = StorageService.getTransactions();
    const conv = StorageService.getConversations();
    const th = StorageService.getTheme();

    setServices(s);
    setProfessionals(p);
    setClients(c);
    setProducts(prd);
    setAppointments(a);
    setCashStatus(cs);
    setTransactions(tx);
    setConversations(conv);
    setThemeConfig(th);

    // Default active client & professional if none set
    if (!activeClient && c.length > 0) setActiveClient(c[0]);
    if (!activePro && p.length > 0) setActivePro(p[0]);

    // Apply CSS variables on load
    StorageService.saveTheme(th);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleOpenBooking = (serviceId?: string, professionalId?: string) => {
    setBookingServiceId(serviceId || services[0]?.id || '');
    setBookingProId(professionalId || professionals[0]?.id || '');
    setBookingConfirmed(false);
    setIsBookingModalOpen(true);
  };

  const handleConfirmPublicBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === bookingServiceId) || services[0];
    const pro = professionals.find(p => p.id === bookingProId) || professionals[0];
    const name = bookingClientName.trim() || 'Visitante Convidada';
    const phone = bookingClientPhone.trim() || '(11) 98765-4321';

    StorageService.addAppointment({
      clientId: `guest-${Date.now()}`,
      clientName: name,
      clientPhone: phone,
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      professionalId: pro.id,
      professionalName: pro.name,
      serviceId: service.id,
      serviceName: service.name,
      date: bookingDate,
      time: bookingTime,
      durationMinutes: service.durationMinutes,
      priceBRL: service.priceBRL,
      status: 'confirmado',
      paymentMethod: 'pendente',
      notes: 'Reserva efetuada pelo canal público de agendamento online.',
    });

    loadAllData();
    setBookingConfirmed(true);
    setTimeout(() => {
      setIsBookingModalOpen(false);
      setBookingConfirmed(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#f3e5ab]">
      {/* Top Header shown only on Public view to maintain top bar contract */}
      {role === 'visitor' && (
        <Header
          currentRole={role}
          onSelectRole={newRole => setRole(newRole)}
          activePublicTab={publicTab}
          onSelectPublicTab={tab => setPublicTab(tab)}
          onOpenBookingModal={() => handleOpenBooking()}
        />
      )}

      {/* Role View Router */}
      {role === 'visitor' && (
        <PublicHomePage
          services={services}
          products={products}
          professionals={professionals}
          activeTab={publicTab}
          onSelectTab={tab => setPublicTab(tab)}
          onSelectRole={newRole => setRole(newRole)}
          onOpenBookingModal={handleOpenBooking}
          show3dParticles={themeConfig.show3dParticles}
        />
      )}

      {role === 'admin' && (
        <AdminDashboard
          services={services}
          professionals={professionals}
          clients={clients}
          products={products}
          appointments={appointments}
          cashStatus={cashStatus}
          transactions={transactions}
          conversations={conversations}
          themeConfig={themeConfig}
          onRefreshData={loadAllData}
          onBackToPublic={() => setRole('visitor')}
          onSwitchRole={newRole => setRole(newRole)}
        />
      )}

      {role === 'client' && activeClient && (
        <ClientPortal
          currentClient={activeClient}
          clients={clients}
          onSelectClient={c => setActiveClient(c)}
          services={services}
          professionals={professionals}
          appointments={appointments}
          onRefreshData={loadAllData}
          onBackToPublic={() => setRole('visitor')}
        />
      )}

      {role === 'professional' && activePro && (
        <ProfessionalPortal
          currentPro={activePro}
          professionals={professionals}
          onSelectPro={p => setActivePro(p)}
          appointments={appointments}
          onRefreshData={loadAllData}
          onBackToPublic={() => setRole('visitor')}
        />
      )}

      {/* Reusable Floating Concierge Chat (Public & Portals) */}
      <FloatingChat
        currentUserId={role === 'client' ? activeClient?.id : role === 'professional' ? activePro?.id : 'guest-visitor'}
        currentUserName={role === 'client' ? activeClient?.name : role === 'professional' ? activePro?.name : 'Visitante'}
        userRole={role}
      />

      {/* GLOBAL MODAL: AGENDAMENTO RÁPIDO PÚBLICO */}
      {isBookingModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsBookingModalOpen(false)}
          title="Agendamento de Experiência"
          subtitle="Selecione o procedimento, especialista e horário de sua preferência"
          footer={
            !bookingConfirmed ? (
              <>
                <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirmPublicBooking} icon={<Calendar size={15} />}>
                  Confirmar Agendamento
                </Button>
              </>
            ) : null
          }
        >
          {bookingConfirmed ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 size={28} />
              </div>
              <h4 className="text-lg font-serif font-semibold text-white">
                Reserva Concluída com Sucesso!
              </h4>
              <p className="text-xs text-neutral-300">
                Seu horário foi inserido na agenda do atelier e você será recepcionada com todo o conforto.
              </p>
            </div>
          ) : (
            <form onSubmit={handleConfirmPublicBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={bookingClientName}
                    onChange={e => setBookingClientName(e.target.value)}
                    placeholder="Ex: Letícia Silveira"
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    WhatsApp para Confirmação *
                  </label>
                  <input
                    type="text"
                    value={bookingClientPhone}
                    onChange={e => setBookingClientPhone(e.target.value)}
                    placeholder="(11) 98888-7777"
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Procedimento Desejado *
                </label>
                <select
                  value={bookingServiceId}
                  onChange={e => setBookingServiceId(e.target.value)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - R$ {s.priceBRL.toFixed(2)} ({s.durationMinutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Especialista de Preferência *
                </label>
                <select
                  value={bookingProId}
                  onChange={e => setBookingProId(e.target.value)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                >
                  {professionals.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.roleTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Data da Visita *
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Horário *
                  </label>
                  <select
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="09:00">09:00</option>
                    <option value="10:30">10:30</option>
                    <option value="14:00">14:00</option>
                    <option value="15:30">15:30</option>
                    <option value="17:00">17:00</option>
                    <option value="18:30">18:30</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#161622] rounded-lg border border-white/5 text-[11px] text-neutral-400">
                * Sem cobrança antecipada. O acerto é realizado com total comodidade no salão após seu atendimento.
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
