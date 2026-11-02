import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Clock, CheckCheck, Minimize2 } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ChatMessage } from '../../types';

interface FloatingChatProps {
  currentUserId?: string;
  currentUserName?: string;
  userRole?: 'visitor' | 'client' | 'professional' | 'admin';
}

export const FloatingChat: React.FC<FloatingChatProps> = ({
  currentUserId = 'visitor-guest',
  currentUserName = 'Visitante',
  userRole = 'visitor',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const conversationId = userRole === 'client' ? 'conv-1' : 'conv-visitor';

  // Load initial messages
  useEffect(() => {
    const all = StorageService.getMessages();
    const currentList = all[conversationId] || [
      {
        id: 'welcome-1',
        conversationId,
        senderId: 'concierge',
        senderName: 'Concierge Sra. Bela Mulher',
        senderRole: 'admin',
        text: 'Olá! Seja muito bem-vinda ao atelier Sra. Bela Mulher. Como posso tornar sua experiência inesquecível hoje?',
        timestamp: 'Agora',
        isRead: true,
      },
    ];
    setMessages(currentList);
  }, [conversationId, isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg = StorageService.sendMessage(conversationId, {
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: userRole,
      text,
      isRead: false,
    });

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Concierge automatic luxury reply
    setIsTyping(true);
    setTimeout(() => {
      let replyText = 'Agradecemos sua mensagem! Nossa equipe de recepção e especialistas está à sua total disposição para confirmar horários ou esclarecer qualquer dúvida de beleza.';
      
      const lower = text.toLowerCase();
      if (lower.includes('horário') || lower.includes('agenda') || lower.includes('vaga')) {
        replyText = 'Temos horários disponíveis nesta semana com nossa equipe visagista! Você pode selecionar o serviço desejado na aba "Novo Agendamento" ou nos informar seu dia de preferência.';
      } else if (lower.includes('vip') || lower.includes('pontos') || lower.includes('selo')) {
        replyText = 'Nosso Clube VIP concede de 5% a 15% em experiências, além de mimos exclusivos como degustação de espumante e agendamento preferencial aos sábados!';
      } else if (lower.includes('mechas') || lower.includes('morena') || lower.includes('corte')) {
        replyText = 'Nossa Balayage Dourada & Morena Iluminada inclui avaliação visagista personalizada e reconstrução capilar. O valor de referência é a partir de R$ 680,00.';
      } else if (lower.includes('juliana') || lower.includes('larissa') || lower.includes('beatriz')) {
        replyText = 'Excelente escolha! Nossas profissionais possuem formação internacional de alta precisão. Seus horários podem ser reservados diretamente pelo portal da cliente.';
      }

      const botMsg = StorageService.sendMessage(conversationId, {
        senderId: 'concierge',
        senderName: 'Concierge Sra. Bela Mulher',
        senderRole: 'admin',
        text: replyText,
        isRead: true,
      });

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const quickQuestions = [
    'Quais os horários disponíveis esta semana?',
    'Como funciona o Selo VIP?',
    'Valores de Balayage e Tratamentos',
    'Gostaria de falar com a recepção',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#121216] border border-[#d4af37]/50 text-[#f3e5ab] shadow-2xl shadow-black/80 hover:bg-[#1a1a24] hover:border-[#d4af37] hover:scale-105 active:scale-95 transition-all duration-200 group cursor-pointer"
          aria-label="Abrir chat do concierge"
        >
          <div className="relative">
            <MessageSquare size={20} className="text-[#d4af37]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d4af37] rounded-full" />
          </div>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            Concierge Online
          </span>
        </button>
      )}

      {/* Floating Chat Box Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[390px] h-[520px] max-h-[85vh] bg-[#101014] border border-[#d4af37]/40 rounded-2xl shadow-2xl shadow-black flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#181822] via-[#14141a] to-[#1a1a24] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8d7122] flex items-center justify-center text-black font-bold shadow-md shadow-[#d4af37]/20">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-sm font-serif font-semibold text-white tracking-wide">
                  Concierge Sra. Bela Mulher
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-[#d4af37]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                  <span>Atendimento Exclusivo</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Minimizar chat"
                aria-label="Minimizar chat"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Fechar chat"
                aria-label="Fechar chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick FAQ Questions Chips */}
          <div className="px-3 py-2 bg-[#0c0c0f] border-b border-white/[0.05] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[#181820] text-neutral-300 hover:text-[#f3e5ab] hover:border-[#d4af37]/40 border border-white/[0.06] transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0d0d11]">
            {messages.map(msg => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-neutral-400 mb-1 px-1">
                    {msg.senderName} · {msg.timestamp}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black font-medium rounded-tr-xs'
                        : 'bg-[#1a1a24] text-neutral-200 border border-white/[0.08] rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-[#d4af37] px-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse delay-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse delay-150" />
                <span className="text-[11px] text-neutral-400 ml-1">Concierge digitando...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[#14141a] border-t border-white/[0.08] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Digite sua dúvida ou pedido..."
              className="flex-1 bg-[#0b0b0e] text-xs text-white placeholder-neutral-500 px-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#d4af37]/60"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-lg bg-[#d4af37] text-black disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all"
              title="Enviar mensagem"
              aria-label="Enviar mensagem"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
