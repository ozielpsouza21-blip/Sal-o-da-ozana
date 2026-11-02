import React, { useState } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  Calendar,
  Users,
  Scissors,
  Sparkles,
  Package,
  Store,
  MessageSquare,
  Palette,
  ArrowLeft,
  Plus,
  Menu,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  AdminModule,
  AppRole,
  Appointment,
  CashRegisterStatus,
  CashTransaction,
  ClientProfile,
  Conversation,
  Product,
  Professional,
  Service,
  ThemeConfig,
} from '../../types';
import { CollapsibleSidebar, NavItem } from '../common/CollapsibleSidebar';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { StorageService } from '../../services/storage';

// Module components
import { OverviewModule } from './modules/OverviewModule';
import { FinanceModule } from './modules/FinanceModule';
import { CashRegisterModule } from './modules/CashRegisterModule';
import { ScheduleModule } from './modules/ScheduleModule';
import { ClientsModule } from './modules/ClientsModule';
import { ProfessionalsModule } from './modules/ProfessionalsModule';
import { ServicesModule } from './modules/ServicesModule';
import { ProductsModule } from './modules/ProductsModule';
import { ShowcaseModule } from './modules/ShowcaseModule';
import { ConversationsModule } from './modules/ConversationsModule';
import { CustomizationModule } from './modules/CustomizationModule';

interface AdminDashboardProps {
  services: Service[];
  professionals: Professional[];
  clients: ClientProfile[];
  products: Product[];
  appointments: Appointment[];
  cashStatus: CashRegisterStatus;
  transactions: CashTransaction[];
  conversations: Conversation[];
  themeConfig: ThemeConfig;
  onRefreshData: () => void;
  onBackToPublic: () => void;
  onSwitchRole: (role: AppRole) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  services,
  professionals,
  clients,
  products,
  appointments,
  cashStatus,
  transactions,
  conversations,
  themeConfig,
  onRefreshData,
  onBackToPublic,
  onSwitchRole,
}) => {
  const [activeModule, setActiveModule] = useState<AdminModule>('visao-geral');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // New Appointment Modal from Admin
  const [isNewAptModalOpen, setIsNewAptModalOpen] = useState(false);
  const [aptClientId, setAptClientId] = useState(clients[0]?.id || '');
  const [aptServiceId, setAptServiceId] = useState(services[0]?.id || '');
  const [aptProId, setAptProId] = useState(professionals[0]?.id || '');
  const [aptDate, setAptDate] = useState('2026-11-02');
  const [aptTime, setAptTime] = useState('11:00');
  const [aptNotes, setAptNotes] = useState('');

  const navItems: NavItem[] = [
    { id: 'visao-geral', label: 'Visão Geral', icon: <LayoutDashboard size={18} /> },
    { id: 'financeiro', label: 'Financeiro', icon: <DollarSign size={18} /> },
    { id: 'caixa', label: 'Caixa', icon: <Receipt size={18} />, badge: cashStatus.isOpen ? 'Aberto' : 'Fechado' },
    { id: 'agenda', label: 'Agenda', icon: <Calendar size={18} />, badge: appointments.filter(a => a.status === 'agendado').length || undefined },
    { id: 'clientes', label: 'Clientes', icon: <Users size={18} /> },
    { id: 'profissionais', label: 'Profissionais', icon: <Scissors size={18} /> },
    { id: 'servicos', label: 'Serviços', icon: <Sparkles size={18} /> },
    { id: 'produtos', label: 'Produtos', icon: <Package size={18} /> },
    { id: 'vitrine', label: 'Vitrine', icon: <Store size={18} /> },
    { id: 'conversas', label: 'Conversas', icon: <MessageSquare size={18} />, badge: 1 },
    { id: 'personalizacao', label: 'Personalização', icon: <Palette size={18} /> },
  ];

  const handleUpdateAptStatus = (id: string, status: any) => {
    StorageService.updateAppointmentStatus(id, status);
    onRefreshData();
  };

  const handleCreateNewAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === aptClientId) || clients[0];
    const service = services.find(s => s.id === aptServiceId) || services[0];
    const pro = professionals.find(p => p.id === aptProId) || professionals[0];

    StorageService.addAppointment({
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientAvatar: client.avatarUrl,
      professionalId: pro.id,
      professionalName: pro.name,
      serviceId: service.id,
      serviceName: service.name,
      date: aptDate,
      time: aptTime,
      durationMinutes: service.durationMinutes,
      priceBRL: service.priceBRL,
      status: 'confirmado',
      paymentMethod: 'pendente',
      notes: aptNotes || 'Agendado pela Recepção / Admin',
    });

    onRefreshData();
    setIsNewAptModalOpen(false);
    setAptNotes('');
  };

  const currentModuleName = navItems.find(i => i.id === activeModule)?.label || 'Visão Geral';

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-row">
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <CollapsibleSidebar
        title="Sra. Bela Mulher"
        subtitle="Gestão & Governança"
        items={navItems}
        activeId={activeModule}
        onSelect={id => setActiveModule(id as AdminModule)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentRole="admin"
        onSwitchRole={onSwitchRole}
      />

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-18 bg-[#0c0c10]/95 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-lg text-neutral-400 hover:text-white lg:hidden"
              aria-label="Abrir menu de navegação"
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 hidden sm:inline">Painel de Gestão</span>
              <span className="text-neutral-600 hidden sm:inline">/</span>
              <span className="font-semibold text-white font-serif text-sm sm:text-base">
                {currentModuleName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublic}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Ver Vitrine Pública</span>
            </button>

            <Button
              size="sm"
              onClick={() => setIsNewAptModalOpen(true)}
              icon={<Plus size={15} />}
            >
              Novo Agendamento
            </Button>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeModule === 'visao-geral' && (
            <OverviewModule
              appointments={appointments}
              clients={clients}
              professionals={professionals}
              services={services}
              cashStatus={cashStatus}
              onNavigateToModule={mod => setActiveModule(mod as AdminModule)}
              onUpdateAptStatus={handleUpdateAptStatus}
              onOpenNewAppointment={() => setIsNewAptModalOpen(true)}
            />
          )}

          {activeModule === 'financeiro' && (
            <FinanceModule
              appointments={appointments}
              services={services}
              products={products}
            />
          )}

          {activeModule === 'caixa' && (
            <CashRegisterModule
              cashStatus={cashStatus}
              transactions={transactions}
              onRefreshData={onRefreshData}
            />
          )}

          {activeModule === 'agenda' && (
            <ScheduleModule
              appointments={appointments}
              professionals={professionals}
              services={services}
              clients={clients}
              onUpdateStatus={handleUpdateAptStatus}
              onOpenNewAppointment={() => setIsNewAptModalOpen(true)}
            />
          )}

          {activeModule === 'clientes' && (
            <ClientsModule
              clients={clients}
              appointments={appointments}
              onRefreshData={onRefreshData}
            />
          )}

          {activeModule === 'profissionais' && (
            <ProfessionalsModule
              professionals={professionals}
              onRefreshData={onRefreshData}
            />
          )}

          {activeModule === 'servicos' && (
            <ServicesModule
              services={services}
              onRefreshData={onRefreshData}
            />
          )}

          {activeModule === 'produtos' && (
            <ProductsModule
              products={products}
              onRefreshData={onRefreshData}
            />
          )}

          {activeModule === 'vitrine' && (
            <ShowcaseModule
              services={services}
              products={products}
              onRefreshData={onRefreshData}
              onPreviewPublic={onBackToPublic}
            />
          )}

          {activeModule === 'conversas' && (
            <ConversationsModule
              conversations={conversations}
              onRefreshData={onRefreshData}
            />
          )}

          {activeModule === 'personalizacao' && (
            <CustomizationModule
              themeConfig={themeConfig}
              onRefreshData={onRefreshData}
            />
          )}
        </main>
      </div>

      {/* MODAL: NOVO AGENDAMENTO RÁPIDO DO ADMIN */}
      {isNewAptModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsNewAptModalOpen(false)}
          title="Novo Agendamento na Recepção"
          subtitle="Selecione cliente, procedimento, data e horário"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsNewAptModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateNewAppointment}>
                Confirmar Horário
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateNewAppointment} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Cliente Cadastrada *
              </label>
              <select
                value={aptClientId}
                onChange={e => setAptClientId(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.vipTier}) - {c.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Procedimento *
              </label>
              <select
                value={aptServiceId}
                onChange={e => setAptServiceId(e.target.value)}
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
                Especialista Designada *
              </label>
              <select
                value={aptProId}
                onChange={e => setAptProId(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              >
                {professionals.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  value={aptDate}
                  onChange={e => setAptDate(e.target.value)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Horário *
                </label>
                <select
                  value={aptTime}
                  onChange={e => setAptTime(e.target.value)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:30">11:30</option>
                  <option value="14:00">14:00</option>
                  <option value="15:30">15:30</option>
                  <option value="17:00">17:00</option>
                  <option value="18:30">18:30</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Observações de Atendimento
              </label>
              <input
                type="text"
                value={aptNotes}
                onChange={e => setAptNotes(e.target.value)}
                placeholder="Ex: Cliente solicitou suíte privativa para reunião telefônica..."
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
