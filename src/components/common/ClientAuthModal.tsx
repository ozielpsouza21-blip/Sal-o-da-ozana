import React, { useState, useEffect } from 'react';
import { Sparkles, Mail, Lock, User, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Heart } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { SupabaseDataService } from '../../services/supabaseDataService';
import { AppRole } from '../../types';

interface ClientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: AppRole, userEmail: string, userName?: string) => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const ClientAuthModal: React.FC<ClientAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured() || !supabase) {
      setErrorMessage('Supabase não configurado. Verifique as variáveis de ambiente.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMessage('Por favor, informe seu e-mail cadastrado.');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });

        if (error) {
          setErrorMessage(`Erro ao enviar e-mail de recuperação: ${error.message}`);
        } else {
          setSuccessMessage('Instruções de recuperação enviadas para o seu e-mail!');
        }
        setLoading(false);
        return;
      }

      if (mode === 'login') {
        if (!email.trim() || !password) {
          setErrorMessage('Preencha o e-mail e a senha.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('E-mail ou senha incorretos.');
          } else {
            setErrorMessage(`Erro ao entrar: ${error.message}`);
          }
          setLoading(false);
          return;
        }

        if (data?.session?.user) {
          const user = data.session.user;
          setSuccessMessage('Login efetuado com sucesso!');

          // Fetch profile or default to client
          const profile = await SupabaseDataService.fetchUserProfile(user.id);
          const userName = profile?.name || user.user_metadata?.name || name || email.split('@')[0];

          // Ensure client record exists or create one if needed
          try {
            await SupabaseDataService.createClient({
              name: userName,
              email: user.email || email,
              phone: phone || '(11) 98888-7777',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              vipTier: 'Bronze',
              vipPoints: 100,
              preferences: 'Cliente cadastrada via portal',
              allergies: 'Nenhuma informada',
              favoriteDrink: 'Espumante Rosé',
            });
          } catch {
            // non-blocking
          }

          setTimeout(() => {
            onSuccess('client', user.email || email, userName);
            onClose();
          }, 600);
        }
      } else {
        // Signup mode
        if (!name.trim() || !email.trim() || !password) {
          setErrorMessage('Preencha todos os campos obrigatórios.');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim(),
              role: 'client',
            },
          },
        });

        if (error) {
          setErrorMessage(`Erro ao criar conta: ${error.message}`);
          setLoading(false);
          return;
        }

        if (data?.user) {
          setSuccessMessage('Conta VIP criada com sucesso! Entrando...');

          try {
            await SupabaseDataService.createClient({
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim() || '(11) 98888-7777',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              vipTier: 'Bronze',
              vipPoints: 150,
              preferences: 'Nova cliente cadastrada no portal',
              allergies: 'Nenhuma informada',
              favoriteDrink: 'Chá Branco Orgânico',
            });
          } catch {
            // non-blocking
          }

          setTimeout(() => {
            onSuccess('client', data.user?.email || email, name.trim());
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-[#0f0f15] border border-[#d4af37]/40 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#f3e5ab]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close / Back button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Voltar ao Início</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa8422] flex items-center justify-center text-black mx-auto mb-3 shadow-lg shadow-[#d4af37]/20">
            <Heart size={22} className="fill-black/20" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            Área Exclusiva da Cliente
          </h2>
          <p className="text-xs text-[#d4af37] font-medium tracking-widest uppercase mt-1">
            Sra. Bela Mulher Atelier VIP
          </p>
          <p className="text-xs text-neutral-400 mt-2">
            {mode === 'login' && 'Faça login para gerenciar seus agendamentos e pontos VIP.'}
            {mode === 'signup' && 'Cadastre-se para obter benefícios exclusivos e agendar com facilidade.'}
            {mode === 'forgot' && 'Informe seu e-mail para receber o link de recuperação de senha.'}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mb-4 bg-red-950/60 border border-red-500/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-200">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-200">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Letícia Silveira"
                    className="w-full bg-[#15151f] border border-white/10 focus:border-[#d4af37] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  WhatsApp / Telefone *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(11) 98888-7777"
                  className="w-full bg-[#15151f] border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              E-mail *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-[#15151f] border border-white/10 focus:border-[#d4af37] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-300">
                  Senha *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-[#f3e5ab] hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#15151f] border border-white/10 focus:border-[#d4af37] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8422] text-[#0a0a0c] font-semibold text-xs shadow-lg shadow-[#d4af37]/20 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin text-black" />
                <span>Processando...</span>
              </>
            ) : (
              <span>
                {mode === 'login' && 'Entrar na Área da Cliente'}
                {mode === 'signup' && 'Criar Conta VIP'}
                {mode === 'forgot' && 'Enviar Instruções de Recuperação'}
              </span>
            )}
          </button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-neutral-400">
          {mode === 'login' && (
            <p>
              Ainda não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[#f3e5ab] font-medium hover:underline cursor-pointer"
              >
                Cadastre-se gratuitamente
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Já possui cadastro?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[#f3e5ab] font-medium hover:underline cursor-pointer"
              >
                Faça login
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p>
              Lembrou sua senha?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[#f3e5ab] font-medium hover:underline cursor-pointer"
              >
                Voltar para o login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
