import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  FileSpreadsheet,
  AlertTriangle,
  Download,
  Calendar,
} from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Appointment, Service, Product } from '../../../types';

interface FinanceModuleProps {
  appointments: Appointment[];
  services: Service[];
  products: Product[];
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({
  appointments,
  services,
  products,
}) => {
  const [period, setPeriod] = useState<'mes_atual' | 'trimestre' | 'ano'>('mes_atual');

  // Operational Simulation Aggregates
  const revenueHairBRL = 14850.0;
  const revenueNailsBRL = 4920.0;
  const revenueAestheticBRL = 6840.0;
  const revenueProductsBRL = 3680.0;
  const totalRevenueBRL = revenueHairBRL + revenueNailsBRL + revenueAestheticBRL + revenueProductsBRL;

  // Operational Costs
  const costCommissionsBRL = totalRevenueBRL * 0.48; // ~48% average commission
  const costSuppliesBRL = 4200.0; // Shampoos, plex, gold leaves, masks
  const costOverheadBRL = 3800.0; // Energy, coffee/espumante, utilities
  const totalCostsBRL = costCommissionsBRL + costSuppliesBRL + costOverheadBRL;

  const netOperatingIncomeBRL = totalRevenueBRL - totalCostsBRL;
  const operatingMarginPercent = (netOperatingIncomeBRL / totalRevenueBRL) * 100;

  return (
    <div className="space-y-6">
      {/* Disclaimer Alert */}
      <div className="p-4 bg-amber-950/40 border border-amber-600/40 rounded-xl flex items-start gap-3 text-xs text-amber-200">
        <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-white font-medium mb-0.5">
            Módulo de Inteligência & DRE Gerencial (Ambiente Operacional)
          </strong>
          Os valores apresentados representam modelos de projeção e gestão interna para cálculo de margem, comissões de parceiros e insumos do atelier Sra. Bela Mulher. Não constituem dados bancários reais.
        </div>
      </div>

      {/* Header with Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-white">
            Demonstrativo de Resultados (DRE Gerencial)
          </h2>
          <p className="text-xs text-neutral-400">
            Acompanhe a lucratividade por categoria de serviço e boutique.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#121217] rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setPeriod('mes_atual')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                period === 'mes_atual'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Novembro/2026
            </button>
            <button
              onClick={() => setPeriod('trimestre')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                period === 'trimestre'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              4º Trimestre
            </button>
            <button
              onClick={() => setPeriod('ano')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                period === 'ano'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ano 2026
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => alert('Relatório analítico exportado para download com sucesso.')}
            icon={<Download size={14} />}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* Top 3 High Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="border border-white/10">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Faturamento Bruto Projetado</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-serif font-bold text-white mt-2 font-mono tabular-nums">
            R$ {totalRevenueBRL.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            Serviços + Boutique Home Care
          </span>
        </Card>

        <Card padding="md" className="border border-white/10">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Custos Operacionais & Repasses</span>
            <TrendingDown size={16} className="text-red-400" />
          </div>
          <div className="text-3xl font-serif font-bold text-white mt-2 font-mono tabular-nums">
            R$ {totalCostsBRL.toFixed(2)}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Comissões + Insumos de Bancada + Despesas
          </span>
        </Card>

        <Card padding="md" borderGold className="bg-[#121219]">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Resultado Operacional Líquido</span>
            <DollarSign size={16} className="text-[#d4af37]" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#f3e5ab] mt-2 font-mono tabular-nums">
            R$ {netOperatingIncomeBRL.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#d4af37] mt-1 block font-medium">
            Margem Operacional de {operatingMarginPercent.toFixed(1)}%
          </span>
        </Card>
      </div>

      {/* Revenue Breakdown by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md" className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Receitas por Especialidade
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-300">Cabelos & Mechas Balayage</span>
                <span className="font-mono font-semibold text-[#f3e5ab]">R$ {revenueHairBRL.toFixed(2)} (49%)</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-[#d4af37] h-full rounded-full" style={{ width: '49%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-300">Estética Facial & Sobrancelhas</span>
                <span className="font-mono font-semibold text-[#f3e5ab]">R$ {revenueAestheticBRL.toFixed(2)} (23%)</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '23%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-300">Unhas Couture & Spa</span>
                <span className="font-mono font-semibold text-[#f3e5ab]">R$ {revenueNailsBRL.toFixed(2)} (16%)</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full rounded-full" style={{ width: '16%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-300">Boutique de Produtos Home Care</span>
                <span className="font-mono font-semibold text-[#f3e5ab]">R$ {revenueProductsBRL.toFixed(2)} (12%)</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Expenses Structure */}
        <Card padding="md" className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Estrutura de Custos & Comissionamento
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#14141c] rounded-lg border border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Repasse de Comissões aos Especialistas</span>
                <span className="text-neutral-500 text-[11px]">Hair stylists, manicures e estetas</span>
              </div>
              <span className="font-mono font-semibold text-red-400">
                - R$ {costCommissionsBRL.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-[#14141c] rounded-lg border border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Químicas, Plex & Insumos de Bancada</span>
                <span className="text-neutral-500 text-[11px]">Kérastase, pigmentos orgânicos, descartáveis</span>
              </div>
              <span className="font-mono font-semibold text-red-400">
                - R$ {costSuppliesBRL.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-[#14141c] rounded-lg border border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Espaço, Energia & Experiência Gourmet</span>
                <span className="text-neutral-500 text-[11px]">Cafés especiais, espumantes e utilidades</span>
              </div>
              <span className="font-mono font-semibold text-red-400">
                - R$ {costOverheadBRL.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
