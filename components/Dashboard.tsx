
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brand, Order, Product, OrderStatus, Location } from '../types';

interface DashboardProps {
  orders: Order[];
  products: Product[];
  activeBrand: Brand;
  activeLocation: Location;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, products, activeBrand, activeLocation }) => {
  const brandOrders = orders.filter(o => o.brand === activeBrand && o.locationId === activeLocation.id);
  const brandProducts = products.filter(p => p.brand === activeBrand);
  
  const totalRevenue = brandOrders
    .filter(o => o.status !== OrderStatus.REJECTED && o.status !== OrderStatus.PENDING)
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = brandOrders.filter(o => o.status === OrderStatus.PENDING).length;
  // Low stock check for current location
  const lowStockItems = brandProducts.filter(p => (p.locationStocks[activeLocation.id] || 0) < 100).length;

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 text-emerald-600 mb-2">
            <i className="fas fa-money-bill-wave text-xl"></i>
            <h3 className="text-sm font-medium text-gray-500">Site Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">{activeLocation.name}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 text-blue-600 mb-2">
            <i className="fas fa-hourglass-half text-xl"></i>
            <h3 className="text-sm font-medium text-gray-500">Local Pending</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Orders at site</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500">
          <div className="flex items-center space-x-3 text-red-600 mb-2">
            <i className="fas fa-exclamation-triangle text-xl"></i>
            <h3 className="text-sm font-medium text-gray-500">Local Low Stock</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Items below 100 at site</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 text-amber-600 mb-2">
            <i className="fas fa-box text-xl"></i>
            <h3 className="text-sm font-medium text-gray-500">Brand Portfolio</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{brandProducts.length}</p>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">SKUs assigned to {activeBrand}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-80">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Site Sales Performance</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Local Stock Preview</h3>
          <div className="space-y-4">
            {brandProducts.slice(0, 5).map(p => {
              const currentStock = p.locationStocks[activeLocation.id] || 0;
              return (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${currentStock < 100 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {currentStock} {p.unit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
