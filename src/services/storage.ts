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
  BillRecord,
  CashClosingRecord,
  PixConfig,
  PaymentProofRecord,
  Vitrine,
  CartItem,
} from '../types';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_CASH_STATUS,
  INITIAL_CLIENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_PRODUCTS,
  INITIAL_PROFESSIONALS,
  INITIAL_SERVICES,
  INITIAL_THEME,
  INITIAL_TRANSACTIONS,
  INITIAL_BILLS,
  INITIAL_CASH_CLOSINGS,
  INITIAL_PIX_CONFIG,
  INITIAL_PAYMENT_PROOFS,
  INITIAL_VITRINES,
} from '../data/initialData';

const STORAGE_KEYS = {
  SERVICES: 'sbm_services_v1',
  PROFESSIONALS: 'sbm_professionals_v1',
  CLIENTS: 'sbm_clients_v1',
  PRODUCTS: 'sbm_products_v1',
  APPOINTMENTS: 'sbm_appointments_v1',
  CASH_STATUS: 'sbm_cash_status_v1',
  TRANSACTIONS: 'sbm_transactions_v1',
  THEME: 'sbm_theme_v1',
  CONVERSATIONS: 'sbm_conversations_v1',
  MESSAGES: 'sbm_messages_v1',
  BILLS: 'sbm_bills_v1',
  CASH_CLOSINGS: 'sbm_cash_closings_v1',
  PIX_CONFIG: 'sbm_pix_config_v1',
  PAYMENT_PROOFS: 'sbm_payment_proofs_v1',
  VITRINES: 'sbm_vitrines_v1',
  CART: 'sbm_cart_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Erro ao carregar chave ${key} do localStorage`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Erro ao salvar chave ${key} no localStorage`, err);
  }
}

export const StorageService = {
  // Services
  getServices: (): Service[] => safeGet(STORAGE_KEYS.SERVICES, INITIAL_SERVICES),
  saveServices: (services: Service[]) => safeSet(STORAGE_KEYS.SERVICES, services),
  addService: (service: Omit<Service, 'id'>): Service => {
    const current = StorageService.getServices();
    const newService: Service = { ...service, id: `srv-${Date.now()}` };
    const updated = [newService, ...current];
    StorageService.saveServices(updated);
    return newService;
  },
  updateService: (id: string, updates: Partial<Service>): Service | null => {
    const current = StorageService.getServices();
    const index = current.findIndex(s => s.id === id);
    if (index === -1) return null;
    current[index] = { ...current[index], ...updates };
    StorageService.saveServices(current);
    return current[index];
  },
  deleteService: (id: string): boolean => {
    const current = StorageService.getServices();
    const updated = current.filter(s => s.id !== id);
    if (updated.length === current.length) return false;
    StorageService.saveServices(updated);
    return true;
  },

  // Professionals
  getProfessionals: (): Professional[] => safeGet(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS),
  saveProfessionals: (list: Professional[]) => safeSet(STORAGE_KEYS.PROFESSIONALS, list),
  addProfessional: (pro: Omit<Professional, 'id'>): Professional => {
    const current = StorageService.getProfessionals();
    const newPro: Professional = { ...pro, id: `pro-${Date.now()}` };
    const updated = [...current, newPro];
    StorageService.saveProfessionals(updated);
    return newPro;
  },
  updateProfessional: (id: string, updates: Partial<Professional>): Professional | null => {
    const current = StorageService.getProfessionals();
    const index = current.findIndex(p => p.id === id);
    if (index === -1) return null;
    current[index] = { ...current[index], ...updates };
    StorageService.saveProfessionals(current);
    return current[index];
  },

  // Clients
  getClients: (): ClientProfile[] => safeGet(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS),
  saveClients: (list: ClientProfile[]) => safeSet(STORAGE_KEYS.CLIENTS, list),
  addClient: (cli: Omit<ClientProfile, 'id' | 'createdAt'>): ClientProfile => {
    const current = StorageService.getClients();
    const newCli: ClientProfile = {
      ...cli,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newCli, ...current];
    StorageService.saveClients(updated);
    return newCli;
  },
  updateClient: (id: string, updates: Partial<ClientProfile>): ClientProfile | null => {
    const current = StorageService.getClients();
    const index = current.findIndex(c => c.id === id);
    if (index === -1) return null;
    current[index] = { ...current[index], ...updates };
    StorageService.saveClients(current);
    return current[index];
  },

  // Products
  getProducts: (): Product[] => safeGet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProducts: (products: Product[]) => safeSet(STORAGE_KEYS.PRODUCTS, products),
  addProduct: (product: Omit<Product, 'id'>): Product => {
    const current = StorageService.getProducts();
    const newProduct: Product = { ...product, id: `prd-${Date.now()}` };
    const updated = [newProduct, ...current];
    StorageService.saveProducts(updated);
    return newProduct;
  },
  adjustProductStock: (id: string, delta: number) => {
    const current = StorageService.getProducts();
    const index = current.findIndex(p => p.id === id);
    if (index !== -1) {
      current[index].stockQuantity = Math.max(0, current[index].stockQuantity + delta);
      StorageService.saveProducts(current);
    }
  },

  // Appointments
  getAppointments: (): Appointment[] => safeGet(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
  saveAppointments: (list: Appointment[]) => safeSet(STORAGE_KEYS.APPOINTMENTS, list),
  addAppointment: (apt: Omit<Appointment, 'id'>): Appointment => {
    const current = StorageService.getAppointments();
    const newApt: Appointment = { ...apt, id: `apt-${Date.now()}` };
    const updated = [newApt, ...current];
    StorageService.saveAppointments(updated);
    return newApt;
  },
  updateAppointmentStatus: (id: string, status: AppointmentStatus, formulaRecord?: string) => {
    const current = StorageService.getAppointments();
    const index = current.findIndex(a => a.id === id);
    if (index !== -1) {
      current[index].status = status;
      if (formulaRecord) {
        current[index].formulaRecord = formulaRecord;
      }
      StorageService.saveAppointments(current);

      // Se for concluído, registra no extrato de caixa se estiver aberto
      if (status === 'concluido') {
        const apt = current[index];
        const method =
          apt.paymentMethod === 'cartao_credito' ||
          apt.paymentMethod === 'cartao_debito' ||
          apt.paymentMethod === 'dinheiro'
            ? apt.paymentMethod
            : 'pix';

        StorageService.addCashTransaction({
          type: 'entrada',
          category: 'Serviço Concluído',
          description: `Atendimento ${apt.serviceName} - ${apt.clientName}`,
          amountBRL: apt.priceBRL,
          operatorName: apt.professionalName,
          appointmentId: apt.id,
          paymentMethod: method,
        });
      }
    }
  },
  updateAppointment: (id: string, updates: Partial<Appointment>): Appointment | null => {
    const current = StorageService.getAppointments();
    const index = current.findIndex(a => a.id === id);
    if (index === -1) return null;
    current[index] = { ...current[index], ...updates };
    StorageService.saveAppointments(current);
    return current[index];
  },

  // Cash Register
  getCashStatus: (): CashRegisterStatus => safeGet(STORAGE_KEYS.CASH_STATUS, INITIAL_CASH_STATUS),
  saveCashStatus: (status: CashRegisterStatus) => safeSet(STORAGE_KEYS.CASH_STATUS, status),
  getTransactions: (): CashTransaction[] => safeGet(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS),
  saveTransactions: (list: CashTransaction[]) => safeSet(STORAGE_KEYS.TRANSACTIONS, list),
  addCashTransaction: (trx: Omit<CashTransaction, 'id' | 'timestamp'>): CashTransaction => {
    const current = StorageService.getTransactions();
    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 8)}`;
    const newTrx: CashTransaction = {
      ...trx,
      id: `trx-${Date.now()}`,
      timestamp: timestampStr,
    };
    const updated = [newTrx, ...current];
    StorageService.saveTransactions(updated);

    // Atualiza status do caixa
    const status = StorageService.getCashStatus();
    // PIX e Cartões não alteram o gaveteiro físico de dinheiro em espécie
    const isCashInflow =
      trx.type === 'suprimento' ||
      trx.type === 'abertura' ||
      (trx.type === 'entrada' && (trx.paymentMethod === 'dinheiro' || !trx.paymentMethod));
    const isCashOutflow =
      trx.type === 'sangria' ||
      (trx.type === 'saida' && (trx.paymentMethod === 'dinheiro' || !trx.paymentMethod));

    if (trx.type === 'entrada' || trx.type === 'suprimento') {
      if (isCashInflow) {
        status.currentBalanceBRL += trx.amountBRL;
      }
      status.totalEntradas += trx.amountBRL;
    } else if (trx.type === 'saida' || trx.type === 'sangria') {
      if (isCashOutflow) {
        status.currentBalanceBRL = Math.max(0, status.currentBalanceBRL - trx.amountBRL);
      }
      status.totalSaidas += trx.amountBRL;
    }
    StorageService.saveCashStatus(status);
    return newTrx;
  },
  openCashRegister: (initialBalanceBRL: number, operatorName: string) => {
    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 8)}`;
    const newStatus: CashRegisterStatus = {
      isOpen: true,
      openedAt: timestampStr,
      openedBy: operatorName,
      initialBalanceBRL,
      currentBalanceBRL: initialBalanceBRL,
      totalEntradas: 0,
      totalSaidas: 0,
    };
    StorageService.saveCashStatus(newStatus);
    StorageService.addCashTransaction({
      type: 'abertura',
      category: 'Abertura de Caixa',
      description: `Abertura oficial do caixa do dia com fundo inicial`,
      amountBRL: initialBalanceBRL,
      operatorName,
    });
  },
  closeCashRegister: (
    operatorName: string,
    closingData?: {
      countedCashBRL: number;
      countedCardBRL: number;
      countedPixBRL: number;
      differenceReason?: string;
      notes?: string;
    }
  ): CashClosingRecord => {
    const status = StorageService.getCashStatus();
    status.isOpen = false;
    StorageService.saveCashStatus(status);

    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 8)}`;

    const countedCash = closingData?.countedCashBRL ?? status.currentBalanceBRL;
    const countedCard = closingData?.countedCardBRL ?? 0;
    const countedPix = closingData?.countedPixBRL ?? 0;
    const totalCounted = countedCash + countedCard + countedPix;
    const difference = countedCash - status.currentBalanceBRL;

    const closingRecord: CashClosingRecord = {
      id: `closing-${Date.now()}`,
      closedAt: timestampStr,
      operatorName,
      initialBalanceBRL: status.initialBalanceBRL,
      totalEntradas: status.totalEntradas,
      totalSaidas: status.totalSaidas,
      expectedBalanceBRL: status.currentBalanceBRL,
      countedCashBRL: countedCash,
      countedCardBRL: countedCard,
      countedPixBRL: countedPix,
      totalCountedBRL: totalCounted,
      differenceBRL: difference,
      differenceReason: closingData?.differenceReason,
      notes: closingData?.notes || `Encerramento de turno executado por ${operatorName}`,
    };

    StorageService.addCashClosing(closingRecord);

    StorageService.addCashTransaction({
      type: 'fechamento',
      category: 'Fechamento de Caixa',
      description: `Encerramento do turno com saldo apurado de R$ ${status.currentBalanceBRL.toFixed(2)}${
        Math.abs(difference) > 0.01 ? ` (Divergência: R$ ${difference.toFixed(2)})` : ' (Conferência exata)'
      }`,
      amountBRL: status.currentBalanceBRL,
      operatorName,
    });

    return closingRecord;
  },

  // Contas a Pagar & Receber (Gestão Financeira)
  getBills: (): BillRecord[] => safeGet(STORAGE_KEYS.BILLS, INITIAL_BILLS),
  saveBills: (bills: BillRecord[]) => safeSet(STORAGE_KEYS.BILLS, bills),
  addBill: (bill: Omit<BillRecord, 'id' | 'createdAt'>): BillRecord => {
    const current = StorageService.getBills();
    const newBill: BillRecord = {
      ...bill,
      id: `bill-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    StorageService.saveBills([newBill, ...current]);
    return newBill;
  },
  updateBill: (id: string, updates: Partial<BillRecord>): BillRecord | null => {
    const current = StorageService.getBills();
    const idx = current.findIndex(b => b.id === id);
    if (idx === -1) return null;
    current[idx] = { ...current[idx], ...updates };
    StorageService.saveBills(current);
    return current[idx];
  },
  deleteBill: (id: string): boolean => {
    const current = StorageService.getBills();
    const updated = current.filter(b => b.id !== id);
    StorageService.saveBills(updated);
    return true;
  },

  // Histórico de Fechamentos de Caixa
  getCashClosings: (): CashClosingRecord[] => safeGet(STORAGE_KEYS.CASH_CLOSINGS, INITIAL_CASH_CLOSINGS),
  saveCashClosings: (list: CashClosingRecord[]) => safeSet(STORAGE_KEYS.CASH_CLOSINGS, list),
  addCashClosing: (closing: Omit<CashClosingRecord, 'id'>): CashClosingRecord => {
    const current = StorageService.getCashClosings();
    const newRecord: CashClosingRecord = {
      ...closing,
      id: (closing as any).id || `closing-${Date.now()}`,
    };
    StorageService.saveCashClosings([newRecord, ...current]);
    return newRecord;
  },

  // Conversations & Chat
  getConversations: (): Conversation[] => safeGet(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS),
  saveConversations: (list: Conversation[]) => safeSet(STORAGE_KEYS.CONVERSATIONS, list),
  getMessages: (): Record<string, ChatMessage[]> => safeGet(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES),
  saveMessages: (msgs: Record<string, ChatMessage[]>) => safeSet(STORAGE_KEYS.MESSAGES, msgs),
  sendMessage: (convId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'conversationId'>): ChatMessage => {
    const allMessages = StorageService.getMessages();
    const list = allMessages[convId] || [];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      conversationId: convId,
      timestamp: timeStr,
    };
    allMessages[convId] = [...list, newMsg];
    StorageService.saveMessages(allMessages);

    // Update conversation lastMessage
    const convs = StorageService.getConversations();
    const cIdx = convs.findIndex(c => c.id === convId);
    if (cIdx !== -1) {
      convs[cIdx].lastMessage = message.text;
      convs[cIdx].lastMessageTime = timeStr;
      StorageService.saveConversations(convs);
    }

    return newMsg;
  },

  // Theme
  getTheme: (): ThemeConfig => {
    const th = safeGet(STORAGE_KEYS.THEME, INITIAL_THEME);
    return {
      ...th,
      show3dParticles: th.show3dParticles !== false,
    };
  },
  saveTheme: (theme: ThemeConfig) => {
    safeSet(STORAGE_KEYS.THEME, theme);
    // Apply CSS variables to root
    const root = document.documentElement;
    root.style.setProperty('--accent-gold', theme.primaryAccent);
    root.style.setProperty('--accent-gold-light', theme.accentLight);
    root.style.setProperty('--accent-gold-subtle', theme.accentSubtle);
    root.style.setProperty('--accent-gold-border', theme.accentBorder);
  },

  // PIX Configuration
  getPixConfig: (): PixConfig => safeGet(STORAGE_KEYS.PIX_CONFIG, INITIAL_PIX_CONFIG),
  savePixConfig: (config: PixConfig): void => safeSet(STORAGE_KEYS.PIX_CONFIG, config),
  updatePixConfig: (updates: Partial<PixConfig>): PixConfig => {
    const current = StorageService.getPixConfig();
    const updated: PixConfig = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    StorageService.savePixConfig(updated);
    return updated;
  },

  // Payment Proofs & Receipts
  getPaymentProofs: (): PaymentProofRecord[] => safeGet(STORAGE_KEYS.PAYMENT_PROOFS, INITIAL_PAYMENT_PROOFS),
  savePaymentProofs: (proofs: PaymentProofRecord[]): void => safeSet(STORAGE_KEYS.PAYMENT_PROOFS, proofs),
  addPaymentProof: (proof: Omit<PaymentProofRecord, 'id' | 'status' | 'submittedAt'>): PaymentProofRecord => {
    const current = StorageService.getPaymentProofs();
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newProof: PaymentProofRecord = {
      ...proof,
      id: `proof-${Date.now()}`,
      status: 'aguardando_confirmacao',
      submittedAt: `${dateStr} ${timeStr}`,
    };
    const updated = [newProof, ...current];
    StorageService.savePaymentProofs(updated);

    // Also update associated appointment status if present
    if (proof.appointmentId) {
      StorageService.updateAppointment(proof.appointmentId, {
        paymentStatus: 'aguardando_confirmacao',
        paymentMethod: 'pix',
        paymentProofUrl: proof.proofImageUrl,
      });
    }

    return newProof;
  },
  confirmPaymentProof: (proofId: string, confirmedBy = 'Administrador'): PaymentProofRecord | null => {
    const current = StorageService.getPaymentProofs();
    const index = current.findIndex(p => p.id === proofId);
    if (index === -1) return null;

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    current[index] = {
      ...current[index],
      status: 'confirmado',
      confirmedAt: `${dateStr} ${timeStr}`,
      confirmedBy,
    };
    StorageService.savePaymentProofs(current);

    const proof = current[index];
    if (proof.appointmentId) {
      StorageService.updateAppointment(proof.appointmentId, {
        paymentStatus: 'pago',
        paymentMethod: 'pix',
      });
    }

    // Add entry to cash register / transactions as PIX revenue
    StorageService.addCashTransaction({
      type: 'entrada',
      category: 'Recebimento PIX',
      description: `PIX confirmado: ${proof.description} - ${proof.clientName}`,
      amountBRL: proof.amountBRL,
      operatorName: confirmedBy,
      appointmentId: proof.appointmentId,
      paymentMethod: 'pix',
    });

    return current[index];
  },
  rejectPaymentProof: (proofId: string, notes?: string): PaymentProofRecord | null => {
    const current = StorageService.getPaymentProofs();
    const index = current.findIndex(p => p.id === proofId);
    if (index === -1) return null;

    current[index] = {
      ...current[index],
      status: 'rejeitado',
      adminNotes: notes || 'Comprovante não localizado ou com dados divergentes.',
    };
    StorageService.savePaymentProofs(current);

    if (current[index].appointmentId) {
      StorageService.updateAppointment(current[index].appointmentId!, {
        paymentStatus: 'pendente',
      });
    }

    return current[index];
  },

  // Vitrines (Múltiplas Vitrines)
  getVitrines: (): Vitrine[] => safeGet(STORAGE_KEYS.VITRINES, INITIAL_VITRINES),
  saveVitrines: (list: Vitrine[]) => safeSet(STORAGE_KEYS.VITRINES, list),
  addVitrine: (vitrine: Omit<Vitrine, 'id' | 'createdAt' | 'updatedAt'>): Vitrine => {
    const current = StorageService.getVitrines();
    const now = new Date().toISOString();
    const newVitrine: Vitrine = {
      ...vitrine,
      id: `vitrine-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...current, newVitrine];
    StorageService.saveVitrines(updated);
    return newVitrine;
  },
  updateVitrine: (id: string, updates: Partial<Vitrine>): Vitrine | null => {
    const current = StorageService.getVitrines();
    const index = current.findIndex(v => v.id === id);
    if (index === -1) return null;
    current[index] = {
      ...current[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    StorageService.saveVitrines(current);
    return current[index];
  },
  deleteVitrine: (id: string): boolean => {
    const current = StorageService.getVitrines();
    const updated = current.filter(v => v.id !== id);
    if (updated.length === current.length) return false;
    StorageService.saveVitrines(updated);
    return true;
  },

  // Shopping Cart
  getCart: (): CartItem[] => safeGet(STORAGE_KEYS.CART, []),
  saveCart: (items: CartItem[]) => safeSet(STORAGE_KEYS.CART, items),
  clearCart: () => safeSet(STORAGE_KEYS.CART, []),

  // Reset to initial (for testing)
  resetAll: () => {
    localStorage.clear();
    window.location.reload();
  },
};
