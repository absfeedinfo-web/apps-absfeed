
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Formula, RawMaterial, Product, FormulaItem } from '../types';
import { Plus, Trash2, Save, Calculator, FileText, Search, Printer } from 'lucide-react';
import { LanguageContext } from '../../../App';

interface FormulaManagerProps {
  formulas: Formula[];
  setFormulas: React.Dispatch<React.SetStateAction<Formula[]>>;
  rawMaterials: RawMaterial[];
  products: Product[];
  userRole: string;
}

export const FormulaManager: React.FC<FormulaManagerProps> = ({ formulas, setFormulas, rawMaterials, products, userRole }) => {
  const { lang, companyName } = useContext(LanguageContext)!;
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [items, setItems] = useState<FormulaItem[]>([]);

  const handlePrintFormula = (formula: Formula) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const product = products.find(p => p.code === formula.productCode);
    const totalBatchWeight = formula.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const avgProtein = totalBatchWeight > 0 
      ? (formula.items.reduce((sum, item) => sum + (Number(item.amount) * Number(item.proteinPercent || 0)), 0) / totalBatchWeight).toFixed(2)
      : 0;

    const html = `
      <html>
        <head>
          <title>Formula - ${formula.productName}</title>
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
          <div class="max-w-4xl mx-auto border-2 border-slate-200 p-10 rounded-[3rem]">
            <div class="text-center border-b-2 border-slate-900 pb-8 mb-8">
              <h1 class="text-4xl font-black text-slate-900 uppercase tracking-tighter">${companyName}</h1>
              <p class="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Quality Feed Production Formula</p>
            </div>

            <div class="flex justify-between items-start mb-10">
              <div>
                <h2 class="text-2xl font-black text-slate-900 uppercase tracking-tight">${formula.productName}</h2>
                <p class="text-rose-600 font-black uppercase text-xs">Product Code: ${formula.productCode}</p>
                <p class="text-slate-400 font-bold text-[10px] mt-1 uppercase">Formula ID: ${formula.id}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-black text-slate-400 uppercase">Last Updated</p>
                <p class="text-sm font-bold text-slate-900">${formula.lastUpdated}</p>
                <div class="mt-2 bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block">
                   Protein: ${avgProtein}% | Batch: ${totalBatchWeight} KG
                </div>
              </div>
            </div>

            <table class="w-full text-left border-collapse mb-10">
              <thead>
                <tr class="bg-slate-50 border-y-2 border-slate-900">
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Raw Material</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-center">Quantity</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-center">Protein %</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right">Percentage</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${formula.items.map((item: any) => {
                  const rm = rawMaterials.find(m => m.id === item.materialId);
                  return `
                    <tr>
                      <td class="py-4 px-4 font-black text-slate-900 uppercase text-sm">${rm?.name || item.materialId}</td>
                      <td class="py-4 px-4 text-center font-bold text-slate-700">${item.amount} KG</td>
                      <td class="py-4 px-4 text-center font-bold text-slate-700">${item.proteinPercent || 0}%</td>
                      <td class="py-4 px-4 text-right font-black text-slate-900">${((item.amount / totalBatchWeight) * 100).toFixed(2)}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot>
                <tr class="bg-slate-50 border-t-2 border-slate-900">
                  <td class="py-4 px-4 font-black text-slate-900 uppercase">Total / Average</td>
                  <td class="py-4 px-4 text-center font-black text-slate-900 text-lg">${totalBatchWeight} KG</td>
                  <td class="py-4 px-4 text-center font-black text-emerald-600 text-lg">${avgProtein}%</td>
                  <td class="py-4 px-4 text-right font-black text-slate-900 text-lg">100.00%</td>
                </tr>
              </tfoot>
            </table>

            <div class="grid grid-cols-2 gap-20 mt-20 pt-10">
              <div class="text-center">
                <div class="border-t border-slate-300 pt-2">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Production Manager</p>
                </div>
              </div>
              <div class="text-center">
                <div class="border-t-2 border-slate-900 pt-2">
                  <p class="text-[10px] font-black text-slate-900 uppercase tracking-widest">Authorized Signatory</p>
                </div>
              </div>
            </div>

            <div class="mt-20 pt-8 border-t border-slate-100 text-center">
              <p class="text-[8px] font-bold text-slate-400 uppercase tracking-[0.5em]">w w w . a b s f e e d . c o m</p>
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

  const loadFormula = useCallback((productCode: string) => {
    const formula = formulas.find(f => f.productCode === productCode);
    if (formula) {
      setItems(formula.items);
    } else {
      setItems([]);
    }
  }, [formulas]);

  // Handle product search
  useEffect(() => {
    const term = productSearch.trim().toLowerCase();
    if (term) {
      const product = products.find(p => p.code.toLowerCase() === term) || 
                     products.find(p => p.code.toLowerCase().includes(term)) ||
                     products.find(p => p.name.toLowerCase().includes(term));
      
      if (product) {
        setTimeout(() => {
          setSelectedProduct(product);
          loadFormula(product.code);
        }, 0);
      } else {
        setTimeout(() => {
          setSelectedProduct(null);
          setItems([]);
        }, 0);
      }
    } else {
      setTimeout(() => {
        setSelectedProduct(null);
        setItems([]);
      }, 0);
    }
  }, [productSearch, products, loadFormula]);

  const addMaterial = () => {
    setItems([...items, { materialId: '', amount: 0, price: 0, proteinPercent: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof FormulaItem, value: any) => {
    const newItems = [...items];
    if (field === 'materialId') {
      const material = rawMaterials.find(m => m.id === value);
      newItems[index] = {
        ...newItems[index],
        materialId: value,
        price: material?.pricePerKg || newItems[index].price || 0,
        proteinPercent: material?.proteinPercent || newItems[index].proteinPercent || 0
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalCost = items.reduce((sum, item) => sum + (Number(item.amount) * Number(item.price)), 0);
  const avgProtein = totalAmount > 0 
    ? (items.reduce((sum, item) => sum + (Number(item.amount) * Number(item.proteinPercent)), 0) / totalAmount).toFixed(2)
    : 0;

  const saveFormula = () => {
    if (userRole === 'VISITOR') {
      alert(lang === 'BN' ? "ভিজিটর মোডে সেভ করা সম্ভব নয়।" : "Saving is not allowed in Visitor mode.");
      return;
    }
    if (!selectedProduct || items.length === 0) return;
    const newFormula: Formula = {
      id: Date.now().toString(),
      productCode: selectedProduct.code,
      productName: selectedProduct.name,
      items: [...items],
      date: new Date().toLocaleDateString(),
      lastUpdated: new Date().toLocaleString()
    };
    setFormulas(prev => [newFormula, ...prev.filter(f => f.productCode !== selectedProduct.code)]);
    alert(lang === 'BN' ? 'ফর্মুলা সংরক্ষিত হয়েছে' : 'Formula Saved Successfully');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {lang === 'BN' ? 'ফর্মুলা এডিটর' : 'Formula Editor'}
            </h2>
            <div className="flex gap-2">
              <button onClick={addMaterial} className="flex items-center gap-2 px-4 py-2 bg-[#722f37] text-white rounded-xl hover:bg-[#5a252c] transition-colors font-bold text-xs uppercase tracking-widest shadow-lg shadow-rose-900/20">
                <Plus size={16} /> Add Material
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-black text-[#722f37] uppercase tracking-widest mb-2 flex items-center gap-1">
              <Search size={12} /> প্রোডাক্ট নির্বাচন করুন (Select Product)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text"
                placeholder="কোড বা নাম দিয়ে খুজুন (Search by code or name...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#722f37] transition-all font-bold text-slate-700"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#722f37] transition-all font-bold text-slate-700"
                value={selectedProduct?.code || ''}
                onChange={(e) => {
                  const p = products.find(prod => prod.code === e.target.value);
                  if (p) {
                    setSelectedProduct(p);
                    setProductSearch(p.code);
                    loadFormula(p.code);
                  }
                }}
              >
                <option value="">-- প্রোডাক্ট তালিকা (Product List) --</option>
                {products.map(p => (
                  <option key={p.code} value={p.code}>[{p.code}] {p.name}</option>
                ))}
              </select>
            </div>
            {selectedProduct && (
              <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                <span className="text-sm font-black text-emerald-800">{selectedProduct.name}</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Code: {selectedProduct.code}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Material</label>
                  <div className="relative">
                    <input 
                      type="text"
                      list="raw-materials-list"
                      placeholder="RAW MATERIALS"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-[#722f37]"
                      value={item.materialId}
                      onChange={(e) => updateItem(index, 'materialId', e.target.value)}
                    />
                    <datalist id="raw-materials-list">
                      {rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
                    </datalist>
                  </div>
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Qty (KG)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-[#722f37]"
                    value={item.amount ?? ''}
                    onChange={(e) => updateItem(index, 'amount', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price/KG</label>
                  <input 
                    type="number"
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-[#722f37]"
                    value={item.price ?? ''}
                    onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Protein %</label>
                  <input 
                    type="number"
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-1 focus:ring-[#722f37]"
                    value={item.proteinPercent ?? ''}
                    onChange={(e) => updateItem(index, 'proteinPercent', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-10 md:col-span-1 text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase mt-4">৳{(item.amount * item.price).toFixed(2)}</div>
                </div>
                <div className="col-span-2 md:col-span-1 text-right">
                  <button onClick={() => removeItem(index)} className="p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors mt-4">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                No materials added yet. Click "Add Material" to start.
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-6 w-full sm:w-auto justify-between sm:justify-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Weight</p>
                  <p className="text-lg font-black text-slate-900">{totalAmount} kg</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Protein</p>
                  <p className="text-lg font-black text-emerald-600">{avgProtein}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cost</p>
                  <p className="text-lg font-black text-[#722f37]">৳{totalCost.toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={saveFormula}
                className="w-full sm:w-auto bg-[#722f37] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-900/20 flex items-center justify-center gap-2 hover:bg-[#5a252c] transition-colors"
              >
                <Save size={18} /> {lang === 'BN' ? 'সংরক্ষণ করুন' : 'Save Formula'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
            <FileText size={20} className="text-rose-500" />
            {lang === 'BN' ? 'সংরক্ষিত ফর্মুলা' : 'Saved Formulas'}
          </h2>
          <div className="space-y-4">
            {formulas.map(f => (
              <div key={f.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group" onClick={() => { setProductSearch(f.productCode); loadFormula(f.productCode); }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-rose-400">{f.productCode}</p>
                    <h4 className="font-black text-lg leading-tight mt-1">{f.productName}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrintFormula(f); }}
                      className="p-2 text-slate-500 hover:text-blue-500 transition-colors"
                      title="Print Formula"
                    >
                      <Printer size={18} />
                    </button>
                    <Calculator size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                  <span>Items: {f.items.length}</span>
                  <span>Updated: {f.date}</span>
                </div>
              </div>
            ))}
            {formulas.length === 0 && (
              <div className="text-center py-12 text-slate-500 italic text-sm">No formulas saved yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
