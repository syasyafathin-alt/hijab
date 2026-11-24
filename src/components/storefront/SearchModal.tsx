import React, { useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatIDR } from '../../utils/format';
import { SafeImage } from '../common/SafeImage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
  onViewAllResults: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onViewAllResults,
}) => {
  const { products } = useStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const activeProducts = products.filter((p) => p.status === 'active');
    const q = query.trim().toLowerCase();
    if (!q) return activeProducts.slice(0, 4);
    return activeProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.colors.some((c) => c.toLowerCase().includes(q))
    );
  }, [products, query]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onViewAllResults(query);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#2E1F1B]/45 backdrop-blur-xs pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FAF7F2] border border-[#EAE0D5] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 px-5 py-4 border-b border-[#EAE0D5]"
        >
          <Search className="w-5 h-5 text-[#8C7A6B] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama hijab, kategori (Pashmina, Voal), atau warna (Dusty Pink)..."
            className="w-full bg-transparent text-[#2E1F1B] placeholder:text-[#8C7A6B] text-sm focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-[#8C7A6B] hover:text-[#2E1F1B] px-2 py-1"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pencarian"
            className="p-1.5 text-[#5C4740] hover:text-[#2E1F1B] rounded-lg hover:bg-[#F3ECE3]"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#8C7A6B]">
              {query.trim()
                ? `Hasil pencarian (${results.length})`
                : 'Rekomendasi Populer'}
            </span>
            {results.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onViewAllResults(query);
                  onClose();
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#A66A6F] hover:text-[#2E1F1B] cursor-pointer"
              >
                Lihat semua di katalog
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-[#5C4740]">
                Tidak ditemukan hijab untuk kata kunci "{query}".
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-3 text-xs font-medium text-[#A66A6F] underline cursor-pointer"
              >
                Tampilkan semua koleksi
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.slice(0, 6).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    onSelectProduct(product.id);
                    onClose();
                  }}
                  className="flex items-center gap-3.5 p-2.5 rounded-lg border border-[#EAE0D5] bg-white/70 hover:bg-[#F3ECE3] transition-colors text-left cursor-pointer"
                >
                  <div className="w-14 h-18 rounded-md overflow-hidden shrink-0 bg-[#F3ECE3]">
                    <SafeImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[#8C7A6B] truncate">
                      {product.category} · {product.colors.slice(0, 2).join(', ')}
                    </p>
                    <p className="text-sm font-medium text-[#2E1F1B] truncate mt-0.5">
                      {product.name}
                    </p>
                    <p className="text-xs font-semibold text-[#A66A6F] tabular-nums mt-1">
                      {formatIDR(product.price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
