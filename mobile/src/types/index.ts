export interface User {
  id: number;
  email: string;
  username: string;
  name?: string;
  business_name?: string;
  phone?: string | null;
  plan?: string;
  status?: boolean;
  created_at?: string;
  restaurant_id?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  business_name: string;
  phone?: string;
}

export interface DashboardOverview {
  restaurant: {
    name: string;
    slug: string;
    is_open: boolean;
    plan_type: string;
  };
  stats: {
    today_orders: number;
    pending: number;
    confirmed: number;
    preparing: number;
    delivered: number;
    cancelled: number;
    today_sales_cop: number;
  };
  recent_orders: Order[];
  menu_url: string;
}

export interface DashboardStats {
  total_orders: number;
  total_sales_cop: number;
  avg_order_value_cop: number;
  orders_by_status: Record<string, number>;
  range: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  is_novedad: boolean;
  category_id: number;
  category_name?: string;
  category?: Category;
  created_at: string;
}

export interface Modifier {
  id: number;
  name: string;
  price: number;
  product_id: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  total: number;
  table_name?: string | null;
  customer_name?: string;
  notes?: string | null;
  items?: OrderItem[];
  items_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  product_price?: number;
  price?: number;
  modifiers_snapshot?: string;
  modifiers?: string[];
  subtotal?: number;
}

export interface CreateOrderPayload {
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  table_id?: number | null;
  items: CreateOrderItem[];
}

export interface CreateOrderItem {
  product_id: number;
  quantity: number;
  modifier_ids?: number[];
}

export interface CreateOrderResponse {
  id: number;
  order_number: string;
  total: number;
  status: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
