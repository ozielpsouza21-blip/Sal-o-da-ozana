/**
 * Supabase Official Client Configuration (Projeto: Espaçobelamulher)
 * 
 * Conexão oficial usando @supabase/supabase-js, alimentada por variáveis de ambiente
 * VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
 * 
 * Se as variáveis ainda não tiverem sido configuradas no ambiente, o cliente
 * permanece nulo de forma segura, permitindo que a aplicação continue operando
 * localmente com dados preservados.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Valida se as variáveis de ambiente necessárias para o projeto Espaçobelamulher foram informadas
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('SEU_PROJETO')
  );
};

export const getSupabaseConfig = () => {
  return {
    supabaseUrl: supabaseUrl || null,
    supabaseAnonKey: supabaseAnonKey || null,
    isConfigured: isSupabaseConfigured(),
    targetProjectName: 'Espaçobelamulher',
  };
};

/**
 * Instância oficial do cliente Supabase.
 * Inicializada apenas quando URL e Anon Key válidas estiverem presentes.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Interface padronizada para respostas de repositórios
 */
export interface SupabaseQueryResponse<T> {
  data: T | null;
  error: { message: string; details?: string } | null;
}
