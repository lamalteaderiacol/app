
// Product category as a string for now, but linked to CategoryDef by name
export type Category = string;

export interface CategoryDef {
  id: string; // or number, json-server handles both
  name: string;
  desc: string;
  items: number;
  status: 'Activo' | 'Inactivo';
  color: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  image_position?: string;
  available: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum View {
  LANDING = 'LANDING',
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  CHECKOUT = 'CHECKOUT',
  ADMIN_INVENTORY = 'ADMIN_INVENTORY',
  ADMIN_ADD_PRODUCT = 'ADMIN_ADD_PRODUCT',
  ADMIN_EDIT_PRODUCT = 'ADMIN_EDIT_PRODUCT',
  ADMIN_CATEGORIES = 'ADMIN_CATEGORIES',
  ADMIN_EDIT_CATEGORY = 'ADMIN_EDIT_CATEGORY',
  ADMIN_SETTINGS = 'ADMIN_SETTINGS'
}

export interface StoreConfig {
  id: number;
  description: string;
  schedule: string;
  address: string;
  landing_hero_image?: string;
  home_hero_image?: string;
}

export interface OrderDetails {
  fullName: string;
  address: string;
  phone: string;
  paymentMethod: 'efectivo' | 'transferencia';
  email?: string;
  instructions?: string;
}
