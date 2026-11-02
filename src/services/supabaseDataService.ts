/**
 * Supabase Data Service Adapter (Projeto: Espaçobelamulher)
 * 
 * Camada de integração pronta para conexão remota com o banco Supabase.
 * Mapeia os dados da aplicação (camelCase) para as tabelas relacionais do Supabase (snake_case).
 * 
 * Caso as tabelas ainda não tenham sido criadas ou ocorra instabilidade de rede,
 * a camada retorna automaticamente o estado do StorageService local sem interrupção.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { StorageService } from './storage';
import {
  Appointment,
  CashRegisterStatus,
  CashTransaction,
  ChatMessage,
  ClientProfile,
  Conversation,
  Product,
  Professional,
  Service,
  ThemeConfig,
} from '../types';

export const SupabaseDataService = {
  // --------------------------------------------------------------------------
  // 1. SERVIÇOS & RITUAIS
  // --------------------------------------------------------------------------
  fetchServices: async (): Promise<Service[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      return StorageService.getServices();
    }
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return StorageService.getServices();
      }

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        durationMinutes: Number(item.duration_minutes ?? item.durationMinutes ?? 60),
        priceBRL: Number(item.price_brl ?? item.priceBRL ?? 0),
        description: item.description || '',
        image: item.image_url || item.image || '',
        popular: Boolean(item.popular),
        featuredInVitrine: Boolean(item.featured_in_vitrine ?? item.featuredInVitrine ?? true),
        active: Boolean(item.active ?? true),
      }));
    } catch {
      return StorageService.getServices();
    }
  },

  // --------------------------------------------------------------------------
  // 2. PROFISSIONAIS DO ATELIER
  // --------------------------------------------------------------------------
  fetchProfessionals: async (): Promise<Professional[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      return StorageService.getProfessionals();
    }
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return StorageService.getProfessionals();
      }

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        roleTitle: item.role_title || item.roleTitle || '',
        specialties: item.specialties || [],
        bio: item.bio || '',
        avatarUrl: item.avatar_url || item.avatarUrl || '',
        rating: Number(item.rating || 5),
        reviewsCount: Number(item.reviews_count || 0),
        commissionRate: Number(item.commission_rate || item.commission_rate_percent || 40),
        phone: item.phone || '(11) 98765-4321',
        email: item.email || 'contato@belamulher.com.br',
        active: Boolean(item.active ?? true),
      }));
    } catch {
      return StorageService.getProfessionals();
    }
  },

  // --------------------------------------------------------------------------
  // 3. CLIENTES (CRM)
  // --------------------------------------------------------------------------
  fetchClients: async (): Promise<ClientProfile[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      return StorageService.getClients();
    }
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return StorageService.getClients();
      }

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        phone: item.phone || '',
        email: item.email || '',
        avatarUrl: item.avatar_url || item.avatarUrl || '',
        vipTier: item.vip_tier || item.vipTier || 'Bronze',
        vipPoints: Number(item.vip_points || item.points_balance || 0),
        preferences: item.preferences || '',
        allergies: item.allergies || '',
        favoriteDrink: item.favorite_drink || '',
        createdAt: item.created_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return StorageService.getClients();
    }
  },

  // --------------------------------------------------------------------------
  // 4. PRODUTOS & BOUTIQUE HOME CARE
  // --------------------------------------------------------------------------
  fetchProducts: async (): Promise<Product[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      return StorageService.getProducts();
    }
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return StorageService.getProducts();
      }

      return data.map((item: any) => ({
        id: item.id,
        sku: item.sku || '',
        name: item.name,
        category: item.category,
        brand: item.brand || 'Sra. Bela Mulher Atelier',
        costPriceBRL: Number(item.cost_price_brl || 0),
        salePriceBRL: Number(item.sale_price_brl || 0),
        stockQuantity: Number(item.stock_quantity || 0),
        minStockAlert: Number(item.min_stock_alert || 5),
        image: item.image_url || item.image || '',
        featuredInVitrine: Boolean(item.featured_in_vitrine ?? true),
      }));
    } catch {
      return StorageService.getProducts();
    }
  },

  // --------------------------------------------------------------------------
  // 5. AGENDAMENTOS
  // --------------------------------------------------------------------------
  fetchAppointments: async (): Promise<Appointment[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      return StorageService.getAppointments();
    }
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .order('appointment_date', { ascending: false });

      if (error || !data || data.length === 0) {
        return StorageService.getAppointments();
      }

      return data.map((item: any) => ({
        id: item.id,
        clientId: item.client_id || '',
        clientName: item.client_name || 'Cliente',
        clientPhone: item.client_phone || '',
        clientAvatar: item.client_avatar || '',
        professionalId: item.professional_id || '',
        professionalName: item.professional_name || '',
        serviceId: item.service_id || '',
        serviceName: item.service_name || '',
        date: item.appointment_date || item.date || '',
        time: item.appointment_time || item.time || '',
        durationMinutes: Number(item.duration_minutes || 60),
        priceBRL: Number(item.price_brl || 0),
        status: item.status || 'confirmado',
        paymentMethod: item.payment_method || 'pendente',
        notes: item.notes || '',
        formulaRecord: item.formula_record || '',
      }));
    } catch {
      return StorageService.getAppointments();
    }
  },

  // --------------------------------------------------------------------------
  // 6. CAIXA & FINANCEIRO
  // --------------------------------------------------------------------------
  fetchCashStatus: async (): Promise<CashRegisterStatus> => {
    if (!isSupabaseConfigured() || !supabase) {
      return StorageService.getCashStatus();
    }
    try {
      const { data, error } = await supabase
        .from('caixa_status')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return StorageService.getCashStatus();
      }

      return {
        isOpen: Boolean(data.is_open),
        openedAt: data.opened_at || '',
        openedBy: data.opened_by || '',
        initialBalanceBRL: Number(data.initial_balance_brl || 0),
        currentBalanceBRL: Number(data.current_balance_brl || 0),
        totalEntradas: Number(data.total_entradas || 0),
        totalSaidas: Number(data.total_saidas || 0),
      };
    } catch {
      return StorageService.getCashStatus();
    }
  },

  fetchTransactions: async (): Promise<CashTransaction[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      return StorageService.getTransactions();
    }
    try {
      const { data, error } = await supabase
        .from('transacoes_caixa')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return StorageService.getTransactions();
      }

      return data.map((item: any) => ({
        id: item.id,
        type: item.type,
        category: item.category,
        description: item.description,
        amountBRL: Number(item.amount_brl || 0),
        operatorName: item.operator_name || '',
        appointmentId: item.appointment_id || undefined,
        timestamp: item.created_at || '',
      }));
    } catch {
      return StorageService.getTransactions();
    }
  },

  // --------------------------------------------------------------------------
  // 7. CONVERSAS & CHAT
  // --------------------------------------------------------------------------
  fetchConversations: async (): Promise<Conversation[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      return StorageService.getConversations();
    }
    try {
      const { data, error } = await supabase
        .from('conversas')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return StorageService.getConversations();
      }

      return data.map((item: any) => ({
        id: item.id,
        participantId: item.participant_id || '',
        participantName: item.participant_name || '',
        participantRole: item.participant_role || 'client',
        participantAvatar: item.participant_avatar || '',
        lastMessage: item.last_message || '',
        lastMessageTime: item.last_message_time || '',
        unreadCount: Number(item.unread_count || 0),
      }));
    } catch {
      return StorageService.getConversations();
    }
  },

  fetchMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      const all = StorageService.getMessages();
      return all[conversationId] || [];
    }
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error || !data) {
        const all = StorageService.getMessages();
        return all[conversationId] || [];
      }

      return data.map((item: any) => ({
        id: item.id,
        conversationId: item.conversation_id,
        senderId: item.sender_id,
        senderName: item.sender_name,
        senderRole: item.sender_role,
        text: item.text,
        timestamp: item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
        isRead: Boolean(item.is_read),
      }));
    } catch {
      const all = StorageService.getMessages();
      return all[conversationId] || [];
    }
  },

  // --------------------------------------------------------------------------
  // 8. CONFIGURAÇÕES & TEMA
  // --------------------------------------------------------------------------
  fetchThemeConfig: async (): Promise<ThemeConfig> => {
    if (!isSupabaseConfigured() || !supabase) {
      return StorageService.getTheme();
    }
    try {
      const { data, error } = await supabase
        .from('configuracoes_salao')
        .select('*')
        .limit(1)
        .single();

      if (error || !data) {
        return StorageService.getTheme();
      }

      return {
        palette: 'champagne',
        primaryAccent: data.primary_accent || '#d4af37',
        accentLight: data.accent_light || '#f3e5ab',
        accentSubtle: data.accent_subtle || 'rgba(212, 175, 55, 0.12)',
        accentBorder: data.accent_border || 'rgba(212, 175, 55, 0.3)',
        cardSurface: data.card_surface || '#101014',
        salonName: data.salon_name || 'Sra. Bela Mulher',
        salonTagline: data.salon_tagline || '',
        contactPhone: data.contact_phone || '',
        instagramHandle: data.instagram_handle || '',
        address: data.address || '',
        openingHours: data.opening_hours || '',
        show3dParticles: Boolean(data.show_3d_particles ?? true),
      };
    } catch {
      return StorageService.getTheme();
    }
  },
};
