
import React, { useState, useContext, useMemo } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { Plus, Trash2, Save, Wallet, Search, X, TrendingUp, ArrowUpRight, ArrowDownRight, Edit, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { LanguageContext } from '../../../App';
import { formatDate } from '../../../utils';

interface CompanyExpenseProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  userRole: string;
}

export const CompanyExpense: React.FC<CompanyExpenseProps> = ({ expenses, setExpenses, userRole }) => {
  const { lang } = useContext(LanguageContext)!;
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    category: 'Others',
    amount: 0,
    description: '',
    paymentMethod: 'Cash'
  });

  const categories: ExpenseCategory[] = ['Transport', 'Food', 'Labor', 'Salary', 'Permanent Asset', 'Event', 'Others'];
  const paymentMethods = ['Cash', 'Mobile Banking', 'Bank'];

  const openModal = (expense?: Expense) => {
    if (expense) {
      setEditingId(expense.id);
      setFormData(expense);
    } else {
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'Others',
        amount: 0,
        description: '',
        paymentMethod: 'Cash'
      });
    }
    setShowModal(true);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'VISITOR') {
      alert(lang === 'BN' ? "ভিজিটর মোডে সেভ করা সম্ভব নয়।" : "Saving is not allowed in Visitor mode.");
      return;
    }
    if (editingId) {
      setExpenses(expenses.map(exp => 
        exp.id === editingId ? { ...formData, id: editingId } as Expense : exp
      ));
    } else {
      const newExpense: Expense = {
        id: Date.now().toString(),
        date: formData.date || '',
        category: formData.category as ExpenseCategory,
        amount: formData.amount || 0,
        description: formData.description || '',
        paymentMethod: formData.paymentMethod as any
      };
      setExpenses([newExpense, ...expenses]);
    }
    setShowModal(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (userRole === 'VISITOR') {
      alert(lang === 'BN' ? "ভিজিটর মোডে মুছে ফেলা সম্ভব নয়।" : "Deleting is not allowed in Visitor mode.");
      return;
    }
    if (window.confirm(lang === 'BN' ? "আপনি কি নিশ্চিত?" : "Are you sure?")) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const totalExpense = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount), 0), [expenses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{lang === 'BN' ? 'কোম্পানি খরচ' : 'Company Expenses'}</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Operational & administrative cost tracking</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#722f37] hover:bg-[#5a252c] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-rose-900/20 flex items-center gap-2"
        >
          <Plus size={18} /> {lang === 'BN' ? 'খরচ যোগ করুন' : 'Add Expense'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-rose-50 text-[#722f37] rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Expenses</p>
            <h3 className="text-2xl font-black text-slate-900">৳{totalExpense.toLocaleString()}</h3>
          </div>
        </div>
        {/* Add more summary cards if needed */}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Category</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {expenses.map(expense => (
              <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-slate-900">{formatDate(expense.date)}</p>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[8px] font-black uppercase tracking-widest">{expense.category}</span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-slate-600">{expense.description}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    {expense.paymentMethod === 'Cash' && <Banknote size={14} className="text-emerald-500" />}
                    {expense.paymentMethod === 'Mobile Banking' && <Smartphone size={14} className="text-rose-500" />}
                    {expense.paymentMethod === 'Bank' && <CreditCard size={14} className="text-blue-500" />}
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{expense.paymentMethod}</p>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <p className="text-sm font-black text-rose-900">৳{expense.amount.toLocaleString()}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal(expense)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic text-sm font-medium">No expense records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Wallet size={24} className="text-rose-500" />
                <h2 className="text-xl font-black tracking-tight">{editingId ? (lang === 'BN' ? 'খরচ সম্পাদনা' : 'Edit Expense') : (lang === 'BN' ? 'নতুন খরচ এন্ট্রি' : 'New Expense Record')}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 transition-all font-bold text-slate-700"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 transition-all font-bold text-slate-700"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount (৳)</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 transition-all font-bold text-slate-700"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 transition-all font-bold text-slate-700 h-24 resize-none"
                  placeholder="What was this for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method as any })}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.paymentMethod === method ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full bg-[#722f37] hover:bg-[#5a252c] text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-900/20 transition-all transform active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                <Save size={20} /> {lang === 'BN' ? 'খরচ রেকর্ড করুন' : 'Record Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
