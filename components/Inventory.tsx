
import React, { useState } from 'react';
import { Product, Brand, User, Role, LogEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { BRAND_HEX } from '../constants';

interface InventoryProps {
  products: Product[];
  currentUser: User;
  activeBrand: Brand;
  onUpdateStock: (productId: string, newStock: number) => void;
  onUpdatePrice: (productId: string, newPrice: number) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, currentUser, activeBrand, onUpdateStock, onUpdatePrice }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [editType, setEditType] = useState<'stock' | 'price'>('stock');
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);

  const brandProducts = products.filter(p => p.brand === activeBrand);

  const handleEdit = (product: Product, type: 'stock' | 'price') => {
    setEditingId(product.id);
    setEditType(type);
    setEditValue(type === 'stock' ? product.stock : product.price);
  };

  const saveEdit = () => {
    if (editingId) {
      if (editType === 'stock') onUpdateStock(editingId, editValue);
      else onUpdatePrice(editingId, editValue);
    }
    setEditingId(null);
  };

  // Prepare data for the overlapping bar chart
  const chartData = brandProducts.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 12) + '...' : p.name,
    current: p.stock,
    lastRestock: p.lastRestockAmount,
    unit: p.unit
  }));

  const brandColor = BRAND_HEX[activeBrand];

  // Aggregate all events for the current brand for the main events table
  const allEvents = brandProducts.flatMap(p => 
    p.history.map(log => ({ ...log, productName: p.name, productId: p.id }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderDetailedLogItem = (log: LogEntry) => {
    switch (log.type) {
      case 'RESTOCK':
        return (
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Restock Update</span>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><span className="text-[10px] text-gray-400 uppercase block">Event #</span> <span className="font-bold text-slate-700">{log.eventNumber}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Date</span> <span className="text-slate-600">{new Date(log.date).toLocaleDateString()}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Quantity</span> <span className="font-bold text-emerald-600">{log.quantity}</span></div>
            </div>
          </div>
        );
      case 'SALE':
        return (
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Sale</span>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><span className="text-[10px] text-gray-400 uppercase block">Event #</span> <span className="font-bold text-slate-700">{log.eventNumber}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Date</span> <span className="text-slate-600">{new Date(log.date).toLocaleDateString()}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Quantity</span> <span className="font-bold text-blue-600">{log.quantity}</span></div>
            </div>
          </div>
        );
      case 'PRICE_CHANGE':
        return (
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Price Change Event</span>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-[10px] text-gray-400 uppercase block">Event #</span> <span className="font-bold text-slate-700">{log.eventNumber}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Authorized By</span> <span className="font-bold text-slate-800">{log.authorizerName || log.userName}</span></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 italic">{log.change}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-sm text-gray-500">Track levels and replenishment for {activeBrand}</p>
        </div>
        <div className="flex space-x-4">
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm text-sm">
            <span className="text-gray-500 mr-2 uppercase tracking-tighter font-bold">Total SKUs</span>
            <span className="font-bold text-gray-900">{brandProducts.length}</span>
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm text-sm">
            <span className="text-gray-500 mr-2 uppercase tracking-tighter font-bold">Critical Level</span>
            <span className="font-bold text-red-600">{brandProducts.filter(p => p.stock < 100).length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stock Visualization Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Stock Levels vs Capacity</h3>
            <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-tight">
              <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm mr-1" style={{backgroundColor: brandColor}}></div> Stock</div>
              <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm mr-1" style={{backgroundColor: brandColor, opacity: 0.2}}></div> Restock</div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barGap={-20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="lastRestock" radius={[4, 4, 0, 0]} barSize={32} fill={brandColor} fillOpacity={0.15} />
                <Bar dataKey="current" radius={[4, 4, 0, 0]} barSize={24} fill={brandColor} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Mini Stats/Quick Actions */}
        <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/20 flex flex-col justify-between">
           <div>
              <div className="flex items-center space-x-2 mb-4">
                <i className="fas fa-boxes text-emerald-400"></i>
                <h3 className="font-bold text-lg">Inventory Health</h3>
              </div>
              <p className="text-emerald-100/70 text-sm leading-relaxed mb-6">
                Active monitoring of stock replenishment and sales fulfillment for {activeBrand}.
              </p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <span className="text-xs">Turnover Ratio</span>
                    <span className="text-sm font-bold">4.2x</span>
                 </div>
                 <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <span className="text-xs">Out of Stock Risk</span>
                    <span className="text-sm font-bold text-red-300">High</span>
                 </div>
              </div>
           </div>
           <button className="mt-8 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
             Download Full Inventory Report
           </button>
        </div>
      </div>

      {/* Main Events Table (5 Columns) */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
           <h3 className="text-lg font-bold text-gray-800">Brand Operations History</h3>
           <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded">5-Column Ledger</span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product Info</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Event #</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Quantity/Change</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Authorized By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allEvents.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm italic">No operations recorded for {activeBrand} yet.</td>
               </tr>
            ) : (
              allEvents.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Column 1: Product Name, Product # */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{(log as any).productName}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-medium"># {(log as any).productId}</p>
                  </td>
                  
                  {/* Column 2: Event # */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      log.type === 'RESTOCK' ? 'bg-emerald-50 text-emerald-700' : 
                      log.type === 'SALE' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {log.eventNumber}
                    </span>
                  </td>
                  
                  {/* Column 3: Date */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{new Date(log.date).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  
                  {/* Column 4: Quantity */}
                  <td className="px-6 py-4">
                    {log.type === 'PRICE_CHANGE' ? (
                       <span className="text-xs font-bold text-amber-600">{log.change}</span>
                    ) : (
                      <span className={`text-sm font-bold ${log.type === 'RESTOCK' ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {log.type === 'RESTOCK' ? '+' : '-'}{log.quantity}
                      </span>
                    )}
                  </td>

                  {/* Column 5: Authorized By */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 mr-2 border border-slate-200">
                        {(log.authorizerName || log.userName).charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{log.authorizerName || log.userName}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Management Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mt-12">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
           <h3 className="text-lg font-bold text-gray-800">Master Product List</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Stock Level</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {brandProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-gray-900">{product.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">{product.category}</p>
                </td>
                <td className="px-6 py-5 text-center">
                  {editingId === product.id && editType === 'stock' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <input 
                        type="number" 
                        className="w-20 p-1.5 border-2 border-emerald-500 rounded-lg text-center outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(parseFloat(e.target.value))}
                        autoFocus
                      />
                      <button onClick={saveEdit} className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-lg"><i className="fas fa-check"></i></button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${product.stock < 100 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {product.stock} {product.unit}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-5 text-right">
                  {editingId === product.id && editType === 'price' ? (
                    <div className="flex items-center justify-end space-x-2">
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-24 p-1.5 border-2 border-emerald-500 rounded-lg text-right outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(parseFloat(e.target.value))}
                        autoFocus
                      />
                      <button onClick={saveEdit} className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-lg"><i className="fas fa-check"></i></button>
                    </div>
                  ) : (
                    <span className="text-sm font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-6 py-5 text-right space-x-2">
                   <button 
                    onClick={() => setHistoryProduct(product)}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
                    title="View History"
                  >
                    <i className="fas fa-clock-rotate-left"></i>
                  </button>
                  <button 
                    onClick={() => handleEdit(product, 'stock')}
                    className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" 
                    title="Update Stock"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                  <button 
                    onClick={() => handleEdit(product, 'price')}
                    className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" 
                    title="Update Price"
                  >
                    <i className="fas fa-tag"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* History Modal (Detailed View) */}
      {historyProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-white/20">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{historyProduct.name}</h3>
                <p className="text-xs text-gray-500 font-medium tracking-wide">Detailed Product Audit Log</p>
              </div>
              <button onClick={() => setHistoryProduct(null)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {historyProduct.history && historyProduct.history.length > 0 ? (
                historyProduct.history.slice().reverse().map((log) => (
                  <div key={log.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                    {renderDetailedLogItem(log)}
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <i className="fas fa-history text-5xl text-gray-200 mb-4"></i>
                  <p className="text-gray-400 font-medium">No activity recorded for this product yet.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-right">
              <button 
                onClick={() => setHistoryProduct(null)}
                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
