import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Scissors,
  Sparkles,
  Search,
} from 'lucide-react';
import { Conversation, ChatMessage } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { StorageService } from '../../../services/storage';

interface ConversationsModuleProps {
  conversations: Conversation[];
  onRefreshData: () => void;
}

export const ConversationsModule: React.FC<ConversationsModuleProps> = ({
  conversations,
  onRefreshData,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || 'conv-1');
  const [textInput, setTextInput] = useState('');

  const messagesMap = StorageService.getMessages();
  const currentMessages = messagesMap[selectedConvId] || [];
  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    StorageService.sendMessage(selectedConvId, {
      senderId: 'admin-reception',
      senderName: 'Recepção Atelier',
      senderRole: 'admin',
      text: textInput.trim(),
      isRead: true,
    });

    setTextInput('');
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold text-white">
          Central de Conversas & Concierge
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Atenda clientes VIP, confirme horários e comunique-se com a equipe na mesma tela.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[560px]">
        {/* Left: Conversations List */}
        <Card padding="none" className="overflow-hidden flex flex-col bg-[#111116] border border-white/10">
          <div className="p-3 bg-[#14141c] border-b border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Conversas Recentes ({conversations.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {conversations.map(conv => {
              const isSelected = conv.id === selectedConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors ${
                    isSelected ? 'bg-[#181824] border-l-2 border-[#d4af37]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <img
                    src={conv.participantAvatar}
                    alt={conv.participantName}
                    className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">
                        {conv.participantName}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {conv.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Right: Active Chat Area */}
        <Card padding="none" className="lg:col-span-2 overflow-hidden flex flex-col bg-[#0e0e12] border border-white/10">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-[#14141c] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConv.participantAvatar}
                    alt={selectedConv.participantName}
                    className="w-9 h-9 rounded-full object-cover border border-[#d4af37]/40"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {selectedConv.participantName}
                    </h4>
                    <span className="text-[10px] text-[#d4af37] uppercase font-medium">
                      {selectedConv.participantRole === 'client' ? 'Cliente VIP' : 'Especialista Parceira'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0a0d]">
                {currentMessages.map(m => {
                  const isAdmin = m.senderRole === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-neutral-500 mb-0.5 px-1">
                        {m.senderName} · {m.timestamp}
                      </div>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black font-medium'
                            : 'bg-[#181822] text-neutral-200 border border-white/10'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#14141c] border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder={`Responder para ${selectedConv.participantName.split(' ')[0]}...`}
                  className="flex-1 bg-[#0b0b0e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#d4af37] focus:outline-none"
                />
                <Button type="submit" size="sm" icon={<Send size={14} />}>
                  Enviar
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-neutral-500">
              Selecione uma conversa para visualizar o histórico
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
