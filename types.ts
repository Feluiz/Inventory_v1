
export type Brand = 'Finca Don Rafa' | 'Yuteco' | 'Ecotact';

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  SHIPPED = 'SHIPPED'
}

export type UserStatus = 'Active' | 'Inactive';

export interface Permission {
  id: string;
  label: string;
  category: string;
}

export interface User {
  id: string; // This will store the 4-digit Employee ID
  firstName: string;
  lastName: string;
  name: string; // Full name for compatibility
  email: string;
  role: Role;
  brands: Brand[];
  permissions: string[];
  department: string;
  status: UserStatus;
}

export interface Location {
  id: string;
  name: string;
  address: string;
}

export interface LogEntry {
  id: string;
  type: 'RESTOCK' | 'SALE' | 'PRICE_CHANGE' | 'CATALOG_CREATE' | 'CATALOG_UPDATE';
  eventNumber: string;
  change: string;
  date: string;
  quantity?: string;
  userId: string;
  userName: string;
  authorizerName?: string;
  locationId?: string;
}

export interface Product {
  id: string;
  brand: Brand;
  name: string;
  price: number;
  locationStocks: Record<string, number>;
  lastRestockAmount: number;
  unit: string;
  category: string;
  status: 'ACTIVE' | 'ARCHIVED';
  observations?: string;
  history: LogEntry[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  brand: Brand;
  locationId: string;
  creatorId: string;
  creatorName: string;
  clientName: string;
  clientEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}
