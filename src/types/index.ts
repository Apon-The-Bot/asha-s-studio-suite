export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  category?: Category;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_price: number | null;
  short_description: string | null;
  long_description: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  stock_qty: number;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  subcategory?: Subcategory;
  product_images?: ProductImage[];
  product_tags?: { tag: Tag }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  notes: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  title_snapshot: string;
  price_snapshot: number;
  image_snapshot: string | null;
  qty: number;
  created_at: string;
}

export interface StoreSettings {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
}

export interface DeliveryCharges {
  inside_city: number;
  outside_city: number;
  free_shipping_threshold: number;
}

export interface MetaPixelSettings {
  enabled: boolean;
  pixel_id: string;
}

export interface PolicySettings {
  return_days: number;
  shipping_info: string;
}
