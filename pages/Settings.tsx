
import React, { useState, useContext } from 'react';
import { User, UserRole, Customer, Officer } from '../types';
import { Save, Trash2, UserPlus, Shield, User as UserIcon, Key, Search, X } from 'lucide-react';
import { LanguageContext } from '../App';

interface SettingsProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  customers: Customer[];
  officers: Officer[];
  role: string;
}

const Settings: React.FC<SettingsProps> = ({ users, setUsers, customers, officers, role }) => {
  const { lang, t } = useContext(LanguageContext)!;
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    id: '',
    role: UserRole.CUSTOMER,
    username: '',
    password: '',
    name: ''
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'VISITOR') {
      alert(lang === 'BN' ? "ভিজিটর মোডে সেভ করা সম্ভব নয়।" : "Saving is not allowed in Visitor mode.");
      return;
    }
    if (!formData.username || !formData.password || !formData.id) return;

    const newUser: User = {
      id: formData.id,
      username: formData.username,
      password: formData.password,
      role: formData.role as UserRole,
      name: formData.name || ''
    };

    setUsers(prev => [...prev, newUser]);
    setShowModal(false);
    setFormData({ role: UserRole.CUSTOMER, username: '', password: '', name: '' });
  };

  const deleteUser = (id: string) => {
    if (role === 'VISITOR') {
      alert(lang === 'BN' ? "ভিজিটর মোডে মুছে ফেলা সম্ভব নয়।" : "Deleting is not allowed in Visitor mode.");
      return;
    }
    if (confirm(lang === 'BN' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{lang === 'BN' ? 'সেটিংস ও ইউজার ম্যানেজমেন্ট' : 'Settings & User Management'}</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configure access control and credentials</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#722f37] hover:bg-[#5a252c] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-rose-900/20 flex items-center gap-2"
        >
          <UserPlus size={18} /> {lang === 'BN' ? 'নতুন ইউজার' : 'Add User'}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User / ID</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-slate-900">{user.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {user.id}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <UserIcon size={14} className="text-slate-300" />
                    <span className="text-sm font-bold text-slate-600">{user.username}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    user.role === UserRole.ADMIN ? 'bg-rose-100 text-[#722f37]' :
                    user.role === UserRole.OFFICER ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Shield size={24} className="text-rose-500" />
                <h2 className="text-xl font-black tracking-tight">{lang === 'BN' ? 'নতুন ইউজার যোগ করুন' : 'Create New User'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 transition-all font-bold text-slate-700"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole, id: '', name: '' })}
                >
                  <option value={UserRole.CUSTOMER}>Dealer / Customer</option>
                  <option value={UserRole.OFFICER}>Sales Officer</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {formData.role === UserRole.CUSTOMER ? 'Select Dealer' : formData.role === UserRole.OFFICER ? 'Select Officer' : 'User Name'}
                </label>
                {formData.role === UserRole.ADMIN ? (
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 transition-all font-bold text-slate-700"
                    placeholder="Admin Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, id: 'admin-' + Date.now() })}
                    required
                  />
                ) : (
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 transition-all font-bold text-slate-700"
                    value={formData.id}
                    onChange={(e) => {
                      const id = e.target.value;
                      const name = formData.role === UserRole.CUSTOMER 
                        ? customers.find(c => c.id === id)?.name 
                        : officers.find(o => o.id === id)?.name;
                      setFormData({ ...formData, id, name });
                    }}
                    required
                  >
                    <option value="">Select...</option>
                    {formData.role === UserRole.CUSTOMER ? (
                      customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)
                    ) : (
                      officers.map(o => <option key={o.id} value={o.id}>{o.name} ({o.id})</option>)
                    )}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Username</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 transition-all font-bold text-slate-700"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                  <input 
                    type="password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 transition-all font-bold text-slate-700"
                    placeholder="••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button className="w-full bg-[#722f37] hover:bg-[#5a252c] text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-900/20 transition-all transform active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                <Save size={20} /> {lang === 'BN' ? 'ইউজার তৈরি করুন' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
