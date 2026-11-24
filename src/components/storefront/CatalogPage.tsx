import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';

interface CatalogPageProps {
  mode: 'shop' | 'new-collection';
  initialCategory?: string;
  initialSearch?: string;
  onSelectProduct: (productId: string) => void;
}

type PriceFilter = 'all' | 'under-100' | '100-150' | 'above-150';
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'bestseller';

export const CatalogPage: React.FC<CatalogPageProps> = ({
  mode,
  initialCategory = 'All',
  initialSearch = '',
  onSelectProduct,
}) => {
  const { products, categories } = useStore();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [onlyNewArrival, setOnlyNewArrival] = useState(mode === 'new-collection');
  const [onlyBestSeller, setOnlyBestSeller] = useState(false);

  // Sync if navigation passes new initial category or mode
  React.useEffect(() => {
    setSelectedCategory(initialCategory || 'All');
  }, [initialCategory]);

  React.useEffect(() => {
    setSearchQuery(initialSearch || '');
  }, [initialSearch]);

  React.useEffect(() => {
    setOnlyNewArrival(mode === 'new-collection');
  }, [mode]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = products.filter((product) => {
      if (product.status !== 'active') return false;

      if (onlyNewArrival && !product.isNewArrival) return false;
      if (onlyBestSeller && !product.isBestSeller) return false;

      if (
        selectedCategory !== 'All' &&
        product.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      if (priceFilter === 'under-100' && product.price >= 100000) return false;
      if (
        priceFilter === '100-150' &&
        (product.price < 100000 || product.price > 150000)
      ) {
        return false;
      }
      if (priceFilter === 'above-150' && product.price <= 150000) return false;

      if (q) {
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCat = product.category.toLowerCase().includes(q);
        const matchesColor = product.colors.some((c) =>
          c.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesCat && !matchesColor) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'bestseller') {
        if (a.isBestSeller === b.isBestSeller) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.isBestSeller ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    priceFilter,
    sortBy,
    onlyNewArrival,
    onlyBestSeller,
  ]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceFilter('all');
    setSortBy('newest');
    setOnlyNewArrival(mode === 'new-collection');
    setOnlyBestSeller(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Page Header */}
      <div className="max-w-2xl space-y-2 mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A66A6F]">
          {mode === 'new-collection' ? 'Edisi Terbaru' : 'Katalog Butik'}
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#2E1F1B]">
          {mode === 'new-collection' ? 'New Collection' : 'Semua Koleksi Hijab'}
        </h1>
        <p className="text-sm sm:text-base text-[#5C4740]">
          Temukan hijab favorit berdasarkan siluet, warna bumi, dan bahan pilihan yang lembut di kulit.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-4 pb-8 border-b border-[#EAE0D5]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk, kategori, atau warna..."
              className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] placeholder:text-[#8C7A6B] focus:outline-none focus:border-[#A66A6F]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus kata kunci"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8C7A6B] hover:text-[#2E1F1B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Price Filter */}
          <div className="md:col-span-4">
            <div className="relative flex items-center">
              <SlidersHorizontal className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 pointer-events-none" />
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
                aria-label="Filter harga"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F] cursor-pointer"
              >
                <option value="all">Semua Rentang Harga</option>
                <option value="under-100">Di bawah Rp 100.000</option>
                <option value="100-150">Rp 100.000 – Rp 150.000</option>
                <option value="above-150">Di atas Rp 150.000</option>
              </select>
            </div>
          </div>

          {/* Sort Select */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Urutkan produk"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F] cursor-pointer"
            >
              <option value="newest">Urutkan: Terbaru</option>
              <option value="bestseller">Urutkan: Best Seller</option>
              <option value="price-asc">Harga: Rendah ke Tinggi</option>
              <option value="price-desc">Harga: Tinggi ke Rendah</option>
            </select>
          </div>
        </div>

        {/* Interactive Category Filter Buttons + Quick Flags */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === 'All'
                  ? 'bg-[#2E1F1B] text-[#FAF7F2]'
                  : 'bg-[#F3ECE3] text-[#5C4740] hover:text-[#2E1F1B]'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-[#2E1F1B] text-[#FAF7F2]'
                    : 'bg-[#F3ECE3] text-[#5C4740] hover:text-[#2E1F1B]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyNewArrival((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                onlyNewArrival
                  ? 'border-[#A66A6F] bg-[#A66A6F]/10 text-[#2E1F1B]'
                  : 'border-[#EAE0D5] bg-white text-[#5C4740] hover:text-[#2E1F1B]'
              }`}
            >
              New Arrival
            </button>
            <button
              type="button"
              onClick={() => setOnlyBestSeller((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                onlyBestSeller
                  ? 'border-[#A66A6F] bg-[#A66A6F]/10 text-[#2E1F1B]'
                  : 'border-[#EAE0D5] bg-white text-[#5C4740] hover:text-[#2E1F1B]'
              }`}
            >
              Best Seller
            </button>
            <span className="text-xs text-[#8C7A6B] tabular-nums pl-1">
              {filteredProducts.length} produk
            </span>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <p className="font-serif text-3xl text-[#2E1F1B]">
            Tidak Ada Produk yang Sesuai
          </p>
          <p className="text-sm text-[#5C4740] max-w-md mx-auto">
            Coba ubah kata kunci pencarian, kategori, atau rentang harga untuk menemukan koleksi hijab lainnya.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-sm font-medium hover:bg-[#46302A] transition-colors cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}
    </section>
  );
};
