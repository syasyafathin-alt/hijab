export type ProductStatus = 'active' | 'draft';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  material: string;
  size: string;
  colors: string[];
  stock: number;
  status: ProductStatus;
  isBestSeller: boolean;
  isNewArrival: boolean;
  image: string;
  gallery?: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  color: string;
  image: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  color: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface StoreSettings {
  brandName: string;
  whatsappNumber: string;
  instagramHandle: string;
  contactEmail: string;
  boutiqueAddress: string;
  promoEyebrow: string;
  promoTitle: string;
  promoDescription: string;
  lowStockThreshold: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
