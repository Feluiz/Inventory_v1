
import React, { useState } from 'react';
import { User, Role, Brand, UserStatus } from '../types';
import { DEPARTMENTS, BRANDS, PRIMARY_COLOR } from '../constants';

interface EmployeesProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
}

const Employees: React.FC<EmployeesProps> = ({ users, onAddUser, onUpdateUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    department: DEPARTMENTS[0],
    role: Role.EMPLOYEE,
    status: 'Active',
    brands: [BRANDS[0]]
  });

  const generateEmployeeId = () => {
    let id: string;
    do {
      id = Math.floor(1000 + Math.random() * 9000).toString();
    } while (users.find(u => u.id === id));
    return id;
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: DEPARTMENTS[0],
      role: Role.EMPLOYEE,
      status: 'Active',
      brands: [BRANDS[0]]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData: User = {
      ...(formData as User),
      id: editingUser ? editingUser.id : generateEmployeeId(),
      name: `${formData.firstName} ${formData.lastName}`,
      permissions: formData.permissions || (formData.role === Role.ADMIN ? ['all'] : ['create_order'])
    };

    if (editingUser) {
      onUpdateUser(userData);
    } else {
      onAddUser(userData);
    }
    setIsModalOpen(false);
  };

  const handleBrandToggle = (brand: Brand) => {
    const currentBrands = formData.brands || [];
    if (currentBrands.includes(brand)) {
      setFormData({ ...formData, brands: currentBrands.filter(b => b !== brand) });
    } else {
      setFormData({ ...formData, brands: [...currentBrands, brand] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#5b3d35]">Employee Directory</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Human Resources & Access Control</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#5b3d35] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#5b3d35]/20 hover:bg-[#3e2a24] transition-all"
        >
          <i className="fas fa-plus mr-2"></i> Add New Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group overflow-hidden hover:border-[#5b3d35]/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 bg-[#5b3d35]/10 text-[#5b3d35] rounded-2xl flex items-center justify-center font-black text-2xl border border-[#5b3d35]/5 shadow-sm">
                  {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 leading-tight">{u.firstName} {u.lastName}</h3>
                  <p className="text-[10px] text-[#5b3d35] font-black uppercase tracking-tighter bg-[#5b3d35]/5 px-1.5 py-0.5 rounded mt-1 inline-block">
                    {u.department}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {u.status}
              </span>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center text-xs font-medium text-gray-500">
                <i className="fas fa-id-badge w-6 text-[#5b3d35]/30"></i> 
                <span className="font-black text-[#5b3d35]">#{u.id}</span>
              </div>
              <div className="flex items-center text-xs font-medium text-gray-500">
                <i className="fas fa-envelope w-6 text-[#5b3d35]/30"></i> {u.email}
              </div>
              <div className="flex items-center text-xs font-medium text-gray-500">
                <i className="fas fa-shield-halved w-6 text-[#5b3d35]/30"></i> {u.role}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {u.brands.map(b => (
                  <span key={b} className="px-2 py-0.5 bg-gray-50 text-[9px] font-black text-gray-400 rounded uppercase border border-gray-100">{b}</span>
                ))}
              </div>
              <button 
                onClick={() => handleOpenEdit(u)}
                className="text-gray-400 hover:text-[#5b3d35] transition-colors p-2"
              >
                <i className="fas fa-edit"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3e2a24]/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full overflow-hidden shadow-2xl border-t-8 border-t-[#5b3d35]">
            <form onSubmit={handleSubmit}>
              <div className="p-10">
                <h3 className="text-2xl font-black text-[#5b3d35] mb-8">
                  {editingUser ? 'Edit Employee' : 'Register New Employee'}
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-50 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#5b3d35] font-bold"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-50 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#5b3d35] font-bold"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-slate-50 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#5b3d35] font-bold"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#5b3d35] font-bold"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Role</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#5b3d35] font-bold"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                    >
                      {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employment Status</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#5b3d35] font-bold"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Authorized Brands</label>
                  <div className="flex gap-2">
                    {BRANDS.map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleBrandToggle(b)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border-2 ${
                          formData.brands?.includes(b) 
                          ? 'bg-[#5b3d35] text-white border-[#5b3d35]' 
                          : 'bg-white text-gray-400 border-gray-100 hover:border-[#5b3d35]/30'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-gray-100 flex justify-end space-x-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-black text-gray-400 uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#5b3d35] text-white px-10 py-3 rounded-2xl font-black text-xs shadow-xl shadow-[#5b3d35]/20 hover:bg-[#3e2a24] uppercase tracking-widest transition-all"
                >
                  {editingUser ? 'Update Employee' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
