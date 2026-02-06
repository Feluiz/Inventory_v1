
import React from 'react';
import { Brand, Permission, Role, OrderStatus, Product, User, Order } from './types';

export const BRANDS: Brand[] = ['Finca Don Rafa', 'Yuteco', 'Ecotact'];

export const BRAND_COLORS: Record<Brand, string> = {
  'Finca Don Rafa': 'bg-emerald-600',
  'Yuteco': 'bg-amber-600',
  'Ecotact': 'bg-sky-600',
};

export const BRAND_HEX: Record<Brand, string> = {
  'Finca Don Rafa': '#059669',
  'Yuteco': '#d97706',
  'Ecotact': '#0284c7',
};

export const PERMISSIONS: Permission[] = [
  { id: 'create_order', label: 'Create Orders', category: 'Orders' },
  { id: 'approve_order', label: 'Approve/Reject Orders', category: 'Orders' },
  { id: 'manage_inventory', label: 'Replenish Stock', category: 'Inventory' },
  { id: 'manage_prices', label: 'Update Prices', category: 'Inventory' },
  { id: 'manage_users', label: 'Manage Employees', category: 'Admin' },
  { id: 'view_reports', label: 'View Reports', category: 'Reports' },
  { id: 'create_custom_reports', label: 'Configure Reports', category: 'Reports' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'p1', brand: 'Finca Don Rafa', name: 'Arabica Green Coffee', price: 12.5, stock: 500, lastRestockAmount: 1000, unit: 'kg', category: 'Raw Materials',
    history: [
      // Added missing eventNumber to comply with LogEntry type
      { id: 'h1', type: 'RESTOCK', eventNumber: 'REST-1000', change: '+1000 units', date: '2023-10-01T10:00:00Z', userId: 'u1', userName: 'Roberto Don Rafa' },
      // Added missing eventNumber to comply with LogEntry type
      { id: 'h2', type: 'SALE', eventNumber: 'ORD-DEMO', change: '-500 units (ORD-DEMO)', date: '2023-11-05T14:30:00Z', userId: 'u2', userName: 'Ana Manager' }
    ]
  },
  { id: 'p2', brand: 'Finca Don Rafa', name: 'Roasted Honey Process', price: 25.0, stock: 120, lastRestockAmount: 200, unit: 'bag', category: 'Finished Goods', history: [] },
  { id: 'p3', brand: 'Yuteco', name: 'Standard Jute Bag 60kg', price: 4.5, stock: 2000, lastRestockAmount: 5000, unit: 'pcs', category: 'Packaging', history: [] },
  { id: 'p4', brand: 'Yuteco', name: 'Custom Printed Bag', price: 6.2, stock: 800, lastRestockAmount: 1000, unit: 'pcs', category: 'Packaging', history: [] },
  { id: 'p5', brand: 'Ecotact', name: 'Hermetic Liner 70L', price: 8.5, stock: 1500, lastRestockAmount: 2000, unit: 'pcs', category: 'Storage', history: [] },
  { id: 'p6', brand: 'Ecotact', name: 'Vacuum Pack High-Barrier', price: 15.0, stock: 450, lastRestockAmount: 500, unit: 'pcs', category: 'Storage', history: [] },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Roberto Don Rafa',
    email: 'admin@donrafa.com',
    role: Role.ADMIN,
    brands: ['Finca Don Rafa', 'Yuteco', 'Ecotact'],
    permissions: PERMISSIONS.map(p => p.id),
    department: 'Executive'
  },
  {
    id: 'u2',
    name: 'Ana Manager',
    email: 'ana@yuteco.com',
    role: Role.MANAGER,
    brands: ['Yuteco', 'Finca Don Rafa'],
    permissions: ['create_order', 'approve_order', 'manage_inventory', 'manage_prices', 'view_reports'],
    department: 'Sales & Operations'
  },
  {
    id: 'u3',
    name: 'Carlos Employee',
    email: 'carlos@ecotact.com',
    role: Role.EMPLOYEE,
    brands: ['Ecotact'],
    permissions: ['create_order'],
    department: 'Sales'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    brand: 'Finca Don Rafa',
    creatorId: 'u3',
    creatorName: 'Carlos Employee',
    clientName: 'Starbucks MX',
    clientEmail: 'procurement@starbucks.com.mx',
    status: OrderStatus.PENDING,
    items: [
      { productId: 'p1', productName: 'Arabica Green Coffee', quantity: 100, unitPrice: 12.5 }
    ],
    total: 1250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
