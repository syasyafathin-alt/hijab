import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types/store';
import { buildWhatsAppUrl, formatIDR } from '../../utils/format';
import { SafeImage } from '../common/SafeImage';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    createOrder,
    settings,
    showToast,
  } = useStore();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const formattedWhatsAppText = useMemo(() => {
    if (!confirmedOrder) return '';
    const itemLines = confirmedOrder.items
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.name} (${item.color}) × ${item.quantity} = ${formatIDR(
            item.price * item.quantity
          )}`
      )
      .join('\n');

    return [
      `Halo *${settings.brandName}*, saya ingin memesan:`,
      '',
      `ID Pesanan: *${confirmedOrder.id}*`,
      `Nama: ${confirmedOrder.customerName}`,
      `No. WhatsApp: ${confirmedOrder.customerPhone}`,
      `Alamat: ${confirmedOrder.customerAddress}`,
      confirmedOrder.notes ? `Catatan: ${confirmedOrder.notes}` : '',
      '',
      '*Detail Produk:*',
      itemLines,
      '',
      `*Total Pembayaran: ${formatIDR(confirmedOrder.totalAmount)}*`,
      '',
      'Mohon informasi ketersediaan dan nomor rekening untuk proses selanjutnya. Terima kasih.',
    ]
      .filter(Boolean)
      .join('\n');
  }, [confirmedOrder, settings.brandName]);

  if (!isCartOpen) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    if (step === 'success') {
      setStep('cart');
      setConfirmedOrder(null);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setFormError('Mohon lengkapi nama, nomor WhatsApp, dan alamat pengiriman.');
      return;
    }
    setFormError('');
    const newOrder = createOrder({
      customerName,
      customerPhone,
      customerAddress,
      notes,
      items: cart,
    });
    setConfirmedOrder(newOrder);
    clearCart();
    setStep('success');
    showToast(`Pesanan ${newOrder.id} tercatat! Lanjutkan konfirmasi ke WhatsApp.`);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(formattedWhatsAppText);
      showToast('Format pesanan berhasil disalin.');
    } catch {
      showToast('Tidak dapat menyalin otomatis, silakan salin manual.', 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#2E1F1B]/45 backdrop-blur-xs"
      onClick={handleClose}
    >
      <aside
        className="w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl border-l border-[#EAE0D5] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        aria-label="Keranjang belanja"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#EAE0D5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#A66A6F]" />
            <h2 className="font-serif text-2xl font-semibold text-[#2E1F1B]">
              {step === 'cart'
                ? 'Keranjang Belanja'
                : step === 'checkout'
                  ? 'Detail Pengiriman'
                  : 'Pesanan Siap Dikirim'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup keranjang"
            className="p-2 rounded-lg text-[#5C4740] hover:bg-[#F3ECE3] hover:text-[#2E1F1B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'success' && confirmedOrder ? (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-[#F3ECE3] border border-[#EAE0D5] text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#A66A6F] mx-auto" />
                <p className="font-serif text-2xl font-semibold text-[#2E1F1B]">
                  Terima Kasih, {confirmedOrder.customerName}
                </p>
                <p className="text-xs text-[#5C4740]">
                  Pesanan Anda telah dicatat dengan ID{' '}
                  <span className="font-semibold text-[#2E1F1B] tabular-nums">
                    {confirmedOrder.id}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8C7A6B]">
                    Ringkasan Pesan WhatsApp
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A66A6F] hover:text-[#2E1F1B] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Salin Pesan
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-[#2E1F1B] bg-white p-4 rounded-xl border border-[#EAE0D5] leading-relaxed">
                  {formattedWhatsAppText}
                </pre>
              </div>

              <div className="space-y-2.5 pt-2">
                <a
                  href={buildWhatsAppUrl(
                    settings.whatsappNumber,
                    formattedWhatsAppText
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-sm font-medium hover:bg-[#46302A] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#DFB9BA]" />
                  Kirim Pesanan via WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full px-5 py-2.5 rounded-lg border border-[#EAE0D5] text-sm font-medium text-[#5C4740] hover:bg-[#F3ECE3] transition-colors cursor-pointer"
                >
                  Kembali Berbelanja
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F3ECE3] flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-[#8C7A6B]" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="font-serif text-2xl font-medium text-[#2E1F1B]">
                  Keranjang Masih Kosong
                </p>
                <p className="text-sm text-[#5C4740]">
                  Jelajahi koleksi pashmina, voal, dan satin pilihan kami untuk melengkapi gaya modest Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-sm font-medium hover:bg-[#46302A] transition-colors cursor-pointer"
              >
                Mulai Belanja
              </button>
            </div>
          ) : step === 'cart' ? (
            <ul className="divide-y divide-[#EAE0D5]">
              {cart.map((item) => (
                <li
                  key={`${item.productId}-${item.color}`}
                  className="py-4 flex gap-4"
                >
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-[#F3ECE3] border border-[#EAE0D5] shrink-0">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#2E1F1B] truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-[#8C7A6B] mt-0.5">
                          Warna: {item.color}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.color)}
                        aria-label={`Hapus ${item.name}`}
                        className="p-1 text-[#8C7A6B] hover:text-rose-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="inline-flex items-center border border-[#EAE0D5] rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              item.productId,
                              item.color,
                              item.quantity - 1
                            )
                          }
                          aria-label="Kurangi jumlah"
                          className="w-8 h-8 flex items-center justify-center text-[#5C4740] hover:bg-[#F3ECE3] rounded-l-lg cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold tabular-nums text-[#2E1F1B]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              item.productId,
                              item.color,
                              item.quantity + 1
                            )
                          }
                          aria-label="Tambah jumlah"
                          className="w-8 h-8 flex items-center justify-center text-[#5C4740] hover:bg-[#F3ECE3] rounded-r-lg cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-[#2E1F1B] tabular-nums">
                        {formatIDR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Aisyah Putri"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                  Nomor WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  required
                  rows={3}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, kecamatan, kota..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                  Catatan Pesanan (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Bungkus kado / kirim sore"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#F3ECE3] border border-[#EAE0D5] space-y-2 text-xs">
                <p className="font-semibold text-[#2E1F1B]">Ringkasan Produk</p>
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.color}`}
                    className="flex justify-between text-[#5C4740]"
                  >
                    <span className="truncate pr-2">
                      {item.name} ({item.color}) × {item.quantity}
                    </span>
                    <span className="tabular-nums font-medium text-[#2E1F1B] shrink-0">
                      {formatIDR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && step !== 'success' && (
          <div className="px-6 py-5 border-t border-[#EAE0D5] bg-[#F3ECE3]/60 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#5C4740]">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-[#2E1F1B]">
                  {formatIDR(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#2E1F1B] pt-1 border-t border-[#EAE0D5]">
                <span>Total</span>
                <span className="tabular-nums">{formatIDR(cartSubtotal)}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-sm font-medium hover:bg-[#46302A] transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#DFB9BA]" />
                Checkout via WhatsApp
              </button>
            ) : (
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 rounded-lg border border-[#EAE0D5] bg-white text-sm font-medium text-[#5C4740] hover:bg-[#F3ECE3] cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-sm font-medium hover:bg-[#46302A] transition-colors cursor-pointer"
                >
                  Buat Pesanan & Format WA
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
