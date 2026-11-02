import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Store,
  Info,
  Check,
  X,
  AlertCircle,
  Package,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  PlusCircle,
  Link2,
  Unlink,
  CheckSquare,
  Layers,
} from 'lucide-react';
import { Vitrine, Product } from '../../../types';
import { SupabaseDataService } from '../../../services/supabaseDataService';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { Card } from '../../common/Card';

interface VitrinesModuleProps {
  products?: Product[];
  onRefreshData?: () => void;
}

export const VitrinesModule: React.FC<VitrinesModuleProps> = ({ products: initialProducts = [], onRefreshData }) => {
  const [vitrines, setVitrines] = useState<Vitrine[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active sub-view: managing products for a specific Vitrine
  const [activeVitrine, setActiveVitrine] = useState<Vitrine | null>(null);

  // Form / Modal States for Vitrine
  const [isVitrineModalOpen, setIsVitrineModalOpen] = useState(false);
  const [editingVitrine, setEditingVitrine] = useState<Vitrine | null>(null);
  const [vitrineName, setVitrineName] = useState('');
  const [vitrineDescription, setVitrineDescription] = useState('');
  const [vitrineCoverUrl, setVitrineCoverUrl] = useState('');
  const [vitrineAtivo, setVitrineAtivo] = useState(true);
  const [vitrineDisplayOrder, setVitrineDisplayOrder] = useState(1);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [deleteVitrineTargetId, setDeleteVitrineTargetId] = useState<string | null>(null);

  // Modals for Product Association & Editing
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [removeProductTargetId, setRemoveProductTargetId] = useState<string | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [modalSuccessNotice, setModalSuccessNotice] = useState<string | null>(null);

  // Form Fields for Product Creation/Editing
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<Product['category']>('Home Care');
  const [prodBrand, setProdBrand] = useState('Sra. Bela Mulher Atelier');
  const [prodSalePrice, setProdSalePrice] = useState<number>(150);
  const [prodPromoPrice, setProdPromoPrice] = useState<string>('');
  const [prodStock, setProdStock] = useState<number>(12);
  const [prodImage, setProdImage] = useState('');
  const [prodSku, setProdSku] = useState('');
  const prodFileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, pData] = await Promise.all([
        SupabaseDataService.fetchVitrines(),
        SupabaseDataService.fetchProducts(),
      ]);
      setVitrines(vData);
      setCatalogProducts(pData);

      // Keep active vitrine reference updated
      if (activeVitrine) {
        const updatedActive = vData.find(v => v.id === activeVitrine.id);
        if (updatedActive) setActiveVitrine(updatedActive);
      }
    } catch (err) {
      console.error('Erro ao carregar vitrines e produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------------------------------------------------------------------
  // VITRINE CRUD HANDLERS
  // ---------------------------------------------------------------------------
  const handleOpenNewVitrineModal = () => {
    setEditingVitrine(null);
    setVitrineName('');
    setVitrineDescription('');
    setVitrineCoverUrl('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80');
    setVitrineAtivo(true);
    setVitrineDisplayOrder(vitrines.length + 1);
    setIsVitrineModalOpen(true);
  };

  const handleOpenEditVitrineModal = (vitrine: Vitrine) => {
    setEditingVitrine(vitrine);
    setVitrineName(vitrine.name);
    setVitrineDescription(vitrine.description || '');
    setVitrineCoverUrl(vitrine.coverImageUrl || '');
    setVitrineAtivo(vitrine.ativo);
    setVitrineDisplayOrder(vitrine.displayOrder || 1);
    setIsVitrineModalOpen(true);
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setVitrineCoverUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveVitrine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vitrineName.trim()) {
      setStatusMessage({ type: 'error', text: 'O nome da vitrine é obrigatório.' });
      return;
    }

    try {
      if (editingVitrine) {
        await SupabaseDataService.updateVitrine(editingVitrine.id, {
          name: vitrineName,
          description: vitrineDescription,
          coverImageUrl: vitrineCoverUrl,
          ativo: vitrineAtivo,
          displayOrder: Number(vitrineDisplayOrder),
        });
        setStatusMessage({ type: 'success', text: `Vitrine "${vitrineName}" atualizada com sucesso!` });
      } else {
        await SupabaseDataService.createVitrine({
          name: vitrineName,
          description: vitrineDescription,
          coverImageUrl: vitrineCoverUrl,
          ativo: vitrineAtivo,
          displayOrder: Number(vitrineDisplayOrder),
          productIds: [],
        });
        setStatusMessage({ type: 'success', text: `Nova vitrine "${vitrineName}" criada com sucesso!` });
      }

      setIsVitrineModalOpen(false);
      await loadData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Erro ao salvar vitrine.' });
    }
  };

  const handleToggleVitrineStatus = async (vitrine: Vitrine) => {
    try {
      await SupabaseDataService.updateVitrine(vitrine.id, { ativo: !vitrine.ativo });
      await loadData();
      if (onRefreshData) onRefreshData();
      setStatusMessage({
        type: 'success',
        text: `Vitrine "${vitrine.name}" agora está ${!vitrine.ativo ? 'Ativa' : 'Inativa'}.`,
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Erro ao alterar status.' });
    }
  };

  const handleDeleteVitrineConfirm = async () => {
    if (!deleteVitrineTargetId) return;
    try {
      await SupabaseDataService.deleteVitrine(deleteVitrineTargetId);
      if (activeVitrine?.id === deleteVitrineTargetId) setActiveVitrine(null);
      setDeleteVitrineTargetId(null);
      await loadData();
      if (onRefreshData) onRefreshData();
      setStatusMessage({ type: 'success', text: 'Vitrine excluída com sucesso!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Erro ao excluir vitrine.' });
    }
  };

  // ---------------------------------------------------------------------------
  // MULTI-PRODUCT ASSOCIATION & ACCUMULATION HANDLERS
  // ---------------------------------------------------------------------------

  // Toggle single product association in vitrine (ACCRUAL / ACCUMULATION)
  const handleToggleAssociateProduct = async (productId: string) => {
    if (!activeVitrine) return;

    const currentProductIds = activeVitrine.productIds || [];
    let updatedProductIds: string[];

    if (currentProductIds.includes(productId)) {
      // Remove only this ID, preserving all other associated IDs
      updatedProductIds = currentProductIds.filter(id => id !== productId);
    } else {
      // APPEND new ID to existing IDs array (no overwriting or resetting!)
      updatedProductIds = [...currentProductIds, productId];
    }

    // Immediately update activeVitrine state so UI and modal reflect change instantly
    const updatedVitrine = { ...activeVitrine, productIds: updatedProductIds };
    setActiveVitrine(updatedVitrine);

    try {
      await SupabaseDataService.updateVitrine(activeVitrine.id, { productIds: updatedProductIds });
      await loadData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Erro ao atualizar associação do produto.' });
    }
  };

  // Associate ALL visible products from catalog search in one click
  const handleAssociateAllFilteredProducts = async () => {
    if (!activeVitrine) return;

    const filtered = catalogProducts.filter(p =>
      productSearchQuery
        ? p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(productSearchQuery.toLowerCase())
        : true
    );

    const currentIds = activeVitrine.productIds || [];
    const newIds = filtered.map(p => p.id).filter(id => !currentIds.includes(id));

    if (newIds.length === 0) {
      setStatusMessage({ type: 'success', text: 'Todos os produtos filtrados já estão associados.' });
      return;
    }

    const updatedProductIds = [...currentIds, ...newIds];
    setActiveVitrine({ ...activeVitrine, productIds: updatedProductIds });

    try {
      await SupabaseDataService.updateVitrine(activeVitrine.id, { productIds: updatedProductIds });
      await loadData();
      if (onRefreshData) onRefreshData();
      setStatusMessage({
        type: 'success',
        text: `${newIds.length} produto(s) adicionados à vitrine com sucesso!`,
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Erro ao associar lote de produtos.' });
    }
  };

  const handleMoveProductOrder = async (productId: string, direction: 'up' | 'down') => {
    if (!activeVitrine) return;
    const currentIds = [...(activeVitrine.productIds || [])];
    const index = currentIds.indexOf(productId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentIds.length) return;

    // Swap elements
    const temp = currentIds[index];
    currentIds[index] = currentIds[newIndex];
    currentIds[newIndex] = temp;

    setActiveVitrine({ ...activeVitrine, productIds: currentIds });

    try {
      await SupabaseDataService.updateVitrine(activeVitrine.id, { productIds: currentIds });
      await loadData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Erro ao reordenar produtos.' });
    }
  };

  const handleRemoveProductFromVitrineConfirm = async () => {
    if (!activeVitrine || !removeProductTargetId) return;
    const updatedIds = (activeVitrine.productIds || []).filter(id => id !== removeProductTargetId);

    setActiveVitrine({ ...activeVitrine, productIds: updatedIds });

    try {
      await SupabaseDataService.updateVitrine(activeVitrine.id, { productIds: updatedIds });
      setRemoveProductTargetId(null);
      await loadData();
      if (onRefreshData) onRefreshData();
      setStatusMessage({
        type: 'success',
        text: 'Produto desvinculado desta vitrine. O cadastro original foi mantido no catálogo.',
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Erro ao remover produto da vitrine.' });
    }
  };

  // Open Product Creation Modal
  const handleOpenCreateProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory('Home Care');
    setProdBrand('Sra. Bela Mulher Atelier');
    setProdSalePrice(180);
    setProdPromoPrice('');
    setProdStock(12);
    setProdImage('https://images.unsplash.com/photo-1608248597262-838249719153?auto=format&fit=crop&w=800&q=80');
    setProdSku(`SBM-${Date.now().toString().slice(-6)}`);
    setModalSuccessNotice(null);
    setIsCreateProductModalOpen(true);
  };

  const handleOpenEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdCategory(product.category);
    setProdBrand(product.brand || 'Sra. Bela Mulher Atelier');
    setProdSalePrice(product.salePriceBRL);
    setProdPromoPrice(product.promotionalPriceBRL ? product.promotionalPriceBRL.toString() : '');
    setProdStock(product.stockQuantity || 10);
    setProdImage(product.image || '');
    setProdSku(product.sku || '');
    setModalSuccessNotice(null);
    setIsCreateProductModalOpen(true);
  };

  const handleProductFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setProdImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Product (Supports option to keep modal open to add multiple products continuously!)
  const handleSaveProduct = async (e?: React.FormEvent, keepOpen: boolean = false) => {
    if (e) e.preventDefault();
    if (!prodName.trim()) {
      setStatusMessage({ type: 'error', text: 'O nome do produto é obrigatório.' });
      return;
    }

    try {
      const promoNum = prodPromoPrice.trim() ? parseFloat(prodPromoPrice) : undefined;

      if (editingProduct) {
        await SupabaseDataService.updateProduct(editingProduct.id, {
          name: prodName,
          category: prodCategory,
          brand: prodBrand,
          salePriceBRL: prodSalePrice,
          promotionalPriceBRL: promoNum,
          stockQuantity: prodStock,
          image: prodImage,
          sku: prodSku,
        });
        setStatusMessage({ type: 'success', text: `Produto "${prodName}" atualizado com sucesso!` });
        setIsCreateProductModalOpen(false);
      } else {
        // Create brand new product in master catalog
        const newProduct = await SupabaseDataService.createProduct({
          name: prodName,
          category: prodCategory,
          brand: prodBrand,
          costPriceBRL: Math.round(prodSalePrice * 0.4),
          salePriceBRL: prodSalePrice,
          promotionalPriceBRL: promoNum,
          stockQuantity: prodStock,
          minStockAlert: 5,
          image: prodImage,
          sku: prodSku || `SBM-${Date.now().toString().slice(-6)}`,
          featuredInVitrine: true,
          active: true,
          displayOrder: catalogProducts.length,
        });

        // ACCUMULATE: Append new product ID to activeVitrine.productIds
        if (activeVitrine) {
          const currentIds = activeVitrine.productIds || [];
          if (!currentIds.includes(newProduct.id)) {
            const updatedProductIds = [...currentIds, newProduct.id];
            setActiveVitrine({ ...activeVitrine, productIds: updatedProductIds });
            await SupabaseDataService.updateVitrine(activeVitrine.id, { productIds: updatedProductIds });
          }
        }

        if (keepOpen) {
          // Reset form fields to quickly register another product
          const savedName = prodName;
          setProdName('');
          setProdSalePrice(180);
          setProdPromoPrice('');
          setProdSku(`SBM-${Date.now().toString().slice(-6)}`);
          setModalSuccessNotice(`✓ "${savedName}" adicionado à vitrine! Digite os dados do próximo produto abaixo.`);
          setStatusMessage({ type: 'success', text: `Produto "${savedName}" adicionado! Pode cadastrar o próximo.` });
        } else {
          setIsCreateProductModalOpen(false);
          setStatusMessage({ type: 'success', text: `Novo produto "${prodName}" cadastrado e associado!` });
        }
      }

      await loadData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Erro ao salvar produto.' });
    }
  };

  // Get Associated Product Objects for the Active Vitrine
  const activeVitrineProducts = activeVitrine
    ? (activeVitrine.productIds || [])
        .map(id => catalogProducts.find(p => p.id === id))
        .filter((p): p is Product => p !== undefined)
    : [];

  return (
    <div className="space-y-6">
      {/* HEADER PRINCIPAL OU NAVEGAÇÃO DE SUB-VIEW */}
      {activeVitrine ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <button
              onClick={() => setActiveVitrine(null)}
              className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:text-white transition-colors cursor-pointer mb-1"
            >
              <ArrowLeft size={14} />
              <span>Voltar para Lista de Vitrines</span>
            </button>
            <div className="flex items-center gap-2">
              <Package className="text-[#d4af37]" size={22} />
              <h2 className="text-2xl font-serif font-bold text-white">
                Gerenciar Produtos: <span className="text-[#f3e5ab] font-normal">{activeVitrine.name}</span>
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Adicione múltiplos produtos do catálogo ou cadastre novos itens sem limite de quantidade.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddExistingModalOpen(true)}
              icon={<Link2 size={15} />}
            >
              Adicionar do Catálogo
            </Button>
            <Button
              size="sm"
              onClick={handleOpenCreateProductModal}
              icon={<Plus size={15} />}
            >
              NOVO PRODUTO
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Store className="text-[#d4af37]" size={22} />
              <h2 className="text-2xl font-serif font-bold text-white">Gestão de Múltiplas Vitrines</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Cadastre vitrines temáticas e organize múltiplos produtos em cada uma.
            </p>
          </div>

          <Button onClick={handleOpenNewVitrineModal} icon={<Plus size={16} />}>
            NOVA VITRINE
          </Button>
        </div>
      )}

      {/* Info Warning banner */}
      <div className="bg-[#18160c] border border-[#d4af37]/30 rounded-xl p-4 flex items-start gap-3">
        <Info size={18} className="text-[#d4af37] shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-300 space-y-1">
          <p className="font-semibold text-[#f3e5ab]">Associação Múltipla sem Limites</p>
          <p className="text-neutral-400">
            Você pode associar quantos produtos desejar nesta vitrine. Os novos itens são sempre acumulados no vetor de associação sem substituir os anteriores.
          </p>
        </div>
      </div>

      {/* Status Feedback Message */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-neutral-400 hover:text-white p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* VIEW 1: PRODUTOS DENTRO DE UMA VITRINE ESPECÍFICA */}
      {activeVitrine ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400 bg-[#111116] p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2">
              <Layers className="text-[#d4af37]" size={16} />
              <span>
                Produtos Associados a esta Vitrine:{' '}
                <strong className="text-white font-mono">{activeVitrineProducts.length} itens</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#d4af37]">Status da Vitrine:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  activeVitrine.ativo ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {activeVitrine.ativo ? 'Publicada' : 'Oculta'}
              </span>
            </div>
          </div>

          {activeVitrineProducts.length === 0 ? (
            <div className="py-16 text-center bg-[#111116] border border-white/10 rounded-2xl p-8 space-y-3">
              <Package size={40} className="mx-auto text-neutral-600" />
              <h3 className="text-base font-serif text-white font-medium">Nenhum produto nesta vitrine</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Adicione produtos do catálogo geral ou cadastre novos produtos específicos sem limite de quantidade.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsAddExistingModalOpen(true)} icon={<Link2 size={14} />}>
                  Buscar no Catálogo
                </Button>
                <Button size="sm" onClick={handleOpenCreateProductModal} icon={<Plus size={14} />}>
                  Cadastrar Produto
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeVitrineProducts.map((product, index) => (
                <Card
                  key={product.id}
                  padding="none"
                  className="overflow-hidden bg-[#111116] border border-white/10 hover:border-[#d4af37]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#181820]">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent opacity-80" />

                      {/* Display Order inside Vitrine */}
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 text-[#d4af37] border border-[#d4af37]/30">
                        Posição #{index + 1}
                      </div>

                      {/* Reorder Buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 p-1 rounded-lg backdrop-blur-md border border-white/10">
                        <button
                          onClick={() => handleMoveProductOrder(product.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-neutral-300 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-300 cursor-pointer"
                          title="Mover para Cima"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => handleMoveProductOrder(product.id, 'down')}
                          disabled={index === activeVitrineProducts.length - 1}
                          className="p-1 text-neutral-300 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-300 cursor-pointer"
                          title="Mover para Baixo"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="text-[10px] text-[#d4af37] uppercase tracking-wider font-semibold">
                        {product.category} • {product.brand}
                      </div>
                      <h4 className="text-sm font-serif font-semibold text-white leading-snug">{product.name}</h4>
                      <div className="flex items-center gap-2 font-mono pt-1">
                        {product.promotionalPriceBRL ? (
                          <>
                            <span className="text-xs text-red-400 line-through">R$ {product.salePriceBRL.toFixed(2)}</span>
                            <span className="text-sm font-semibold text-[#f3e5ab]">R$ {product.promotionalPriceBRL.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-[#f3e5ab]">R$ {product.salePriceBRL.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 bg-[#0a0a0e] border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenEditProductModal(product)}
                      icon={<Edit3 size={12} />}
                    >
                      Editar
                    </Button>

                    <button
                      onClick={() => setRemoveProductTargetId(product.id)}
                      className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Remover desta vitrine"
                    >
                      <Unlink size={13} />
                      <span>Desvincular</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: LISTAGEM GERAL DE VITRINES DO ADM */
        <div>
          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-400">Carregando vitrines...</div>
          ) : vitrines.length === 0 ? (
            <div className="py-16 text-center bg-[#111116] border border-white/10 rounded-2xl p-8 space-y-3">
              <Store size={40} className="mx-auto text-neutral-600" />
              <h3 className="text-base font-serif text-white font-medium">Nenhuma vitrine cadastrada</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Clique no botão acima para cadastrar a primeira vitrine personalizada do seu atelier.
              </p>
              <Button onClick={handleOpenNewVitrineModal} variant="outline" size="sm" icon={<Plus size={14} />}>
                Cadastrar Vitrine
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vitrines.map(vitrine => {
                const count = (vitrine.productIds || []).length;
                return (
                  <Card
                    key={vitrine.id}
                    padding="none"
                    className="overflow-hidden bg-[#111116] border border-white/10 hover:border-[#d4af37]/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover Image Header */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#181820]">
                        <img
                          src={
                            vitrine.coverImageUrl ||
                            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={vitrine.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-black/30" />

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-black/70 text-[#d4af37] border border-[#d4af37]/30 backdrop-blur-md">
                            Ordem: #{vitrine.displayOrder}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => handleToggleVitrineStatus(vitrine)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md border transition-colors cursor-pointer ${
                              vitrine.ativo
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-neutral-800/80 text-neutral-400 border-white/10 hover:bg-neutral-700'
                            }`}
                          >
                            {vitrine.ativo ? (
                              <>
                                <Eye size={11} /> Publicada
                              </>
                            ) : (
                              <>
                                <EyeOff size={11} /> Oculta
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <h3 className="text-base font-serif font-semibold text-white leading-snug">{vitrine.name}</h3>
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {vitrine.description || 'Sem descrição cadastrada.'}
                        </p>

                        <div className="pt-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-[#f3e5ab] font-mono">
                            {count} {count === 1 ? 'produto associado' : 'produtos associados'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-[#0a0a0e] border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        onClick={() => setActiveVitrine(vitrine)}
                        icon={<Package size={13} />}
                      >
                        Gerenciar Produtos ({count})
                      </Button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditVitrineModal(vitrine)}
                          className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                          title="Editar Vitrine"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteVitrineTargetId(vitrine.id)}
                          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Vitrine"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CADASTRAR / EDITAR VITRINE */}
      {isVitrineModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsVitrineModalOpen(false)}
          title={editingVitrine ? 'Editar Vitrine' : 'Cadastrar Nova Vitrine'}
          subtitle="Preencha as informações para organizar a vitrine no carrossel"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsVitrineModalOpen(false)}>
                CANCELAR
              </Button>
              <Button onClick={handleSaveVitrine}>
                SALVAR VITRINE
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveVitrine} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Nome da Vitrine *</label>
              <input
                type="text"
                value={vitrineName}
                onChange={e => setVitrineName(e.target.value)}
                placeholder="Ex: Coleção Noivas Imperiais 2026"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Descrição Resumida</label>
              <textarea
                value={vitrineDescription}
                onChange={e => setVitrineDescription(e.target.value)}
                placeholder="Apresentação curta exibida no card do carrossel..."
                rows={3}
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Imagem de Capa *</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vitrineCoverUrl}
                    onChange={e => setVitrineCoverUrl(e.target.value)}
                    placeholder="URL da imagem (https://...)"
                    className="flex-1 bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    onChange={handleCoverFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => coverFileInputRef.current?.click()}
                    icon={<Upload size={14} />}
                  >
                    Upload
                  </Button>
                </div>

                {vitrineCoverUrl && (
                  <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-white/10 bg-[#08080a]">
                    <img src={vitrineCoverUrl} alt="Pré-visualização" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-[#d4af37] font-semibold border border-[#d4af37]/30">
                      Pré-visualização
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Ordem de Exibição</label>
                <input
                  type="number"
                  min={1}
                  value={vitrineDisplayOrder}
                  onChange={e => setVitrineDisplayOrder(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Status de Publicação</label>
                <select
                  value={vitrineAtivo ? 'true' : 'false'}
                  onChange={e => setVitrineAtivo(e.target.value === 'true')}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="true">Publicada (Visível)</option>
                  <option value="false">Oculta / Rascunho</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: ADICIONAR PRODUTOS EXISTENTES À VITRINE (SELEÇÃO MÚLTIPLA / ACÚMULO) */}
      {isAddExistingModalOpen && activeVitrine && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddExistingModalOpen(false)}
          title={`Associar Produtos: ${activeVitrine.name}`}
          subtitle="Clique em 'Associar' nos produtos desejados. Todas as seleções são acumuladas nesta vitrine."
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-neutral-400 font-mono">
                {(activeVitrine.productIds || []).length} produtos associados
              </span>
              <Button onClick={() => setIsAddExistingModalOpen(false)}>
                CONCLUIR E FECHAR
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Search filter & Batch action */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={e => setProductSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, categoria ou marca..."
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAssociateAllFilteredProducts}
                icon={<CheckSquare size={14} />}
                className="w-full sm:w-auto whitespace-nowrap"
              >
                Associar Todos Listados
              </Button>
            </div>

            {/* Catalog List */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 border border-white/10 rounded-xl p-2 bg-[#0c0c10]">
              {catalogProducts
                .filter(p =>
                  productSearchQuery
                    ? p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      p.category.toLowerCase().includes(productSearchQuery.toLowerCase())
                    : true
                )
                .map(prod => {
                  const isAssociated = (activeVitrine.productIds || []).includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                        isAssociated
                          ? 'bg-[#d4af37]/10 border-[#d4af37]/40'
                          : 'bg-[#14141c] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover bg-neutral-800" />
                        <div>
                          <h5 className="font-semibold text-white text-xs">{prod.name}</h5>
                          <span className="text-[10px] text-neutral-400">
                            {prod.category} • R$ {prod.salePriceBRL.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleAssociateProduct(prod.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isAssociated
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30'
                            : 'bg-[#d4af37] text-black hover:bg-[#f3e5ab]'
                        }`}
                        title={isAssociated ? 'Clique para desassociar' : 'Clique para associar'}
                      >
                        {isAssociated ? (
                          <>
                            <CheckCircle2 size={12} /> Associado
                          </>
                        ) : (
                          <>
                            <PlusCircle size={12} /> Associar
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: CADASTRAR NOVO PRODUTO COM SUPORTE A ADIÇÃO CONTÍNUA */}
      {isCreateProductModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateProductModalOpen(false)}
          title={editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto na Vitrine'}
          subtitle={
            editingProduct
              ? 'Altere as informações do produto no catálogo geral'
              : 'Cadastre quantos produtos desejar. Cada produto salvo é associado a esta vitrine automaticamente.'
          }
          footer={
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
              <Button variant="outline" onClick={() => setIsCreateProductModalOpen(false)}>
                FECHAR
              </Button>
              <div className="flex items-center gap-2">
                {!editingProduct && (
                  <Button variant="secondary" onClick={e => handleSaveProduct(e, true)}>
                    SALVAR E CADASTRAR OUTRO
                  </Button>
                )}
                <Button onClick={e => handleSaveProduct(e, false)}>
                  SALVAR PRODUTO
                </Button>
              </div>
            </div>
          }
        >
          <form onSubmit={e => handleSaveProduct(e, false)} className="space-y-4 text-xs">
            {modalSuccessNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{modalSuccessNotice}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Nome do Produto *</label>
              <input
                type="text"
                value={prodName}
                onChange={e => setProdName(e.target.value)}
                placeholder="Ex: Óleo Iluminador Capilar 24k"
                className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Categoria *</label>
                <select
                  value={prodCategory}
                  onChange={e => setProdCategory(e.target.value as any)}
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
                <label className="text-xs font-medium text-neutral-300 block mb-1">Marca / Linha</label>
                <input
                  type="text"
                  value={prodBrand}
                  onChange={e => setProdBrand(e.target.value)}
                  placeholder="Sra. Bela Mulher Atelier"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Preço Normal (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={prodSalePrice}
                  onChange={e => setProdSalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Preço Promocional (Opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={prodPromoPrice}
                  onChange={e => setProdPromoPrice(e.target.value)}
                  placeholder="Ex: 149.90"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Foto do Produto *</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prodImage}
                    onChange={e => setProdImage(e.target.value)}
                    placeholder="URL da imagem (https://...)"
                    className="flex-1 bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                  <input
                    type="file"
                    ref={prodFileInputRef}
                    onChange={handleProductFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => prodFileInputRef.current?.click()}
                    icon={<Upload size={14} />}
                  >
                    Upload
                  </Button>
                </div>

                {prodImage && (
                  <div className="relative aspect-[4/3] w-32 rounded-lg overflow-hidden border border-white/10 bg-[#08080a]">
                    <img src={prodImage} alt="Pré-visualização" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Estoque Inicial</label>
                <input
                  type="number"
                  min="0"
                  value={prodStock}
                  onChange={e => setProdStock(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">SKU / Código</label>
                <input
                  type="text"
                  value={prodSku}
                  onChange={e => setProdSku(e.target.value)}
                  placeholder="SBM-PROD-01"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: CONFIRMAÇÃO DE REMOÇÃO DE PRODUTO DA VITRINE */}
      {removeProductTargetId && (
        <Modal
          isOpen={true}
          onClose={() => setRemoveProductTargetId(null)}
          title="Desvincular Produto"
          subtitle="Remover exibição deste produto na vitrine atual"
          footer={
            <>
              <Button variant="outline" onClick={() => setRemoveProductTargetId(null)}>
                CANCELAR
              </Button>
              <button
                onClick={handleRemoveProductFromVitrineConfirm}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
              >
                DESVINCULAR DA VITRINE
              </button>
            </>
          }
        >
          <div className="py-2 text-xs text-neutral-300 space-y-2">
            <p>
              Tem certeza de que deseja remover este produto da vitrine <strong>"{activeVitrine?.name}"</strong>?
            </p>
            <p className="text-[#d4af37] text-[11px]">
              ✓ O produto continuará cadastrado no catálogo geral e poderá ser associado novamente a qualquer momento.
            </p>
          </div>
        </Modal>
      )}

      {/* MODAL 5: CONFIRMAÇÃO DE EXCLUSÃO DE VITRINE */}
      {deleteVitrineTargetId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteVitrineTargetId(null)}
          title="Confirmar Exclusão de Vitrine"
          subtitle="Esta ação removerá a coleção de exibição selecionada."
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteVitrineTargetId(null)}>
                CANCELAR
              </Button>
              <button
                onClick={handleDeleteVitrineConfirm}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
              >
                EXCLUIR VITRINE DEFINITIVAMENTE
              </button>
            </>
          }
        >
          <div className="py-2 text-xs text-neutral-300 space-y-2">
            <p>Tem certeza de que deseja excluir esta vitrine?</p>
            <p className="text-neutral-400 text-[11px]">
              Todos os produtos associados permanecerão gravados no catálogo geral e nenhuma informação original de produto será perdida.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
