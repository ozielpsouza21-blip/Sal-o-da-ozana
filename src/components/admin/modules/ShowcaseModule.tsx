import React, { useState } from 'react';
import { Eye, Plus, Trash2, Edit2, X, Save, Upload } from 'lucide-react';
import { Product, Service } from '../../../types';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { SupabaseDataService } from '../../../services/supabaseDataService';

interface ShowcaseModuleProps {
  services: Service[];
  products: Product[];
  onRefreshData: () => void;
  onPreviewPublic: () => void;
}

export const ShowcaseModule: React.FC<ShowcaseModuleProps> = ({
  services,
  products,
  onRefreshData,
  onPreviewPublic,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [editingItem, setEditingItem] = useState<Partial<Service> | Partial<Product> | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleOpenEdit = (item: Service | Product) => setEditingItem({ ...item });
  const handleOpenNew = () => {
    setIsAdding(true);
    setEditingItem(activeTab === 'services' 
      ? { name: '', category: 'Cabelos', description: '', priceBRL: 0, image: '', durationMinutes: 60, featuredInVitrine: true, active: true }
      : { name: '', category: 'Tratamento Capilar', brand: '', salePriceBRL: 0, image: '', stockQuantity: 0, sku: '', featuredInVitrine: true }
    );
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAdding(false);
  };

  const handleDelete = async (item: Service | Product) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        if ('durationMinutes' in item) await SupabaseDataService.deleteService(item.id);
        else await SupabaseDataService.deleteProduct(item.id);
        onRefreshData();
      } catch (e: any) {
        alert(`Erro ao excluir: ${e.message}`);
      }
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;
    try {
      if (isAdding) {
        if (activeTab === 'services') await SupabaseDataService.createService(editingItem as Omit<Service, 'id'>);
        else await SupabaseDataService.createProduct(editingItem as Omit<Product, 'id'>);
      } else {
        if ('durationMinutes' in editingItem) await SupabaseDataService.updateService(editingItem.id!, editingItem as Partial<Service>);
        else await SupabaseDataService.updateProduct(editingItem.id!, editingItem as Partial<Product>);
      }
      handleCancel();
      onRefreshData();
    } catch (e: any) {
      alert(`Erro ao salvar: ${e.message}`);
    }
  };

  const renderItem = (item: Service | Product) => (
    <Card key={item.id} padding="sm" className="flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
        <div>
          <h4 className="font-semibold text-white">{item.name}</h4>
          <div className="text-neutral-400">R$ {('priceBRL' in item ? item.priceBRL : item.salePriceBRL).toFixed(2)}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item)} icon={<Edit2 size={14}/>}>Editar</Button>
        <Button variant="danger" size="sm" onClick={() => handleDelete(item)} icon={<Trash2 size={14}/>}>Excluir</Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-xl font-serif font-semibold text-white">Gerenciar Vitrine</h2>
        <div className="flex gap-2">
          <Button onClick={handleOpenNew} icon={<Plus size={15} />}>Novo</Button>
          <Button onClick={onPreviewPublic} variant="secondary" icon={<Eye size={15} />}>Visualizar</Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button onClick={() => setActiveTab('services')} className={`px-4 py-2 text-xs font-semibold uppercase rounded-lg ${activeTab === 'services' ? 'bg-[#d4af37] text-black' : 'text-neutral-400'}`}>Procedimentos</button>
        <button onClick={() => setActiveTab('products')} className={`px-4 py-2 text-xs font-semibold uppercase rounded-lg ${activeTab === 'products' ? 'bg-[#d4af37] text-black' : 'text-neutral-400'}`}>Boutique</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(activeTab === 'services' ? services : products).map(renderItem)}
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg space-y-4">
            <h3 className="text-lg font-semibold text-white">{isAdding ? 'Novo Item' : 'Editar Item'}</h3>
            <input type="text" placeholder="Nome" value={editingItem.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full bg-[#181822] p-2 rounded text-white" />
            <textarea placeholder="Descrição" value={(editingItem as Service).description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="w-full bg-[#181822] p-2 rounded text-white" />
            <div className="flex gap-2">
              <input type="number" placeholder="Preço" value={(('priceBRL' in editingItem! ? (editingItem as Service).priceBRL : (editingItem as Product).salePriceBRL) || 0)} onChange={e => setEditingItem({...editingItem, [activeTab === 'services' ? 'priceBRL' : 'salePriceBRL']: parseFloat(e.target.value)})} className="w-full bg-[#181822] p-2 rounded text-white" />
              <input type="number" placeholder="Preço Promo" value={editingItem.promotionalPriceBRL || ''} onChange={e => setEditingItem({...editingItem, promotionalPriceBRL: parseFloat(e.target.value)})} className="w-full bg-[#181822] p-2 rounded text-white" />
            </div>
            <input type="number" placeholder="Ordem" value={editingItem.displayOrder || 0} onChange={e => setEditingItem({...editingItem, displayOrder: parseInt(e.target.value)})} className="w-full bg-[#181822] p-2 rounded text-white" />
            <label className="flex items-center gap-2 text-white">
              <input type="checkbox" checked={editingItem.active} onChange={e => setEditingItem({...editingItem, active: e.target.checked})} />
              Ativo
            </label>
            <div className="flex items-center gap-4">
              <img src={editingItem.image} alt="Preview" className="w-16 h-16 rounded bg-[#181822]" />
              <label className="cursor-pointer bg-[#181822] p-2 rounded flex items-center gap-2 text-white">
                <Upload size={15}/> Upload Imagem
                <input type="file" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setEditingItem({...editingItem, image: reader.result as string});
                    reader.readAsDataURL(file);
                  }
                }} className="hidden" />
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={handleCancel}>Cancelar</Button>
              <Button onClick={handleSave} icon={<Save size={15} />}>Salvar</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
