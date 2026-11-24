import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Download,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Minus,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { PRESET_HIJAB_PHOTOS } from '../../data/seedData';
import { useStore } from '../../context/StoreContext';
import { Category, Order, OrderStatus, Product } from '../../types/store';
import {
  compressImageFile,
  formatDateID,
  formatIDR,
  getStockStatus,
} from '../../utils/format';
import { SafeImage } from '../common/SafeImage';
import { ProductFormModal } from './ProductFormModal';

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'inventory'
  | 'settings';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewStorefront: () => void;
}

const SIDEBAR_ITEMS: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onViewStorefront,
}) => {
  const {
    products,
    categories,
    orders,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    addCategory,
    updateCategory,
    deleteCategory,
    updateOrderStatus,
    updateSettings,
    logoutAdmin,
    resetDemoData,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Product CRUD states
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('All');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<Product | null>(null);

  // Category CRUD states
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState(PRESET_HIJAB_PHOTOS[0].url);
  const catFileRef = useRef<HTMLInputElement>(null);

  // Inventory states
  const [inventoryFilter, setInventoryFilter] = useState<
    'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'
  >('All');

  // Orders states
  const [orderFilter, setOrderFilter] = useState<'All' | OrderStatus>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  React.useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Overview KPIs
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;
  const outOfStockProducts = products.filter((p) => p.stock <= 0).length;
  const totalCategories = categories.length;

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (productCatFilter !== 'All' && p.category !== productCatFilter) {
        return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.colors.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [products, productSearch, productCatFilter]);

  const filteredInventory = useMemo(() => {
    return products.filter((p) => {
      const st = getStockStatus(p.stock, settings.lowStockThreshold);
      if (inventoryFilter === 'All') return true;
      return st === inventoryFilter;
    });
  }, [products, inventoryFilter, settings.lowStockThreshold]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) =>
      orderFilter === 'All' ? true : o.status === orderFilter
    );
  }, [orders, orderFilter]);

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleSaveProduct = (data: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
  };

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatImage(PRESET_HIJAB_PHOTOS[0].url);
    setCatModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatImage(cat.image);
    setCatModalOpen(true);
  };

  const handleCategoryPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 700, 0.8);
      setCatImage(compressed);
    } catch {
      // Ignore invalid image
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: catName.trim(),
        description: catDesc.trim(),
        image: catImage,
      });
    } else {
      addCategory({
        name: catName.trim(),
        description:
          catDesc.trim() || 'Koleksi hijab pilihan dengan bahan lembut dan elegan.',
        image: catImage,
      });
    }
    setCatModalOpen(false);
  };

  const handleLogoutClick = () => {
    logoutAdmin();
    onLogout();
  };

  const activeTabTitle =
    SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#2E1F1B]/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#2E1F1B] text-[#F3ECE3] flex flex-col justify-between transition-transform duration-200 shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#5C4740]/40">
            <span className="font-serif text-xl font-semibold text-[#FAF7F2] whitespace-nowrap">
              {settings.brandName}
            </span>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-[#D5C3AD] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#A66A6F] text-white'
                      : 'text-[#D5C3AD] hover:bg-[#46302A] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#5C4740]/40 space-y-1.5">
          <button
            type="button"
            onClick={onViewStorefront}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#D5C3AD] hover:bg-[#46302A] hover:text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>Lihat Katalog</span>
          </button>
          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-200 hover:bg-rose-950/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-[#EAE0D5] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Buka menu sidebar"
              className="lg:hidden p-2 rounded-lg text-[#2E1F1B] hover:bg-[#F3ECE3] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-[#8C7A6B]">Admin</span>
              <span className="text-[#B9A99A]">/</span>
              <span className="font-semibold text-[#2E1F1B]">{activeTabTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenNewProduct}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-xs font-medium hover:bg-[#46302A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#EAE0D5] rounded-xl p-5">
                  <p className="text-xs font-medium text-[#8C7A6B]">
                    Total Products
                  </p>
                  <p className="font-serif text-3xl font-semibold text-[#2E1F1B] tabular-nums mt-2">
                    {totalProducts}
                  </p>
                </div>

                <div className="bg-white border border-[#EAE0D5] rounded-xl p-5">
                  <p className="text-xs font-medium text-[#8C7A6B]">
                    Active Products
                  </p>
                  <p className="font-serif text-3xl font-semibold text-emerald-800 tabular-nums mt-2">
                    {activeProducts}
                  </p>
                </div>

                <div className="bg-white border border-[#EAE0D5] rounded-xl p-5">
                  <p className="text-xs font-medium text-[#8C7A6B]">
                    Out of Stock
                  </p>
                  <p className="font-serif text-3xl font-semibold text-rose-700 tabular-nums mt-2">
                    {outOfStockProducts}
                  </p>
                </div>

                <div className="bg-white border border-[#EAE0D5] rounded-xl p-5">
                  <p className="text-xs font-medium text-[#8C7A6B]">
                    Total Categories
                  </p>
                  <p className="font-serif text-3xl font-semibold text-[#A66A6F] tabular-nums mt-2">
                    {totalCategories}
                  </p>
                </div>
              </div>

              {/* Recent Products & Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white border border-[#EAE0D5] rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#EAE0D5] flex items-center justify-between">
                    <h2 className="font-serif text-xl font-semibold text-[#2E1F1B]">
                      Produk Terbaru
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-medium text-[#A66A6F] hover:text-[#2E1F1B] cursor-pointer"
                    >
                      Kelola Semua
                    </button>
                  </div>
                  <div className="divide-y divide-[#EAE0D5]">
                    {products.slice(0, 5).map((prod) => {
                      const st = getStockStatus(
                        prod.stock,
                        settings.lowStockThreshold
                      );
                      return (
                        <div
                          key={prod.id}
                          className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-[#FAF7F2]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-12 rounded overflow-hidden bg-[#F3ECE3] shrink-0">
                              <SafeImage
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#2E1F1B] truncate">
                                {prod.name}
                              </p>
                              <p className="text-xs text-[#8C7A6B]">
                                {prod.category} · {formatIDR(prod.price)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={`text-xs font-medium ${
                                st === 'Out of Stock'
                                  ? 'text-rose-700'
                                  : st === 'Low Stock'
                                    ? 'text-amber-700'
                                    : 'text-emerald-800'
                              }`}
                            >
                              {st}
                            </span>
                            <p className="text-[11px] text-[#8C7A6B] tabular-nums">
                              {prod.stock} pcs
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white border border-[#EAE0D5] rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#EAE0D5] flex items-center justify-between">
                    <h2 className="font-serif text-xl font-semibold text-[#2E1F1B]">
                      Pesanan Masuk
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-medium text-[#A66A6F] hover:text-[#2E1F1B] cursor-pointer"
                    >
                      Lihat Pesanan
                    </button>
                  </div>
                  <div className="divide-y divide-[#EAE0D5]">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF7F2]"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#2E1F1B] tabular-nums">
                            {ord.id}
                          </p>
                          <p className="text-xs text-[#5C4740] truncate">
                            {ord.customerName}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-[#2E1F1B] tabular-nums">
                            {formatIDR(ord.totalAmount)}
                          </p>
                          <p className="text-[11px] text-[#8C7A6B]">{ord.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 2. PRODUCTS MANAGEMENT (CRUD) */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-medium text-[#2E1F1B]">
                    Manajemen Produk
                  </h1>
                  <p className="text-xs text-[#8C7A6B]">
                    Kelola produk hijab, foto, harga, varian warna, dan label.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenNewProduct}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-xs font-medium hover:bg-[#46302A] cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Produk Baru
                </button>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari nama produk, kategori, atau warna..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
                  />
                </div>
                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
                >
                  <option value="All">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-[#EAE0D5] rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[780px]">
                  <thead>
                    <tr className="border-b border-[#EAE0D5] bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-[#8C7A6B]">
                      <th className="py-3 px-4 font-semibold">Produk</th>
                      <th className="py-3 px-4 font-semibold">Kategori</th>
                      <th className="py-3 px-4 font-semibold">Harga</th>
                      <th className="py-3 px-4 font-semibold">Stok</th>
                      <th className="py-3 px-4 font-semibold">Status & Label</th>
                      <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D5] text-sm">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-sm text-[#8C7A6B]"
                        >
                          Tidak ada produk yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const stockSt = getStockStatus(
                          product.stock,
                          settings.lowStockThreshold
                        );
                        return (
                          <tr
                            key={product.id}
                            className="hover:bg-[#FAF7F2]/80 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-14 rounded overflow-hidden bg-[#F3ECE3] border border-[#EAE0D5] shrink-0">
                                  <SafeImage
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover object-top"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-[#2E1F1B]">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-[#8C7A6B] truncate max-w-[220px]">
                                    {product.colors.join(', ')}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[#5C4740]">
                              {product.category}
                            </td>
                            <td className="py-3 px-4 font-medium text-[#2E1F1B] tabular-nums">
                              {formatIDR(product.price)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-xs font-medium tabular-nums ${
                                  stockSt === 'Out of Stock'
                                    ? 'text-rose-700'
                                    : stockSt === 'Low Stock'
                                      ? 'text-amber-700'
                                      : 'text-emerald-800'
                                }`}
                              >
                                {product.stock} pcs · {stockSt}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-xs space-y-0.5">
                                <p
                                  className={
                                    product.status === 'active'
                                      ? 'text-emerald-800 font-medium'
                                      : 'text-[#8C7A6B]'
                                  }
                                >
                                  {product.status === 'active' ? 'Active' : 'Draft'}
                                </p>
                                <p className="text-[11px] text-[#8C7A6B]">
                                  {[
                                    product.isNewArrival && 'New Arrival',
                                    product.isBestSeller && 'Best Seller',
                                  ]
                                    .filter(Boolean)
                                    .join(' · ') || 'Reguler'}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditProduct(product)}
                                  aria-label={`Edit ${product.name}`}
                                  className="p-2 rounded-lg border border-[#EAE0D5] text-[#5C4740] hover:bg-[#F3ECE3] hover:text-[#2E1F1B] cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteProduct(product)}
                                  aria-label={`Hapus ${product.name}`}
                                  className="p-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-medium text-[#2E1F1B]">
                    Manajemen Kategori
                  </h1>
                  <p className="text-xs text-[#8C7A6B]">
                    Atur kategori hijab yang muncul pada filter katalog pengunjung.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewCategoryModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-xs font-medium hover:bg-[#46302A] cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Kategori
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((cat) => {
                  const count = products.filter(
                    (p) => p.category.toLowerCase() === cat.name.toLowerCase()
                  ).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-white border border-[#EAE0D5] rounded-xl overflow-hidden flex flex-col"
                    >
                      <div className="aspect-[16/9] bg-[#F3ECE3] border-b border-[#EAE0D5] overflow-hidden">
                        <SafeImage
                          src={cat.image}
                          alt={cat.name}
                          fallbackTitle={cat.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif text-2xl font-medium text-[#2E1F1B]">
                              {cat.name}
                            </h3>
                            <span className="text-xs text-[#8C7A6B] tabular-nums">
                              {count} produk
                            </span>
                          </div>
                          <p className="text-xs text-[#5C4740] mt-1.5 leading-relaxed">
                            {cat.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#EAE0D5]">
                          <button
                            type="button"
                            onClick={() => openEditCategoryModal(cat)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#EAE0D5] text-xs font-medium text-[#2E1F1B] hover:bg-[#F3ECE3] cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCategory(cat.id)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 text-xs font-medium text-rose-700 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-medium text-[#2E1F1B]">
                    Manajemen Pesanan
                  </h1>
                  <p className="text-xs text-[#8C7A6B]">
                    Pantau pesanan yang masuk dari keranjang pelanggan dan perbarui statusnya.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['All', 'Pending', 'Processing', 'Completed', 'Cancelled'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setOrderFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          orderFilter === st
                            ? 'bg-[#2E1F1B] text-[#FAF7F2]'
                            : 'bg-white border border-[#EAE0D5] text-[#5C4740] hover:text-[#2E1F1B]'
                        }`}
                      >
                        {st === 'All' ? 'Semua' : st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#EAE0D5] rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[860px]">
                  <thead>
                    <tr className="border-b border-[#EAE0D5] bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-[#8C7A6B]">
                      <th className="py-3 px-4 font-semibold">Order ID</th>
                      <th className="py-3 px-4 font-semibold">Pelanggan</th>
                      <th className="py-3 px-4 font-semibold">Produk</th>
                      <th className="py-3 px-4 font-semibold">Jumlah</th>
                      <th className="py-3 px-4 font-semibold">Total Harga</th>
                      <th className="py-3 px-4 font-semibold">Tanggal</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D5] text-sm">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-12 text-center text-sm text-[#8C7A6B]"
                        >
                          Belum ada pesanan untuk status ini.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const totalQty = order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        );
                        return (
                          <tr
                            key={order.id}
                            className="hover:bg-[#FAF7F2]/80 transition-colors"
                          >
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="font-mono text-xs font-semibold text-[#A66A6F] hover:underline cursor-pointer"
                              >
                                {order.id}
                              </button>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-medium text-[#2E1F1B]">
                                {order.customerName}
                              </p>
                              <p className="text-xs text-[#8C7A6B] tabular-nums">
                                {order.customerPhone}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 max-w-[240px]">
                              <p className="text-xs text-[#2E1F1B] truncate">
                                {order.items
                                  .map((i) => `${i.name} (${i.color})`)
                                  .join(', ')}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 tabular-nums text-[#5C4740]">
                              {totalQty} pcs
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-[#2E1F1B] tabular-nums">
                              {formatIDR(order.totalAmount)}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-[#8C7A6B] tabular-nums">
                              {formatDateID(order.createdAt)}
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  updateOrderStatus(
                                    order.id,
                                    e.target.value as OrderStatus
                                  )
                                }
                                aria-label={`Status pesanan ${order.id}`}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:outline-none cursor-pointer ${
                                  order.status === 'Completed'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : order.status === 'Processing'
                                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                                      : order.status === 'Cancelled'
                                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                                        : 'bg-[#F3ECE3] border-[#D8C7B4] text-[#2E1F1B]'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-medium text-[#2E1F1B]">
                    Manajemen Stok & Inventori
                  </h1>
                  <p className="text-xs text-[#8C7A6B]">
                    Produk dengan stok 0 otomatis berlabel Sold Out pada katalog pengunjung.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setInventoryFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          inventoryFilter === st
                            ? 'bg-[#2E1F1B] text-[#FAF7F2]'
                            : 'bg-white border border-[#EAE0D5] text-[#5C4740] hover:text-[#2E1F1B]'
                        }`}
                      >
                        {st === 'All' ? 'Semua' : st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#EAE0D5] rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#EAE0D5] bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-[#8C7A6B]">
                      <th className="py-3 px-4 font-semibold">Produk</th>
                      <th className="py-3 px-4 font-semibold">Kategori</th>
                      <th className="py-3 px-4 font-semibold">Status Stok</th>
                      <th className="py-3 px-4 font-semibold">Jumlah Stok</th>
                      <th className="py-3 px-4 font-semibold text-right">
                        Atur Cepat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D5] text-sm">
                    {filteredInventory.map((prod) => {
                      const st = getStockStatus(
                        prod.stock,
                        settings.lowStockThreshold
                      );
                      return (
                        <tr key={prod.id} className="hover:bg-[#FAF7F2]/80">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 rounded overflow-hidden bg-[#F3ECE3] shrink-0">
                                <SafeImage
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover object-top"
                                />
                              </div>
                              <span className="font-medium text-[#2E1F1B]">
                                {prod.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#5C4740]">
                            {prod.category}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                st === 'Out of Stock'
                                  ? 'text-rose-700'
                                  : st === 'Low Stock'
                                    ? 'text-amber-700'
                                    : 'text-emerald-800'
                              }`}
                            >
                              {st === 'Out of Stock' ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              ) : st === 'Low Stock' ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              {st}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold tabular-nums text-[#2E1F1B]">
                            {prod.stock} pcs
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateStock(prod.id, prod.stock - 1)}
                                aria-label={`Kurangi stok ${prod.name}`}
                                className="w-8 h-8 rounded-lg border border-[#EAE0D5] flex items-center justify-center text-[#5C4740] hover:bg-[#F3ECE3] cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min={0}
                                value={prod.stock}
                                onChange={(e) =>
                                  updateStock(prod.id, Number(e.target.value) || 0)
                                }
                                aria-label={`Stok ${prod.name}`}
                                className="w-16 h-8 text-center rounded-lg border border-[#EAE0D5] text-xs font-semibold tabular-nums text-[#2E1F1B]"
                              />
                              <button
                                type="button"
                                onClick={() => updateStock(prod.id, prod.stock + 1)}
                                aria-label={`Tambah stok ${prod.name}`}
                                className="w-8 h-8 rounded-lg border border-[#EAE0D5] flex items-center justify-center text-[#5C4740] hover:bg-[#F3ECE3] cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h1 className="font-serif text-3xl font-medium text-[#2E1F1B]">
                  Pengaturan Butik
                </h1>
                <p className="text-xs text-[#8C7A6B]">
                  Atur identitas brand, nomor WhatsApp checkout, dan ambang batas stok menipis.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateSettings(settingsForm);
                }}
                className="bg-white border border-[#EAE0D5] rounded-xl p-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                      Nama Brand
                    </label>
                    <input
                      type="text"
                      value={settingsForm.brandName}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          brandName: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                      Nomor WhatsApp Checkout
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          whatsappNumber: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D5] text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instagramHandle}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          instagramHandle: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                      Batas Low Stock (pcs)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={settingsForm.lowStockThreshold}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          lowStockThreshold: Number(e.target.value) || 5,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D5] text-sm tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                    Judul Promo Banner
                  </label>
                  <input
                    type="text"
                    value={settingsForm.promoTitle}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        promoTitle: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D5] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                    Deskripsi Promo Banner
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.promoDescription}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        promoDescription: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D5] text-sm"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmResetModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-rose-200 text-xs font-medium text-rose-700 hover:bg-rose-50 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Data ke Default
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-xs font-medium hover:bg-[#46302A] cursor-pointer"
                  >
                    Simpan Pengaturan
                  </button>
                </div>
              </form>

              <div className="bg-white border border-[#EAE0D5] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-serif text-xl font-medium text-[#2E1F1B]">
                    Ekspor Seluruh Kode &amp; HTML (.zip)
                  </h2>
                  <p className="text-xs text-[#5C4740]">
                    Unduh arsip ZIP berisi seluruh source code (React + Vite + Tailwind + aset foto hijab) dan hasil build HTML/CSS/JS siap deploy.
                  </p>
                </div>
                <a
                  href="/noura-atelier-hijab.zip"
                  download="noura-atelier-hijab.zip"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#A66A6F] text-white text-xs font-medium hover:bg-[#93585D] transition-colors shrink-0 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Unduh File ZIP
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Add/Edit Modal */}
      <ProductFormModal
        isOpen={productModalOpen}
        editingProduct={editingProduct}
        categories={categories}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Delete Product Confirmation Modal */}
      {confirmDeleteProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E1F1B]/45 p-4"
          onClick={() => setConfirmDeleteProduct(null)}
        >
          <div
            className="bg-white border border-[#EAE0D5] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-2xl font-semibold text-[#2E1F1B]">
              Hapus Produk?
            </h3>
            <p className="text-sm text-[#5C4740]">
              Produk <strong>{confirmDeleteProduct.name}</strong> akan dihapus permanen dari katalog dan keranjang.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteProduct(null)}
                className="px-4 py-2 rounded-lg border border-[#EAE0D5] text-xs font-medium text-[#5C4740] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(confirmDeleteProduct.id);
                  setConfirmDeleteProduct(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-700 text-white text-xs font-medium hover:bg-rose-800 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {catModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E1F1B]/45 p-4"
          onClick={() => setCatModalOpen(false)}
        >
          <div
            className="bg-[#FAF7F2] border border-[#EAE0D5] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-semibold text-[#2E1F1B]">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="p-1.5 rounded-lg text-[#5C4740] hover:bg-[#F3ECE3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F3ECE3] border border-[#EAE0D5] shrink-0">
                  <SafeImage
                    src={catImage}
                    alt={catName || 'Kategori'}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    ref={catFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCategoryPhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => catFileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#EAE0D5] text-xs font-medium text-[#2E1F1B] hover:bg-[#F3ECE3] cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Unggah Foto Kategori
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Bergo"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Deskripsi bahan dan karakter siluet..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#EAE0D5] text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAE0D5] text-xs font-medium text-[#5C4740] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-xs font-medium cursor-pointer"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E1F1B]/45 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white border border-[#EAE0D5] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <div>
                <p className="font-mono text-xs text-[#A66A6F] font-semibold">
                  {selectedOrder.id}
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#2E1F1B]">
                  Detail Pesanan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-[#5C4740] hover:bg-[#F3ECE3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-[#2E1F1B]">
                {selectedOrder.customerName}
              </p>
              <p className="text-xs text-[#5C4740] tabular-nums">
                WhatsApp: {selectedOrder.customerPhone}
              </p>
              <p className="text-xs text-[#5C4740]">
                Alamat: {selectedOrder.customerAddress}
              </p>
              {selectedOrder.notes && (
                <p className="text-xs text-[#8C7A6B]">
                  Catatan: {selectedOrder.notes}
                </p>
              )}
            </div>

            <div className="border-t border-b border-[#EAE0D5] py-3 space-y-2">
              {selectedOrder.items.map((item, i) => (
                <div
                  key={`${item.productId}-${i}`}
                  className="flex justify-between text-xs"
                >
                  <span className="text-[#2E1F1B]">
                    {item.name} ({item.color}) × {item.quantity}
                  </span>
                  <span className="font-semibold tabular-nums text-[#2E1F1B]">
                    {formatIDR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm font-semibold text-[#2E1F1B]">
              <span>Total Pesanan</span>
              <span className="tabular-nums">
                {formatIDR(selectedOrder.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Demo Data Modal */}
      {confirmResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E1F1B]/45 p-4"
          onClick={() => setConfirmResetModal(false)}
        >
          <div
            className="bg-white border border-[#EAE0D5] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-2xl font-semibold text-[#2E1F1B]">
              Reset Data Demo?
            </h3>
            <p className="text-sm text-[#5C4740]">
              Semua produk, kategori, dan pesanan akan dikembalikan ke data awal bawaan.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmResetModal(false)}
                className="px-4 py-2 rounded-lg border border-[#EAE0D5] text-xs font-medium text-[#5C4740] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setConfirmResetModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-700 text-white text-xs font-medium cursor-pointer"
              >
                Ya, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
