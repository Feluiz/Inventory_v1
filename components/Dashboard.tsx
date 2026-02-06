
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Brand, Order, Product, OrderStatus } from '../types';

interface DashboardProps {
  orders: Order[];
  products: Product[];
  activeBrand: Brand;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, products, activeBrand }) => {
  const brandOrders = orders.filter(o => o.brand === activeBrand);
  const brandProducts = products.filter(p => p.brand === activeBrand);
  
  const totalRevenue = brandOrders
    .filter(o => o.status !== OrderStatus.REJECTED && o.status !== OrderStatus.PENDING)
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = brandOrders.filter(o => o.status === OrderStatus.PENDING).length;
  const lowStockItems = brandProducts.filter(p => p.stock < 100).length;

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
            <h3 className="text-sm font-medium text-gray-500">Total Revenue ({activeBrand})</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 text-blue-600 mb-2">
            <i className="fas fa-hourglass-half text-xl"></i>
            <h3 className="text-sm font-medium text-gray-500">Pending Approvals</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 text-red-600 mb-2">
            <i className="fas fa-exclamation-triangle text-xl"></i>
            <h3 className="text-sm font-medium text-gray-500">Low Stock Alerts</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 text-amber-600 mb-2">
            <i className="fas fa-box text-xl"></i>
            <h3 className="text-sm font-medium text-gray-500">Active Products</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{brandProducts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-80">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Sales Performance</h3>
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
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Stock Movements</h3>
          <div className="space-y-4">
            {brandProducts.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-semibold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.category}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${p.stock < 100 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {p.stock} {p.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
