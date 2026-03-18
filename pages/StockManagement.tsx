
import React, { useState, useContext } from 'react';
import { Product } from '../types';
import { PlusCircle, MinusCircle, History, PackageCheck, AlertTriangle, Hash, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import { LanguageContext } from '../App';

interface StockManagementProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const StockManagement: React.FC<StockManagementProps> = ({ products, setProducts }) => {
  const { role, t } = useContext(LanguageContext)!;
  const [selectedProductCode, setSelectedProductCode] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [batchNumber, setBatchNumber] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'IN' | 'OUT'>('IN');

  const selectedProduct = products.find(p => p.code === selectedProductCode);

  const handleAdjust = () => {
    if (role === 'VISITOR') return;
    if (!selectedProductCode || quantity <= 0) {
      alert("Invalid selection or quantity");
      return;
    }

    setProducts(prev => prev.map(p => {
      if (p.code === selectedProductCode) {
        const newStock = adjustmentType === 'IN' ? p.stock + quantity : p.stock - quantity;
        if (newStock < 0) {
          alert("Insufficient stock for deduction!");
          return p;
        }
        return { ...p, stock: newStock };
      }
      return p;
    }));

    alert(`Stock adjusted for ${selectedProduct?.name}${batchNumber ? ` (Batch: ${batchNumber})` : ''}`);
    setQuantity(0);
    setBatchNumber('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#722f37] rounded-2xl text-white shadow-xl shadow-rose-900/20">
            <PackageCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gudam / Inventory Control</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Manual Stock Loads & Adjustments</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h3 className="font-black text-slate-800 mb-8 uppercase text-[10px] tracking-[0.2em] border-b pb-4">
              Adjustment Entry
            </h3>
            {role === 'ADMIN' ? (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Product</label>
                  <select 
                    className="w-full mt-2 border rounded-2xl p-4 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#722f37] transition-all"
                    value={selectedProductCode}
                    onChange={(e) => setSelectedProductCode(e.target.value)}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(p => (
                      <option key={p.code} value={p.code}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                      <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Current Stock</p>
                      <p className="text-xl font-black text-[#722f37]">{selectedProduct.stock} {selectedProduct.unit}s</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Category</p>
                      <p className="text-xs font-black text-slate-600 truncate uppercase mt-1">{selectedProduct.category}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch / Lot Number</label>
                  <div className="relative mt-2">
                    <Hash className="absolute left-4 top-4 text-slate-300" size={18} />
                    <input 
                      type="text"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      className="w-full border rounded-2xl p-4 pl-12 font-bold text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-[#722f37]"
                      placeholder="e.g. LOT-2024-01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setAdjustmentType('IN')}
                    className={`flex flex-col items-center justify-center p-5 rounded-3xl font-black transition-all border ${adjustmentType === 'IN' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-600/20 scale-105' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-emerald-200'}`}
                  >
                    <PlusCircle size={24} className="mb-2" />
                    <span className="text-[10px] uppercase tracking-widest">Stock In</span>
                  </button>
                  <button 
                    onClick={() => setAdjustmentType('OUT')}
                    className={`flex flex-col items-center justify-center p-5 rounded-3xl font-black transition-all border ${adjustmentType === 'OUT' ? 'bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-600/20 scale-105' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-rose-200'}`}
                  >
                    <MinusCircle size={24} className="mb-2" />
                    <span className="text-[10px] uppercase tracking-widest">Stock Out</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity (Bags)</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full mt-2 border rounded-2xl p-4 text-2xl font-black outline-none focus:ring-2 focus:ring-[#722f37] bg-slate-50 text-center"
                    placeholder="0"
                  />
                </div>

                <button 
                  onClick={handleAdjust}
                  disabled={!selectedProduct}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] hover:bg-black disabled:opacity-30 transition-all shadow-xl active:scale-95 uppercase text-xs tracking-[0.2em]"
                >
                  Execute Adjustment
                </button>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                 <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                    <Eye size={32} />
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed px-6">
                    Adjustments are disabled in Visitor Mode.<br/>Contact admin for stock entry.
                 </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 min-h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Inventory Status List</h3>
                <p className="text-slate-400 text-[10px] font-bold mt-1">Real-time health of all product stock</p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100 uppercase tracking-widest">
                  <AlertTriangle size={12} /> {products.filter(p => p.stock < 20).length} Critical
                </span>
                <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                  <History size={12} /> Live Sync
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.code} className={`p-5 rounded-[2rem] border transition-all flex justify-between items-center group ${p.stock < 20 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">#{p.code}</p>
                    <p className="font-black text-slate-800 text-sm truncate w-40 group-hover:text-[#722f37] transition-colors">{p.name}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 italic">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black ${p.stock < 20 ? 'text-rose-600' : 'text-slate-900'}`}>{p.stock}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Bags</p>
                    {p.stock < 20 && (
                      <span className="inline-block mt-2 bg-rose-600 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase animate-pulse">Low</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
