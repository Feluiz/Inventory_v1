import React, { useState } from 'react';
import { Product, Brand, User, Role, LogEntry, Location } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BRAND_HEX, BRANDS, LOCATIONS } from '../constants';

interface InventoryProps {
  products: Product[];
  currentUser: User;
  activeBrand: Brand;
  activeLocation: Location;
  onUpdateStock: (productId: string, newStock: number) => void;
  onUpdatePrice: (productId: string, newPrice: number) => void;
  onBulkUpdate?: (updates: { productId: string, addedStock: number, newPrice: number }[], batchNumber: string, sourceId?: string, purchaseOrder?: string) => void;
  onAddProduct?: (product: Partial<Product>) => void;
  onUpdateProduct?: (product: Product) => void;
}

const Inventory: React.FC<InventoryProps> = ({ 
  products, 
  currentUser, 
  activeBrand, 
  activeLocation,
  onUpdateStock, 
  onUpdatePrice, 
  onBulkUpdate, 
  onAddProduct,
  onUpdateProduct
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [editType, setEditType] = useState<'stock' | 'price'>('stock');
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Bulk Modal States
  const [bulkBatchNumber, setBulkBatchNumber] = useState(`BATCH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [bulkSourceId, setBulkSourceId] = useState<string>('restock'); // 'restock' or locationId
  const [purchaseOrder, setPurchaseOrder] = useState<string>('');
  const [bulkEntries, setBulkEntries] = useState<Record<string, { addedStock: number, newPrice: number }>>({});
  const [bulkSearch, setBulkSearch] = useState('');

  // Catalog Form States
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    id: '',
    name: '',
    brand: activeBrand,
    price: 0,
    unit: 'units',
    category: 'General',
    status: 'ACTIVE',
    observations: ''
  });

  const brandProducts = products.filter(p => p.brand === activeBrand);

  const handleEditStockOrPrice = (product: Product, type: 'stock' | 'price') => {
    setEditingId(product.id);
    setEditType(type);
    setEditValue(type === 'stock' ? (product.locationStocks[activeLocation.id] || 0) : product.price);
  };

  const saveInlineEdit = () => {
    if (editingId) {
      if (editType === 'stock') onUpdateStock(editingId, editValue);
      else onUpdatePrice(editingId, editValue);
    }
    setEditingId(null);
  };

  const handleBulkEntryChange = (productId: string, field: 'addedStock' | 'newPrice', value: number) => {
    setBulkEntries(prev => {
      const current = prev[productId] || { addedStock: 0, newPrice: products.find(p => p.id === productId)?.price || 0 };
      return {
        ...prev,
        [productId]: {
          ...current,
          [field]: value
        }
      };
    });
  };

  const handleBulkSubmit = () => {
    const updates = Object.entries(bulkEntries)
      .map(([productId, entry]) => ({
        productId,
        addedStock: entry.addedStock,
        newPrice: entry.newPrice
      }))
      .filter(u => u.addedStock !== 0 || u.newPrice !== products.find(p => p.id === u.productId)?.price);

    if (updates.length === 0) {
      alert("No changes to process.");
      return;
    }

    if (bulkSourceId === 'restock' && !purchaseOrder) {
      alert("Please enter a Purchase Order # for restocking.");
      return;
    }

    // Basic validation for transfers: check if source has enough stock
    if (bulkSourceId !== 'restock') {
      const sourceLoc = LOCATIONS.find(l => l.id === bulkSourceId);
      for (const update of updates) {
        const prod = products.find(p => p.id === update.productId);
        const sourceStock = prod?.locationStocks[bulkSourceId] || 0;
        if (update.addedStock > sourceStock) {
          alert(`Not enough stock in ${sourceLoc?.name} for product: ${prod?.name}. Current: ${sourceStock}`);
          return;
        }
      }
    }

    if (onBulkUpdate) {
      onBulkUpdate(updates, bulkBatchNumber, bulkSourceId, purchaseOrder);
      setIsBulkModalOpen(false);
      setBulkEntries({});
      setPurchaseOrder('');
      setBulkBatchNumber(`BATCH-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const openCatalogForNew = () => {
    setEditingProduct(null);
    setNewProductForm({
      id: '',
      name: '',
      brand: activeBrand,
      price: 0,
      unit: 'units',
      category: 'General',
      status: 'ACTIVE',
      observations: ''
    });
    setIsCatalogModalOpen(true);
  };

  const openCatalogForEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProductForm({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      unit: product.unit,
      category: product.category,
      status: product.status,
      observations: product.observations || ''
    });
    setIsCatalogModalOpen(true);
  };

  const handleCatalogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.id || !newProductForm.name) {
      alert("ID and Name are required.");
      return;
    }

    if (!editingProduct) {
      if (!window.confirm(`Are you sure you want to register the new SKU: ${newProductForm.id}?`)) return;
    }

    if (editingProduct) {
      onUpdateProduct?.({ ...editingProduct, ...newProductForm } as Product);
    } else {
      if (products.some(p => p.id === newProductForm.id)) {
        alert("Product ID must be unique across all brands.");
        return;
      }
      onAddProduct?.(newProductForm);
    }
    setIsCatalogModalOpen(false);
  };

  const chartData = brandProducts.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 12) + '...' : p.name,
    current: p.locationStocks[activeLocation.id] || 0,
    lastRestock: p.lastRestockAmount,
    unit: p.unit
  }));

  const brandColor = BRAND_HEX[activeBrand];
  const allEvents = brandProducts.flatMap(p => 
    p.history.map(log => ({ ...log, productName: p.name, productId: p.id }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderDetailedLogItem = (log: LogEntry) => {
    switch (log.type) {
      case 'RESTOCK':
        return (
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Stock Input</span>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div><span className="text-[10px] text-gray-400 uppercase block">Ref #</span> <span className="font-bold text-slate-700">{log.eventNumber}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Date</span> <span className="text-slate-600">{new Date(log.date).toLocaleDateString()}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Quantity</span> <span className="font-bold text-emerald-600">{log.quantity}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Site</span> <span className="font-bold text-slate-500 uppercase text-[10px]">{log.locationId || 'N/A'}</span></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 italic">{log.change}</p>
          </div>
        );
      case 'SALE':
        return (
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Sale / Out</span>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div><span className="text-[10px] text-gray-400 uppercase block">Event #</span> <span className="font-bold text-slate-700">{log.eventNumber}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Date</span> <span className="text-slate-600">{new Date(log.date).toLocaleDateString()}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Quantity</span> <span className="font-bold text-blue-600">{log.quantity}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Site</span> <span className="font-bold text-slate-500 uppercase text-[10px]">{log.locationId || 'N/A'}</span></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 italic">{log.change}</p>
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
      case 'CATALOG_CREATE':
      case 'CATALOG_UPDATE':
        return (
          <div className="flex flex-col space-y-1">
            <span className={`text-xs font-black uppercase tracking-widest ${log.type === 'CATALOG_CREATE' ? 'text-indigo-600' : 'text-slate-600'}`}>
              {log.type === 'CATALOG_CREATE' ? 'Catalog Definition' : 'Catalog Update'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-[10px] text-gray-400 uppercase block">Event #</span> <span className="font-bold text-slate-700">{log.eventNumber}</span></div>
              <div><span className="text-[10px] text-gray-400 uppercase block">Author</span> <span className="font-bold text-slate-800">{log.authorizerName || log.userName}</span></div>
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
          <p className="text-sm text-gray-500 flex items-center">
            <i className="fas fa-location-dot mr-1.5 text-emerald-600"></i>
            Managing levels for <span className="font-bold text-slate-900 mx-1">{activeBrand}</span> at <span className="font-bold text-emerald-600 ml-1">{activeLocation.name}</span>
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={openCatalogForNew}
            className="bg-white text-slate-900 border-2 border-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center"
          >
            <i className="fas fa-book-open mr-2 text-indigo-500"></i>
            Catalog
          </button>
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center"
          >
            <i className="fas fa-layer-group mr-2 text-emerald-400"></i>
            Bulk Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Local Stock Levels</h3>
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

        <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/20 flex flex-col justify-between">
           <div>
              <div className="flex items-center space-x-2 mb-4">
                <i className="fas fa-boxes text-emerald-400"></i>
                <h3 className="font-bold text-lg">Site Health</h3>
              </div>
              <p className="text-emerald-100/70 text-sm leading-relaxed mb-6">
                Active monitoring of stock at <span className="font-bold text-white">{activeLocation.name}</span>.
              </p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <span className="text-xs">Capacity Utilization</span>
                    <span className="text-sm font-bold">68%</span>
                 </div>
                 <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <span className="text-xs">Out of Stock Risk</span>
                    <span className="text-sm font-bold text-red-300">Moderate</span>
                 </div>
              </div>
           </div>
           <button className="mt-8 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
             Generate Site Inventory List
           </button>
        </div>
      </div>

      {/* Main Events Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
           <h3 className="text-lg font-bold text-gray-800">Operational History</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Product Info</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Location</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Qty</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allEvents.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm italic">No operations recorded yet.</td>
               </tr>
            ) : (
              allEvents.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{(log as any).productName}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-medium"># {(log as any).productId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      log.type === 'RESTOCK' ? 'bg-emerald-50 text-emerald-700' : 
                      log.type === 'SALE' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-700'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{log.locationId || 'Global'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-bold ${log.type === 'RESTOCK' ? 'text-emerald-600' : log.type === 'SALE' ? 'text-blue-600' : 'text-slate-600'}`}>
                      {log.quantity || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm text-slate-600">{new Date(log.date).toLocaleDateString()}</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Master Product List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mt-12">
        <div className="p-6 border-b border-gray-100">
           <h3 className="text-lg font-bold text-gray-800">Site Stock Ledger</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Product</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Local Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {brandProducts.map(product => {
              const localStock = product.locationStocks[activeLocation.id] || 0;
              return (
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
                      <button onClick={saveInlineEdit} className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-lg"><i className="fas fa-check"></i></button>
                    </div>
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${localStock < 100 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {localStock} {product.unit}
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-right font-extrabold text-gray-900">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-6 py-5 text-right space-x-2">
                  <button onClick={() => setHistoryProduct(product)} className="p-2 text-slate-400 hover:text-slate-600"><i className="fas fa-history"></i></button>
                  <button onClick={() => handleEditStockOrPrice(product, 'stock')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded"><i className="fas fa-plus"></i></button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Bulk Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-8 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Bulk Entry - Destination: {activeLocation.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">Add units by restock or internal transfer from another site</p>
                </div>
                <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Source Selection */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Input Source Type</label>
                  <select 
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 font-bold transition-all"
                    value={bulkSourceId}
                    onChange={(e) => setBulkSourceId(e.target.value)}
                  >
                    <option value="restock">External Restock (Purchase)</option>
                    {LOCATIONS.filter(l => l.id !== activeLocation.id).map(l => (
                      <option key={l.id} value={l.id}>Transfer from: {l.name}</option>
                    ))}
                  </select>
                </div>

                {/* Conditional Purchase Order Input */}
                {bulkSourceId === 'restock' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Purchase Order #</label>
                    <div className="relative">
                      <i className="fas fa-hashtag absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. PO-DRG-001"
                        className="w-full bg-white border-2 border-emerald-200 rounded-xl pl-11 pr-4 py-2.5 outline-none focus:border-emerald-500 font-bold transition-all text-emerald-900"
                        value={purchaseOrder}
                        onChange={(e) => setPurchaseOrder(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Batch Reference (Static or Shared) */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Batch/Reference ID</label>
                  <input 
                    type="text" 
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 font-bold"
                    value={bulkBatchNumber}
                    onChange={(e) => setBulkBatchNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 pt-4">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-200">
                    <th className="pb-4 text-[10px] font-bold text-gray-500 uppercase">Product</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-500 uppercase text-center">Current Target Stock</th>
                    {bulkSourceId !== 'restock' && (
                      <th className="pb-4 text-[10px] font-bold text-emerald-600 uppercase text-center">Source Site Stock</th>
                    )}
                    <th className="pb-4 text-[10px] font-bold text-gray-500 uppercase text-right">Units to Add (+)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <p className="text-sm font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] uppercase text-gray-400 font-black">{p.brand} • {p.unit}</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          {p.locationStocks[activeLocation.id] || 0}
                        </span>
                      </td>
                      {bulkSourceId !== 'restock' && (
                        <td className="py-4 text-center">
                          <span className={`text-xs font-black px-2 py-1 rounded ${
                            (p.locationStocks[bulkSourceId] || 0) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {p.locationStocks[bulkSourceId] || 0}
                          </span>
                        </td>
                      )}
                      <td className="py-4 text-right">
                        <input 
                          type="number" 
                          min="0"
                          placeholder="0"
                          className="w-24 bg-white border-2 border-gray-200 rounded-xl p-2 outline-none focus:border-emerald-500 font-bold transition-all text-center"
                          value={bulkEntries[p.id]?.addedStock || ''}
                          onChange={(e) => handleBulkEntryChange(p.id, 'addedStock', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-slate-50/50">
               <div className="text-xs font-bold text-slate-500">
                  Updates to process: <span className="text-slate-900 font-black">{Object.keys(bulkEntries).filter(k => bulkEntries[k].addedStock > 0).length} items</span>
               </div>
               <div className="flex space-x-4">
                <button onClick={() => setIsBulkModalOpen(false)} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-900">Discard</button>
                <button 
                  onClick={handleBulkSubmit} 
                  className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all"
                >
                  {bulkSourceId === 'restock' ? 'Execute Purchase Restock' : 'Process Site Transfer'}
                </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Modal */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-indigo-50/20">
              <h3 className="text-2xl font-black text-slate-900">{editingProduct ? 'Edit Global Catalog' : 'New Catalog Definition'}</h3>
              <button onClick={() => setIsCatalogModalOpen(false)} className="text-slate-400 hover:text-slate-900"><i className="fas fa-times text-2xl"></i></button>
            </div>
            <form onSubmit={handleCatalogSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">SKU ID (Unique)</label>
                  <input required readOnly={!!editingProduct} type="text" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold" value={newProductForm.id} onChange={(e) => setNewProductForm({...newProductForm, id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Display Name</label>
                  <input required type="text" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold" value={newProductForm.name} onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Brand Portfolio</label>
                  <select className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold" value={newProductForm.brand} onChange={(e) => setNewProductForm({...newProductForm, brand: e.target.value as Brand})}>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Master Unit Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input required type="number" step="0.01" className="w-full pl-8 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold" value={newProductForm.price} onChange={(e) => setNewProductForm({...newProductForm, price: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsCatalogModalOpen(false)} className="px-6 py-3 font-bold text-slate-400">Cancel</button>
                <button type="submit" className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20">
                  {editingProduct ? 'Commit Changes' : 'Register Catalog Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{historyProduct.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Supply Chain Audit</p>
              </div>
              <button onClick={() => setHistoryProduct(null)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {historyProduct.history.length === 0 ? (
                <div className="text-center py-20 text-slate-300 font-medium italic">No ledger entries for this SKU yet.</div>
              ) : (
                historyProduct.history.slice().reverse().map(log => (
                  <div key={log.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:shadow-sm transition-shadow">
                    {renderDetailedLogItem(log)}
                  </div>
                ))
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 text-right">
              <button onClick={() => setHistoryProduct(null)} className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold text-sm">Close Audit Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
