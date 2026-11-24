import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  buildWhatsAppUrl,
  formatIDR,
  getColorHex,
  getStockStatus,
} from '../../utils/format';
import { SafeImage } from '../common/SafeImage';
import { ProductCard } from './ProductCard';

interface ProductDetailPageProps {
  productId: string;
  onBackToCatalog: () => void;
  onSelectProduct: (productId: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBackToCatalog,
  onSelectProduct,
}) => {
  const { products, settings, addToCart, setIsCartOpen } = useStore();
  const product = products.find((p) => p.id === productId);

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || 'Default');
      setQuantity(1);
      setActiveImage(product.image);
    }
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = products.filter(
      (p) =>
        p.id !== product.id &&
        p.status === 'active' &&
        p.category === product.category
    );
    if (sameCategory.length >= 3) return sameCategory.slice(0, 3);
    const others = products.filter(
      (p) =>
        p.id !== product.id &&
        p.status === 'active' &&
        p.category !== product.category
    );
    return [...sameCategory, ...others].slice(0, 3);
  }, [product, products]);

  if (!product) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-4xl text-[#2E1F1B]">
          Produk Tidak Ditemukan
        </h1>
        <p className="text-sm text-[#5C4740]">
          Produk yang Anda cari mungkin telah diperbarui atau dihapus dari katalog.
        </p>
        <button
          type="button"
          onClick={onBackToCatalog}
          className="px-5 py-2.5 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-sm font-medium cursor-pointer"
        >
          Kembali ke Katalog
        </button>
      </section>
    );
  }

  const stockStatus = getStockStatus(product.stock, settings.lowStockThreshold);
  const isSoldOut = product.stock <= 0;
  const galleryImages = Array.from(
    new Set([product.image, ...(product.gallery || [])].filter(Boolean))
  );

  const directWaMessage = [
    `Halo *${settings.brandName}*, saya tertarik memesan:`,
    '',
    `Produk: *${product.name}*`,
    `Kategori: ${product.category}`,
    `Warna: ${selectedColor}`,
    `Jumlah: ${quantity}`,
    `Total: *${formatIDR(product.price * quantity)}*`,
    '',
    'Apakah stok warna ini masih tersedia?',
  ].join('\n');

  const directWaUrl = buildWhatsAppUrl(settings.whatsappNumber, directWaMessage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={onBackToCatalog}
        className="inline-flex items-center gap-2 text-xs font-medium text-[#5C4740] hover:text-[#2E1F1B] mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Katalog
      </button>

      {/* Main Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#F3ECE3] border border-[#EAE0D5]">
            <SafeImage
              src={activeImage || product.image}
              alt={product.name}
              fallbackTitle={product.name}
              className={`w-full h-full object-cover object-top ${
                isSoldOut ? 'opacity-70 grayscale-[20%]' : ''
              }`}
            />
            {isSoldOut && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded bg-[#2E1F1B] text-[#FAF7F2] text-xs font-medium tracking-wide">
                Sold Out
              </span>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                    activeImage === imgUrl
                      ? 'border-[#2E1F1B] ring-1 ring-[#2E1F1B]'
                      : 'border-[#EAE0D5] opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={imgUrl}
                    alt={`${product.name} tampilan ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-6">
          <div className="space-y-2 pb-5 border-b border-[#EAE0D5]">
            <div className="flex items-center gap-2 text-xs text-[#8C7A6B]">
              <span className="uppercase tracking-wider">{product.category}</span>
              {product.isNewArrival && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#A66A6F] font-medium">New Arrival</span>
                </>
              )}
              {product.isBestSeller && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#2E1F1B] font-medium">Best Seller</span>
                </>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#2E1F1B]">
              {product.name}
            </h1>

            <p className="text-2xl font-semibold text-[#2E1F1B] tabular-nums pt-1">
              {formatIDR(product.price)}
            </p>
          </div>

          <p className="text-sm sm:text-base text-[#5C4740] leading-relaxed">
            {product.description}
          </p>

          {/* Specifications Grid */}
          <dl className="grid grid-cols-2 gap-4 py-4 border-y border-[#EAE0D5] text-sm">
            <div>
              <dt className="text-xs text-[#8C7A6B]">Bahan</dt>
              <dd className="font-medium text-[#2E1F1B] mt-0.5">
                {product.material || 'Premium Hijab Fabric'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#8C7A6B]">Ukuran</dt>
              <dd className="font-medium text-[#2E1F1B] mt-0.5 tabular-nums">
                {product.size || '180 × 75 cm'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#8C7A6B]">Kategori</dt>
              <dd className="font-medium text-[#2E1F1B] mt-0.5">
                {product.category}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#8C7A6B]">Ketersediaan Stok</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-medium tabular-nums">
                <span
                  className={
                    stockStatus === 'Out of Stock'
                      ? 'text-rose-700'
                      : stockStatus === 'Low Stock'
                        ? 'text-amber-700'
                        : 'text-emerald-800'
                  }
                >
                  {stockStatus}
                  {!isSoldOut ? ` (${product.stock} pcs)` : ''}
                </span>
              </dd>
            </div>
          </dl>

          {/* Color Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#5C4740]">
                Pilih Warna:{' '}
                <strong className="text-[#2E1F1B]">{selectedColor}</strong>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {product.colors.map((color) => {
                const active = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'border-[#2E1F1B] bg-[#F3ECE3] text-[#2E1F1B]'
                        : 'border-[#EAE0D5] bg-white text-[#5C4740] hover:border-[#B9A99A]'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: getColorHex(color) }}
                      className="w-3.5 h-3.5 rounded-full border border-[#2E1F1B]/20 shrink-0"
                    />
                    <span>{color}</span>
                    {active && <Check className="w-3.5 h-3.5 text-[#A66A6F]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isSoldOut && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-[#5C4740]">Jumlah</span>
                <div className="inline-flex items-center border border-[#EAE0D5] rounded-lg bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Kurangi jumlah"
                    className="w-10 h-10 flex items-center justify-center text-[#5C4740] hover:bg-[#F3ECE3] rounded-l-lg cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold tabular-nums text-[#2E1F1B]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    aria-label="Tambah jumlah"
                    className="w-10 h-10 flex items-center justify-center text-[#5C4740] hover:bg-[#F3ECE3] rounded-r-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={isSoldOut}
                onClick={() => {
                  addToCart(product, selectedColor, quantity);
                  setIsCartOpen(true);
                }}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-medium transition-colors ${
                  isSoldOut
                    ? 'bg-[#EAE0D5] text-[#8C7A6B] cursor-not-allowed'
                    : 'bg-[#2E1F1B] text-[#FAF7F2] hover:bg-[#46302A] cursor-pointer'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isSoldOut ? 'Sold Out' : 'Add to Cart'}</span>
              </button>

              {isSoldOut ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-[#EAE0D5] bg-[#F3ECE3] text-[#8C7A6B] text-sm font-medium cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Stok Habis</span>
                </button>
              ) : (
                <a
                  href={directWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-[#2E1F1B] text-[#2E1F1B] text-sm font-medium hover:bg-[#F3ECE3] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#A66A6F]" />
                  <span>Order via WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-14 border-t border-[#EAE0D5]">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A66A6F]">
              Lengkapi Gaya Anda
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#2E1F1B] mt-1">
              Rekomendasi Produk Serupa
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
