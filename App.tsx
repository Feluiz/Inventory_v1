
import React, { useState, useEffect } from 'react';
import { User, Role, Brand, Product, Order, OrderStatus, LogEntry } from './types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_ORDERS, BRANDS } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Inventory from './components/Inventory';
import Reports from './components/Reports';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeBrand, setActiveBrand] = useState<Brand>(BRANDS[0]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);

  // Auto-login for demo purposes
  useEffect(() => {
    if (!user) setUser(INITIAL_USERS[0]);
  }, [user]);

  const handleLogout = () => {
    alert("Logged out successfully");
    setUser(null);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Logic: Sales logged when confirmed
    if (status === OrderStatus.CONFIRMED && order.status !== OrderStatus.CONFIRMED) {
      setProducts(prevProducts => {
        return prevProducts.map(p => {
          const item = order.items.find(oi => oi.productId === p.id);
          if (item) {
            const newLog: LogEntry = {
              id: `log-${Date.now()}-${Math.random()}`,
              type: 'SALE',
              eventNumber: order.id,
              change: `Sold ${item.quantity} ${p.unit}`,
              date: new Date().toISOString(),
              quantity: `${item.quantity} ${p.unit}`,
              userId: user?.id || 'sys',
              userName: user?.name || 'System',
              authorizerName: user?.name || 'System'
            };
            return {
              ...p,
              stock: p.stock - item.quantity,
              history: [...p.history, newLog]
            };
          }
          return p;
        });
      });
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
  };

  const createOrder = (orderData: Partial<Order>) => {
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 900) + 100}`,
      brand: activeBrand,
      creatorId: user?.id || '',
      creatorName: user?.name || '',
      clientName: orderData.clientName || '',
      clientEmail: orderData.clientEmail || '',
      status: OrderStatus.PENDING,
      items: orderData.items || [],
      total: orderData.total || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const added = newStock - p.stock;
        const eventNum = `REST-${Math.floor(1000 + Math.random() * 9000)}`;
        const newLog: LogEntry = {
          id: `log-${Date.now()}`,
          type: 'RESTOCK',
          eventNumber: eventNum,
          change: `Restock of ${added} units`,
          date: new Date().toISOString(),
          quantity: `${added} ${p.unit}`,
          userId: user?.id || 'sys',
          userName: user?.name || 'System',
          authorizerName: user?.name || 'System'
        };
        return { 
          ...p, 
          stock: newStock, 
          lastRestockAmount: added > 0 ? added : p.lastRestockAmount,
          history: [...p.history, newLog] 
        };
      }
      return p;
    }));
  };

  const updatePrice = (productId: string, newPrice: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const eventNum = `PRC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const newLog: LogEntry = {
          id: `log-${Date.now()}`,
          type: 'PRICE_CHANGE',
          eventNumber: eventNum,
          change: `$${p.price.toFixed(2)} -> $${newPrice.toFixed(2)}`,
          date: new Date().toISOString(),
          authorizerName: user?.name || 'System',
          userId: user?.id || 'sys',
          userName: user?.name || 'System'
        };
        return { 
          ...p, 
          price: newPrice, 
          history: [...p.history, newLog] 
        };
      }
      return p;
    }));
  };

  if (!user) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Don Rafa Group</h1>
          <p className="text-gray-500 mt-2">Inventory Management System</p>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700 text-center">Demo: Select a profile to enter</p>
          {INITIAL_USERS.map(u => (
            <button
              key={u.id}
              onClick={() => {
                setUser(u);
                setActiveBrand(u.brands[0]);
              }}
              className="w-full p-4 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500 capitalize">{u.role.toLowerCase()}</p>
              </div>
              <i className="fas fa-chevron-right text-gray-300 group-hover:text-emerald-500"></i>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeBrand={activeBrand} 
      setActiveBrand={setActiveBrand}
      currentView={currentView}
      setCurrentView={setCurrentView}
    >
      {currentView === 'dashboard' && <Dashboard orders={orders} products={products} activeBrand={activeBrand} />}
      {currentView === 'orders' && (
        <Orders 
          orders={orders} 
          products={products} 
          currentUser={user} 
          activeBrand={activeBrand}
          onUpdateStatus={updateOrderStatus}
          onCreateOrder={createOrder}
        />
      )}
      {currentView === 'inventory' && (
        <Inventory 
          products={products} 
          currentUser={user} 
          activeBrand={activeBrand} 
          onUpdateStock={updateStock}
          onUpdatePrice={updatePrice}
        />
      )}
      {currentView === 'reports' && <Reports orders={orders} products={products} activeBrand={activeBrand} />}
      
      {currentView === 'employees' && user.role === Role.ADMIN && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Employee Directory</h2>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">Add New Employee</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allUsers.map(u => (
              <div key={u.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group overflow-hidden hover:border-emerald-200 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{u.name}</h3>
                    <p className="text-xs text-gray-500">{u.department}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <i className="fas fa-envelope w-5 text-slate-300"></i> {u.email}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <i className="fas fa-shield-halved w-5 text-slate-300"></i> {u.role}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-1">
                  {u.brands.map(b => (
                    <span key={b} className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-600 rounded uppercase">{b}</span>
                  ))}
                </div>
                <button className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fas fa-ellipsis-v"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
