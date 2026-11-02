import React, { useState } from 'react';
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
} from 'lucide-react';
import { CashRegisterStatus, CashTransaction } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { StorageService } from '../../../services/storage';

interface CashRegisterModuleProps {
  cashStatus: CashRegisterStatus;
  transactions: CashTransaction[];
  onRefreshData: () => void;
}

export const CashRegisterModule: React.FC<CashRegisterModuleProps> = ({
  cashStatus,
  transactions,
  onRefreshData,
}) => {
  // Modal states
  const [modalType, setModalType] = useState<'open' | 'close' | 'sangria' | 'suprimento' | null>(null);
  const [amountInput, setAmountInput] = useState<string>('');
  const [descInput, setDescInput] = useState<string>('');
  const [operatorInput, setOperatorInput] = useState<string>('Recepção Principal');

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput) || 0;
    StorageService.openCashRegister(amount, operatorInput);
    onRefreshData();
    setModalType(null);
    setAmountInput('');
  };

  const handleCloseRegister = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.closeCashRegister(operatorInput);
    onRefreshData();
    setModalType(null);
  };

  const handleAddSangria = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput) || 0;
    if (amount <= 0 || amount > cashStatus.currentBalanceBRL) {
      alert('Valor de sangria inválido ou superior ao saldo em caixa.');
      return;
    }
    StorageService.addCashTransaction({
      type: 'sangria',
      category: 'Sangria de Caixa',
      description: descInput || 'Retirada de numerário para custódia/cofre',
      amountBRL: amount,
      operatorName: operatorInput,
    });
    onRefreshData();
    setModalType(null);
    setAmountInput('');
    setDescInput('');
  };

  const handleAddSuprimento = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput) || 0;
    if (amount <= 0) return;
    StorageService.addCashTransaction({
      type: 'suprimento',
      category: 'Suprimento de Caixa',
      description: descInput || 'Aporte de troco adicional',
      amountBRL: amount,
      operatorName: operatorInput,
    });
    onRefreshData();
    setModalType(null);
    setAmountInput('');
    setDescInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Status & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-semibold text-white">
              Fluxo & Gestão de Caixa Diário
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                cashStatus.isOpen
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50'
                  : 'bg-red-950/80 text-red-400 border border-red-700/50'
              }`}
            >
              {cashStatus.isOpen ? 'Caixa Aberto' : 'Caixa Encerrado'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            {cashStatus.isOpen
              ? `Aberto por ${cashStatus.openedBy} às ${cashStatus.openedAt}`
              : 'O caixa está fechado no momento.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {cashStatus.isOpen ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setAmountInput('');
                  setDescInput('');
                  setModalType('suprimento');
                }}
                icon={<Plus size={14} />}
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
                icon={<Minus size={14} />}
              >
                Sangria
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setModalType('close')}
                icon={<Lock size={14} />}
              >
                Fechar Caixa
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setAmountInput('300.00');
                setModalType('open');
              }}
              icon={<Unlock size={14} />}
            >
              Abrir Caixa do Dia
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card padding="md" borderGold className="bg-[#121219]">
          <span className="text-[11px] uppercase tracking-wider text-[#d4af37] font-medium block">
            Saldo Atual em Espécie
          </span>
          <div className="text-3xl font-serif font-bold text-[#f3e5ab] mt-1 font-mono tabular-nums">
            R$ {cashStatus.currentBalanceBRL.toFixed(2)}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Fundo inicial: R$ {cashStatus.initialBalanceBRL.toFixed(2)}
          </span>
        </Card>

        <Card padding="md" className="border border-white/10">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium block">
            Total Entradas Hoje
          </span>
          <div className="text-3xl font-serif font-bold text-emerald-400 mt-1 font-mono tabular-nums">
            + R$ {cashStatus.totalEntradas.toFixed(2)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Serviços & Vendas em balcão
          </span>
        </Card>

        <Card padding="md" className="border border-white/10">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium block">
            Total Saídas Hoje
          </span>
          <div className="text-3xl font-serif font-bold text-red-400 mt-1 font-mono tabular-nums">
            - R$ {cashStatus.totalSaidas.toFixed(2)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Sangrias & Despesas imediatas
          </span>
        </Card>

        <Card padding="md" className="border border-white/10">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium block">
            Movimentações Registradas
          </span>
          <div className="text-3xl font-serif font-bold text-white mt-1 font-mono tabular-nums">
            {transactions.length}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Lançamentos auditáveis do turno
          </span>
        </Card>
      </div>

      {/* Extrato de Lançamentos */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Extrato Detalhado de Lançamentos
          </h3>
          <span className="text-xs text-neutral-400">
            Atualização em tempo real
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            Nenhuma movimentação registrada no caixa hoje.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map(trx => {
              const isPositive = trx.type === 'entrada' || trx.type === 'suprimento' || trx.type === 'abertura';
              return (
                <div key={trx.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isPositive
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : 'bg-red-950/60 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {isPositive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>

                    <div>
                      <div className="font-semibold text-white">{trx.description}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {trx.category} · Operador: {trx.operatorName} · {trx.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-semibold text-sm ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isPositive ? '+' : '-'} R$ {trx.amountBRL.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* MODAL: ABRIR CAIXA */}
      {modalType === 'open' && (
        <Modal
          isOpen={true}
          onClose={() => setModalType(null)}
          title="Abertura de Caixa do Turno"
          subtitle="Informe o fundo inicial em dinheiro para troco"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalType(null)}>
                Cancelar
              </Button>
              <Button onClick={handleOpenRegister}>
                Confirmar Abertura
              </Button>
            </>
          }
        >
          <form onSubmit={handleOpenRegister} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Fundo de Troco Inicial (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                placeholder="300.00"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Operador Responsável
              </label>
              <input
                type="text"
                value={operatorInput}
                onChange={e => setOperatorInput(e.target.value)}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: FECHAR CAIXA */}
      {modalType === 'close' && (
        <Modal
          isOpen={true}
          onClose={() => setModalType(null)}
          title="Encerramento de Caixa"
          subtitle={`Saldo apurado no sistema: R$ ${cashStatus.currentBalanceBRL.toFixed(2)}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setModalType(null)}>
                Voltar
              </Button>
              <Button variant="danger" onClick={handleCloseRegister}>
                Confirmar Fechamento
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs text-neutral-300">
            <p>
              Ao encerrar o caixa, o saldo final será registrado para conferência e o caixa será travado até o próximo turno.
            </p>
            <div className="p-3 bg-[#161622] rounded-lg border border-white/10">
              <div className="flex justify-between py-1">
                <span>Fundo Inicial:</span>
                <span className="font-mono">R$ {cashStatus.initialBalanceBRL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Total Entradas:</span>
                <span className="font-mono text-emerald-400">+ R$ {cashStatus.totalEntradas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Total Saídas:</span>
                <span className="font-mono text-red-400">- R$ {cashStatus.totalSaidas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-t border-white/10 font-bold text-white">
                <span>Saldo Final em Caixa:</span>
                <span className="font-mono text-[#f3e5ab]">R$ {cashStatus.currentBalanceBRL.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: SANGRIA */}
      {modalType === 'sangria' && (
        <Modal
          isOpen={true}
          onClose={() => setModalType(null)}
          title="Realizar Sangria (Retirada de Caixa)"
          subtitle={`Saldo disponível para retirada: R$ ${cashStatus.currentBalanceBRL.toFixed(2)}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setModalType(null)}>
                Cancelar
              </Button>
              <Button variant="secondary" onClick={handleAddSangria}>
                Efetuar Retirada
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddSangria} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Valor da Sangria (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                placeholder="Ex: 500.00"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Motivo / Destino
              </label>
              <input
                type="text"
                value={descInput}
                onChange={e => setDescInput(e.target.value)}
                placeholder="Ex: Transferência para cofre administrativo"
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
          subtitle="Adicionar dinheiro em espécie para troco operacional"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalType(null)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSuprimento}>
                Confirmar Entrada
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddSuprimento} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Valor do Aporte (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                placeholder="Ex: 200.00"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={descInput}
                onChange={e => setDescInput(e.target.value)}
                placeholder="Ex: Reforço de moedas e notas de 10 reais para troco"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
