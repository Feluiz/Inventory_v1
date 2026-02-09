
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
  authorizerName?: string; 
  userId: string;
  userName: string;
  locationId?: string; // Track where the event happened
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
  // Stock is now a map of locationId -> quantity
  locationStocks: Record<string, number>; 
  lastRestockAmount: number;
  unit: string;
  category: string;
  history: LogEntry[];
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  observations?: string;
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
  locationId: string; // Fulfillment location
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
