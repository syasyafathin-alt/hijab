import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2, Upload, X } from 'lucide-react';
import { PRESET_HIJAB_PHOTOS } from '../../data/seedData';
import { Category, Product, ProductStatus } from '../../types/store';
import { compressImageFile } from '../../utils/format';
import { SafeImage } from '../common/SafeImage';

interface ProductFormModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Omit<Product, 'id' | 'createdAt'>) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  editingProduct,
  categories,
  onClose,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('129000');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('Modal Silk Premium');
  const [size, setSize] = useState('180 × 75 cm');
  const [colorsInput, setColorsInput] = useState('Dusty Pink, Ivory');
  const [stock, setStock] = useState('15');
  const [status, setStatus] = useState<ProductStatus>('active');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setPrice(String(editingProduct.price));
      setDescription(editingProduct.description);
      setMaterial(editingProduct.material || '');
      setSize(editingProduct.size || '');
      setColorsInput(editingProduct.colors.join(', '));
      setStock(String(editingProduct.stock));
      setStatus(editingProduct.status);
      setIsBestSeller(editingProduct.isBestSeller);
      setIsNewArrival(editingProduct.isNewArrival);
      setImage(editingProduct.image);
    } else {
      setName('');
      setCategory(categories[0]?.name || 'Pashmina');
      setPrice('125000');
      setDescription('');
      setMaterial('Ultrafine Voal');
      setSize('115 × 115 cm');
      setColorsInput('Dusty Pink, Warm Taupe, Ivory');
      setStock('12');
      setStatus('active');
      setIsBestSeller(false);
      setIsNewArrival(true);
      setImage(PRESET_HIJAB_PHOTOS[0].url);
    }
    setError('');
  }, [editingProduct, isOpen, categories]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Mohon unggah file gambar (JPG, PNG, atau WebP).');
      return;
    }
    try {
      setUploading(true);
      setError('');
      const compressed = await compressImageFile(file);
      setImage(compressed);
    } catch {
      setError('Gagal memproses foto. Silakan coba gambar lain.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!name.trim()) {
      setError('Nama produk wajib diisi.');
      return;
    }
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError('Harga produk harus lebih dari 0.');
      return;
    }
    if (Number.isNaN(numericStock) || numericStock < 0) {
      setError('Stok produk tidak boleh negatif.');
      return;
    }

    const parsedColors = colorsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    onSave({
      name: name.trim(),
      category: category || categories[0]?.name || 'Pashmina',
      price: numericPrice,
      description:
        description.trim() ||
        'Hijab butik dengan serat lembut yang nyaman digunakan sepanjang hari.',
      material: material.trim() || 'Premium Hijab Fabric',
      size: size.trim() || '180 × 75 cm',
      colors: parsedColors.length > 0 ? parsedColors : ['Warm Taupe'],
      stock: Math.floor(numericStock),
      status,
      isBestSeller,
      isNewArrival,
      image,
      gallery: image ? [image] : [],
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E1F1B]/45 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#FAF7F2] border border-[#EAE0D5] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EAE0D5] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#2E1F1B]">
              {editingProduct ? 'Edit Produk Hijab' : 'Tambah Produk Hijab Baru'}
            </h2>
            <p className="text-xs text-[#8C7A6B]">
              Perubahan akan langsung tampil pada katalog pengunjung.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 rounded-lg text-[#5C4740] hover:bg-[#F3ECE3] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="admin-product-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* Photo Management Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start bg-white p-4 rounded-xl border border-[#EAE0D5]">
            <div className="md:col-span-4">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-[#F3ECE3] border border-[#EAE0D5]">
                <SafeImage
                  src={image}
                  alt={name || 'Preview foto produk'}
                  fallbackTitle={name || 'Belum ada foto'}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-3">
              <div>
                <p className="text-xs font-semibold text-[#2E1F1B]">
                  Foto Produk Hijab
                </p>
                <p className="text-xs text-[#8C7A6B] mt-0.5">
                  Unggah foto hijab baru (rasio 3:4 disarankan), ganti dengan galeri preset, atau hapus foto.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-xs font-medium hover:bg-[#46302A] transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {uploading
                      ? 'Memproses...'
                      : image
                        ? 'Ganti Foto (Upload)'
                        : 'Unggah Foto'}
                  </span>
                </button>

                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>

              {/* Preset Boutique Photo Strip */}
              <div className="pt-2">
                <p className="text-[11px] text-[#8C7A6B] mb-2 flex items-center gap-1">
                  <ImagePlus className="w-3.5 h-3.5" />
                  Atau pilih foto katalog studio:
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_HIJAB_PHOTOS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      title={preset.label}
                      className={`w-12 h-16 rounded-md overflow-hidden border shrink-0 transition-all cursor-pointer ${
                        image === preset.url
                          ? 'border-[#A66A6F] ring-2 ring-[#A66A6F]/30'
                          : 'border-[#EAE0D5] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <SafeImage
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                Nama Produk *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ayla Silk Pashmina"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                Kategori *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                Harga (Rp) *
              </label>
              <input
                type="number"
                min={1000}
                step={500}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] tabular-nums focus:outline-none focus:border-[#A66A6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                Warna (pisahkan dengan koma) *
              </label>
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                placeholder="Dusty Pink, Ivory, Mocca"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                Stok (pcs) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] tabular-nums focus:outline-none focus:border-[#A66A6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                Bahan
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Modal Silk Premium"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                Ukuran
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="180 × 75 cm"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                Deskripsi Produk
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan kenyamanan bahan, finishing jahit tepi, dan keunggulan hijab..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                Status Produk
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
              >
                <option value="active">Active (Tampil di Katalog)</option>
                <option value="draft">Draft (Disembunyikan)</option>
              </select>
            </div>

            <div className="flex items-end gap-5 pb-2">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#2E1F1B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="w-4 h-4 accent-[#A66A6F] rounded"
                />
                <span>New Arrival</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#2E1F1B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="w-4 h-4 accent-[#A66A6F] rounded"
                />
                <span>Best Seller</span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#EAE0D5] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#EAE0D5] text-xs font-medium text-[#5C4740] hover:bg-[#F3ECE3] cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="admin-product-form"
            className="px-5 py-2 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-xs font-medium hover:bg-[#46302A] cursor-pointer"
          >
            {editingProduct ? 'Simpan Perubahan' : 'Tambahkan Produk'}
          </button>
        </div>
      </div>
    </div>
  );
};
