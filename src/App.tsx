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
import { SupabaseDataService } from './services/supabaseDataService';
import { supabase } from './services/supabaseClient';

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
import { Calendar, CheckCircle2, Globe, User, Scissors, ShieldCheck, Sparkles } from 'lucide-react';
import { AuthView } from './components/common/AuthView';
import { ClientAuthModal } from './components/common/ClientAuthModal';
import { ProfessionalAuthModal } from './components/common/ProfessionalAuthModal';
import { FixedFooterNav } from './components/common/FixedFooterNav';
import { ExternalSideMenu } from './components/common/ExternalSideMenu';

export default function App() {
  const [role, setRole] = useState<AppRole>('visitor');
  const [publicTab, setPublicTab] = useState<PublicTab>('home');

  // Supabase Auth State
  const [authUserEmail, setAuthUserEmail] = useState<string | null>(null);
  const [authUserName, setAuthUserName] = useState<string | null>(null);
  const [isAuthViewOpen, setIsAuthViewOpen] = useState(false);
  const [authViewInitialMode, setAuthViewInitialMode] = useState<'login' | 'signup'>('login');
  const [targetRoleLabel, setTargetRoleLabel] = useState('Painel do Atelier');
  const [logoutErrorMessage, setLogoutErrorMessage] = useState<string | null>(null);

  // Client & Professional Auth Modal States
  const [isClientAuthOpen, setIsClientAuthOpen] = useState(false);
  const [clientAuthInitialMode, setClientAuthInitialMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isProAuthOpen, setIsProAuthOpen] = useState(false);
  const [proAuthInitialMode, setProAuthInitialMode] = useState<'login' | 'forgot'>('login');

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

  const loadAllData = async () => {
    const [s, p, c, prd, a, cs, tx, conv, th] = await Promise.all([
      SupabaseDataService.fetchServices(),
      SupabaseDataService.fetchProfessionals(),
      SupabaseDataService.fetchClients(),
      SupabaseDataService.fetchProducts(),
      SupabaseDataService.fetchAppointments(),
      SupabaseDataService.fetchCashStatus(),
      SupabaseDataService.fetchTransactions(),
      SupabaseDataService.fetchConversations(),
      SupabaseDataService.fetchThemeConfig(),
    ]);

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

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setAuthUserEmail(session.user.email || null);
          setAuthUserName(session.user.user_metadata?.name || null);
          SupabaseDataService.fetchUserProfile(session.user.id).then((profile) => {
            if (profile?.role) {
              setRole(profile.role as AppRole);
            } else {
              setRole('client');
            }
            if (profile?.name) {
              setAuthUserName(profile.name);
            }
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setAuthUserEmail(null);
          setAuthUserName(null);
          setRole('visitor');
        } else if (session?.user) {
          setAuthUserEmail(session.user.email || null);
          setAuthUserName(session.user.user_metadata?.name || null);
          SupabaseDataService.fetchUserProfile(session.user.id).then((profile) => {
            if (profile?.role) {
              setRole(profile.role as AppRole);
            } else {
              setRole('client');
            }
            if (profile?.name) {
              setAuthUserName(profile.name);
            }
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleLogout = async () => {
    setLogoutErrorMessage(null);
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Erro ao realizar logout no Supabase:', error.message);
          setLogoutErrorMessage(`Não foi possível encerrar a sessão: ${error.message}`);
          return;
        }
      }
    } catch (err: any) {
      console.error('Exceção ao encerrar sessão:', err?.message || err);
      setLogoutErrorMessage('Ocorreu uma falha ao conectar com o servidor para encerrar a sessão. Tente novamente.');
      return;
    }

    // Limpa estado em memória e retorna para a tela pública com login pronto
    setAuthUserEmail(null);
    setAuthUserName(null);
    setRole('visitor');
    setIsAuthViewOpen(true);
    setAuthViewInitialMode('login');
  };

  const handleSelectRole = (newRole: AppRole) => {
    if (newRole === 'visitor') {
      setRole('visitor');
      setIsAuthViewOpen(false);
      setIsClientAuthOpen(false);
      setIsProAuthOpen(false);
      return;
    }

    if (newRole === 'client') {
      if (!authUserEmail) {
        setClientAuthInitialMode('login');
        setIsClientAuthOpen(true);
        return;
      }
      setRole('client');
      setIsClientAuthOpen(false);
      return;
    }

    if (newRole === 'professional') {
      if (!authUserEmail) {
        setProAuthInitialMode('login');
        setIsProAuthOpen(true);
        return;
      }
      setRole('professional');
      setIsProAuthOpen(false);
      return;
    }

    if (newRole === 'admin') {
      if (!authUserEmail) {
        setAuthViewInitialMode('login');
        setTargetRoleLabel('Painel Administrativo do Atelier');
        setIsAuthViewOpen(true);
        return;
      }
      setRole('admin');
      setIsAuthViewOpen(false);
      return;
    }

    setRole(newRole);
    setIsAuthViewOpen(false);
  };

  const handleOpenAuthView = (mode: 'login' | 'signup' = 'login') => {
    setAuthViewInitialMode(mode);
    setTargetRoleLabel('Painel do Atelier');
    setIsAuthViewOpen(true);
  };

  const handleOpenBooking = (serviceId?: string, professionalId?: string) => {
    setBookingServiceId(serviceId || services[0]?.id || '');
    setBookingProId(professionalId || professionals[0]?.id || '');
    setBookingConfirmed(false);
    setIsBookingModalOpen(true);
  };

  const handleConfirmPublicBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === bookingServiceId) || services[0];
    const pro = professionals.find(p => p.id === bookingProId) || professionals[0];
    const name = bookingClientName.trim() || 'Visitante Convidada';
    const phone = bookingClientPhone.trim() || '(11) 98765-4321';

    await SupabaseDataService.createAppointment({
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

    await loadAllData();
    setBookingConfirmed(true);
    setTimeout(() => {
      setIsBookingModalOpen(false);
      setBookingConfirmed(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#f3e5ab] pb-24">
      {/* External Side Menu (PWA & ADM access) */}
      <ExternalSideMenu
        onOpenAdmin={() => handleSelectRole('admin')}
      />

      {/* Fixed Footer Navigation Bar (Início, Vitrine, Cliente, Profissional, Chat) */}
      <FixedFooterNav
        currentRole={role}
        activePublicTab={publicTab}
        onSelectRole={newRole => setRole(newRole)}
        onSelectPublicTab={tab => setPublicTab(tab)}
        onOpenClientAuth={() => {
          setClientAuthInitialMode('login');
          setIsClientAuthOpen(true);
        }}
        onOpenProAuth={() => {
          setProAuthInitialMode('login');
          setIsProAuthOpen(true);
        }}
        onOpenChat={() => {
          // Trigger floating chat click if available or scroll/focus
          const chatBtn = document.querySelector('[aria-label="Abrir chat do concierge"]') as HTMLButtonElement;
          if (chatBtn) chatBtn.click();
        }}
        hasAuthUser={!!authUserEmail}
      />
      {/* Real Supabase Auth View when Auth mode is triggered */}
      {isAuthViewOpen ? (
        <>
          <Header
            currentRole={role}
            onSelectRole={handleSelectRole}
            activePublicTab={publicTab}
            onSelectPublicTab={tab => setPublicTab(tab)}
            onOpenBookingModal={() => handleOpenBooking()}
            authUserEmail={authUserEmail}
            authUserName={authUserName}
            onOpenAuthView={handleOpenAuthView}
            onLogout={handleLogout}
          />
          <AuthView
            initialMode={authViewInitialMode}
            targetRoleLabel={targetRoleLabel}
            onSuccess={(newRole, email, name) => {
              setRole(newRole);
              setAuthUserEmail(email);
              setAuthUserName(name || null);
              setIsAuthViewOpen(false);
            }}
            onCancel={() => {
              setIsAuthViewOpen(false);
            }}
          />
        </>
      ) : (
        <>
          {/* Role View Router */}
          {role === 'visitor' && (
            <>
              <Header
                currentRole={role}
                onSelectRole={handleSelectRole}
                activePublicTab={publicTab}
                onSelectPublicTab={tab => setPublicTab(tab)}
                onOpenBookingModal={() => handleOpenBooking()}
                authUserEmail={authUserEmail}
                authUserName={authUserName}
                onOpenAuthView={handleOpenAuthView}
                onLogout={handleLogout}
              />
              <PublicHomePage
                services={services}
                products={products}
                professionals={professionals}
                activeTab={publicTab}
                onSelectTab={tab => setPublicTab(tab)}
                onSelectRole={handleSelectRole}
                onOpenBookingModal={handleOpenBooking}
                show3dParticles={themeConfig.show3dParticles}
              />
            </>
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
              onLogout={handleLogout}
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
        </>
      )}

      {/* Logout Error Modal */}
      {logoutErrorMessage && (
        <Modal
          isOpen={true}
          onClose={() => setLogoutErrorMessage(null)}
          title="Aviso de Encerramento de Sessão"
          subtitle="Aviso do Servidor de Autenticação"
          footer={
            <Button onClick={() => setLogoutErrorMessage(null)}>
              Entendido
            </Button>
          }
        >
          <div className="py-4 text-xs text-red-300 bg-red-950/40 p-4 rounded-xl border border-red-500/30">
            {logoutErrorMessage}
          </div>
        </Modal>
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

      {/* Client Auth Modal */}
      <ClientAuthModal
        isOpen={isClientAuthOpen}
        onClose={() => setIsClientAuthOpen(false)}
        initialMode={clientAuthInitialMode}
        onSuccess={(newRole, email, name) => {
          setRole(newRole);
          setAuthUserEmail(email);
          setAuthUserName(name || null);
          setIsClientAuthOpen(false);
        }}
      />

      {/* Professional Auth Modal */}
      <ProfessionalAuthModal
        isOpen={isProAuthOpen}
        onClose={() => setIsProAuthOpen(false)}
        initialMode={proAuthInitialMode}
        onSuccess={(newRole, email, name) => {
          setRole(newRole);
          setAuthUserEmail(email);
          setAuthUserName(name || null);
          setIsProAuthOpen(false);
        }}
      />
    </div>
  );
}
