
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Brand, Order, Product } from '../types';
import { getReportInsights } from '../services/geminiService';

interface ReportsProps {
  orders: Order[];
  products: Product[];
  activeBrand: Brand;
}

const Reports: React.FC<ReportsProps> = ({ orders, products, activeBrand }) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDataInsights = async () => {
    setLoading(true);
    // Fixed: Property 'stock' does not exist on type 'Product'. Summing locationStocks to get total stock for the brand report.
    const brandData = {
      brand: activeBrand,
      period,
      totalSales: orders.filter(o => o.brand === activeBrand).length,
      revenue: orders.filter(o => o.brand === activeBrand).reduce((s, o) => s + o.total, 0),
      lowStockItems: products.filter(p => p.brand === activeBrand && Object.values(p.locationStocks).reduce((sum, qty) => sum + qty, 0) < 100).length
    };
    const res = await getReportInsights(brandData);
    setInsights(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchDataInsights();
  }, [activeBrand, period]);

  const data = [
    { name: 'Jan', revenue: 45000, orders: 240 },
    { name: 'Feb', revenue: 52000, orders: 300 },
    { name: 'Mar', revenue: 48000, orders: 280 },
    { name: 'Apr', revenue: 61000, orders: 350 },
    { name: 'May', revenue: 55000, orders: 310 },
    { name: 'Jun', revenue: 67000, orders: 390 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Operational Reports</h2>
        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                period === p ? 'bg-emerald-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
            <h3 className="font-bold text-gray-800 mb-6">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64">
            <h3 className="font-bold text-gray-800 mb-6">Order Volume</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="stepAfter" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <i className="fas fa-brain text-emerald-400"></i>
                <h3 className="font-bold text-lg">AI Business Insights</h3>
              </div>
              
              {loading ? (
                <div className="flex items-center space-x-3 text-emerald-300 animate-pulse">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Analyzing numbers...</span>
                </div>
              ) : (
                <ul className="space-y-4">
                  {insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <i className="fas fa-lightbulb text-emerald-400 mt-1 shrink-0"></i>
                      <p className="text-sm text-emerald-50 leading-relaxed">{insight}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-800 rounded-full blur-3xl opacity-50"></div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Avg. Order Value</span>
                <span className="font-bold text-gray-900">$245.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Order Growth</span>
                <span className="font-bold text-emerald-600">+12.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Fulfillment Rate</span>
                <span className="font-bold text-gray-900">98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
