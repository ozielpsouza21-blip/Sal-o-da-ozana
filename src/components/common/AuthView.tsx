import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowLeft, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { SupabaseDataService } from '../../services/supabaseDataService';
import { AppRole } from '../../types';

interface AuthViewProps {
  onSuccess: (role: AppRole, userEmail: string, userName?: string) => void;
  onCancel: () => void;
  initialMode?: 'login' | 'signup';
  targetRoleLabel?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onSuccess,
  onCancel,
  initialMode = 'login',
  targetRoleLabel = 'Painel do Atelier',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleQuickAdminFill = () => {
    setEmail('oficial.belamulher@gmail.com');
    setPassword('');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured() || !supabase) {
        // Fallback when Supabase is not yet configured locally
        setLoading(false);
        setErrorMessage('Cliente Supabase não inicializado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente.');
        return;
      }

      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('E-mail ou senha incorretos. Por favor, verifique suas credenciais.');
          } else if (error.message.includes('Email not confirmed')) {
            setErrorMessage('E-mail não confirmado. Verifique sua caixa de entrada.');
          } else {
            setErrorMessage(`Erro ao autenticar: ${error.message}`);
          }
          setLoading(false);
          return;
        }

        if (data?.session?.user) {
          const user = data.session.user;
          setSuccessMessage('Login efetuado com sucesso!');
          
          // Fetch user profile role from public.profiles
          const profile = await SupabaseDataService.fetchUserProfile(user.id);
          const userRole = (profile?.role || 'client') as AppRole;
          const userName = profile?.name || user.user_metadata?.name || email.split('@')[0];

          setTimeout(() => {
            onSuccess(userRole, user.email || email, userName);
          }, 600);
        }
      } else {
        // Sign Up Mode
        if (!name.trim()) {
          setErrorMessage('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim(),
            },
          },
        });

        if (error) {
          setErrorMessage(`Erro ao criar conta: ${error.message}`);
          setLoading(false);
          return;
        }

        if (data?.user) {
          setSuccessMessage('Conta criada com sucesso no Supabase! Efetuando login...');
          
          // Optionally create profile row if backend trigger isn't present
          try {
            await SupabaseDataService.saveThemeConfig; // trigger handshake
          } catch {
            // non-blocking
          }

          setTimeout(() => {
            onSuccess('client', data.user?.email || email, name);
          }, 800);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao comunicar com a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-[#0f0f15] border border-[#d4af37]/30 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#f3e5ab]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Return button */}
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para Página Pública</span>
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa8422] flex items-center justify-center text-black mx-auto mb-3 shadow-lg shadow-[#d4af37]/20">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            Sra. Bela Mulher
          </h2>
          <p className="text-xs text-[#d4af37] font-medium tracking-widest uppercase mt-1">
            Autenticação Oficial · Supabase Auth
          </p>
          <p className="text-xs text-neutral-400 mt-2">
            Acesse o {targetRoleLabel} com suas credenciais registradas.
          </p>
        </div>

        {/* Quick Fill for Official Admin */}
        <div className="mb-6 bg-[#161622] border border-[#d4af37]/20 rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <ShieldCheck size={16} className="text-[#d4af37] shrink-0" />
            <span>E-mail do Administrador Oficial</span>
          </div>
          <button
            type="button"
            onClick={handleQuickAdminFill}
            className="text-[11px] bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#f3e5ab] px-2.5 py-1 rounded-md font-medium transition-colors border border-[#d4af37]/30 cursor-pointer shrink-0"
          >
            Preencher E-mail
          </button>
        </div>

        {/* Feedback Alert Messages */}
        {errorMessage && (
          <div className="mb-5 bg-red-950/60 border border-red-500/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Nome Completo
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full bg-[#15151f] border border-white/10 focus:border-[#d4af37] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              E-mail Registrado
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="oficial.belamulher@gmail.com"
                className="w-full bg-[#15151f] border border-white/10 focus:border-[#d4af37] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#15151f] border border-white/10 focus:border-[#d4af37] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8422] text-[#0a0a0c] font-semibold text-xs shadow-lg shadow-[#d4af37]/20 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin text-black" />
                <span>Autenticando no Supabase...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Entrar com Supabase Auth' : 'Criar Nova Conta no Supabase'}</span>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-neutral-400">
          {mode === 'login' ? (
            <p>
              Primeiro acesso ao aplicativo?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className="text-[#f3e5ab] font-medium hover:underline cursor-pointer"
              >
                Criar uma conta no Supabase Auth
              </button>
            </p>
          ) : (
            <p>
              Já possui uma conta registrada?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="text-[#f3e5ab] font-medium hover:underline cursor-pointer"
              >
                Fazer login com e-mail e senha
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
