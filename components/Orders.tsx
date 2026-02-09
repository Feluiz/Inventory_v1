
import React, { useState } from 'react';
import { Order, OrderStatus, Brand, Product, User, Role, OrderItem, Location } from '../types';

interface OrdersProps {
  orders: Order[];
  products: Product[];
  currentUser: User;
  activeBrand: Brand;
  // Added activeLocation to match props passed in App.tsx
  activeLocation: Location;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCreateOrder: (order: Partial<Order>) => void;
}

const Orders: React.FC<OrdersProps> = ({ orders, products, currentUser, activeBrand, activeLocation, onUpdateStatus, onCreateOrder }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [showQuote, setShowQuote] = useState<Order | null>(null);
  
  const [newOrder, setNewOrder] = useState({
    clientName: '',
    clientEmail: '',
    items: [] as OrderItem[]
  });

  const filteredOrders = orders.filter(o => o.brand === activeBrand);
  const brandProducts = products.filter(p => p.brand === activeBrand);

  const addItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { productId: '', productName: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...newOrder.items];
    if (field === 'productId') {
      const prod = brandProducts.find(p => p.id === value);
      updatedItems[index] = { 
        ...updatedItems[index], 
        productId: value, 
        productName: prod?.name || '', 
        unitPrice: prod?.price || 0 
      };
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrder.items.length === 0) return;
    
    const total = newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    onCreateOrder({
      ...newOrder,
      brand: activeBrand,
      status: OrderStatus.PENDING,
      total
    });
    setShowCreate(false);
    setNewOrder({ clientName: '', clientEmail: '', items: [] });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-100 text-amber-800';
      case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-800';
      case OrderStatus.PAID: return 'bg-emerald-100 text-emerald-800';
      case OrderStatus.PRODUCTION: return 'bg-purple-100 text-purple-800';
      case OrderStatus.SHIPPED: return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.REJECTED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showQuote) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-0">
        <div className="p-8 no-print border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <button onClick={() => setShowQuote(null)} className="text-gray-500 hover:text-gray-800">
            <i className="fas fa-arrow-left mr-2"></i> Back to Orders
          </button>
          <div className="flex space-x-2">
             <button onClick={() => window.print()} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
               <i className="fas fa-print mr-2"></i> Print / PDF
             </button>
          </div>
        </div>

        <div className="p-12 space-y-8 print:p-0">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{showQuote.brand}</h1>
              <p className="text-gray-500 mt-1 uppercase tracking-widest text-xs">Official Quotation</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">#{showQuote.id}</p>
              <p className="text-gray-500">{new Date(showQuote.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 border-y border-gray-100 py-8">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">From</p>
              <p className="font-bold">{showQuote.brand} Office</p>
              <p className="text-gray-600">Southern Chiapas Industrial Park</p>
              <p className="text-gray-600">Mexico</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Bill To</p>
              <p className="font-bold">{showQuote.clientName}</p>
              <p className="text-gray-600">{showQuote.clientEmail}</p>
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase">
                <th className="py-4">Description</th>
                <th className="py-4 text-center">Qty</th>
                <th className="py-4 text-right">Unit Price</th>
                <th className="py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {showQuote.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-4">{item.productName}</td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 text-right font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-8 text-right font-bold text-gray-900">Total Amount Due</td>
                <td className="pt-8 text-right font-bold text-2xl text-emerald-600">${showQuote.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="pt-12 text-center text-gray-400 text-xs italic">
            This is a computer-generated quote and valid for 30 days.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Sales Orders</h2>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center shadow-md transition-all"
        >
          <i className="fas fa-plus mr-2"></i> New Order
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Create New Sales Order</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    value={newOrder.clientName}
                    onChange={(e) => setNewOrder({...newOrder, clientName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    value={newOrder.clientEmail}
                    onChange={(e) => setNewOrder({...newOrder, clientEmail: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-700">Order Items</h4>
                  <button type="button" onClick={addItem} className="text-sm text-emerald-600 hover:underline">
                    + Add Product
                  </button>
                </div>
                {newOrder.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-6">
                      <select 
                        required
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      >
                        <option value="">Select Product</option>
                        {brandProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (${p.price}/{p.unit})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        min="1" 
                        placeholder="Qty"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm py-2 font-bold">${(item.quantity * item.unitPrice).toFixed(0)}</p>
                    </div>
                    <div className="col-span-1">
                      <button 
                        type="button" 
                        onClick={() => setNewOrder({...newOrder, items: newOrder.items.filter((_, i) => i !== idx)})}
                        className="text-red-500 p-2"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Client</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No orders found for this brand.</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{order.clientName}</p>
                    <p className="text-xs text-gray-500">{order.clientEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">${order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => setShowQuote(order)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded" 
                      title="View Quote"
                    >
                      <i className="fas fa-file-invoice"></i>
                    </button>
                    
                    {(currentUser.role === Role.ADMIN || currentUser.role === Role.MANAGER) && order.status === OrderStatus.PENDING && (
                      <>
                        <button 
                          onClick={() => onUpdateStatus(order.id, OrderStatus.CONFIRMED)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded" 
                          title="Approve"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(order.id, OrderStatus.REJECTED)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded" 
                          title="Reject"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    )}

                    {(currentUser.role === Role.ADMIN || currentUser.role === Role.MANAGER) && order.status === OrderStatus.CONFIRMED && (
                      <button 
                        onClick={() => onUpdateStatus(order.id, OrderStatus.PAID)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded" 
                        title="Mark Paid"
                      >
                        <i className="fas fa-hand-holding-dollar"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
