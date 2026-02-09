
import { Brand, Permission, Role, OrderStatus, Product, User, Order, Location } from './types';

export const BRANDS: Brand[] = ['Finca Don Rafa', 'Yuteco', 'Ecotact'];

export const LOCATIONS: Location[] = [
  { id: 'loc-1', name: 'Main Warehouse (Chiapas)', address: 'Industrial Zone, Chiapas' },
  { id: 'loc-2', name: 'Distribution Center (Mexico City)', address: 'Central North, CDMX' },
  { id: 'loc-3', name: 'Retail Store (Tapachula)', address: 'Main Ave, Tapachula' }
];

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

// Added INITIAL_USERS to fix the import error in App.tsx
export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Roberto Don Rafa',
    email: 'roberto@donrafa.com',
    role: Role.ADMIN,
    brands: ['Finca Don Rafa', 'Yuteco', 'Ecotact'],
    permissions: ['create_order', 'approve_order', 'manage_inventory', 'manage_prices', 'manage_users', 'view_reports', 'create_custom_reports'],
    department: 'Administration'
  },
  {
    id: 'u2',
    name: 'Ana Manager',
    email: 'ana@donrafa.com',
    role: Role.MANAGER,
    brands: ['Finca Don Rafa', 'Yuteco'],
    permissions: ['create_order', 'approve_order', 'manage_inventory', 'view_reports'],
    department: 'Operations'
  },
  {
    id: 'u3',
    name: 'Carlos Employee',
    email: 'carlos@donrafa.com',
    role: Role.EMPLOYEE,
    brands: ['Finca Don Rafa'],
    permissions: ['create_order'],
    department: 'Sales'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'p1', brand: 'Finca Don Rafa', name: 'Arabica Green Coffee', price: 12.5, 
    locationStocks: { 'loc-1': 500, 'loc-2': 200, 'loc-3': 50 },
    lastRestockAmount: 1000, unit: 'kg', category: 'Raw Materials', status: 'ACTIVE',
    history: [
      { id: 'h1', type: 'RESTOCK', eventNumber: 'REST-1000', change: '+1000 units', date: '2023-10-01T10:00:00Z', userId: 'u1', userName: 'Roberto Don Rafa', locationId: 'loc-1' },
      { id: 'h2', type: 'SALE', eventNumber: 'ORD-DEMO', change: '-500 units (ORD-DEMO)', date: '2023-11-05T14:30:00Z', userId: 'u2', userName: 'Ana Manager', locationId: 'loc-1' }
    ]
  },
  { 
    id: 'p2', brand: 'Finca Don Rafa', name: 'Roasted Honey Process', price: 25.0, 
    locationStocks: { 'loc-1': 120, 'loc-2': 80, 'loc-3': 30 },
    lastRestockAmount: 200, unit: 'bag', category: 'Finished Goods', status: 'ACTIVE', history: [] 
  },
  { 
    id: 'p3', brand: 'Yuteco', name: 'Standard Jute Bag 60kg', price: 4.5, 
    locationStocks: { 'loc-1': 2000, 'loc-2': 1500, 'loc-3': 400 },
    lastRestockAmount: 5000, unit: 'pcs', category: 'Packaging', status: 'ACTIVE', history: [] 
  },
  { 
    id: 'p4', brand: 'Yuteco', name: 'Custom Printed Bag', price: 6.2, 
    locationStocks: { 'loc-1': 800, 'loc-2': 300, 'loc-3': 100 },
    lastRestockAmount: 1000, unit: 'pcs', category: 'Packaging', status: 'ACTIVE', history: [] 
  },
  { 
    id: 'p5', brand: 'Ecotact', name: 'Hermetic Liner 70L', price: 8.5, 
    locationStocks: { 'loc-1': 1500, 'loc-2': 1200, 'loc-3': 300 },
    lastRestockAmount: 2000, unit: 'pcs', category: 'Storage', status: 'ACTIVE', history: [] 
  },
  { 
    id: 'p6', brand: 'Ecotact', name: 'Vacuum Pack High-Barrier', price: 15.0, 
    locationStocks: { 'loc-1': 450, 'loc-2': 200, 'loc-3': 50 },
    lastRestockAmount: 500, unit: 'pcs', category: 'Storage', status: 'ACTIVE', history: [] 
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    brand: 'Finca Don Rafa',
    locationId: 'loc-1',
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
