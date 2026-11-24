import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/store';
import { formatIDR, getColorHex } from '../../utils/format';
import { SafeImage } from '../common/SafeImage';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
}) => {
  const { addToCart } = useStore();
  const isSoldOut = product.stock <= 0;

  const badgeLabel = isSoldOut
    ? 'Sold Out'
    : product.isNewArrival
      ? 'New Arrival'
      : product.isBestSeller
        ? 'Best Seller'
        : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    addToCart(product, product.colors[0] || 'Default', 1);
  };

  return (
    <article
      onClick={() => onSelectProduct(product.id)}
      className="group cursor-pointer flex flex-col bg-[#FAF7F2] transition-transform duration-200 hover:-translate-y-0.5"
    >
      {/* Portrait Media Container (3:4 consistent aspect ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F3ECE3] border border-[#EAE0D5]">
        <SafeImage
          src={product.image}
          alt={product.name}
          fallbackTitle={product.name}
          className={`w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
            isSoldOut ? 'opacity-65 grayscale-[25%]' : ''
          }`}
        />

        {/* Single subtle editorial corner label (max 1 per card) */}
        {badgeLabel && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded text-[11px] font-medium tracking-wide ${
              isSoldOut
                ? 'bg-[#2E1F1B] text-[#FAF7F2]'
                : product.isNewArrival
                  ? 'bg-[#FAF7F2]/92 text-[#2E1F1B] border border-[#EAE0D5]'
                  : 'bg-[#A66A6F] text-white'
            }`}
          >
            {badgeLabel}
          </span>
        )}

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isSoldOut}
          aria-label={
            isSoldOut
              ? `${product.name} stok habis`
              : `Tambah ${product.name} ke keranjang`
          }
          className={`absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition-all duration-200 ${
            isSoldOut
              ? 'bg-[#EAE0D5] text-[#8C7A6B] cursor-not-allowed'
              : 'bg-[#FAF7F2]/95 text-[#2E1F1B] hover:bg-[#2E1F1B] hover:text-[#FAF7F2] cursor-pointer md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isSoldOut ? 'Sold Out' : 'Add'}</span>
        </button>
      </div>

      {/* Product Metadata (unboxed typography, consistent baseline) */}
      <div className="pt-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#8C7A6B]">
            {product.category}
          </p>
          <h3 className="font-sans text-[15px] font-semibold text-[#2E1F1B] leading-snug mt-0.5 group-hover:text-[#A66A6F] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex items-center -space-x-0.5 shrink-0">
              {product.colors.slice(0, 3).map((color) => (
                <span
                  key={color}
                  title={color}
                  style={{ backgroundColor: getColorHex(color) }}
                  className="w-3.5 h-3.5 rounded-full border border-[#2E1F1B]/20 inline-block"
                />
              ))}
            </div>
            <span className="text-xs text-[#5C4740] truncate">
              {product.colors[0]}
              {product.colors.length > 1 ? ` +${product.colors.length - 1}` : ''}
            </span>
          </div>

          <span className="text-sm font-semibold text-[#2E1F1B] tabular-nums shrink-0">
            {formatIDR(product.price)}
          </span>
        </div>
      </div>
    </article>
  );
};
