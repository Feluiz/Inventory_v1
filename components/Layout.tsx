
import React, { useState } from 'react';
import { Role, Brand, User } from '../types';
import { BRANDS, BRAND_COLORS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeBrand: Brand;
  setActiveBrand: (brand: Brand) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  activeBrand, 
  setActiveBrand,
  currentView,
  setCurrentView
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line', roles: [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE] },
    { id: 'orders', label: 'Orders & Sales', icon: 'fa-shopping-cart', roles: [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE] },
    { id: 'inventory', label: 'Inventory', icon: 'fa-boxes-stacked', roles: [Role.ADMIN, Role.MANAGER] },
    { id: 'reports', label: 'Reports', icon: 'fa-file-invoice-dollar', roles: [Role.ADMIN, Role.MANAGER] },
    { id: 'employees', label: 'Employees', icon: 'fa-users-gear', roles: [Role.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-slate-900 text-white flex flex-col no-print`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          <span className={`font-bold text-xl truncate ${!sidebarOpen && 'hidden'}`}>Don Rafa Group</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-700 rounded">
            <i className={`fas ${sidebarOpen ? 'fa-angle-double-left' : 'fa-bars'}`}></i>
          </button>
        </div>

        <nav className="flex-1 mt-4 px-2 space-y-1">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                currentView === item.id ? 'bg-emerald-600' : 'hover:bg-slate-800'
              }`}
            >
              <i className={`fas ${item.icon} w-6 text-center`}></i>
              {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button onClick={onLogout} className="w-full flex items-center p-3 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors">
            <i className="fas fa-sign-out-alt w-6 text-center"></i>
            {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 no-print">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-800 capitalize">{currentView}</h2>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {user.brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setActiveBrand(brand)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    activeBrand === brand 
                    ? `${BRAND_COLORS[brand]} text-white shadow-sm` 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
            </div>
            <div className="h-10 w-10 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-full font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* View Port */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
