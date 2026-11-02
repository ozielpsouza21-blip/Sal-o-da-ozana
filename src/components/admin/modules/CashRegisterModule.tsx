import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Unlock,
  Plus,
  Minus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  QrCode,
  Banknote,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  Receipt,
  HelpCircle,
} from 'lucide-react';
import { Appointment, CashClosingRecord, CashRegisterStatus, CashTransaction } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { StorageService } from '../../../services/storage';
import { SupabaseDataService } from '../../../services/supabaseDataService';

interface CashRegisterModuleProps {
  cashStatus: CashRegisterStatus;
  transactions: CashTransaction[];
  appointments?: Appointment[];
  onRefreshData: () => void;
  onNavigateToFinanceiro?: () => void;
}

export const CashRegisterModule: React.FC<CashRegisterModuleProps> = ({
  cashStatus,
  transactions,
  appointments = [],
  onRefreshData,
  onNavigateToFinanceiro,
}) => {
  const [activeTab, setActiveTab] = useState<'extrato' | 'conferencia' | 'historico'>('extrato');
  const [modalType, setModalType] = useState<
    'open' | 'close' | 'sangria' | 'suprimento' | 'lancamento' | 'detalhes_fechamento' | null
  >(null);

  // Form inputs
  const [amountInput, setAmountInput] = useState<string>('');
  const [descInput, setDescInput] = useState<string>('');
  const [categoryInput, setCategoryInput] = useState<string>('Serviço');
  const [paymentMethodInput, setPaymentMethodInput] = useState<
    'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'transferencia'
  >('dinheiro');
  const [operatorInput, setOperatorInput] = useState<string>('Recepção Principal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fechamento assisted inputs
  const [countedCashInput, setCountedCashInput] = useState<string>('');
  const [countedCardInput, setCountedCardInput] = useState<string>('');
  const [countedPixInput, setCountedPixInput] = useState<string>('');
  const [closingNotesInput, setClosingNotesInput] = useState<string>('');
  const [differenceReasonInput, setDifferenceReasonInput] = useState<string>('');
  const [selectedClosingDetail, setSelectedClosingDetail] = useState<CashClosingRecord | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Cash closings list from storage
  const cashClosings = useMemo(() => StorageService.getCashClosings(), [cashStatus]);

  // Totals by payment method
  const totalsByMethod = useMemo(() => {
    let dinheiro = 0;
    let pix = 0;
    let cartaoCredito = 0;
    let cartaoDebito = 0;

    transactions.forEach(t => {
      if (t.type === 'entrada') {
        const method = t.paymentMethod || 'dinheiro';
        if (method === 'dinheiro') dinheiro += t.amountBRL;
        else if (method === 'pix') pix += t.amountBRL;
        else if (method === 'cartao_credito') cartaoCredito += t.amountBRL;
        else if (method === 'cartao_debito') cartaoDebito += t.amountBRL;
      }
    });

    return { dinheiro, pix, cartaoCredito, cartaoDebito };
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType =
        filterType === 'todos' ||
        (filterType === 'entradas' && (t.type === 'entrada' || t.type === 'suprimento')) ||
        (filterType === 'saidas' && (t.type === 'saida' || t.type === 'sangria')) ||
        t.type === filterType;

      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.operatorName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  // Handlers
  const handleOpenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput) || 0;
    if (amount < 0) return;

    setIsSubmitting(true);
    try {
      await SupabaseDataService.openCashRegister(amount, operatorInput.trim() || 'Recepção Principal');
      onRefreshData();
      setModalType(null);
      setAmountInput('');
    } catch (err) {
      alert('Erro ao abrir caixa no sistema.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const countedCash = parseFloat(countedCashInput) || 0;
      const countedCard = parseFloat(countedCardInput) || 0;
      const countedPix = parseFloat(countedPixInput) || 0;

      await SupabaseDataService.closeCashRegister(operatorInput.trim() || 'Gerência', {
        countedCashBRL: countedCash,
        countedCardBRL: countedCard,
        countedPixBRL: countedPix,
        differenceReason: differenceReasonInput.trim() || undefined,
        notes: closingNotesInput.trim() || undefined,
      });

      onRefreshData();
      setModalType(null);
      setCountedCashInput('');
      setCountedCardInput('');
      setCountedPixInput('');
      setDifferenceReasonInput('');
      setClosingNotesInput('');
    } catch (err) {
      alert('Erro ao encerrar caixa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSangria = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput) || 0;
    if (amount <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }
    if (amount > cashStatus.currentBalanceBRL) {
      alert(`Valor de sangria (R$ ${amount.toFixed(2)}) superior ao saldo em espécie (R$ ${cashStatus.currentBalanceBRL.toFixed(2)}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await SupabaseDataService.addCashTransaction({
        type: 'sangria',
        category: 'Sangria de Caixa',
        description: descInput.trim() || 'Retirada de numerário para custódia/cofre',
        amountBRL: amount,
        operatorName: operatorInput.trim() || 'Operador de Caixa',
        paymentMethod: 'dinheiro',
      });
      // Update cash status balance
      const newStatus: CashRegisterStatus = {
        ...cashStatus,
        currentBalanceBRL: Math.max(0, cashStatus.currentBalanceBRL - amount),
        totalSaidas: cashStatus.totalSaidas + amount,
      };
      await SupabaseDataService.updateCashStatus(newStatus);
      onRefreshData();
      setModalType(null);
      setAmountInput('');
      setDescInput('');
    } catch (err) {
      alert('Erro ao processar sangria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSuprimento = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput) || 0;
    if (amount <= 0) return;

    setIsSubmitting(true);
    try {
      await SupabaseDataService.addCashTransaction({
        type: 'suprimento',
        category: 'Suprimento de Caixa',
        description: descInput.trim() || 'Aporte de troco adicional em espécie',
        amountBRL: amount,
        operatorName: operatorInput.trim() || 'Operador de Caixa',
        paymentMethod: 'dinheiro',
      });
      const newStatus: CashRegisterStatus = {
        ...cashStatus,
        currentBalanceBRL: cashStatus.currentBalanceBRL + amount,
        totalEntradas: cashStatus.totalEntradas + amount,
      };
      await SupabaseDataService.updateCashStatus(newStatus);
      onRefreshData();
      setModalType(null);
      setAmountInput('');
      setDescInput('');
    } catch (err) {
      alert('Erro ao processar suprimento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLancamento = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput) || 0;
    if (amount <= 0 || !descInput.trim()) return;

    setIsSubmitting(true);
    try {
      await SupabaseDataService.addCashTransaction({
        type: 'entrada',
        category: categoryInput,
        description: descInput.trim(),
        amountBRL: amount,
        operatorName: operatorInput.trim() || 'Recepção',
        paymentMethod: paymentMethodInput,
      });

      // StorageService.addCashTransaction já atualizou o saldo físico caso seja dinheiro,
      // preservando PIX e cartões isolados do gaveteiro físico
      const updatedStatus = StorageService.getCashStatus();
      await SupabaseDataService.updateCashStatus(updatedStatus);

      onRefreshData();
      setModalType(null);
      setAmountInput('');
      setDescInput('');
    } catch (err) {
      alert('Erro ao registrar lançamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Data/Hora', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Forma de Pagamento', 'Operador'];
    const rows = filteredTransactions.map(t => [
      `"${t.timestamp}"`,
      `"${t.type.toUpperCase()}"`,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.amountBRL.toFixed(2)}"`,
      `"${t.paymentMethod || 'dinheiro'}"`,
      `"${t.operatorName}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `extrato_caixa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Difference calculation during closing modal
  const expectedCashBalance = cashStatus.currentBalanceBRL;
  const parsedCountedCash = parseFloat(countedCashInput) || 0;
  const cashDifference = parsedCountedCash - expectedCashBalance;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#101017] p-5 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-md ${
                cashStatus.isOpen
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/40'
                  : 'bg-red-950/60 text-red-400 border-red-600/40'
              }`}
            >
              {cashStatus.isOpen ? <Unlock size={20} /> : <Lock size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-white tracking-wide">
                  Caixa Operacional & PDV
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    cashStatus.isOpen
                      ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-600/60'
                      : 'bg-red-950/90 text-red-400 border border-red-600/60'
                  }`}
                >
                  {cashStatus.isOpen ? 'Turno Aberto' : 'Turno Fechado'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5">
                <Clock size={12} className="text-[#d4af37]" />
                {cashStatus.isOpen
                  ? `Iniciado por ${cashStatus.openedBy || 'Operador'} em ${cashStatus.openedAt || 'Hoje'}`
                  : 'Nenhum turno em andamento. Abra o caixa para autorizar novos recebimentos e sangrias.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {cashStatus.isOpen ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAmountInput('');
                  setDescInput('');
                  setCategoryInput('Venda Balcão');
                  setModalType('lancamento');
                }}
                icon={<Plus size={14} className="text-[#d4af37]" />}
              >
                Novo Recebimento
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setAmountInput('');
                  setDescInput('');
                  setModalType('suprimento');
                }}
                icon={<ArrowDownLeft size={14} />}
              >
                Suprimento
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAmountInput('');
                  setDescInput('');
                  setModalType('sangria');
                }}
                icon={<Minus size={14} className="text-amber-400" />}
              >
                Sangria
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setCountedCashInput(cashStatus.currentBalanceBRL.toFixed(2));
                  setCountedCardInput((totalsByMethod.cartaoCredito + totalsByMethod.cartaoDebito).toFixed(2));
                  setCountedPixInput(totalsByMethod.pix.toFixed(2));
                  setModalType('close');
                }}
                icon={<Lock size={14} />}
              >
                Fechar Caixa
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setAmountInput('350.00');
                setOperatorInput('Recepção Principal');
                setModalType('open');
              }}
              icon={<Unlock size={14} />}
            >
              Abrir Caixa do Turno
            </Button>
          )}

          {onNavigateToFinanceiro && (
            <Button
              size="sm"
              variant="outline"
              onClick={onNavigateToFinanceiro}
              icon={<DollarSign size={14} className="text-[#d4af37]" />}
            >
              DRE Financeiro
            </Button>
          )}
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Físico em Espécie */}
        <Card padding="md" borderGold className="bg-gradient-to-br from-[#121219] to-[#181824] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider text-[#d4af37] font-semibold flex items-center gap-1.5">
              <Banknote size={15} />
              Saldo Físico (Espécie)
            </span>
            <span className="text-[10px] text-neutral-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
              Gaveteiro
            </span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#f3e5ab] mt-2 font-mono tabular-nums">
            R$ {cashStatus.currentBalanceBRL.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-white/5">
            <span>Fundo inicial:</span>
            <span className="text-neutral-300 font-mono">R$ {cashStatus.initialBalanceBRL.toFixed(2)}</span>
          </div>
        </Card>

        {/* Entradas */}
        <Card padding="md" className="border border-white/10 bg-[#101016]">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1.5">
              <ArrowDownLeft size={15} className="text-emerald-400" />
              Entradas do Turno
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-1.5 py-0.5 rounded">
              +Créditos
            </span>
          </div>
          <div className="text-3xl font-serif font-bold text-emerald-400 mt-2 font-mono tabular-nums">
            + R$ {cashStatus.totalEntradas.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-white/5 flex justify-between">
            <span>Serviços + Vendas:</span>
            <span className="text-white font-mono">{transactions.filter(t => t.type === 'entrada').length} recebimentos</span>
          </div>
        </Card>

        {/* Saídas e Sangrias */}
        <Card padding="md" className="border border-white/10 bg-[#101016]">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1.5">
              <ArrowUpRight size={15} className="text-red-400" />
              Saídas & Sangrias
            </span>
            <span className="text-[10px] text-red-400 font-bold bg-red-950/50 px-1.5 py-0.5 rounded">
              -Retiradas
            </span>
          </div>
          <div className="text-3xl font-serif font-bold text-red-400 mt-2 font-mono tabular-nums">
            - R$ {cashStatus.totalSaidas.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-white/5 flex justify-between">
            <span>Despesas pagas:</span>
            <span className="text-white font-mono">{transactions.filter(t => t.type === 'saida' || t.type === 'sangria').length} retiradas</span>
          </div>
        </Card>

        {/* Total Auditado Geral */}
        <Card padding="md" className="border border-white/10 bg-[#101016]">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#d4af37]" />
              Movimentações Auditadas
            </span>
            <span className="text-[10px] text-[#d4af37] font-semibold bg-[#d4af37]/10 px-1.5 py-0.5 rounded">
              100% Seguro
            </span>
          </div>
          <div className="text-3xl font-serif font-bold text-white mt-2 font-mono tabular-nums">
            {transactions.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-white/5 flex justify-between">
            <span>Última ação:</span>
            <span className="text-[#f3e5ab] font-mono truncate max-w-[120px]">
              {transactions[0]?.timestamp.split(' ')[1] || 'Recente'}
            </span>
          </div>
        </Card>
      </div>

      {/* Resumo por Forma de Pagamento no Turno */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-[#13131c] rounded-xl border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-700/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Banknote size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-neutral-400 block uppercase">Dinheiro (Espécie)</span>
            <span className="text-sm font-bold font-mono text-white">R$ {totalsByMethod.dinheiro.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-3 bg-[#13131c] rounded-xl border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-950/60 border border-teal-700/40 text-teal-400 flex items-center justify-center shrink-0">
            <QrCode size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-neutral-400 block uppercase">PIX Instantâneo</span>
            <span className="text-sm font-bold font-mono text-white">R$ {totalsByMethod.pix.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-3 bg-[#13131c] rounded-xl border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-700/40 text-indigo-400 flex items-center justify-center shrink-0">
            <CreditCard size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-neutral-400 block uppercase">Cartão de Crédito</span>
            <span className="text-sm font-bold font-mono text-white">R$ {totalsByMethod.cartaoCredito.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-3 bg-[#13131c] rounded-xl border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-950/60 border border-sky-700/40 text-sky-400 flex items-center justify-center shrink-0">
            <CreditCard size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-neutral-400 block uppercase">Cartão de Débito</span>
            <span className="text-sm font-bold font-mono text-white">R$ {totalsByMethod.cartaoDebito.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Tabs: Extrato vs Conferência vs Histórico */}
      <div className="border-b border-white/10 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('extrato')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'extrato'
                ? 'border-[#d4af37] text-[#f3e5ab] font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Receipt size={14} />
            Extrato de Movimentações ({filteredTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab('conferencia')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'conferencia'
                ? 'border-[#d4af37] text-[#f3e5ab] font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={14} />
            Calculadora de Conferência Física
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'historico'
                ? 'border-[#d4af37] text-[#f3e5ab] font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar size={14} />
            Histórico de Fechamentos ({cashClosings.length})
          </button>
        </div>

        {activeTab === 'extrato' && (
          <Button size="sm" variant="outline" onClick={handleExportCSV} icon={<Download size={13} />}>
            Exportar CSV
          </Button>
        )}
      </div>

      {/* TAB 1: EXTRATO */}
      {activeTab === 'extrato' && (
        <Card padding="md" className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['todos', 'entradas', 'saidas', 'sangria', 'suprimento', 'abertura', 'fechamento'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    filterType === t
                      ? 'bg-[#d4af37] text-black font-semibold shadow-sm'
                      : 'bg-[#161622] text-neutral-400 hover:text-white border border-white/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por descrição ou operador..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              Nenhuma movimentação encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="divide-y divide-white/5 overflow-x-auto">
              {filteredTransactions.map(trx => {
                const isPositive = trx.type === 'entrada' || trx.type === 'suprimento' || trx.type === 'abertura';
                return (
                  <div key={trx.id} className="py-3 flex items-center justify-between text-xs hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          isPositive
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : 'bg-red-950/60 text-red-400 border border-red-800/40'
                        }`}
                      >
                        {isPositive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{trx.description}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-[#d4af37] font-medium">{trx.category}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <User size={11} className="text-neutral-500" />
                            {trx.operatorName}
                          </span>
                          <span>·</span>
                          <span>{trx.timestamp}</span>
                          {trx.paymentMethod && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                                trx.paymentMethod === 'pix'
                                  ? 'bg-teal-950/80 text-teal-300 border border-teal-700/60 shadow-sm'
                                  : trx.paymentMethod === 'dinheiro'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                                  : 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
                              }`}
                            >
                              {trx.paymentMethod === 'pix' ? (
                                <>
                                  <QrCode size={10} className="text-teal-400" />
                                  <span>PIX</span>
                                </>
                              ) : trx.paymentMethod === 'dinheiro' ? (
                                <>
                                  <Banknote size={10} className="text-emerald-400" />
                                  <span>ESPÉCIE</span>
                                </>
                              ) : (
                                <>
                                  <CreditCard size={10} className="text-indigo-400" />
                                  <span>{trx.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <span
                        className={`font-mono font-bold text-sm tabular-nums block ${
                          isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : '-'} R$ {trx.amountBRL.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                        {trx.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: CALCULADORA DE CONFERÊNCIA FÍSICA */}
      {activeTab === 'conferencia' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="md" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Banknote size={16} className="text-[#d4af37]" />
                Conferência Rápida do Gaveteiro
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Utilize esta ferramenta para conferir o dinheiro em espécie gaveta antes do fechamento.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#14141c] rounded-xl border border-white/10 flex justify-between items-center">
                <span className="text-neutral-400 font-medium">Saldo Teórico do Sistema:</span>
                <span className="text-base font-bold font-mono text-[#f3e5ab]">
                  R$ {cashStatus.currentBalanceBRL.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Total de Dinheiro em Espécie Contado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={countedCashInput}
                  onChange={e => setCountedCashInput(e.target.value)}
                  placeholder="Ex: 1470.00"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-3 text-sm text-white font-mono focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              {countedCashInput && (
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    Math.abs(cashDifference) < 0.01
                      ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                      : cashDifference > 0
                      ? 'bg-sky-950/40 border-sky-600/40 text-sky-300'
                      : 'bg-red-950/40 border-red-600/40 text-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>Resultado da Conferência:</span>
                    <span className="font-mono text-sm">
                      {Math.abs(cashDifference) < 0.01
                        ? 'Caixa Exato (Sem divergência)'
                        : cashDifference > 0
                        ? `Sobra de R$ ${cashDifference.toFixed(2)}`
                        : `Falta de R$ ${Math.abs(cashDifference).toFixed(2)}`}
                    </span>
                  </div>
                  <p className="text-[11px] mt-1 text-neutral-400">
                    {Math.abs(cashDifference) < 0.01
                      ? 'O numerário físico confere perfeitamente com os lançamentos de entrada e saída.'
                      : 'Houve diferença entre o esperado e o apurado. Registre o motivo ao fechar o caixa.'}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#d4af37]" />
              Resumo Operacional do Turno Atual
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Status Operacional:</span>
                <span className={`font-semibold ${cashStatus.isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                  {cashStatus.isOpen ? 'Em Atendimento' : 'Encerrado'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Abertura:</span>
                <span className="text-neutral-200">{cashStatus.openedAt || 'Não registrado'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Operador:</span>
                <span className="text-neutral-200">{cashStatus.openedBy || 'Recepção'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Fundo de Troco Inicial:</span>
                <span className="text-white font-mono">R$ {cashStatus.initialBalanceBRL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Entradas Acumuladas:</span>
                <span className="text-emerald-400 font-mono">+ R$ {cashStatus.totalEntradas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Saídas / Sangrias:</span>
                <span className="text-red-400 font-mono">- R$ {cashStatus.totalSaidas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2.5 bg-[#14141c] px-3 rounded-lg border border-white/10 font-bold">
                <span className="text-white">Saldo em Caixa Atual:</span>
                <span className="text-[#f3e5ab] font-mono text-sm">R$ {cashStatus.currentBalanceBRL.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: HISTÓRICO DE FECHAMENTOS */}
      {activeTab === 'historico' && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Auditoria de Fechamentos Anteriores
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Histórico arquivado com divergências, saldos apurados e operadores responsáveis.
              </p>
            </div>
          </div>

          {cashClosings.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">
              Nenhum fechamento registrado no histórico ainda.
            </div>
          ) : (
            <div className="divide-y divide-white/5 overflow-x-auto">
              {cashClosings.map(c => {
                const hasDivergence = Math.abs(c.differenceBRL) > 0.01;
                return (
                  <div key={c.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{c.closedAt}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            !hasDivergence
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/40'
                              : c.differenceBRL > 0
                              ? 'bg-sky-950 text-sky-400 border border-sky-700/40'
                              : 'bg-red-950 text-red-400 border border-red-700/40'
                          }`}
                        >
                          {!hasDivergence ? 'Exato' : c.differenceBRL > 0 ? `Sobra R$ ${c.differenceBRL.toFixed(2)}` : `Falta R$ ${Math.abs(c.differenceBRL).toFixed(2)}`}
                        </span>
                      </div>
                      <p className="text-neutral-400 text-[11px]">
                        Operador: <strong className="text-neutral-200">{c.operatorName}</strong> · Fundo Inicial: R$ {c.initialBalanceBRL.toFixed(2)} · Entradas: +R$ {c.totalEntradas.toFixed(2)} · Saídas: -R$ {c.totalSaidas.toFixed(2)}
                      </p>
                      {c.notes && (
                        <p className="text-neutral-500 text-[11px] italic">
                          Obs: {c.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 block uppercase">Saldo Apurado</span>
                        <span className="font-mono font-bold text-sm text-[#f3e5ab]">
                          R$ {c.countedCashBRL.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedClosingDetail(c)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* MODAL: ABRIR CAIXA */}
      {modalType === 'open' && (
        <Modal
          isOpen={true}
          onClose={() => setModalType(null)}
          title="Abertura de Caixa do Turno"
          subtitle="Informe o fundo inicial em dinheiro para troco e o operador responsável"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalType(null)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleOpenRegister} disabled={isSubmitting}>
                {isSubmitting ? 'Abrindo...' : 'Confirmar Abertura'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleOpenRegister} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Fundo de Troco Inicial (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                placeholder="350.00"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Operador Responsável *
              </label>
              <input
                type="text"
                value={operatorInput}
                onChange={e => setOperatorInput(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                placeholder="Ex: Recepção Manhã"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: FECHAR CAIXA PROFISSIONAL COM CONFERÊNCIA */}
      {modalType === 'close' && (
        <Modal
          isOpen={true}
          onClose={() => setModalType(null)}
          title="Fechamento & Conferência Cega de Caixa"
          subtitle="Realize a conferência física dos valores para auditoria e encerramento"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalType(null)} disabled={isSubmitting}>
                Voltar
              </Button>
              <Button variant="danger" onClick={handleCloseRegister} disabled={isSubmitting}>
                {isSubmitting ? 'Encerrando...' : 'Confirmar Fechamento de Turno'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleCloseRegister} className="space-y-4 text-xs">
            {/* Apuração do Sistema por Forma de Pagamento */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-[#d4af37] uppercase tracking-wider block">
                Apuração do Turno por Forma de Pagamento
              </span>

              {/* Grid dos Meios: Dinheiro Físico vs PIX vs Cartões */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Dinheiro Físico */}
                <div className="p-2.5 bg-[#161622] rounded-xl border border-emerald-700/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <Banknote size={14} />
                    <span>Gaveta (Espécie)</span>
                  </div>
                  <div className="text-base font-bold font-mono text-white">
                    R$ {expectedCashBalance.toFixed(2)}
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Fundo R$ {cashStatus.initialBalanceBRL.toFixed(2)} + Vendas R$ {totalsByMethod.dinheiro.toFixed(2)}
                  </p>
                </div>

                {/* 2. PIX Instantâneo (Separado e Não Físico) */}
                <div className="p-2.5 bg-[#0f1f1d] rounded-xl border border-teal-500/40 space-y-1">
                  <div className="flex items-center justify-between text-teal-300 font-semibold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <QrCode size={14} className="text-teal-400" />
                      <span>PIX Bancário</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold uppercase">
                      Digital
                    </span>
                  </div>
                  <div className="text-base font-bold font-mono text-teal-300">
                    R$ {totalsByMethod.pix.toFixed(2)}
                  </div>
                  <p className="text-[10px] text-teal-400/80">
                    Creditado na conta bancária (não entra no gaveteiro)
                  </p>
                </div>

                {/* 3. Cartões Crédito/Débito */}
                <div className="p-2.5 bg-[#141424] rounded-xl border border-indigo-500/40 space-y-1">
                  <div className="flex items-center justify-between text-indigo-300 font-semibold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <CreditCard size={14} className="text-indigo-400" />
                      <span>Cartões POS</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                      Adquirente
                    </span>
                  </div>
                  <div className="text-base font-bold font-mono text-indigo-300">
                    R$ {(totalsByMethod.cartaoCredito + totalsByMethod.cartaoDebito).toFixed(2)}
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Crédito R$ {totalsByMethod.cartaoCredito.toFixed(2)} · Débito R$ {totalsByMethod.cartaoDebito.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Resumo Consolidado */}
              <div className="p-2.5 bg-[#121218] rounded-xl border border-white/10 flex justify-between items-center text-[11px]">
                <span className="text-neutral-400">Total Geral de Recebimentos do Turno:</span>
                <span className="font-mono font-bold text-white text-xs">
                  R$ {cashStatus.totalEntradas.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Inputs de Contagem e Conferência */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Banknote size={14} className="text-emerald-400" />
                    1. Dinheiro Físico Contado na Gaveta (Cédulas e Moedas) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCountedCashInput(expectedCashBalance.toFixed(2))}
                    className="text-[10px] text-[#d4af37] hover:underline cursor-pointer"
                  >
                    Usar apurado (R$ {expectedCashBalance.toFixed(2)})
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={countedCashInput}
                  onChange={e => setCountedCashInput(e.target.value)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-teal-300 flex items-center gap-1">
                      <QrCode size={13} className="text-teal-400" />
                      2. Conferência PIX (R$) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setCountedPixInput(totalsByMethod.pix.toFixed(2))}
                      className="text-[10px] text-teal-400 hover:underline cursor-pointer"
                    >
                      Apurado (R$ {totalsByMethod.pix.toFixed(2)})
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={countedPixInput}
                    onChange={e => setCountedPixInput(e.target.value)}
                    className="w-full bg-[#14141c] border border-teal-500/30 rounded-lg p-2.5 text-xs text-white font-mono focus:border-teal-400 focus:outline-none"
                    placeholder="0.00"
                    required
                  />
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Conferido no extrato bancário
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1">
                      <CreditCard size={13} className="text-indigo-400" />
                      3. Comprovantes Cartões (R$)
                    </label>
                    <button
                      type="button"
                      onClick={() => setCountedCardInput((totalsByMethod.cartaoCredito + totalsByMethod.cartaoDebito).toFixed(2))}
                      className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                    >
                      Apurado (R$ {(totalsByMethod.cartaoCredito + totalsByMethod.cartaoDebito).toFixed(2)})
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={countedCardInput}
                    onChange={e => setCountedCardInput(e.target.value)}
                    className="w-full bg-[#14141c] border border-indigo-500/30 rounded-lg p-2.5 text-xs text-white font-mono focus:border-indigo-400 focus:outline-none"
                    placeholder="0.00"
                  />
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Relatório do POS / Adquirente
                  </span>
                </div>
              </div>
            </div>

            {/* Alerta de Divergência Automático */}
            <div
              className={`p-3 rounded-xl border ${
                Math.abs(cashDifference) < 0.01
                  ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                  : cashDifference > 0
                  ? 'bg-sky-950/40 border-sky-600/40 text-sky-300'
                  : 'bg-red-950/40 border-red-600/40 text-red-300'
              }`}
            >
              <div className="flex justify-between font-bold">
                <span>Diferença / Quebra de Caixa:</span>
                <span className="font-mono">
                  {Math.abs(cashDifference) < 0.01
                    ? 'R$ 0,00 (Exato)'
                    : cashDifference > 0
                    ? `+ R$ ${cashDifference.toFixed(2)} (Sobra)`
                    : `- R$ ${Math.abs(cashDifference).toFixed(2)} (Falta)`}
                </span>
              </div>
            </div>

            {Math.abs(cashDifference) > 0.01 && (
              <div>
                <label className="text-xs font-semibold text-amber-300 block mb-1">
                  Justificativa da Divergência *
                </label>
                <input
                  type="text"
                  value={differenceReasonInput}
                  onChange={e => setDifferenceReasonInput(e.target.value)}
                  placeholder="Ex: Diferença de centavos em trocos ou devolução cliente"
                  className="w-full bg-[#14141c] border border-amber-600/40 rounded-lg p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Observações de Encerramento (Opcional)
              </label>
              <textarea
                rows={2}
                value={closingNotesInput}
                onChange={e => setClosingNotesInput(e.target.value)}
                placeholder="Observações adicionais para o próximo turno..."
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: SANGRIA */}
      {modalType === 'sangria' && (
        <Modal
          isOpen={true}
          onClose={() => setModalType(null)}
          title="Realizar Sangria (Retirada de Espécie)"
          subtitle={`Saldo disponível no gaveteiro: R$ ${cashStatus.currentBalanceBRL.toFixed(2)}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setModalType(null)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button variant="secondary" onClick={handleAddSangria} disabled={isSubmitting}>
                {isSubmitting ? 'Processando...' : 'Efetuar Retirada'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddSangria} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Valor da Sangria (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                placeholder="Ex: 500.00"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Destino / Motivo da Retirada *
              </label>
              <input
                type="text"
                value={descInput}
                onChange={e => setDescInput(e.target.value)}
                placeholder="Ex: Depósito bancário imediato ou cofre central"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: SUPRIMENTO */}
      {modalType === 'suprimento' && (
        <Modal
          isOpen={true}
          onClose={() => setModalType(null)}
          title="Aporte de Suprimento (Entrada de Troco)"
          subtitle="Adicionar dinheiro em espécie para troco operacional na gaveta"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalType(null)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleAddSuprimento} disabled={isSubmitting}>
                {isSubmitting ? 'Processando...' : 'Confirmar Aporte'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddSuprimento} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Valor do Aporte (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                placeholder="Ex: 200.00"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Descrição / Origem *
              </label>
              <input
                type="text"
                value={descInput}
                onChange={e => setDescInput(e.target.value)}
                placeholder="Ex: Reforço de cédulas pequenas e moedas"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: NOVO RECEBIMENTO BALCÃO */}
      {modalType === 'lancamento' && (
        <Modal
          isOpen={true}
          onClose={() => setModalType(null)}
          title="Novo Recebimento de Balcão"
          subtitle="Lance vendas imediatas de boutique ou serviços avulsos pagos no PDV"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalType(null)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleAddLancamento} disabled={isSubmitting}>
                {isSubmitting ? 'Gravando...' : 'Registrar Recebimento'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddLancamento} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Descrição do Recebimento *
              </label>
              <input
                type="text"
                value={descInput}
                onChange={e => setDescInput(e.target.value)}
                placeholder="Ex: Venda 1x Óleo Iluminador Ouro 24k ou Escova Express"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Forma de Pagamento *
                </label>
                <select
                  value={paymentMethodInput}
                  onChange={e => setPaymentMethodInput(e.target.value as any)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="dinheiro">Dinheiro (Espécie)</option>
                  <option value="pix">PIX Instantâneo</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="transferencia">Transferência Bancária</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Categoria *
              </label>
              <select
                value={categoryInput}
                onChange={e => setCategoryInput(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              >
                <option value="Venda Balcão">Venda Balcão / Boutique</option>
                <option value="Serviço">Serviço Avulso</option>
                <option value="Pacote">Pacote de Tratamentos</option>
                <option value="Outros">Outras Entradas</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: DETALHES DO FECHAMENTO ANTERIOR */}
      {selectedClosingDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedClosingDetail(null)}
          title="Comprovante de Fechamento de Caixa"
          subtitle={`Auditado em ${selectedClosingDetail.closedAt} por ${selectedClosingDetail.operatorName}`}
          footer={
            <Button onClick={() => setSelectedClosingDetail(null)}>
              Fechar Comprovante
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#161622] rounded-xl border border-white/10 space-y-2">
              <div className="flex justify-between text-neutral-400">
                <span>Fundo Inicial:</span>
                <span className="font-mono text-white">R$ {selectedClosingDetail.initialBalanceBRL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Total Entradas:</span>
                <span className="font-mono text-emerald-400">+ R$ {selectedClosingDetail.totalEntradas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Total Saídas:</span>
                <span className="font-mono text-red-400">- R$ {selectedClosingDetail.totalSaidas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-300 pt-1.5 border-t border-white/5">
                <span>Saldo Teórico Esperado:</span>
                <span className="font-mono font-bold text-white">R$ {selectedClosingDetail.expectedBalanceBRL.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 bg-[#13131c] rounded-xl border border-white/10 space-y-2">
              <span className="text-[10px] text-[#d4af37] font-semibold uppercase tracking-wider block mb-1">
                Valores Conferidos no Fechamento
              </span>
              <div className="flex justify-between text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Banknote size={13} className="text-emerald-400" />
                  Dinheiro em Espécie (Gaveteiro Físico):
                </span>
                <span className="font-mono font-bold text-white">R$ {selectedClosingDetail.countedCashBRL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-teal-300 bg-teal-950/20 p-1.5 rounded-lg border border-teal-800/30">
                <span className="flex items-center gap-1.5 font-semibold">
                  <QrCode size={13} className="text-teal-400" />
                  Total Recebido via PIX (Extrato Bancário):
                </span>
                <span className="font-mono font-bold text-teal-300">R$ {selectedClosingDetail.countedPixBRL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <CreditCard size={13} className="text-indigo-400" />
                  Comprovantes de Cartões (POS / Adquirente):
                </span>
                <span className="font-mono text-white">R$ {selectedClosingDetail.countedCardBRL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-white/5 font-bold">
                <span className="text-white">Total Geral Conferido:</span>
                <span className="font-mono text-[#f3e5ab]">R$ {selectedClosingDetail.totalCountedBRL.toFixed(2)}</span>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border font-semibold flex justify-between ${
                Math.abs(selectedClosingDetail.differenceBRL) < 0.01
                  ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-600/40 text-red-300'
              }`}
            >
              <span>Divergência / Quebra:</span>
              <span className="font-mono">
                {Math.abs(selectedClosingDetail.differenceBRL) < 0.01
                  ? 'R$ 0,00 (Conferência 100% Exata)'
                  : `R$ ${selectedClosingDetail.differenceBRL.toFixed(2)}`}
              </span>
            </div>

            {selectedClosingDetail.differenceReason && (
              <div className="p-3 bg-[#181822] rounded-lg border border-white/5">
                <span className="text-neutral-500 block text-[10px]">Justificativa do Operador:</span>
                <p className="text-neutral-200 mt-0.5">{selectedClosingDetail.differenceReason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
