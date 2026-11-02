import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  Truck,
  Store,
  Copy,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';
import { CartItem, Product } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface ShoppingCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const ShoppingCartDrawer: React.FC<ShoppingCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmation'>('cart');

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'retirada' | 'entrega'>('retirada');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  if (!isOpen) return null;

  // Calculate Subtotals & Totals
  const calculateItemUnitPrice = (product: Product) => {
    return product.promotionalPriceBRL ?? product.salePriceBRL;
  };

  const subtotalProducts = cartItems.reduce((acc, item) => {
    return acc + calculateItemUnitPrice(item.product) * item.quantity;
  }, 0);

  const deliveryFee = deliveryOption === 'entrega' ? 25.0 : 0.0;
  const grandTotal = subtotalProducts + deliveryFee;

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText('contato@srabelamulher.com.br');
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleFinalizeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Por favor, informe seu nome e telefone para contato.');
      return;
    }

    const generatedNum = `PED-${Date.now().toString().slice(-6)}`;
    setOrderNumber(generatedNum);

    // Format WhatsApp order message
    let itemsText = cartItems
      .map(
        item =>
          `• ${item.quantity}x ${item.product.name} (R$ ${(
            calculateItemUnitPrice(item.product) * item.quantity
          ).toFixed(2)})`
      )
      .join('\n');

    const message = `*NOVO PEDIDO DE COMPRA - SRA. BELA MULHER ATELIER*\n` +
      `*Número:* ${generatedNum}\n\n` +
      `*Cliente:* ${customerName}\n` +
      `*Telefone:* ${customerPhone}\n` +
      `*E-mail:* ${customerEmail || 'Não informado'}\n\n` +
      `*ITENS DO PEDIDO:*\n${itemsText}\n\n` +
      `*Subtotal Produtos:* R$ ${subtotalProducts.toFixed(2)}\n` +
      `*Entrega/Retirada:* ${deliveryOption === 'entrega' ? 'Entrega em Domicílio (R$ 25,00)' : 'Retirada no Atelier (Grátis)'}\n` +
      `*TOTAL FINAL:* R$ ${grandTotal.toFixed(2)}\n\n` +
      `*Forma de Pagamento:* ${
        paymentMethod === 'pix'
          ? 'PIX Instantâneo'
          : paymentMethod === 'cartao'
          ? 'Cartão na Entrega/Retirada'
          : 'Dinheiro'
      }`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5511987654321?text=${encodedMessage}`;

    // Open WhatsApp link in new tab or record
    window.open(whatsappUrl, '_blank');

    setStep('confirmation');
  };

  const handleFinishAndClear = () => {
    onClearCart();
    setStep('cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end transition-opacity animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#0c0c10] border-l border-white/10 h-full flex flex-col justify-between shadow-2xl text-neutral-100">
        
        {/* HEADER */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#121218]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37]">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-white">Carrinho de Compras</h2>
              <span className="text-[11px] text-neutral-400">
                {totalItemsCount} {totalItemsCount === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY BY STEP */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {step === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="text-base font-serif text-white font-medium">Seu carrinho está vazio</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto font-light leading-relaxed">
                    Explore os produtos exclusivos das nossas vitrines e clique em "COMPRAR" para adicionar os itens desejados.
                  </p>
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Explorar Vitrines
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => {
                    const unitPrice = calculateItemUnitPrice(item.product);
                    const itemSubtotal = unitPrice * item.quantity;

                    return (
                      <div
                        key={item.product.id}
                        className="p-3.5 bg-[#14141c] border border-white/10 rounded-xl flex items-center justify-between gap-3 hover:border-[#d4af37]/30 transition-colors"
                      >
                        {/* Thumbnail */}
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover bg-neutral-800 shrink-0 border border-white/10"
                        />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-[#d4af37] font-medium uppercase tracking-wider truncate">
                            {item.product.brand}
                          </div>
                          <h4 className="text-xs font-semibold text-white truncate leading-snug">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                            {item.product.promotionalPriceBRL ? (
                              <>
                                <span className="text-red-400 line-through text-[10px]">
                                  R$ {item.product.salePriceBRL.toFixed(2)}
                                </span>
                                <span className="text-[#f3e5ab] font-bold">
                                  R$ {item.product.promotionalPriceBRL.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-[#f3e5ab] font-bold">
                                R$ {item.product.salePriceBRL.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls & Subtotal */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-neutral-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                            title="Remover produto"
                          >
                            <Trash2 size={14} />
                          </button>

                          <div className="flex items-center gap-1.5 bg-[#08080a] border border-white/10 rounded-lg p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="p-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="p-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleFinalizeOrder} className="space-y-5 text-xs">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-serif font-semibold text-white">1. Identificação da Cliente</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Informe seus dados para contato e confirmação do pedido
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Ex: Helena Montenegro"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-b border-white/10 py-4 space-y-3">
                <h3 className="text-sm font-serif font-semibold text-white">2. Modalidade de Entrega</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('retirada')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryOption === 'retirada'
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                        : 'bg-[#14141c] border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Store size={16} className="text-[#d4af37]" />
                      <span className="font-semibold text-xs text-white">Retirada no Atelier</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 block font-semibold">Grátis (Jardins, SP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryOption('entrega')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryOption === 'entrega'
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                        : 'bg-[#14141c] border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Truck size={16} className="text-[#d4af37]" />
                      <span className="font-semibold text-xs text-white">Entrega Expressa</span>
                    </div>
                    <span className="text-[10px] text-neutral-300 block">R$ 25,00 (Capital SP)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-serif font-semibold text-white">3. Forma de Pagamento</h3>
                <div className="space-y-2">
                  <label
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'pix' ? 'bg-[#d4af37]/15 border-[#d4af37]' : 'bg-[#14141c] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode size={18} className="text-[#d4af37]" />
                      <div>
                        <span className="font-semibold text-white block">PIX Instantâneo</span>
                        <span className="text-[10px] text-neutral-400">Desconto e liberação imediata</span>
                      </div>
                    </div>
                    <input type="radio" name="payment" checked={paymentMethod === 'pix'} readOnly />
                  </label>

                  {paymentMethod === 'pix' && (
                    <div className="p-3.5 bg-[#08080a] border border-[#d4af37]/30 rounded-xl space-y-2 text-[11px] text-neutral-300">
                      <p className="font-semibold text-[#f3e5ab]">Chave PIX e Instruções:</p>
                      <div className="flex items-center justify-between bg-[#14141c] p-2 rounded border border-white/10 font-mono">
                        <span>contato@srabelamulher.com.br</span>
                        <button
                          type="button"
                          onClick={handleCopyPixKey}
                          className="text-[#d4af37] hover:text-white text-[10px] flex items-center gap-1 font-sans cursor-pointer"
                        >
                          {copiedPix ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <label
                    onClick={() => setPaymentMethod('cartao')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'cartao' ? 'bg-[#d4af37]/15 border-[#d4af37]' : 'bg-[#14141c] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={18} className="text-[#d4af37]" />
                      <div>
                        <span className="font-semibold text-white block">Cartão de Crédito / Débito</span>
                        <span className="text-[10px] text-neutral-400">Na entrega ou retirada no atelier</span>
                      </div>
                    </div>
                    <input type="radio" name="payment" checked={paymentMethod === 'cartao'} readOnly />
                  </label>

                  <label
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'dinheiro' ? 'bg-[#d4af37]/15 border-[#d4af37]' : 'bg-[#14141c] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote size={18} className="text-[#d4af37]" />
                      <div>
                        <span className="font-semibold text-white block">Dinheiro em Espécie</span>
                        <span className="text-[10px] text-neutral-400">Na entrega ou retirada</span>
                      </div>
                    </div>
                    <input type="radio" name="payment" checked={paymentMethod === 'dinheiro'} readOnly />
                  </label>
                </div>
              </div>
            </form>
          )}

          {step === 'confirmation' && (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-[#d4af37] font-semibold">{orderNumber}</span>
                <h3 className="text-xl font-serif font-bold text-white">Pedido de Compra Registrado!</h3>
                <p className="text-xs text-neutral-300 max-w-xs mx-auto font-light leading-relaxed">
                  Obrigado, <strong className="text-white">{customerName}</strong>! Seu pedido foi formatado e enviado ao nosso concierge via WhatsApp.
                </p>
              </div>

              <div className="p-4 bg-[#14141c] border border-white/10 rounded-xl text-left space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal Produtos:</span>
                  <span className="text-white font-mono">R$ {subtotalProducts.toFixed(2)}</span>
                </div>
                {deliveryOption === 'entrega' && (
                  <div className="flex justify-between text-neutral-400">
                    <span>Taxa de Entrega Expressa:</span>
                    <span className="text-white font-mono">R$ 25,00</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-white/10 text-[#f3e5ab]">
                  <span>Total Final:</span>
                  <span className="font-mono">R$ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleFinishAndClear} className="w-full">
                CONCLUIR E VOLTAR À VITRINE
              </Button>
            </div>
          )}
        </div>

        {/* FOOTER SUMMARY & NAVIGATION BUTTONS */}
        {cartItems.length > 0 && step !== 'confirmation' && (
          <div className="p-5 border-t border-white/10 bg-[#121218] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal dos Produtos:</span>
                <span className="font-mono text-white">R$ {subtotalProducts.toFixed(2)}</span>
              </div>
              {step === 'checkout' && deliveryOption === 'entrega' && (
                <div className="flex justify-between text-neutral-400">
                  <span>Entrega Expressa:</span>
                  <span className="font-mono text-white">R$ 25,00</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#f3e5ab] pt-2 border-t border-white/10">
                <span>Total Final:</span>
                <span className="font-mono text-base">R$ {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <Button onClick={() => setStep('checkout')} className="w-full" icon={<ArrowRight size={16} />}>
                FINALIZAR COMPRA
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep('cart')} className="w-1/3">
                  Voltar
                </Button>
                <Button type="submit" form="checkout-form" className="w-2/3" icon={<Send size={15} />}>
                  ENVIAR PEDIDO
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
