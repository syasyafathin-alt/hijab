import { StockStatus } from '../types/store';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateID(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function getStockStatus(stock: number, threshold = 5): StockStatus {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= threshold) return 'Low Stock';
  return 'In Stock';
}

const COLOR_SWATCH_MAP: Record<string, string> = {
  'dusty pink': '#C99195',
  'dusty rose': '#BA7D82',
  'blush': '#DFB9BA',
  'ivory': '#F6F1E9',
  'cream': '#EFE6D8',
  'warm beige': '#DCCBB8',
  'beige': '#D8C7B4',
  'champagne': '#E1CFBA',
  'taupe': '#A99686',
  'warm taupe': '#9B8776',
  'mocca': '#9E7E69',
  'mocha': '#967661',
  'cokelat muda': '#B49178',
  'sand': '#D5C3AD',
  'espresso': '#4A332D',
  'charcoal': '#433C3A',
  'sage': '#A7B09E',
  'olive': '#8D937B',
  'oatmeal': '#E3D9CA',
  'soft rose': '#D3A3A6',
};

export function getColorHex(colorName: string): string {
  const key = colorName.trim().toLowerCase();
  if (COLOR_SWATCH_MAP[key]) return COLOR_SWATCH_MAP[key];
  for (const [mappedKey, hex] of Object.entries(COLOR_SWATCH_MAP)) {
    if (key.includes(mappedKey)) return hex;
  }
  return '#B9A99A';
}

export function compressImageFile(file: File, maxWidth = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak valid.'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const normalizedPhone = cleanPhone.startsWith('0')
    ? `62${cleanPhone.slice(1)}`
    : cleanPhone;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
