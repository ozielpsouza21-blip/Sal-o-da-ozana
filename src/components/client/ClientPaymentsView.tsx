import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Copy,
  Check,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  Sparkles,
  Building,
  User,
  Eye,
  FileCheck,
  ShieldCheck,
  Calendar,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Appointment, ClientProfile, PaymentProofRecord, PixConfig } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { StorageService } from '../../services/storage';
import { processImageFile } from '../../utils/imageUpload';

interface ClientPaymentsViewProps {
  currentClient: ClientProfile;
  appointments: Appointment[];
  onRefreshData: () => void;
}

export const ClientPaymentsView: React.FC<ClientPaymentsViewProps> = ({
  currentClient,
  appointments,
  onRefreshData,
}) => {
  const [pixConfig, setPixConfig] = useState<PixConfig>(StorageService.getPixConfig());
  const [proofs, setProofs] = useState<PaymentProofRecord[]>(StorageService.getPaymentProofs());

  // Copy Feedback states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Submit Proof Modal state
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState<string>('');
  const [proofAmount, setProofAmount] = useState<string>('');
  const [proofDescription, setProofDescription] = useState<string>('');
  const [proofImageBase64, setProofImageBase64] = useState<string>('');
  const [proofClientNotes, setProofClientNotes] = useState<string>('');
  const [isProcessingProof, setIsProcessingProof] = useState<boolean>(false);
  const [proofSubmitSuccess, setProofSubmitSuccess] = useState<boolean>(false);

  // View Receipt Modal state
  const [viewingProof, setViewingProof] = useState<PaymentProofRecord | null>(null);

  // Filter client data
  const myAppointments = appointments.filter(a => a.clientId === currentClient.id);
  const myProofs = proofs.filter(p => p.clientId === currentClient.id);

  // Pending appointments to pay
  const pendingAppointments = myAppointments.filter(
    a => a.status !== 'cancelado' && a.paymentStatus !== 'pago'
  );

  const reloadData = () => {
    setPixConfig(StorageService.getPixConfig());
    setProofs(StorageService.getPaymentProofs());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleCopyCode = () => {
    if (!pixConfig.copiaECola) return;
    navigator.clipboard.writeText(pixConfig.copiaECola);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyKey = () => {
    if (!pixConfig.chavePix) return;
    navigator.clipboard.writeText(pixConfig.chavePix);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleOpenProofModal = (apt?: Appointment) => {
    if (apt) {
      setSelectedAptId(apt.id);
      setProofAmount(apt.priceBRL.toFixed(2));
      setProofDescription(`${apt.serviceName} (${apt.date} às ${apt.time})`);
    } else if (pendingAppointments.length > 0) {
      const first = pendingAppointments[0];
      setSelectedAptId(first.id);
      setProofAmount(first.priceBRL.toFixed(2));
      setProofDescription(`${first.serviceName} (${first.date} às ${first.time})`);
    } else {
      setSelectedAptId('');
      setProofAmount('');
      setProofDescription('Pagamento de Atendimento / Sinal');
    }
    setProofImageBase64('');
    setProofClientNotes('');
    setProofSubmitSuccess(false);
    setIsProofModalOpen(true);
  };

  const handleProofImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingProof(true);
    try {
      const dataUrl = await processImageFile(file, 1000, 1000, 0.88);
      setProofImageBase64(dataUrl);
    } catch (err: any) {
      alert(err?.message || 'Erro ao carregar comprovante.');
    } finally {
      setIsProcessingProof(false);
    }
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(proofAmount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Informe um valor válido em reais.');
      return;
    }
    if (!proofImageBase64) {
      alert('Por favor, anexe a foto ou captura de tela do comprovante.');
      return;
    }

    StorageService.addPaymentProof({
      clientId: currentClient.id,
      clientName: currentClient.name,
      clientPhone: currentClient.phone,
      appointmentId: selectedAptId || undefined,
      amountBRL: amountNum,
      description: proofDescription || 'Pagamento PIX',
      proofImageUrl: proofImageBase64,
      adminNotes: proofClientNotes ? `Obs da cliente: ${proofClientNotes}` : undefined,
    });

    setProofs(StorageService.getPaymentProofs());
    onRefreshData();
    setProofSubmitSuccess(true);
    setTimeout(() => {
      setProofSubmitSuccess(false);
      setIsProofModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2.5">
            Pagamentos & PIX Oficial
            <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-medium border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#f3e5ab]">
              Atelier Exclusivo
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Consulte os dados oficiais de pagamento, copie a chave PIX e envie seu comprovante com rapidez.
          </p>
        </div>

        <Button
          onClick={() => handleOpenProofModal()}
          icon={<FileCheck size={16} />}
          size="md"
        >
          Já realizei o pagamento
        </Button>
      </div>

      {/* SECTION 1: FORMAS DE PAGAMENTO DISPONÍVEIS */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <CreditCard size={15} className="text-[#d4af37]" />
          Formas de Pagamento Aceitas no Salão
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PIX Instantâneo Card */}
          <Card className="p-5 border-[#d4af37]/40 bg-gradient-to-b from-[#16140d] via-[#101014] to-[#0c0c10] relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37] text-black uppercase tracking-wider">
                Recomendado
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8d7122] flex items-center justify-center text-black mb-3 shadow-md">
              <QrCode size={20} />
            </div>
            <h4 className="text-sm font-semibold text-white">PIX Instantâneo</h4>
            <p className="text-xs text-neutral-400 mt-1">
              Liberação rápida sem taxas adicionais. Copie o código ou escaneie o QR Code oficial abaixo.
            </p>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-emerald-400">
              <Sparkles size={13} />
              <span>Pontos VIP creditados no ato da conferência</span>
            </div>
          </Card>

          {/* Cartões Card */}
          <Card className="p-5 border-white/[0.08] bg-[#0e0e14]">
            <div className="w-10 h-10 rounded-xl bg-white/5 text-neutral-300 flex items-center justify-center mb-3">
              <CreditCard size={20} />
            </div>
            <h4 className="text-sm font-semibold text-white">Cartões de Crédito & Débito</h4>
            <p className="text-xs text-neutral-400 mt-1">
              Aceito presencialmente na recepção: Visa, Mastercard, Elo, American Express e Hipercard.
            </p>
            <div className="mt-3 pt-3 border-t border-white/5 text-xs text-neutral-500">
              Parcelamento em até 3x para pacotes e mechas
            </div>
          </Card>

          {/* Dinheiro Card */}
          <Card className="p-5 border-white/[0.08] bg-[#0e0e14]">
            <div className="w-10 h-10 rounded-xl bg-white/5 text-neutral-300 flex items-center justify-center mb-3">
              <Banknote size={20} />
            </div>
            <h4 className="text-sm font-semibold text-white">Dinheiro em Espécie</h4>
            <p className="text-xs text-neutral-400 mt-1">
              Pagamento direto no balcão da recepção com emissão imediata do cupom de atendimento.
            </p>
            <div className="mt-3 pt-3 border-t border-white/5 text-xs text-neutral-500">
              Disponível durante o horário de atendimento
            </div>
          </Card>
        </div>
      </div>

      {/* SECTION 2: PIX OFICIAL DO ATELIER (QR CODE + COPIA E COLA) */}
      <Card className="p-6 border-white/[0.08] bg-[#0c0c12]">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* QR Code Container */}
          <div className="flex flex-col items-center text-center shrink-0">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl bg-[#08080a] border-2 border-[#d4af37]/50 flex items-center justify-center p-3.5 shadow-2xl overflow-hidden">
              {pixConfig.qrCodeUrl ? (
                <img
                  src={pixConfig.qrCodeUrl}
                  alt="QR Code Oficial do Atelier"
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                /* Fallback vector representation */
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#121218] to-[#181824] rounded-xl border border-white/10">
                  <div className="w-28 h-28 rounded-xl border-2 border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] mb-2 bg-[#d4af37]/5">
                    <QrCode size={56} />
                  </div>
                  <span className="text-xs font-semibold text-[#f3e5ab]">PIX Sra. Bela Mulher</span>
                  <span className="text-[11px] text-neutral-400 mt-0.5">Use o Copia e Cola ao lado</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Ambiente e QR Code Oficial do Salão</span>
            </div>
          </div>

          {/* Details & Copia e Cola */}
          <div className="flex-1 w-full space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                  Dados Oficiais da Conta
                </span>
                {!pixConfig.ativo && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                    PIX Temporariamente Indisponível
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white mt-1">
                {pixConfig.titular}
              </h3>
              <p className="text-xs text-neutral-400">
                {pixConfig.banco} {pixConfig.cidade && `· ${pixConfig.cidade}`}
              </p>
            </div>

            {/* Chave PIX Card */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-neutral-400 font-medium block">
                  Chave PIX ({pixConfig.tipoChave.toUpperCase()}):
                </span>
                <span className="text-sm font-mono font-semibold text-[#f3e5ab] select-all">
                  {pixConfig.chavePix}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                {copiedKey ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Chave Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copiar Chave</span>
                  </>
                )}
              </button>
            </div>

            {/* PIX Copia e Cola */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Código PIX Copia e Cola
              </label>
              <div className="relative">
                <div className="p-3 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-neutral-300 break-all max-h-24 overflow-y-auto leading-relaxed select-all">
                  {pixConfig.copiaECola || 'Código não disponível'}
                </div>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <Button
                  onClick={handleCopyCode}
                  size="md"
                  icon={copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  className="sm:w-auto w-full justify-center"
                >
                  {copiedCode ? 'Código PIX Copiado com Sucesso!' : 'Copiar Código PIX'}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleOpenProofModal()}
                  icon={<FileCheck size={16} />}
                  className="sm:w-auto w-full justify-center"
                >
                  Enviar Comprovante
                </Button>
              </div>
            </div>

            {/* Instructions */}
            {pixConfig.instrucoes && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300/90 flex items-start gap-2">
                <Info size={16} className="shrink-0 mt-0.5 text-amber-400" />
                <span>{pixConfig.instrucoes}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION 3: VALOR E IDENTIFICAÇÃO DA COBRANÇA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Calendar size={15} className="text-[#d4af37]" />
            Identificação de Cobranças & Agendamentos
          </h3>
          <span className="text-xs text-neutral-500">
            {pendingAppointments.length} procedimento(s) pendente(s)
          </span>
        </div>

        {myAppointments.length === 0 ? (
          <Card className="p-8 text-center border-white/[0.08] bg-[#0e0e14]">
            <p className="text-xs text-neutral-400">
              Você ainda não possui agendamentos cadastrados.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAppointments.map(apt => {
              const isPaid = apt.paymentStatus === 'pago';
              const isAwaiting = apt.paymentStatus === 'aguardando_confirmacao';

              return (
                <Card
                  key={apt.id}
                  className={`p-5 border transition-all ${
                    isPaid
                      ? 'border-emerald-500/20 bg-emerald-950/5'
                      : isAwaiting
                      ? 'border-amber-500/30 bg-amber-950/10'
                      : 'border-white/[0.08] bg-[#0e0e14]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-neutral-400">
                        {apt.date} às {apt.time} ({apt.durationMinutes} min)
                      </span>
                      <h4 className="text-base font-serif font-bold text-white mt-0.5">
                        {apt.serviceName}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Especialista: <span className="text-neutral-200">{apt.professionalName}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-neutral-500 block">Valor:</span>
                      <span className="text-base font-mono font-bold text-[#f3e5ab]">
                        R$ {apt.priceBRL.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 size={12} />
                          Pagamento Confirmado
                        </span>
                      ) : isAwaiting ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Clock size={12} />
                          Aguardando confirmação
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 text-neutral-300 border border-white/10">
                          Pendente de pagamento
                        </span>
                      )}
                    </div>

                    {!isPaid && (
                      <Button
                        size="sm"
                        variant={isAwaiting ? 'outline' : 'primary'}
                        onClick={() => handleOpenProofModal(apt)}
                        icon={<FileCheck size={14} />}
                      >
                        {isAwaiting ? 'Reenviar Comprovante' : 'Pagar via PIX'}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 4: HISTÓRICO DE COMPROVANTES ENVIADOS */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <FileCheck size={15} className="text-[#d4af37]" />
          Meus Comprovantes Enviados
        </h3>

        {myProofs.length === 0 ? (
          <Card className="p-6 text-center border-white/[0.08] bg-[#0e0e14] text-neutral-500 text-xs">
            Nenhum comprovante enviado por você até o momento.
          </Card>
        ) : (
          <Card className="p-5 border-white/[0.08] bg-[#0e0e14]">
            <div className="divide-y divide-white/[0.06]">
              {myProofs.map(proof => (
                <div key={proof.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-white">{proof.description}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Enviado em {proof.submittedAt} · R$ {proof.amountBRL.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {proof.status === 'aguardando_confirmacao' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Clock size={12} />
                        Aguardando confirmação
                      </span>
                    )}
                    {proof.status === 'confirmado' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 size={12} />
                        Confirmado
                      </span>
                    )}
                    {proof.status === 'rejeitado' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                        Não reconhecido
                      </span>
                    )}

                    {proof.proofImageUrl && (
                      <button
                        type="button"
                        onClick={() => setViewingProof(proof)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors cursor-pointer"
                        title="Ver imagem do comprovante"
                      >
                        <Eye size={14} className="text-[#d4af37]" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* MODAL: ENVIAR COMPROVANTE */}
      {isProofModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsProofModalOpen(false)}
          title="Envio de Comprovante PIX"
          subtitle="Anexe a imagem do comprovante gerado pelo seu banco"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsProofModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitProof}
                icon={<Check size={14} />}
                disabled={isProcessingProof || !proofImageBase64}
              >
                {isProcessingProof ? 'Processando...' : 'Enviar para Conferência'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSubmitProof} className="space-y-4 py-1 text-xs">
            {proofSubmitSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-300">Comprovante enviado com sucesso!</h4>
                <p className="text-neutral-300 text-xs">
                  O status do seu atendimento foi atualizado para &ldquo;Aguardando confirmação&rdquo;. Nossa recepção irá conferir o valor no extrato bancário.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Atendimento / Procedimento Relacionado
                  </label>
                  <select
                    value={selectedAptId}
                    onChange={e => {
                      const id = e.target.value;
                      setSelectedAptId(id);
                      const found = myAppointments.find(a => a.id === id);
                      if (found) {
                        setProofAmount(found.priceBRL.toFixed(2));
                        setProofDescription(`${found.serviceName} (${found.date} às ${found.time})`);
                      }
                    }}
                    className="w-full bg-[#14141c] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="">Outro pagamento / Adiantamento</option>
                    {myAppointments.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.serviceName} - {a.date} às {a.time} (R$ {a.priceBRL.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Valor Transferido (R$) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={proofAmount}
                      onChange={e => setProofAmount(e.target.value)}
                      placeholder="Ex: 680.00"
                      required
                      className="w-full bg-[#14141c] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Identificação / Referência
                    </label>
                    <input
                      type="text"
                      value={proofDescription}
                      onChange={e => setProofDescription(e.target.value)}
                      placeholder="Ex: Balayage Dourada"
                      className="w-full bg-[#14141c] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {/* File Upload Box */}
                <div>
                  <label className="block text-neutral-300 font-medium mb-1.5">
                    Foto ou Captura do Comprovante <span className="text-red-400">*</span>
                  </label>

                  {proofImageBase64 ? (
                    <div className="relative rounded-xl border border-[#d4af37]/40 bg-[#0a0a0e] p-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={proofImageBase64}
                          alt="Pré-visualização do Comprovante"
                          className="w-16 h-16 object-cover rounded-lg border border-white/10"
                        />
                        <div>
                          <p className="text-xs font-semibold text-white">Comprovante anexado</p>
                          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={12} />
                            Imagem pronta para envio
                          </p>
                        </div>
                      </div>

                      <label className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 hover:text-white cursor-pointer transition-colors">
                        Trocar
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#d4af37]/40 cursor-pointer transition-all">
                      <Upload size={24} className="text-[#d4af37] mb-2" />
                      <span className="text-xs font-semibold text-white">
                        {isProcessingProof ? 'Otimizando imagem...' : 'Tirar foto ou escolher da galeria'}
                      </span>
                      <span className="text-[11px] text-neutral-500 mt-0.5">
                        JPEG, PNG, WEBP suportados
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Observações Adicionais (Opcional)
                  </label>
                  <input
                    type="text"
                    value={proofClientNotes}
                    onChange={e => setProofClientNotes(e.target.value)}
                    placeholder="Ex: Transferido da conta de Carlos"
                    className="w-full bg-[#14141c] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-neutral-400 flex items-start gap-2">
                  <ShieldCheck size={16} className="shrink-0 text-[#d4af37] mt-0.5" />
                  <span>
                    O envio gera o status <strong>&ldquo;Aguardando confirmação&rdquo;</strong>. A recepção conferirá o extrato bancário para aprovação final.
                  </span>
                </div>
              </>
            )}
          </form>
        </Modal>
      )}

      {/* MODAL: VER COMPROVANTE ENVIADO */}
      {viewingProof && (
        <Modal
          isOpen={true}
          onClose={() => setViewingProof(null)}
          title={`Comprovante: ${viewingProof.description}`}
          subtitle={`R$ ${viewingProof.amountBRL.toFixed(2)} · Enviado em ${viewingProof.submittedAt}`}
          footer={
            <Button size="sm" onClick={() => setViewingProof(null)}>
              Fechar
            </Button>
          }
        >
          <div className="space-y-3 py-1">
            <div className="max-h-[60vh] overflow-auto rounded-xl bg-black border border-white/10 flex items-center justify-center p-2">
              {viewingProof.proofImageUrl ? (
                <img
                  src={viewingProof.proofImageUrl}
                  alt="Comprovante"
                  className="max-h-[55vh] object-contain rounded-lg"
                />
              ) : (
                <p className="text-xs text-neutral-500 py-6">Imagem não disponível.</p>
              )}
            </div>
            <div className="text-xs text-neutral-400">
              Status: <span className="text-white font-medium capitalize">{viewingProof.status.replace('_', ' ')}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
