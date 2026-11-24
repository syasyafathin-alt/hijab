import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BOUTIQUE_IMAGES } from '../../data/seedData';
import { useStore } from '../../context/StoreContext';
import { SafeImage } from '../common/SafeImage';
import { ProductCard } from './ProductCard';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectCategory: (categoryName: string) => void;
  onSelectProduct: (productId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectCategory,
  onSelectProduct,
}) => {
  const { products, categories, settings } = useStore();
  const [showcaseTab, setShowcaseTab] = useState<'new' | 'best'>('new');

  const activeProducts = products.filter((p) => p.status === 'active');
  const newArrivals = activeProducts.filter((p) => p.isNewArrival).slice(0, 6);
  const bestSellers = activeProducts.filter((p) => p.isBestSeller).slice(0, 6);

  const displayedShowcase = showcaseTab === 'new' ? newArrivals : bestSellers;

  return (
    <div>
      {/* 1. Split Editorial Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 lg:pt-10 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center py-4 lg:py-10 space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A66A6F]">
              Modest Boutique Collection
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-[#2E1F1B] leading-[1.08] tracking-tight">
              Keanggunan Tenang dalam Setiap Lipatan Hijab
            </h1>
            <p className="text-base text-[#5C4740] leading-relaxed max-w-xl">
              Dikurasi dari serat modal silk, ultrafine voal, dan ceruty yang sejuk di kulit. Hadir dalam palet warna bumi yang lembut untuk menemani langkah penuh percaya diri.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/shop')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-sm font-medium hover:bg-[#46302A] transition-colors cursor-pointer"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4 text-[#DFB9BA]" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/new-collection')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg border border-[#D8C7B4] text-sm font-medium text-[#2E1F1B] hover:bg-[#F3ECE3] transition-colors cursor-pointer"
              >
                Lihat New Arrival
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#EAE0D5] max-w-lg">
              <div>
                <p className="font-serif text-2xl font-semibold text-[#2E1F1B] tabular-nums">
                  {categories.length}
                </p>
                <p className="text-xs text-[#8C7A6B] mt-0.5">Siluet Pilihan</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-semibold text-[#2E1F1B]">
                  Breathable
                </p>
                <p className="text-xs text-[#8C7A6B] mt-0.5">Serat Sejuk Alami</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-semibold text-[#2E1F1B]">
                  Baby-Seam
                </p>
                <p className="text-xs text-[#8C7A6B] mt-0.5">Jahit Tepi Presisi</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[420px] lg:min-h-[580px] rounded-2xl overflow-hidden bg-[#F3ECE3] border border-[#EAE0D5]">
              <SafeImage
                src={BOUTIQUE_IMAGES.heroEditorial}
                alt="Model mengenakan Ayla Silk Pashmina Dusty Pink"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#2E1F1B]/75 via-[#2E1F1B]/25 to-transparent text-[#FAF7F2]">
                <p className="text-xs uppercase tracking-widest text-[#DFB9BA]">
                  Signature Piece
                </p>
                <p className="font-serif text-2xl font-medium mt-0.5">
                  Ayla Silk Pashmina — Dusty Pink
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Collection (5 Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#EAE0D5]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A66A6F]">
              Featured Collection
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2E1F1B] mt-1">
              Eksplorasi Berdasarkan Bahan
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2E1F1B] hover:text-[#A66A6F] transition-colors cursor-pointer self-start sm:self-auto"
          >
            Semua Kategori
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className="group text-left cursor-pointer focus:outline-none"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F3ECE3] border border-[#EAE0D5]">
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  fallbackTitle={cat.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2E1F1B]/75 via-[#2E1F1B]/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-[#FAF7F2]">
                  <h3 className="font-serif text-xl font-medium">{cat.name}</h3>
                  <p className="text-[11px] text-[#E3D9CA] line-clamp-1 mt-0.5">
                    {
                      activeProducts.filter((p) => p.category === cat.name)
                        .length
                    }{' '}
                    Koleksi
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. New Arrival & Best Seller Curated Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#EAE0D5]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A66A6F]">
              Kurasi Pilihan
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2E1F1B] mt-1">
              {showcaseTab === 'new' ? 'New Arrival' : 'Best Seller'}
            </h2>
          </div>

          <div className="inline-flex items-center p-1 rounded-lg bg-[#F3ECE3] border border-[#EAE0D5] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowcaseTab('new')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                showcaseTab === 'new'
                  ? 'bg-[#FAF7F2] text-[#2E1F1B] shadow-xs'
                  : 'text-[#5C4740] hover:text-[#2E1F1B]'
              }`}
            >
              New Arrival ({newArrivals.length})
            </button>
            <button
              type="button"
              onClick={() => setShowcaseTab('best')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                showcaseTab === 'best'
                  ? 'bg-[#FAF7F2] text-[#2E1F1B] shadow-xs'
                  : 'text-[#5C4740] hover:text-[#2E1F1B]'
              }`}
            >
              Best Seller ({bestSellers.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedShowcase.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#2E1F1B] text-sm font-medium text-[#2E1F1B] hover:bg-[#2E1F1B] hover:text-[#FAF7F2] transition-colors cursor-pointer"
          >
            Lihat Seluruh Katalog
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. Aesthetic Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl overflow-hidden bg-[#F3ECE3] border border-[#EAE0D5] grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A66A6F]">
              {settings.promoEyebrow}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2E1F1B] leading-tight">
              {settings.promoTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#5C4740] leading-relaxed">
              {settings.promoDescription}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/shop')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#A66A6F] text-white text-sm font-medium hover:bg-[#93585D] transition-colors cursor-pointer"
              >
                Jelajahi Promo Koleksi
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="lg:col-span-6 min-h-[280px] lg:min-h-[380px]">
            <SafeImage
              src={BOUTIQUE_IMAGES.flatlayCollection}
              alt="Koleksi warna bumi Noura Atelier"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5. About Brand Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A66A6F]">
          Tentang {settings.brandName}
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2E1F1B] leading-snug">
          Dirancang untuk Kenyamanan Sepanjang Hari, Tanpa Mengorbankan Keanggunan
        </h2>
        <p className="text-sm sm:text-base text-[#5C4740] leading-relaxed max-w-2xl mx-auto">
          Setiap helai hijab {settings.brandName} melewati seleksi bahan ketat agar tetap sejuk di iklim tropis, mudah dibentuk, dan tahan lama. Kami percaya busana modest terbaik adalah yang terasa ringan dan tulus menemani aktivitas Anda.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/about')}
            className="text-sm font-medium text-[#2E1F1B] underline underline-offset-4 hover:text-[#A66A6F] transition-colors cursor-pointer"
          >
            Baca Kisah Atelier Kami
          </button>
        </div>
      </section>
    </div>
  );
};
