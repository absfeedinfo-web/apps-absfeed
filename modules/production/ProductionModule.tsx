
import React, { useState, useEffect } from 'react';
import { ProductionSheet } from './components/ProductionSheet';
import { CompanyExpense } from './components/CompanyExpense';
import { FormulaManager } from './components/FormulaManager';
import RawMaterialsList from './components/RawMaterialsList';
import { ProductionEntry, Expense, RawMaterial, Product, Formula } from './types';
import { RAW_MATERIALS as INITIAL_MATERIALS, PRODUCTS as INITIAL_PRODUCTS } from './constants';
import { LayoutDashboard, ClipboardList, TrendingUp, Wallet, Settings, Database } from 'lucide-react';

interface ProductionModuleProps {
  userRole: 'ADMIN' | 'SALES' | 'ACCOUNTS' | 'VISITOR' | 'CUSTOMER' | 'OFFICER';
  products: any[]; // Using any[] to avoid type conflicts between root and module types
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
}

export const ProductionModule: React.FC<ProductionModuleProps> = ({ userRole, products: appProducts, setProducts }) => {
  const [activeTab, setActiveTab] = useState<'sheet' | 'dashboard' | 'expense' | 'formula' | 'raw_materials'>('sheet');
  const [entries, setEntries] = useState<ProductionEntry[]>(() => {
    const saved = localStorage.getItem('abs_production_data');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('abs_expense_data');
    return saved ? JSON.parse(saved) : [];
  });
  const [formulas, setFormulas] = useState<Formula[]>(() => {
    const saved = localStorage.getItem('abs_formulas');
    return saved ? JSON.parse(saved) : [];
  });
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    const saved = localStorage.getItem('abs_raw_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  // Map app products to production module products if needed
  const products: Product[] = appProducts.map(p => ({
    code: p.code,
    name: p.name,
    bagSize: typeof p.bagSize === 'number' ? p.bagSize : Number(p.bagSize?.replace(/[^0-9.]/g, '') || 50),
    protein: p.protein || '0%',
    category: (p.category === 'Poultry' || p.category === 'Fish' || p.category === 'Cattle') ? p.category : 'Poultry'
  }));

  // Persistence Logic
  useEffect(() => {
    localStorage.setItem('abs_production_data', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('abs_expense_data', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('abs_formulas', JSON.stringify(formulas));
  }, [formulas]);

  useEffect(() => {
    localStorage.setItem('abs_raw_materials', JSON.stringify(rawMaterials));
  }, [rawMaterials]);

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalProductionValue = entries.reduce((sum, entry) => sum + entry.totalValue, 0);
  const totalRMStockValue = rawMaterials.reduce((sum, rm) => sum + (rm.totalValue || 0), 0);

  const today = new Date().toISOString().split('T')[0];
  const todayProduction = entries.filter(e => e.date === today).reduce((sum, e) => sum + e.totalValue, 0);
  const todayExpense = expenses.filter(e => e.date === today).reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="flex flex-col bg-stone-50 text-stone-900 w-full h-full min-h-[calc(100vh-120px)]">
      {/* Module Navigation */}
      <nav className="flex bg-slate-900 text-white p-2 gap-2 overflow-x-auto shrink-0 no-print">
        <button 
          onClick={() => setActiveTab('sheet')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'sheet' ? 'bg-[#722f37] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <ClipboardList size={16} /> Production
        </button>
        <button 
          onClick={() => setActiveTab('expense')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'expense' ? 'bg-[#722f37] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <Wallet size={16} /> Expenses
        </button>
        <button 
          onClick={() => setActiveTab('formula')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'formula' ? 'bg-[#722f37] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <Settings size={16} /> Formulas
        </button>
        <button 
          onClick={() => setActiveTab('raw_materials')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'raw_materials' ? 'bg-[#722f37] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <Database size={16} /> Raw Materials
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-[#722f37] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <LayoutDashboard size={16} /> Dashboard
        </button>
      </nav>

      <div className="p-6 md:p-10 flex-1 overflow-auto">
        {activeTab === 'sheet' && (
          <ProductionSheet 
            entries={entries} 
            setEntries={setEntries} 
            products={products} 
            formulas={formulas}
            rawMaterials={rawMaterials}
            setRawMaterials={setRawMaterials}
            userRole={userRole}
            setAppProducts={setProducts}
          />
        )}
        {activeTab === 'expense' && (
          <CompanyExpense 
            expenses={expenses} 
            setExpenses={setExpenses} 
            userRole={userRole}
          />
        )}
        {activeTab === 'formula' && (
          <FormulaManager 
            formulas={formulas} 
            setFormulas={setFormulas} 
            rawMaterials={rawMaterials} 
            products={products} 
            userRole={userRole}
          />
        )}
        {activeTab === 'raw_materials' && (
          <RawMaterialsList 
            rawMaterials={rawMaterials} 
            setRawMaterials={setRawMaterials} 
            userRole={userRole}
          />
        )}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Production Analytics</h2>
              <div className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Last Updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Production Value</p>
                <p className="text-3xl font-black text-emerald-600 font-mono">৳{totalProductionValue.toLocaleString()}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Today:</span>
                  <span className="text-sm font-black text-emerald-600">৳{todayProduction.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-rose-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Company Expense</p>
                <p className="text-3xl font-black text-rose-600 font-mono">৳{totalExpense.toLocaleString()}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Today:</span>
                  <span className="text-sm font-black text-rose-600">৳{todayExpense.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">RM Stock Value</p>
                <p className="text-3xl font-black text-blue-600 font-mono">৳{totalRMStockValue.toLocaleString()}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Items:</span>
                  <span className="text-sm font-black text-blue-600">{rawMaterials.length} Items</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
