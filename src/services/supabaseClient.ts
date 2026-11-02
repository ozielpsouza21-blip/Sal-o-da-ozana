/**
 * Supabase Architecture Bridge & Client Configuration
 * 
 * Este arquivo define a arquitetura pronta para futura conexão direta com o Supabase
 * (Autenticação, Banco de Dados PostgreSQL, Storage de Fotos e Real-time Channels),
 * com camada local totalmente desacoplada e reativa.
 */

export interface SupabaseConfig {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  isConfigured: boolean;
}

// Obter variáveis de ambiente seguras (sem expor credenciais reais)
export const getSupabaseConfig = (): SupabaseConfig => {
  const url = import.meta.env.VITE_SUPABASE_URL || null;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

  return {
    supabaseUrl: url,
    supabaseAnonKey: key,
    isConfigured: Boolean(url && key),
  };
};

/**
 * Interface padronizada para repositórios compatíveis com Supabase
 */
export interface SupabaseQueryResponse<T> {
  data: T | null;
  error: { message: string; details?: string } | null;
}

export interface SupabaseClientContract {
  auth: {
    getUser: () => Promise<SupabaseQueryResponse<{ id: string; email: string; role: string }>>;
    signInWithPassword: (credentials: { email: string; password?: string }) => Promise<SupabaseQueryResponse<{ token: string }>>;
    signOut: () => Promise<SupabaseQueryResponse<boolean>>;
  };
  from: <T = any>(table: string) => {
    select: (columns?: string) => Promise<SupabaseQueryResponse<T[]>>;
    insert: (values: Partial<T> | Partial<T>[]) => Promise<SupabaseQueryResponse<T[]>>;
    update: (values: Partial<T>) => { eq: (column: string, value: any) => Promise<SupabaseQueryResponse<T[]>> };
    delete: () => { eq: (column: string, value: any) => Promise<SupabaseQueryResponse<boolean>> };
  };
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: Blob) => Promise<SupabaseQueryResponse<{ path: string }>>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
  channel: (channelName: string) => {
    on: (event: string, filter: any, callback: (payload: any) => void) => any;
    subscribe: () => void;
    unsubscribe: () => void;
  };
}

/**
 * Cliente representativo preparado para conectar ao Supabase quando as variáveis de ambiente forem injetadas
 */
export const supabaseClient: SupabaseClientContract = {
  auth: {
    getUser: async () => ({
      data: { id: 'usr-admin-1', email: 'contato@srabélamulher.com.br', role: 'admin' },
      error: null,
    }),
    signInWithPassword: async () => ({
      data: { token: 'mock-session-token' },
      error: null,
    }),
    signOut: async () => ({
      data: true,
      error: null,
    }),
  },
  from: <T = any>(_table: string) => ({
    select: async () => {
      // Carregado através da camada de Storage Reativo
      return { data: [] as T[], error: null };
    },
    insert: async (values: Partial<T> | Partial<T>[]) => {
      const arr = Array.isArray(values) ? values : [values];
      return { data: arr as unknown as T[], error: null };
    },
    update: (values: Partial<T>) => ({
      eq: async () => ({ data: [values] as unknown as T[], error: null }),
    }),
    delete: () => ({
      eq: async () => ({ data: true, error: null }),
    }),
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string) => ({
        data: { path: `${bucket}/${path}` },
        error: null,
      }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `/uploads/${path}` },
      }),
    }),
  },
  channel: (channelName: string) => ({
    on: () => ({}),
    subscribe: () => {},
    unsubscribe: () => {},
  }),
};
