import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
} from '../data/seedData';
import {
  CartItem,
  Category,
  Order,
  OrderStatus,
  Product,
  StoreSettings,
  ToastMessage,
} from '../types/store';

const STORAGE_KEYS = {
  PRODUCTS: 'noura_products_v1',
  CATEGORIES: 'noura_categories_v1',
  CART: 'noura_cart_v1',
  ORDERS: 'noura_orders_v1',
  SETTINGS: 'noura_settings_v1',
  ADMIN_AUTH: 'noura_admin_auth_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Handle storage quota gracefully
  }
}

interface StoreContextValue {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  orders: Order[];
  settings: StoreSettings;
  isAdminAuthenticated: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Cart actions
  addToCart: (product: Product, color: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, color: string, quantity: number) => void;
  removeFromCart: (productId: string, color: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  // Checkout / Order actions
  createOrder: (payload: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    notes?: string;
    items: CartItem[];
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Admin product CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;

  // Admin category CRUD
  addCategory: (category: Omit<Category, 'id' | 'slug'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Admin settings & auth
  updateSettings: (updates: Partial<StoreSettings>) => void;
  loginAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() =>
    readStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    readStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES)
  );
  const [cart, setCart] = useState<CartItem[]>(() => readStorage(STORAGE_KEYS.CART, []));
  const [orders, setOrders] = useState<Order[]>(() =>
    readStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS)
  );
  const [settings, setSettings] = useState<StoreSettings>(() =>
    readStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  );
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() =>
    readStorage(STORAGE_KEYS.ADMIN_AUTH, false)
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.CART, cart);
  }, [cart]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.ADMIN_AUTH, isAdminAuthenticated);
  }, [isAdminAuthenticated]);

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: Product, color: string, quantity = 1) => {
    if (product.stock <= 0) {
      showToast('Produk ini sedang habis (Sold Out).', 'error');
      return;
    }
    const chosenColor = color || product.colors[0] || 'Default';
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.color === chosenColor
      );
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.productId === product.id && item.color === chosenColor
            ? { ...item, quantity: nextQty }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          color: chosenColor,
          image: product.image,
          quantity: Math.min(product.stock, quantity),
        },
      ];
    });
    showToast(`${product.name} (${chosenColor}) ditambahkan ke keranjang.`);
  };

  const updateCartQuantity = (productId: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }
    const product = products.find((p) => p.id === productId);
    const maxStock = product ? product.stock : 99;
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.color === color
          ? { ...item, quantity: Math.min(maxStock, quantity) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, color: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.color === color))
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const createOrder = (payload: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    notes?: string;
    items: CartItem[];
  }): Order => {
    const orderNum = String(orders.length + 1).padStart(2, '0');
    const newOrder: Order = {
      id: `ORD-2611-${orderNum}-${Math.floor(10 + Math.random() * 89)}`,
      customerName: payload.customerName.trim(),
      customerPhone: payload.customerPhone.trim(),
      customerAddress: payload.customerAddress.trim(),
      notes: payload.notes?.trim(),
      items: payload.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        color: item.color,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Deduct stock cleanly when an order is created
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedQty = payload.items
          .filter((i) => i.productId === prod.id)
          .reduce((s, i) => s + i.quantity, 0);
        if (orderedQty === 0) return prod;
        return { ...prod, stock: Math.max(0, prod.stock - orderedQty) };
      })
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
    showToast(`Status pesanan ${orderId} diperbarui ke ${status}.`);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prd-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Produk "${newProduct.name}" berhasil ditambahkan.`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, ...updates } : prod))
    );
    showToast('Perubahan produk disimpan.');
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
    setCart((prev) => prev.filter((item) => item.productId !== id));
    showToast(`Produk "${target?.name ?? ''}" telah dihapus.`);
  };

  const updateStock = (id: string, newStock: number) => {
    const safeStock = Math.max(0, Math.floor(newStock));
    setProducts((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, stock: safeStock } : prod))
    );
    showToast('Stok produk diperbarui.');
  };

  const addCategory = (catData: Omit<Category, 'id' | 'slug'>) => {
    const slug = catData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now().toString(36)}`,
      slug: slug || `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Kategori "${newCat.name}" ditambahkan.`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const previous = categories.find((c) => c.id === id);
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id
          ? {
              ...cat,
              ...updates,
              slug: updates.name
                ? updates.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                : cat.slug,
            }
          : cat
      )
    );
    if (previous && updates.name && previous.name !== updates.name) {
      setProducts((prev) =>
        prev.map((p) =>
          p.category === previous.name ? { ...p, category: updates.name! } : p
        )
      );
    }
    showToast('Kategori berhasil diperbarui.');
  };

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    showToast(`Kategori "${target?.name ?? ''}" dihapus.`);
  };

  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    showToast('Pengaturan butik disimpan.');
  };

  const loginAdmin = (username: string, password: string): boolean => {
    if (username.trim() === 'admin' && password === 'admin') {
      setIsAdminAuthenticated(true);
      showToast('Selamat datang kembali di Dashboard Admin.');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    showToast('Anda telah keluar dari sesi admin.', 'info');
  };

  const resetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setOrders(INITIAL_ORDERS);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
    showToast('Data katalog dan pesanan dikembalikan ke setelan awal.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        orders,
        settings,
        isAdminAuthenticated,
        isCartOpen,
        setIsCartOpen,
        toasts,
        showToast,
        dismissToast,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        loginAdmin,
        logoutAdmin,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
