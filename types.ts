
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export type Brand = 'Finca Don Rafa' | 'Yuteco' | 'Ecotact';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  PRODUCTION = 'IN PRODUCTION',
  SHIPPED = 'SHIPPED/DELIVERED',
  REJECTED = 'REJECTED'
}

export interface LogEntry {
  id: string;
  type: 'RESTOCK' | 'SALE' | 'PRICE_CHANGE';
  eventNumber: string; // e.g., "REST-1024", "ORD-552", "PRC-A92"
  change: string;      // descriptive summary
  date: string;
  quantity?: string;   // specific quantity change
  authorizerName?: string; // Name of user who authorized (specifically for price changes)
  userId: string;
  userName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  brands: Brand[];
  permissions: string[];
  department: string;
}

export interface Product {
  id: string;
  brand: Brand;
  name: string;
  price: number;
  stock: number;
  lastRestockAmount: number;
  unit: string;
  category: string;
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
  creatorId: string;
  creatorName: string;
  clientName: string;
  clientEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  managerNote?: string;
}

export interface Permission {
  id: string;
  label: string;
  category: 'Orders' | 'Inventory' | 'Admin' | 'Reports';
}
