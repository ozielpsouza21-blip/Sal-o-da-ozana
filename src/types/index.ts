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
  | 'diagnostico'
  | 'config-pagamentos';

export type ClientTab = 'agendamentos' | 'novo' | 'pagamentos' | 'historico' | 'perfil' | 'vip' | 'chat';

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
  paymentMethod?: 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'pix' | 'pix_simulado' | 'pendente';
  paymentStatus?: 'pendente' | 'aguardando_confirmacao' | 'pago' | 'cancelado';
  paymentProofUrl?: string;
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
  paymentMethod?: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'outro';
  costType?: 'fixa' | 'variavel';
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

export type BillType = 'pagar' | 'receber';
export type BillCategory =
  | 'Serviços'
  | 'Boutique Home Care'
  | 'Comissões de Especialistas'
  | 'Insumos & Produtos de Bancada'
  | 'Aluguel & Condomínio'
  | 'Energia, Água & Conectividade'
  | 'Mimos & Experiência Gourmet'
  | 'Marketing & Mídia'
  | 'Impostos & Taxas de Cartão'
  | 'Outros';

export type BillCostType = 'fixa' | 'variavel';
export type BillStatus = 'pendente' | 'pago' | 'atrasado';

export interface BillRecord {
  id: string;
  type: BillType;
  title: string;
  category: BillCategory;
  costType: BillCostType;
  amountBRL: number;
  dueDate: string; // YYYY-MM-DD
  paymentDate?: string;
  status: BillStatus;
  paymentMethod: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'boleto';
  supplierOrRecipient?: string;
  notes?: string;
  createdAt: string;
}

export interface CashClosingRecord {
  id: string;
  closedAt: string;
  operatorName: string;
  initialBalanceBRL: number;
  totalEntradas: number;
  totalSaidas: number;
  expectedBalanceBRL: number;
  countedCashBRL: number;
  countedCardBRL: number;
  countedPixBRL: number;
  totalCountedBRL: number;
  differenceBRL: number; // countedCash - expectedBalance
  differenceReason?: string;
  notes?: string;
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

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';

export interface PixConfig {
  ativo: boolean;
  chavePix: string;
  tipoChave: PixKeyType;
  titular: string;
  banco: string;
  cidade?: string;
  copiaECola: string;
  qrCodeUrl: string;
  instrucoes?: string;
  updatedAt?: string;
}

export type PaymentProofStatus = 'aguardando_confirmacao' | 'confirmado' | 'rejeitado';

export interface PaymentProofRecord {
  id: string;
  appointmentId?: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  amountBRL: number;
  description: string;
  proofImageUrl?: string;
  proofFileName?: string;
  status: PaymentProofStatus;
  submittedAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
  adminNotes?: string;
}
