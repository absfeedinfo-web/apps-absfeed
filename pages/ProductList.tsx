
import React, { useState, useContext } from 'react';
import { Product } from '../types';
import { Search, Filter, Plus, Edit2, Trash2, X, Package, Tag, TrendingUp, DollarSign, BarChart2, BrainCircuit, Printer } from 'lucide-react';
import { LanguageContext } from '../App';

interface ProductListProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onAnalyze?: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, setProducts, onAnalyze }) => {
  const { t, lang, role, companyName } = useContext(LanguageContext)!;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    name: '',
    category: 'Poultry Feed',
    bagSize: '50 kg',
    status: 'Active',
    unit: 'Bag',
    stock: 0,
    mrpPrice: 0,
    tpPrice: 0,
    spPrice: 0,
    purchasePrice: 0
  });

  const categories = ['All', 'Poultry Feed', 'Fish Feed', 'Cattle Feed'];

  const handleOpenModal = (p?: Product) => {
    if (role === 'VISITOR') return;
    if (p) {
      setEditingProduct(p);
      setFormData(p);
    } else {
      setEditingProduct(null);
      setFormData({
        code: '', name: '', category: 'Poultry Feed', unit: 'Bag', bagSize: '50 kg',
        purchasePrice: 0, tpPrice: 0, mrpPrice: 0, spPrice: 0, stock: 0, status: 'Active'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (role === 'VISITOR') return;
    e.preventDefault();
    if (!formData.code || !formData.name) return;

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.code === editingProduct.code ? { ...p, ...formData as Product } : p));
    } else {
      if (products.some(p => p.code === formData.code)) {
        alert(lang === 'BN' ? "এই কোডটি ইতিমধ্যে ব্যবহৃত হয়েছে" : "Code already exists");
        return;
      }
      setProducts(prev => [...prev, formData as Product]);
    }
    setShowModal(false);
  };

  const handleDelete = (code: string) => {
    if (role === 'VISITOR') return;
    if (window.confirm(lang === 'BN' ? 'আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.code !== code));
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.includes(searchTerm);
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Product List - ${companyName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .no-print { display: none; }
              body { padding: 0; margin: 0; }
            }
            body { font-family: 'Inter', sans-serif; }
          </style>
        </head>
        <body class="p-10">
          <div class="max-w-6xl mx-auto">
            <div class="border-b-4 border-[#722f37] pb-6 text-center mb-8 relative">
              <div class="flex justify-between items-start">
                <div class="w-20 h-20 bg-[#722f37] rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                  <span class="text-2xl font-black italic">ABS</span>
                </div>
                <div class="flex-1 text-center px-4">
                  <h1 class="text-4xl font-black text-[#722f37] uppercase leading-none tracking-tighter">${companyName}</h1>
                  <p class="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">(A Sister Concern of AHYAN GROUP)</p>
                  
                  <div class="grid grid-cols-2 gap-8 text-[9px] mt-4 font-bold text-slate-500 text-left">
                    <div class="border-l-2 border-slate-200 pl-4">
                      <p class="font-black text-[#722f37] uppercase text-[10px] mb-1">Head Office:</p>
                      <p>House No. 12 (4th floor), Road No. 25, Sector-07, Uttara, Dhaka-1230</p>
                      <p>Email: absfeed.info@gmail.com | Phone: +8809638-201686</p>
                    </div>
                    <div class="text-right border-r-2 border-slate-200 pr-4">
                      <p class="font-black text-[#722f37] uppercase text-[10px] mb-1">Regional Office:</p>
                      <p>Ahyan City, Bagerdanga, Fultola, Khulna-9210</p>
                      <p>Phone: +8801918-594466 | Web: www.absfeed.com</p>
                    </div>
                  </div>
                </div>
                <div class="w-20 h-20 opacity-0 shrink-0"></div>
              </div>

              <div class="mt-8 flex justify-center">
                <div class="bg-slate-900 text-white px-10 py-2.5 rounded-full text-[12px] font-black uppercase tracking-[0.4em] shadow-xl border-2 border-white/20">
                  INVENTORY & STOCK STATUS REPORT
                </div>
              </div>
              <p class="text-slate-400 text-[10px] font-bold mt-3 uppercase tracking-widest">Report Date: ${new Date().toLocaleString()}</p>
            </div>

            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-900 text-white">
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Code</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Product Name</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right">Cost</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right">Trade (TP)</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-center">Stock</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right">Total Value</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${filtered.map(p => `
                  <tr>
                    <td class="py-4 px-4 font-black text-[#722f37] text-xs">${p.code}</td>
                    <td class="py-4 px-4">
                      <div class="text-xs font-black text-slate-900 uppercase">${p.name}</div>
                      <div class="text-[8px] font-bold text-slate-400 uppercase">${p.category} • ${p.bagSize}</div>
                    </td>
                    <td class="py-4 px-4 text-right font-bold text-slate-600 text-xs">৳${p.purchasePrice.toLocaleString()}</td>
                    <td class="py-4 px-4 text-right font-black text-slate-900 text-xs">৳${p.tpPrice.toLocaleString()}</td>
                    <td class="py-4 px-4 text-center font-black text-slate-900 text-xs">${p.stock} Bag</td>
                    <td class="py-4 px-4 text-right font-black text-[#722f37] text-xs">৳${(p.stock * p.purchasePrice).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot class="border-t-4 border-slate-900">
                <tr class="bg-slate-50">
                  <td colspan="5" class="py-6 px-4 text-right font-black text-slate-900 uppercase text-xs">Grand Total Inventory Value</td>
                  <td class="py-6 px-4 text-right font-black text-[#722f37] text-lg">৳${filtered.reduce((s, p) => s + (p.stock * p.purchasePrice), 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div class="grid grid-cols-3 gap-10 mt-20 pt-10">
              <div class="text-center">
                <div class="border-t border-slate-300 pt-2">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Keeper</p>
                </div>
              </div>
              <div class="text-center">
                <div class="border-t border-slate-300 pt-2">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accounts Dept</p>
                </div>
              </div>
              <div class="text-center">
                <div class="border-t-2 border-slate-900 pt-2">
                  <p class="text-[10px] font-black text-slate-900 uppercase tracking-widest">Managing Director</p>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{lang === 'BN' ? 'পণ্য ও ইনভেন্টরি' : 'Inventory & Pricing'}</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Grains, Feed & Stock Analysis</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-sm hover:bg-slate-200 transition-all active:scale-95 text-sm uppercase tracking-widest no-print"
          >
            <Printer size={20} /> {lang === 'BN' ? 'প্রিন্ট' : 'Print'}
          </button>
          <button 
            onClick={onAnalyze}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95 text-sm uppercase tracking-widest"
          >
            <BrainCircuit size={20} /> {t('smartAnalysis')}
          </button>
          {role === 'ADMIN' && (
            <button 
              onClick={() => handleOpenModal()}
              className="bg-[#722f37] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-rose-900/20 hover:bg-[#5a252c] transition-all active:scale-95 text-sm uppercase tracking-widest"
            >
              <Plus size={20} /> {lang === 'BN' ? 'নতুন পণ্য' : 'Add Product'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm col-span-2">
           <div className="relative">
             <input 
               type="text" 
               placeholder={lang === 'BN' ? "কোড বা নাম দিয়ে খুজুন..." : "Search by code or name..."} 
               className="w-full pl-12 pr-4 py-3 border-none rounded-xl outline-none bg-slate-50 font-bold text-slate-700"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search className="absolute left-4 top-3.5 text-slate-300" size={20} />
           </div>
        </div>
        <select 
          className="w-full border border-slate-100 rounded-3xl px-6 py-4 bg-white font-black text-slate-600 outline-none uppercase text-[10px] tracking-widest shadow-sm"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <div className="bg-[#722f37] p-5 rounded-3xl text-white flex items-center justify-between shadow-xl">
           <div>
              <p className="text-[8px] font-black uppercase opacity-60 tracking-widest">Total Inventory Value</p>
              <p className="text-lg font-black leading-none">৳{products.reduce((s,p)=>s+(p.stock*p.purchasePrice), 0).toLocaleString()}</p>
           </div>
           <DollarSign size={20} className="text-rose-300 opacity-40" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
                <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Cost</th>
                <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Trade (TP)</th>
                <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Profit Margin</th>
                <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total Value</th>
                <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => {
                const margin = product.purchasePrice > 0 ? ((product.tpPrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(1) : '0';
                return (
                  <tr key={product.code} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-6">
                      <span className="font-black text-[#722f37] bg-rose-50 px-2 py-1 rounded text-[10px] border border-rose-100">{product.code}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-xs font-black text-slate-900 uppercase">{product.name}</div>
                      <div className="flex items-center gap-2 mt-1 opacity-60">
                        <Tag size={10} className="text-slate-400" />
                        <span className="text-[8px] font-black text-slate-500 uppercase">{product.category} • {product.bagSize}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[11px] font-bold text-slate-400 text-right">৳{product.purchasePrice.toLocaleString()}</td>
                    <td className="px-6 py-6 text-[11px] font-black text-slate-900 text-right">৳{product.tpPrice.toLocaleString()}</td>
                    <td className="px-6 py-6 text-right">
                      <div className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <TrendingUp size={10} /> {margin}%
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className={`text-[11px] font-black ${product.stock < 20 ? 'text-rose-600 bg-rose-50' : 'text-slate-900 bg-slate-50'} inline-block px-2 py-1 rounded-lg border border-slate-200/50 min-w-[50px]`}>
                        {product.stock} Bag
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[11px] font-black text-[#722f37] text-right">
                       ৳{(product.stock * product.purchasePrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center gap-2">
                        {role === 'ADMIN' ? (
                          <>
                            <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-[#722f37] transition-all"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(product.code)} className="p-2 text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={16} /></button>
                          </>
                        ) : (
                          <div className="text-[8px] font-black text-slate-300 uppercase">ReadOnly</div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#722f37] rounded-2xl shadow-xl">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{editingProduct ? (lang === 'BN' ? 'পণ্য সংশোধন' : 'Edit Product') : (lang === 'BN' ? 'নতুন পণ্য যোগ' : 'Add New Product')}</h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Configure item specifications</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <form className="p-10 space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'পণ্য কোড' : 'Product Code'}</label>
                  <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'পণ্যের নাম' : 'Product Name'}</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700">
                    {categories.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bag Size</label>
                  <input type="text" value={formData.bagSize} onChange={e => setFormData({...formData, bagSize: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700" placeholder="50 kg" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cost Price</label>
                  <input type="number" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700 text-center" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Trade Price (TP)</label>
                  <input type="number" value={formData.tpPrice} onChange={e => setFormData({...formData, tpPrice: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700 text-center" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">MRP Price</label>
                  <input type="number" value={formData.mrpPrice} onChange={e => setFormData({...formData, mrpPrice: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700 text-center" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Special (SP)</label>
                  <input type="number" value={formData.spPrice} onChange={e => setFormData({...formData, spPrice: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-600 text-center" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opening Stock (Bags)</label>
                <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-700" />
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-2xl transition-all active:scale-95 uppercase text-[10px] tracking-widest">{t('cancel')}</button>
                <button type="submit" className="flex-1 bg-[#722f37] text-white font-black py-5 rounded-2xl transition-all active:scale-95 shadow-xl shadow-rose-900/20 uppercase text-[10px] tracking-widest">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
