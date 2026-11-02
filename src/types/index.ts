export type AppRole = 'visitor' | 'client' | 'professional' | 'admin';

export type PublicTab = 'home' | 'vitrine' | 'servicos' | 'experiencia' | 'contato';

export type AdminModule = 
  | 'visao-geral' 
  | 'financeiro' 
  | 'caixa' 
  | 'agenda' 
  | 'clientes' 
  | 'profissionais' 
  | 'servicos' 
  | 'produtos' 
  | 'vitrine' 
  | 'conversas' 
  | 'personalizacao'
  | 'diagnostico';

export type ClientTab = 'agendamentos' | 'novo' | 'historico' | 'perfil' | 'vip' | 'chat';

export type ProfessionalTab = 'agenda' | 'atendimentos' | 'comissoes' | 'perfil' | 'chat';

export type VipTier = 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  bannerUrl?: string;
  vipTier: VipTier;
  vipPoints: number;
  formulaNote?: string;
  preferences?: string;
  allergies?: string;
  favoriteDrink?: string;
  createdAt: string;
}

export interface Professional {
  id: string;
  name: string;
  roleTitle: string;
  avatarUrl: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  commissionRate: number; // in percentage e.g. 50
  specialties: string[];
  phone: string;
  email: string;
  active: boolean;
}

export interface Service {
  id: string;
  name: string;
  category: 'Cabelos' | 'Unhas' | 'Estética' | 'Noivas' | 'Sobrancelhas & Cílios';
  durationMinutes: number;
  priceBRL: number;
  description: string;
  image: string;
  popular?: boolean;
  featuredInVitrine?: boolean;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'Tratamento Capilar' | 'Finalizadores' | 'Home Care' | 'Esmaltes & Cuidados' | 'Acessórios';
  brand: string;
  costPriceBRL: number;
  salePriceBRL: number;
  stockQuantity: number;
  minStockAlert: number;
  image: string;
  sku: string;
  featuredInVitrine?: boolean;
}

export type AppointmentStatus = 
  | 'agendado' 
  | 'confirmado' 
  | 'em_atendimento' 
  | 'concluido' 
  | 'cancelado';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAvatar: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  priceBRL: number;
  status: AppointmentStatus;
  paymentMethod?: 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'pix_simulado' | 'pendente';
  notes?: string;
  formulaRecord?: string;
}

export interface CashTransaction {
  id: string;
  type: 'entrada' | 'saida' | 'abertura' | 'fechamento' | 'sangria' | 'suprimento';
  category: string;
  description: string;
  amountBRL: number;
  timestamp: string;
  operatorName: string;
  appointmentId?: string;
}

export interface CashRegisterStatus {
  isOpen: boolean;
  openedAt?: string;
  openedBy?: string;
  initialBalanceBRL: number;
  currentBalanceBRL: number;
  totalEntradas: number;
  totalSaidas: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: AppRole;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: AppRole;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export type ThemePalette = 'champagne' | 'rosegold' | 'bronze' | 'emerald' | 'amber' | 'custom';

export interface ThemeConfig {
  palette: ThemePalette;
  primaryAccent: string; // Hex
  accentLight: string;
  accentSubtle: string;
  accentBorder: string;
  cardSurface: string;
  salonName: string;
  salonTagline: string;
  contactPhone: string;
  instagramHandle: string;
  address: string;
  openingHours: string;
  show3dParticles: boolean;
  bannerVideoUrl?: string;
}
