import React, { useState } from 'react';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  Search,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Product } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { StorageService } from '../../../services/storage';

interface ProductsModuleProps {
  products: Product[];
  onRefreshData: () => void;
}

export const ProductsModule: React.FC<ProductsModuleProps> = ({
  products,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New product state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('Tratamento Capilar');
  const [brand, setBrand] = useState('Sra. Bela Mulher Atelier');
  const [costPriceBRL, setCostPriceBRL] = useState('80.00');
  const [salePriceBRL, setSalePriceBRL] = useState('180.00');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [minStockAlert, setMinStockAlert] = useState('3');
  const [sku, setSku] = useState('SBM-NEW');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    StorageService.addProduct({
      name: name.trim(),
      category,
      brand: brand.trim(),
      costPriceBRL: parseFloat(costPriceBRL) || 50,
      salePriceBRL: parseFloat(salePriceBRL) || 120,
      stockQuantity: parseInt(stockQuantity) || 5,
      minStockAlert: parseInt(minStockAlert) || 2,
      image: '/src/assets/images/service_luxury_haircare_1793577408044.jpg',
      sku: sku.trim() || `SBM-${Date.now().toString().slice(-4)}`,
      featuredInVitrine: true,
      active: true,
      displayOrder: 0,
    });

    onRefreshData();
    setIsModalOpen(false);
    setName('');
  };

  const handleAdjustStock = (id: string, delta: number) => {
    StorageService.adjustProductStock(id, delta);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-white">
            Estoque da Boutique & Home Care
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Controle de inventário, margens de revenda e alerta automático de reposição.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
          Cadastrar Produto
        </Button>
      </div>

      {/* Search Input */}
      <div className="p-3 bg-[#121217] border border-white/10 rounded-xl flex items-center gap-3">
        <Search size={16} className="text-neutral-500 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar produtos por nome, marca ou código SKU..."
          className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(p => {
          const isLowStock = p.stockQuantity <= p.minStockAlert;
          const unitProfitBRL = p.salePriceBRL - p.costPriceBRL;

          return (
            <Card
              key={p.id}
              padding="md"
              className={`flex flex-col justify-between space-y-4 border ${
                isLowStock ? 'border-amber-600/50 bg-[#16120e]' : 'border-white/10 bg-[#111116]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                    {p.brand}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {p.sku}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white mt-1 leading-snug">
                  {p.name}
                </h4>
                <div className="text-[11px] text-[#d4af37] font-medium mt-0.5">
                  {p.category}
                </div>

                {isLowStock && (
                  <div className="mt-2 p-2 bg-amber-950/60 border border-amber-800/40 rounded text-[11px] text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" />
                    <span>Estoque Crítico: restam apenas {p.stockQuantity} un</span>
                  </div>
                )}
              </div>

              {/* Pricing & Margins */}
              <div className="p-2.5 bg-[#14141c] rounded-lg border border-white/5 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Preço de Venda:</span>
                  <span className="font-mono font-bold text-[#f3e5ab]">
                    R$ {p.salePriceBRL.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Custo: R$ {p.costPriceBRL.toFixed(2)}</span>
                  <span className="text-emerald-400 font-mono">
                    Margem: + R$ {unitProfitBRL.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Stock Stepper */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 block">Saldo em Estoque</span>
                  <span className="text-base font-mono font-bold text-white">
                    {p.stockQuantity} <span className="text-xs font-normal text-neutral-400">un</span>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAdjustStock(p.id, -1)}
                    disabled={p.stockQuantity <= 0}
                    className="p-1.5 rounded bg-[#181822] hover:bg-white/10 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Baixa de 1 unidade (venda)"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={() => handleAdjustStock(p.id, 1)}
                    className="p-1.5 rounded bg-[#181822] hover:bg-white/10 text-neutral-300"
                    title="Entrada de 1 unidade (reposição)"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODAL: NOVO PRODUTO */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title="Cadastrar Item na Boutique"
          subtitle="Controle preços, margens e estoque mínimo de alerta"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProduct}>
                Salvar Produto
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Nome Comercial do Produto *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Máscara Reconstrutora Ouro Líquido"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Tratamento Capilar">Tratamento Capilar</option>
                  <option value="Finalizadores">Finalizadores</option>
                  <option value="Home Care">Home Care</option>
                  <option value="Esmaltes & Cuidados">Esmaltes & Cuidados</option>
                  <option value="Acessórios">Acessórios</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Código SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  placeholder="SBM-101"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Custo de Compra (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costPriceBRL}
                  onChange={e => setCostPriceBRL(e.target.value)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePriceBRL}
                  onChange={e => setSalePriceBRL(e.target.value)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Estoque Inicial (un) *
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={e => setStockQuantity(e.target.value)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Alerta Mínimo (un)
                </label>
                <input
                  type="number"
                  value={minStockAlert}
                  onChange={e => setMinStockAlert(e.target.value)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
