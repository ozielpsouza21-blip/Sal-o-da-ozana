import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Key,
  Building,
  User,
  Copy,
  Check,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Eye,
  Clock,
  ShieldCheck,
  CreditCard,
  DollarSign,
  FileCheck,
  XCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { PixConfig, PixKeyType, PaymentProofRecord, Appointment } from '../../../types';
import { StorageService } from '../../../services/storage';
import { processImageFile } from '../../../utils/imageUpload';

interface PaymentConfigModuleProps {
  onRefreshData?: () => void;
  appointments?: Appointment[];
}

export const PaymentConfigModule: React.FC<PaymentConfigModuleProps> = ({
  onRefreshData,
  appointments = [],
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'proofs'>('config');

  // Form State
  const [config, setConfig] = useState<PixConfig>(StorageService.getPixConfig());
  const [chavePix, setChavePix] = useState(config.chavePix);
  const [tipoChave, setTipoChave] = useState<PixKeyType>(config.tipoChave);
  const [titular, setTitular] = useState(config.titular);
  const [banco, setBanco] = useState(config.banco);
  const [cidade, setCidade] = useState(config.cidade || 'São Paulo - SP');
  const [copiaECola, setCopiaECola] = useState(config.copiaECola);
  const [qrCodeUrl, setQrCodeUrl] = useState(config.qrCodeUrl || '');
  const [ativo, setAtivo] = useState(config.ativo);
  const [instrucoes, setInstrucoes] = useState(config.instrucoes || '');

  // UI State
  const [isUploadingQR, setIsUploadingQR] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Proofs State
  const [proofs, setProofs] = useState<PaymentProofRecord[]>(StorageService.getPaymentProofs());
  const [selectedProofForView, setSelectedProofForView] = useState<PaymentProofRecord | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [proofToReject, setProofToReject] = useState<PaymentProofRecord | null>(null);

  const pendingProofs = proofs.filter(p => p.status === 'aguardando_confirmacao');

  const reloadData = () => {
    const currentConfig = StorageService.getPixConfig();
    setConfig(currentConfig);
    setChavePix(currentConfig.chavePix);
    setTipoChave(currentConfig.tipoChave);
    setTitular(currentConfig.titular);
    setBanco(currentConfig.banco);
    setCidade(currentConfig.cidade || '');
    setCopiaECola(currentConfig.copiaECola);
    setQrCodeUrl(currentConfig.qrCodeUrl || '');
    setAtivo(currentConfig.ativo);
    setInstrucoes(currentConfig.instrucoes || '');
    setProofs(StorageService.getPaymentProofs());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingQR(true);
    try {
      const dataUrl = await processImageFile(file, 800, 800, 0.9);
      setQrCodeUrl(dataUrl);
    } catch (err: any) {
      alert(err?.message || 'Erro ao processar imagem do QR Code.');
    } finally {
      setIsUploadingQR(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PixConfig = {
      ativo,
      chavePix: chavePix.trim(),
      tipoChave,
      titular: titular.trim(),
      banco: banco.trim(),
      cidade: cidade.trim(),
      copiaECola: copiaECola.trim(),
      qrCodeUrl: qrCodeUrl.trim(),
      instrucoes: instrucoes.trim(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.savePixConfig(updated);
    setConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    if (onRefreshData) {
      onRefreshData();
    }
  };

  const handleCopy = (text: string, isKey = false) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleConfirmProof = (proof: PaymentProofRecord) => {
    if (confirm(`Confirmar recebimento do PIX no valor de R$ ${proof.amountBRL.toFixed(2)} da cliente ${proof.clientName}?`)) {
      StorageService.confirmPaymentProof(proof.id, 'Gerência / Administrador');
      setProofs(StorageService.getPaymentProofs());
      if (selectedProofForView?.id === proof.id) {
        setSelectedProofForView(null);
      }
      if (onRefreshData) {
        onRefreshData();
      }
    }
  };

  const handleOpenReject = (proof: PaymentProofRecord) => {
    setProofToReject(proof);
    setRejectionNotes('Comprovante não localizado no extrato bancário ou ilegível.');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!proofToReject) return;
    StorageService.rejectPaymentProof(proofToReject.id, rejectionNotes);
    setProofs(StorageService.getPaymentProofs());
    setIsRejectModalOpen(false);
    setProofToReject(null);
    if (selectedProofForView?.id === proofToReject.id) {
      setSelectedProofForView(null);
    }
    if (onRefreshData) {
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8d7122] flex items-center justify-center text-black shadow-lg shadow-[#d4af37]/20">
              <QrCode size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
                Configuração de Pagamentos
                <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-medium tracking-normal border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#f3e5ab]">
                  PIX Atelier
                </span>
              </h1>
              <p className="text-xs text-neutral-400">
                Gerencie as informações bancárias do PIX e audite os comprovantes enviados pelas clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex items-center gap-2 bg-[#121218] p-1 rounded-xl border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'config'
                ? 'bg-[#d4af37] text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Key size={14} />
            <span>Dados PIX & QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('proofs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
              activeTab === 'proofs'
                ? 'bg-[#d4af37] text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileCheck size={14} />
            <span>Comprovantes Recebidos</span>
            {pendingProofs.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-black">
                {pendingProofs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <div>
            <p className="font-semibold text-emerald-300">Configurações de pagamento salvas com sucesso!</p>
            <p className="text-emerald-400/80">
              A chave PIX, o QR Code e o código Copia e Cola já estão atualizados e sincronizados no Painel da Cliente.
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: CONFIGURAÇÃO PIX */}
      {activeTab === 'config' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1 & 2: Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Toggle Card */}
              <Card className="p-5 border-white/[0.08] bg-[#0e0e14]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-[#d4af37]" />
                      Status do Recebimento via PIX
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Controle a exibição do PIX como forma de pagamento no aplicativo.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ativo}
                      onChange={e => setAtivo(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs">
                  <span className="text-neutral-500">Situação atual:</span>
                  {ativo ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      PIX Ativo (Disponível para clientes)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      PIX Inativo (Oculto ou suspenso temporariamente)
                    </span>
                  )}
                </div>
              </Card>

              {/* Bank & Key Details Card */}
              <Card className="p-6 border-white/[0.08] bg-[#0e0e14] space-y-5">
                <h3 className="text-sm font-serif font-bold text-[#f3e5ab] flex items-center gap-2 border-b border-white/[0.06] pb-3">
                  <Building size={16} className="text-[#d4af37]" />
                  Dados Bancários & Identificação da Conta
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Tipo da Chave PIX <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={tipoChave}
                      onChange={e => setTipoChave(e.target.value as PixKeyType)}
                      className="w-full bg-[#14141c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="email">E-mail</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="cpf">CPF</option>
                      <option value="telefone">Telefone / Celular</option>
                      <option value="aleatoria">Chave Aleatória (EVP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Chave PIX <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={chavePix}
                      onChange={e => setChavePix(e.target.value)}
                      placeholder="Ex: contato@srabelamulher.com.br ou 42.189.920/0001-55"
                      required
                      className="w-full bg-[#14141c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Nome do Titular da Conta <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={titular}
                      onChange={e => setTitular(e.target.value)}
                      placeholder="Ex: Sra. Bela Mulher Atelier LTDA"
                      required
                      className="w-full bg-[#14141c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Instituição Financeira / Banco <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={banco}
                      onChange={e => setBanco(e.target.value)}
                      placeholder="Ex: Banco Inter S.A., Nubank, Itaú..."
                      required
                      className="w-full bg-[#14141c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Cidade / UF do Domicílio Bancário
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    placeholder="Ex: São Paulo - SP"
                    className="w-full bg-[#14141c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-neutral-300">
                      Código PIX Copia e Cola Oficial <span className="text-red-400">*</span>
                    </label>
                    {copiaECola && (
                      <button
                        type="button"
                        onClick={() => handleCopy(copiaECola, false)}
                        className="text-[11px] text-[#f3e5ab] hover:text-[#d4af37] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedCode ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            <span className="text-emerald-400">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Testar Cópia</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={copiaECola}
                    onChange={e => setCopiaECola(e.target.value)}
                    placeholder="Cole aqui o código EMV / Copia e Cola gerado pelo aplicativo do seu banco (começa com 000201...)"
                    required
                    className="w-full bg-[#14141c] border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37] resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Este é o código que os clientes utilizarão no botão 1-clique &ldquo;Copiar Código PIX&rdquo; para colar diretamente no aplicativo do banco.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Orientações e Instruções Adicionais para a Cliente
                  </label>
                  <input
                    type="text"
                    value={instrucoes}
                    onChange={e => setInstrucoes(e.target.value)}
                    placeholder="Ex: Após a transferência, envie o comprovante abaixo para validação da nossa equipe."
                    className="w-full bg-[#14141c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </Card>
            </div>

            {/* Col 3: QR Code Upload & Live Preview */}
            <div className="space-y-6">
              <Card className="p-6 border-white/[0.08] bg-[#0e0e14] flex flex-col items-center text-center">
                <h3 className="text-sm font-serif font-bold text-[#f3e5ab] mb-2 flex items-center gap-2">
                  <QrCode size={16} className="text-[#d4af37]" />
                  QR Code Oficial do PIX
                </h3>
                <p className="text-xs text-neutral-400 mb-4">
                  Faça upload da imagem gerada pelo seu banco para exibição direta às clientes.
                </p>

                {/* QR Code Container */}
                <div className="relative w-56 h-56 rounded-2xl bg-[#09090d] border-2 border-[#d4af37]/40 flex items-center justify-center p-3 shadow-xl group overflow-hidden">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="QR Code PIX Cadastrado"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    /* Fallback Generated Vector QR Representation */
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#121218] to-[#1a1a24] rounded-xl border border-white/10">
                      <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] mb-2">
                        <QrCode size={48} />
                      </div>
                      <span className="text-[11px] text-neutral-400 font-medium">Nenhum QR Code enviado</span>
                      <span className="text-[10px] text-neutral-500 mt-0.5">Faça upload da imagem abaixo</span>
                    </div>
                  )}

                  {/* Hover action overlay */}
                  {qrCodeUrl && (
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                      <label className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-black font-semibold text-xs cursor-pointer hover:bg-[#e5c158] transition-colors flex items-center gap-1.5">
                        <Upload size={14} />
                        <span>Substituir</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setQrCodeUrl('')}
                        className="px-3 py-1.5 rounded-lg bg-red-950/80 text-red-400 border border-red-500/30 font-medium text-xs cursor-pointer hover:bg-red-900 transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        <span>Remover</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload Buttons */}
                <div className="w-full mt-4 space-y-2">
                  <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium cursor-pointer transition-colors">
                    <Upload size={15} className="text-[#d4af37]" />
                    <span>{isUploadingQR ? 'Otimizando imagem...' : 'Fazer Upload do QR Code'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Formatos aceitos: JPEG, PNG, WEBP. Imagem otimizada automaticamente.
                  </p>
                </div>

                {/* Quick Info Summary */}
                <div className="w-full mt-5 pt-4 border-t border-white/5 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Titular:</span>
                    <span className="text-neutral-200 font-medium truncate max-w-[150px]">{titular || 'Não preenchido'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Banco:</span>
                    <span className="text-neutral-200 font-medium truncate max-w-[150px]">{banco || 'Não preenchido'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Chave:</span>
                    <span className="text-[#f3e5ab] font-medium truncate max-w-[150px] font-mono">{chavePix || 'Não informada'}</span>
                  </div>
                </div>
              </Card>

              {/* Action Save Card */}
              <Card className="p-5 border-[#d4af37]/30 bg-gradient-to-br from-[#121218] to-[#1c1810]">
                <div className="flex items-start gap-3 mb-4">
                  <ShieldCheck size={20} className="text-[#d4af37] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-white">Sincronização Segura</p>
                    <p className="text-neutral-400 mt-0.5">
                      Ao salvar, todos os dados são validados e refletidos instantaneamente no Painel do Cliente.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="md"
                  className="w-full justify-center"
                  icon={<Save size={16} />}
                >
                  Salvar Configurações PIX
                </Button>
              </Card>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: COMPROVANTES RECEBIDOS */}
      {activeTab === 'proofs' && (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-amber-500/20 bg-amber-950/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    Aguardando Confirmação
                  </p>
                  <p className="text-2xl font-bold font-serif text-white mt-1">
                    {pendingProofs.length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Clock size={20} />
                </div>
              </div>
              <p className="text-[11px] text-amber-300/70 mt-2">
                Requerem auditoria no extrato bancário
              </p>
            </Card>

            <Card className="p-4 border-emerald-500/20 bg-emerald-950/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    Confirmados
                  </p>
                  <p className="text-2xl font-bold font-serif text-white mt-1">
                    {proofs.filter(p => p.status === 'confirmado').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <p className="text-[11px] text-emerald-300/70 mt-2">
                Total registrado e validado
              </p>
            </Card>

            <Card className="p-4 border-white/[0.08] bg-[#0e0e14]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Total Movimentado
                  </p>
                  <p className="text-2xl font-bold font-serif text-[#f3e5ab] mt-1">
                    R${' '}
                    {proofs
                      .filter(p => p.status === 'confirmado')
                      .reduce((acc, curr) => acc + curr.amountBRL, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2">
                Recebimentos confirmados via PIX
              </p>
            </Card>
          </div>

          {/* List of Receipts */}
          <Card className="p-6 border-white/[0.08] bg-[#0e0e14]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-serif font-bold text-white">
                  Histórico de Comprovantes Enviados pelas Clientes
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Nenhum pagamento é marcado como confirmado automaticamente; confira o valor e aprove abaixo.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={reloadData}
                icon={<Clock size={14} />}
              >
                Atualizar Lista
              </Button>
            </div>

            {proofs.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs">
                Nenhum comprovante de pagamento foi enviado ainda.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-neutral-400 font-semibold border-b border-white/[0.08] pb-2">
                      <th className="py-3 px-2">Cliente / Contato</th>
                      <th className="py-3 px-2">Serviço / Referência</th>
                      <th className="py-3 px-2">Data Envio</th>
                      <th className="py-3 px-2">Valor</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {proofs.map(proof => (
                      <tr key={proof.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-2">
                          <div className="font-semibold text-white">{proof.clientName}</div>
                          {proof.clientPhone && (
                            <div className="text-[11px] text-neutral-500">{proof.clientPhone}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="text-neutral-300 font-medium">{proof.description}</div>
                          {proof.appointmentId && (
                            <span className="text-[10px] text-neutral-500 font-mono">
                              Ref: {proof.appointmentId}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-neutral-400 whitespace-nowrap">
                          {proof.submittedAt}
                        </td>
                        <td className="py-3.5 px-2 font-mono font-bold text-[#f3e5ab]">
                          R$ {proof.amountBRL.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-2 whitespace-nowrap">
                          {proof.status === 'aguardando_confirmacao' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Clock size={12} />
                              Aguardando Confirmação
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
                              <XCircle size={12} />
                              Rejeitado
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {proof.proofImageUrl && (
                              <button
                                type="button"
                                onClick={() => setSelectedProofForView(proof)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-[11px] font-medium border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
                                title="Visualizar comprovante"
                              >
                                <Eye size={13} className="text-[#d4af37]" />
                                <span>Ver Foto</span>
                              </button>
                            )}

                            {proof.status === 'aguardando_confirmacao' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmProof(proof)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/40 flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Confirmar recebimento do PIX"
                                >
                                  <Check size={13} />
                                  <span>Confirmar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReject(proof)}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium border border-red-500/20 flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Recusar comprovante"
                                >
                                  <XCircle size={13} />
                                  <span>Recusar</span>
                                </button>
                              </>
                            )}

                            {proof.status === 'confirmado' && (
                              <span className="text-[11px] text-neutral-500">
                                Por: {proof.confirmedBy || 'Admin'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal: View Receipt Image */}
      {selectedProofForView && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedProofForView(null)}
          title={`Comprovante de Pagamento — ${selectedProofForView.clientName}`}
          subtitle={`Valor: R$ ${selectedProofForView.amountBRL.toFixed(2)} · Enviado em ${selectedProofForView.submittedAt}`}
          footer={
            <div className="flex items-center justify-between w-full gap-3">
              <div>
                {selectedProofForView.status === 'aguardando_confirmacao' && (
                  <span className="text-xs text-amber-300 flex items-center gap-1">
                    <Clock size={13} />
                    Aguardando conferência no extrato bancário
                  </span>
                )}
                {selectedProofForView.status === 'confirmado' && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Confirmado por {selectedProofForView.confirmedBy}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedProofForView.status === 'aguardando_confirmacao' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenReject(selectedProofForView)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 cursor-pointer"
                    >
                      Recusar
                    </button>
                    <Button
                      size="sm"
                      onClick={() => handleConfirmProof(selectedProofForView)}
                      icon={<Check size={14} />}
                    >
                      Confirmar Recebimento
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProofForView(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 py-2">
            <div className="max-h-[60vh] overflow-auto rounded-xl bg-black border border-white/10 flex items-center justify-center p-2">
              {selectedProofForView.proofImageUrl ? (
                <img
                  src={selectedProofForView.proofImageUrl}
                  alt="Comprovante de transferência"
                  className="max-h-[55vh] object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="p-8 text-neutral-500 text-xs text-center">
                  Imagem do comprovante não disponível.
                </div>
              )}
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-500">Referência do Atendimento:</span>
                <span className="font-semibold text-white">{selectedProofForView.description}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-500">Valor Cobrado:</span>
                <span className="font-bold text-[#f3e5ab]">R$ {selectedProofForView.amountBRL.toFixed(2)}</span>
              </div>
              {selectedProofForView.adminNotes && (
                <div className="pt-2 text-neutral-400 border-t border-white/5">
                  <span className="text-neutral-500">Notas Internas:</span> {selectedProofForView.adminNotes}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Reject Proof */}
      {isRejectModalOpen && proofToReject && (
        <Modal
          isOpen={true}
          onClose={() => setIsRejectModalOpen(false)}
          title="Recusar Comprovante de Pagamento"
          subtitle={`Cliente: ${proofToReject.clientName} · R$ ${proofToReject.amountBRL.toFixed(2)}`}
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRejectModalOpen(false)}
              >
                Cancelar
              </Button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Confirmar Recusa
              </button>
            </div>
          }
        >
          <div className="space-y-4 py-2">
            <p className="text-xs text-neutral-300">
              Informe o motivo da recusa para orientar a cliente a reenviar um comprovante legível ou verificar a transferência no banco:
            </p>
            <textarea
              rows={3}
              value={rejectionNotes}
              onChange={e => setRejectionNotes(e.target.value)}
              className="w-full bg-[#14141c] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
              placeholder="Ex: Valor não identificado no extrato da conta bancária..."
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
