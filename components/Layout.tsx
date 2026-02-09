
import React, { useState } from 'react';
import { Role, Brand, User, Location } from '../types';
import { BRANDS, BRAND_COLORS, LOCATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeBrand: Brand;
  setActiveBrand: (brand: Brand) => void;
  activeLocation: Location;
  setActiveLocation: (location: Location) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  activeBrand, 
  setActiveBrand,
  activeLocation,
  setActiveLocation,
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

          <div className="flex items-center space-x-6">
            {/* Location Switcher */}
            <div className="relative group">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full hover:border-emerald-500 transition-colors cursor-pointer">
                <i className="fas fa-warehouse text-emerald-600 text-xs"></i>
                <span className="text-xs font-bold text-slate-700">{activeLocation.name}</span>
                <i className="fas fa-chevron-down text-[10px] text-slate-400"></i>
              </div>
              
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] p-2">
                <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Operational Site</p>
                {LOCATIONS.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setActiveLocation(loc)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col ${
                      activeLocation.id === loc.id ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-sm font-bold">{loc.name}</span>
                    <span className="text-[10px] opacity-70 truncate">{loc.address}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
              </div>
              <div className="h-10 w-10 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm">
                {user.name.charAt(0)}
              </div>
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
