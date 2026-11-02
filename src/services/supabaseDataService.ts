/**
 * Supabase Data Service Adapter (Projeto: Espaçobelamulher)
 * 
 * Camada de integração bidirecional (leitura e gravação) pronta para a conexão remota com o banco Supabase.
 * Mapeia os dados da aplicação (camelCase) para as tabelas relacionais do Supabase (snake_case).
 * 
 * Mantém sincronização com o StorageService local para resiliência offline e transição transparente.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { StorageService } from './storage';
import {
  Appointment,
  AppointmentStatus,
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
        active: Boolean(item.ativo ?? item.active ?? true),
      }));
    } catch {
      return StorageService.getServices();
    }
  },

  createService: async (service: Omit<Service, 'id'>): Promise<Service> => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('servicos')
        .insert({
          name: service.name,
          category: service.category,
          duration_minutes: service.durationMinutes,
          price_brl: service.priceBRL,
          description: service.description,
          image_url: service.image || '/src/assets/images/service_luxury_haircare_1793577408044.jpg',
          popular: service.popular || false,
          featured_in_vitrine: service.featuredInVitrine ?? true,
          ativo: service.active ?? true,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Falha ao salvar serviço no Supabase: ${error?.message || 'Erro desconhecido'}`);
      }

      const newSrv: Service = {
        id: data.id,
        name: data.name,
        category: data.category,
        durationMinutes: Number(data.duration_minutes ?? 60),
        priceBRL: Number(data.price_brl ?? 0),
        description: data.description || '',
        image: data.image_url || '',
        popular: Boolean(data.popular),
        featuredInVitrine: Boolean(data.featured_in_vitrine ?? true),
        active: Boolean(data.ativo ?? true),
      };

      StorageService.addService(newSrv);
      return newSrv;
    } else {
      return StorageService.addService(service);
    }
  },

  updateService: async (id: string, service: Partial<Service>): Promise<boolean> => {
    if (isSupabaseConfigured() && supabase) {
      const updatePayload: any = {};
      if (service.name !== undefined) updatePayload.name = service.name;
      if (service.category !== undefined) updatePayload.category = service.category;
      if (service.durationMinutes !== undefined) updatePayload.duration_minutes = service.durationMinutes;
      if (service.priceBRL !== undefined) updatePayload.price_brl = service.priceBRL;
      if (service.description !== undefined) updatePayload.description = service.description;
      if (service.image !== undefined) updatePayload.image_url = service.image;
      if (service.popular !== undefined) updatePayload.popular = service.popular;
      if (service.featuredInVitrine !== undefined) updatePayload.featured_in_vitrine = service.featuredInVitrine;
      if (service.active !== undefined) updatePayload.ativo = service.active;
      updatePayload.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('servicos')
        .update(updatePayload)
        .eq('id', id);

      if (error) {
        throw new Error(`Falha ao atualizar serviço no Supabase: ${error.message}`);
      }
      StorageService.updateService(id, service);
      return true;
    } else {
      StorageService.updateService(id, service);
      return true;
    }
  },

  deleteService: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Falha ao excluir serviço no Supabase: ${error.message}`);
      }
      StorageService.deleteService(id);
      return true;
    } else {
      StorageService.deleteService(id);
      return true;
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
        active: Boolean(item.ativo ?? item.active ?? true),
      }));
    } catch {
      return StorageService.getProfessionals();
    }
  },

  createProfessional: async (pro: Omit<Professional, 'id'>): Promise<Professional> => {
    const local = StorageService.addProfessional(pro);
    if (!isSupabaseConfigured() || !supabase) return local;

    try {
      const { data, error } = await supabase
        .from('profissionais')
        .insert({
          name: pro.name,
          role_title: pro.roleTitle,
          avatar_url: pro.avatarUrl,
          bio: pro.bio,
          rating: pro.rating,
          reviews_count: pro.reviewsCount,
          commission_rate: pro.commissionRate,
          specialties: pro.specialties,
          phone: pro.phone,
          email: pro.email,
          ativo: pro.active,
        })
        .select()
        .single();

      if (!error && data) {
        return { ...local, id: data.id };
      }
    } catch (e) {
      console.warn('Persistência remota de profissional falhou, mantido localmente:', e);
    }
    return local;
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

  createClient: async (cli: Omit<ClientProfile, 'id' | 'createdAt'>): Promise<ClientProfile> => {
    const local = StorageService.addClient(cli);
    if (!isSupabaseConfigured() || !supabase) return local;

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          name: cli.name,
          email: cli.email,
          phone: cli.phone,
          avatar_url: cli.avatarUrl,
          vip_tier: cli.vipTier || 'Bronze',
          vip_points: cli.vipPoints || 0,
          preferences: cli.preferences,
          allergies: cli.allergies,
          favorite_drink: cli.favoriteDrink,
        })
        .select()
        .single();

      if (!error && data) {
        return { ...local, id: data.id };
      }
    } catch (e) {
      console.warn('Persistência remota de cliente falhou, mantido localmente:', e);
    }
    return local;
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

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const local = StorageService.addProduct(product);
    if (!isSupabaseConfigured() || !supabase) return local;

    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert({
          sku: product.sku,
          name: product.name,
          category: product.category,
          brand: product.brand,
          cost_price_brl: product.costPriceBRL,
          sale_price_brl: product.salePriceBRL,
          stock_quantity: product.stockQuantity,
          min_stock_alert: product.minStockAlert,
          image_url: product.image,
          featured_in_vitrine: product.featuredInVitrine ?? true,
          ativo: true,
        })
        .select()
        .single();

      if (!error && data) {
        return { ...local, id: data.id };
      }
    } catch (e) {
      console.warn('Persistência remota de produto falhou, mantido localmente:', e);
    }
    return local;
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
        serviceId: item.servico_id || item.service_id || '',
        serviceName: item.service_name || '',
        date: item.appointment_date || item.date || '',
        time: item.appointment_time || item.time || '',
        durationMinutes: Number(item.duration_minutes || 60),
        priceBRL: Number(item.price_brl || 0),
        status: item.status || 'agendado',
        paymentMethod: item.payment_method || 'pendente',
        notes: item.notes || '',
        formulaRecord: item.formula_record || '',
      }));
    } catch {
      return StorageService.getAppointments();
    }
  },

  createAppointment: async (apt: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const local = StorageService.addAppointment(apt);
    if (!isSupabaseConfigured() || !supabase) return local;

    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert({
          client_name: apt.clientName,
          client_phone: apt.clientPhone,
          client_avatar: apt.clientAvatar,
          professional_id: apt.professionalId,
          professional_name: apt.professionalName,
          servico_id: apt.serviceId,
          service_name: apt.serviceName,
          appointment_date: apt.date,
          appointment_time: apt.time,
          duration_minutes: apt.durationMinutes,
          price_brl: apt.priceBRL,
          status: apt.status || 'agendado',
          payment_method: apt.paymentMethod || 'pendente',
          notes: apt.notes,
          formula_record: apt.formulaRecord,
        })
        .select()
        .single();

      if (!error && data) {
        return { ...local, id: data.id };
      }
    } catch (e) {
      console.warn('Persistência remota de agendamento falhou, mantido localmente:', e);
    }
    return local;
  },

  updateAppointmentStatus: async (id: string, status: AppointmentStatus, formulaRecord?: string) => {
    StorageService.updateAppointmentStatus(id, status, formulaRecord);
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      await supabase
        .from('agendamentos')
        .update({
          status,
          formula_record: formulaRecord,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (e) {
      console.warn('Atualização remota de agendamento falhou:', e);
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

  addCashTransaction: async (trx: Omit<CashTransaction, 'id' | 'timestamp'>): Promise<CashTransaction> => {
    const local = StorageService.addCashTransaction(trx);
    if (!isSupabaseConfigured() || !supabase) return local;

    try {
      const { data, error } = await supabase
        .from('transacoes_caixa')
        .insert({
          type: trx.type,
          category: trx.category,
          description: trx.description,
          amount_brl: trx.amountBRL,
          operator_name: trx.operatorName,
          appointment_id: trx.appointmentId,
        })
        .select()
        .single();

      if (!error && data) {
        return { ...local, id: data.id };
      }
    } catch (e) {
      console.warn('Persistência remota de transação falhou:', e);
    }
    return local;
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

  sendMessage: async (convId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'conversationId'>): Promise<ChatMessage> => {
    const local = StorageService.sendMessage(convId, message);
    if (!isSupabaseConfigured() || !supabase) return local;

    try {
      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          conversation_id: convId,
          sender_id: message.senderId,
          sender_name: message.senderName,
          sender_role: message.senderRole,
          text: message.text,
          is_read: message.isRead || false,
        })
        .select()
        .single();

      if (!error && data) {
        return { ...local, id: data.id };
      }
    } catch (e) {
      console.warn('Persistência remota de mensagem falhou:', e);
    }
    return local;
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
        show3dParticles: data.show_3d_particles !== undefined && data.show_3d_particles !== null ? Boolean(data.show_3d_particles) : true,
      };
    } catch {
      return StorageService.getTheme();
    }
  },

  saveThemeConfig: async (theme: ThemeConfig): Promise<void> => {
    StorageService.saveTheme(theme);
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      await supabase
        .from('configuracoes_salao')
        .upsert({
          salon_name: theme.salonName,
          salon_tagline: theme.salonTagline,
          contact_phone: theme.contactPhone,
          instagram_handle: theme.instagramHandle,
          address: theme.address,
          opening_hours: theme.openingHours,
          primary_accent: theme.primaryAccent,
          accent_light: theme.accentLight,
          accent_subtle: theme.accentSubtle,
          accent_border: theme.accentBorder,
          card_surface: theme.cardSurface,
          show_3d_particles: theme.show3dParticles,
          updated_at: new Date().toISOString(),
        });
    } catch (e) {
      console.warn('Atualização remota de tema falhou:', e);
    }
  },

  // --------------------------------------------------------------------------
  // 9. PERFIL DE USUÁRIO & AUTENTICAÇÃO
  // --------------------------------------------------------------------------
  fetchUserProfile: async (userId: string): Promise<{ role: string; name: string; email: string } | null> => {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return {
        role: data.role,
        name: data.name,
        email: data.email,
      };
    } catch {
      return null;
    }
  },
};
