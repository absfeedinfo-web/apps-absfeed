
import React, { useState, useContext, useEffect } from 'react';
import { ProductionEntry, Product, Formula, RawMaterial, FormulaItem } from '../types';
import { ClipboardList, Download, Printer, Plus, Search, Trash2, Edit, Save, X, Eye } from 'lucide-react';
import { LanguageContext } from '../../../App';

interface ProductionSheetProps {
  entries: ProductionEntry[];
  setEntries: React.Dispatch<React.SetStateAction<ProductionEntry[]>>;
  products: Product[];
  formulas: Formula[];
  rawMaterials: RawMaterial[];
  setRawMaterials: React.Dispatch<React.SetStateAction<RawMaterial[]>>;
  userRole: string;
  setAppProducts: React.Dispatch<React.SetStateAction<any[]>>;
}

export const ProductionSheet: React.FC<ProductionSheetProps> = ({ entries, setEntries, products, formulas, rawMaterials, setRawMaterials, userRole, setAppProducts }) => {
  const { lang, companyName } = useContext(LanguageContext)!;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [viewingBreakdown, setViewingBreakdown] = useState<ProductionEntry | null>(null);

  const handlePrintFullHistory = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Production History - ${companyName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
          </style>
        </head>
        <body>
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
                PRODUCTION HISTORY REPORT
              </div>
            </div>
            <p class="text-slate-400 text-[10px] font-bold mt-3 uppercase tracking-widest">Report Date: ${new Date().toLocaleString()}</p>
          </div>

          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-900 text-white">
                <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Date</th>
                <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Batch No</th>
                <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Product</th>
                <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-center">Bags</th>
                <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right">KG Rate</th>
                <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right">Total Value</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${entries.map(entry => `
                <tr>
                  <td class="py-4 px-4 text-xs font-bold">${entry.date}</td>
                  <td class="py-4 px-4 text-xs font-black">${entry.batchNo}</td>
                  <td class="py-4 px-4">
                    <div class="text-xs font-black text-slate-900 uppercase">${entry.productName}</div>
                    <div class="text-[8px] font-bold text-slate-400 uppercase">CODE: ${entry.productCode}</div>
                  </td>
                  <td class="py-4 px-4 text-center text-xs font-black">${entry.bags} Bags</td>
                  <td class="py-4 px-4 text-right text-xs font-black text-emerald-600">৳${entry.kgValue.toFixed(2)}</td>
                  <td class="py-4 px-4 text-right text-xs font-black text-emerald-600">৳${entry.totalValue.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot class="border-t-4 border-slate-900">
              <tr class="bg-slate-50">
                <td colspan="5" class="py-6 px-4 text-right font-black text-slate-900 uppercase text-xs">Total Production Value</td>
                <td class="py-6 px-4 text-right font-black text-[#722f37] text-lg">৳${entries.reduce((sum, e) => sum + e.totalValue, 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div class="grid grid-cols-3 gap-10 mt-20 pt-10">
            <div class="text-center">
              <div class="border-t border-slate-300 pt-2">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Production Manager</p>
              </div>
            </div>
            <div class="text-center">
              <div class="border-t border-slate-300 pt-2">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accounts Dept</p>
              </div>
            </div>
            <div class="text-center">
              <div class="border-t-2 border-slate-900 pt-2">
                <p class="text-[10px] font-black text-slate-900 uppercase tracking-widest">Authorized Signatory</p>
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
  
  const [formData, setFormData] = useState<ProductionEntry>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    batchNo: '',
    productCode: '',
    productName: '',
    partyName: '',
    bags: 0,
    totalKgs: 0,
    transportMill: 0,
    transportBuyerDepot: 0,
    bagCardCost: 0,
    millingCharge: 0,
    laborCost: 0,
    commission: 0,
    bakshish: 0,
    additionalCost: 0,
    formula: [],
    totalValue: 0
  });

  // Handle product search
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const product = products.find(p => p.code.toLowerCase() === term) || 
                     products.find(p => p.code.toLowerCase().includes(term)) ||
                     products.find(p => p.name.toLowerCase().includes(term));
      
      if (product) {
        setTimeout(() => {
          setSelectedProduct(product);
          setFormData(prev => ({ ...prev, productCode: product.code }));
          
          // Auto-load formula if exists
          const formula = formulas.find(f => f.productCode === product.code);
          if (formula) {
            setFormData(prev => ({ ...prev, formula: formula.items }));
          }
        }, 0);
      } else {
        setTimeout(() => setSelectedProduct(null), 0);
      }
    } else {
      setTimeout(() => setSelectedProduct(null), 0);
    }
  }, [searchTerm, products, formulas]);

  // Auto-calculate total KGs when bags change
  useEffect(() => {
    const bags = formData.bags || 0;
    const bagSize = selectedProduct?.bagSize || 0;
    const calculatedTotal = bags * bagSize;
    
    if (formData.totalKgs !== calculatedTotal) {
      setTimeout(() => {
        setFormData(prev => ({ ...prev, totalKgs: calculatedTotal }));
      }, 0);
    }
  }, [formData.bags, selectedProduct, formData.totalKgs]);

  const handleChargeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleAddRawMaterial = () => {
    setFormData(prev => ({
      ...prev,
      formula: [...(prev.formula || []), { materialId: '', amount: 0, price: 0, proteinPercent: 0 }]
    }));
  };

  const handleRemoveRawMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      formula: prev.formula?.filter((_, i) => i !== index)
    }));
  };

  const handleRawMaterialChange = (index: number, field: keyof FormulaItem, value: any) => {
    setFormData(prev => {
      const newFormula = [...(prev.formula || [])];
      newFormula[index] = { ...newFormula[index], [field]: value };
      
      // Auto-fill price if material is selected
      if (field === 'materialId') {
        const material = rawMaterials.find(rm => rm.id === value);
        if (material) {
          newFormula[index].price = material.pricePerKg || 0;
          newFormula[index].proteinPercent = material.proteinPercent || 0;
        }
      }
      
      return { ...prev, formula: newFormula };
    });
  };

  const calculateTotalValue = () => {
    const rmCost = formData.formula?.reduce((sum, item) => sum + (item.amount * item.price), 0) || 0;
    const otherCosts = (formData.transportMill || 0) + 
                       (formData.transportBuyerDepot || 0) + 
                       (formData.bagCardCost || 0) + 
                       (formData.millingCharge || 0) + 
                       (formData.laborCost || 0) + 
                       (formData.commission || 0) + 
                       (formData.bakshish || 0) + 
                       (formData.additionalCost || 0);
    return rmCost + otherCosts;
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'VISITOR') {
      alert(lang === 'BN' ? "ভিজিটর মোডে সেভ করা সম্ভব নয়।" : "Saving is not allowed in Visitor mode.");
      return;
    }
    if (!selectedProduct) {
      alert('Please select a valid product.');
      return;
    }

    const totalValue = calculateTotalValue();
    const totalKgs = formData.totalKgs || 0;

    const newEntry: ProductionEntry = {
      id: editingEntryId || Date.now().toString(),
      batchNo: formData.batchNo || '',
      date: formData.date || '',
      productCode: formData.productCode || '',
      productName: selectedProduct.name,
      partyName: formData.partyName || '',
      bags: formData.bags || 0,
      totalKgs,
      transportMill: formData.transportMill || 0,
      transportBuyerDepot: formData.transportBuyerDepot || 0,
      bagCardCost: formData.bagCardCost || 0,
      millingCharge: formData.millingCharge || 0,
      laborCost: formData.laborCost || 0,
      commission: formData.commission || 0,
      bakshish: formData.bakshish || 0,
      additionalCost: formData.additionalCost || 0,
      totalValue,
      formula: formData.formula || [],
      kgValue: totalKgs > 0 ? totalValue / totalKgs : 0
    };

    // Update Raw Material Stock
    const updatedRM = [...rawMaterials];
    
    // 1. Restore old production effects if editing
    if (editingEntryId) {
      const oldEntry = entries.find(e => e.id === editingEntryId);
      if (oldEntry) {
        // Restore RM stock
        oldEntry.formula.forEach(item => {
          const rmIndex = updatedRM.findIndex(rm => rm.id === item.materialId);
          if (rmIndex !== -1) {
            const newStock = (updatedRM[rmIndex].stock || 0) + item.amount;
            updatedRM[rmIndex] = {
              ...updatedRM[rmIndex],
              stock: newStock,
              totalValue: newStock * (updatedRM[rmIndex].pricePerKg || 0)
            };
          }
        });
      }
    }

    // 2. Apply new production effects
    newEntry.formula.forEach(item => {
      const rmIndex = updatedRM.findIndex(rm => rm.id === item.materialId);
      if (rmIndex !== -1) {
        const newStock = (updatedRM[rmIndex].stock || 0) - item.amount;
        updatedRM[rmIndex] = {
          ...updatedRM[rmIndex],
          stock: newStock,
          totalValue: newStock * (updatedRM[rmIndex].pricePerKg || 0)
        };
      }
    });

    setRawMaterials(updatedRM);

    // Update Finished Goods Stock (App Products)
    setAppProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      
      if (editingEntryId) {
        const oldEntry = entries.find(e => e.id === editingEntryId);
        if (oldEntry) {
          const pIndex = updatedProducts.findIndex(p => p.code === oldEntry.productCode);
          if (pIndex !== -1) {
            updatedProducts[pIndex] = {
              ...updatedProducts[pIndex],
              stock: (updatedProducts[pIndex].stock || 0) - oldEntry.bags
            };
          }
        }
      }

      const pIndex = updatedProducts.findIndex(p => p.code === newEntry.productCode);
      if (pIndex !== -1) {
        updatedProducts[pIndex] = {
          ...updatedProducts[pIndex],
          stock: (updatedProducts[pIndex].stock || 0) + newEntry.bags
        };
      }

      return updatedProducts;
    });

    if (editingEntryId) {
      setEntries(entries.map(e => e.id === editingEntryId ? newEntry : e));
      setEditingEntryId(null);
    } else {
      setEntries([newEntry, ...entries]);
    }
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      batchNo: '',
      productCode: '',
      partyName: '',
      bags: 0,
      totalKgs: 0,
      transportMill: 0,
      transportBuyerDepot: 0,
      bagCardCost: 0,
      millingCharge: 0,
      laborCost: 0,
      commission: 0,
      bakshish: 0,
      additionalCost: 0,
      formula: []
    });
    setSearchTerm('');
    setSelectedProduct(null);
  };

  const handleDelete = (id: string) => {
    if (userRole === 'VISITOR') {
      alert(lang === 'BN' ? "ভিজিটর মোডে মুছে ফেলা সম্ভব নয়।" : "Deleting is not allowed in Visitor mode.");
      return;
    }
    if (confirm('Are you sure you want to delete this production entry?')) {
      const entryToDelete = entries.find(e => e.id === id);
      if (entryToDelete) {
        // Update RM Stock
        const updatedRM = [...rawMaterials];
        entryToDelete.formula.forEach(item => {
          const rmIndex = updatedRM.findIndex(rm => rm.id === item.materialId);
          if (rmIndex !== -1) {
            const newStock = (updatedRM[rmIndex].stock || 0) + item.amount;
            updatedRM[rmIndex] = {
              ...updatedRM[rmIndex],
              stock: newStock,
              totalValue: newStock * (updatedRM[rmIndex].pricePerKg || 0)
            };
          }
        });
        setRawMaterials(updatedRM);
        
        // Update Product Stock
        setAppProducts(prevProducts => {
          const updatedProducts = [...prevProducts];
          const pIndex = updatedProducts.findIndex(p => p.code === entryToDelete.productCode);
          if (pIndex !== -1) {
            updatedProducts[pIndex] = {
              ...updatedProducts[pIndex],
              stock: (updatedProducts[pIndex].stock || 0) - entryToDelete.bags
            };
          }
          return updatedProducts;
        });
      }
      setEntries(entries.filter(e => e.id !== id));
      if (editingEntryId === id) {
        setEditingEntryId(null);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          batchNo: '',
          productCode: '',
          partyName: '',
          bags: 0,
          totalKgs: 0,
          transportMill: 0,
          transportBuyerDepot: 0,
          bagCardCost: 0,
          millingCharge: 0,
          laborCost: 0,
          commission: 0,
          bakshish: 0,
          additionalCost: 0,
          formula: []
        });
        setSearchTerm('');
        setSelectedProduct(null);
      }
    }
  };

  const handleEdit = (entry: ProductionEntry) => {
    if (userRole === 'VISITOR') {
      alert(lang === 'BN' ? "ভিজিটর মোডে সম্পাদনা সম্ভব নয়।" : "Editing is not allowed in Visitor mode.");
      return;
    }
    setEditingEntryId(entry.id);
    setFormData(entry);
    setSearchTerm(entry.productCode);
    const product = products.find(p => p.code === entry.productCode);
    setSelectedProduct(product || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrintBatch = (entry: ProductionEntry) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalRawMaterialCost = entry.formula.reduce((sum, item) => sum + (item.amount * item.price), 0);
    const otherCosts = entry.transportMill + entry.transportBuyerDepot + entry.bagCardCost + 
                      entry.millingCharge + entry.laborCost + entry.commission + 
                      entry.bakshish + entry.additionalCost;

    const html = `
      <html>
        <head>
          <title>Production Breakdown - ${entry.batchNo}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 30px; color: #1e293b; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f8fafc; text-align: left; padding: 10px; font-size: 10px; font-weight: 900; text-transform: uppercase; border: 1px solid #e2e8f0; }
            td { padding: 10px; font-size: 11px; border: 1px solid #e2e8f0; }
            .total-row td { font-weight: 900; background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <div class="border-b-2 border-slate-200 pb-6 text-center mb-6 relative">
            <div class="text-center px-4">
              <h1 class="text-3xl font-black text-[#722f37] uppercase leading-none tracking-tighter">${companyName}</h1>
              <p class="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">(A Sister Concern of AHYAN GROUP)</p>
              
              <div class="grid grid-cols-2 gap-8 text-[8px] mt-4 font-bold text-slate-500 text-left">
                <div class="border-l-2 border-slate-200 pl-4">
                  <p class="font-black text-[#722f37] uppercase text-[9px] mb-1">Head Office:</p>
                  <p>House No. 12 (4th floor), Road No. 25, Sector-07, Uttara, Dhaka-1230</p>
                  <p>Email: absfeed.info@gmail.com | Phone: +8809638-201686</p>
                </div>
                <div class="text-right border-r-2 border-slate-200 pr-4">
                  <p class="font-black text-[#722f37] uppercase text-[9px] mb-1">Regional Office:</p>
                  <p>Ahyan City, Bagerdanga, Fultola, Khulna-9210</p>
                  <p>Phone: +8801918-594466 | Web: www.absfeed.com</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-center mb-6">
            <div class="bg-slate-900 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-lg border border-white/20">
              PRODUCTION BREAKDOWN
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-slate-50 p-4 border border-slate-100">
              <p class="text-[8px] font-black text-slate-400 uppercase mb-1">Batch Information</p>
              <p class="text-sm font-black text-slate-900">${entry.batchNo} (${entry.date})</p>
            </div>
            <div class="bg-slate-50 p-4 border border-slate-100">
              <p class="text-[8px] font-black text-slate-400 uppercase mb-1">Product Details</p>
              <p class="text-sm font-black text-slate-900">${entry.productName} [${entry.productCode}]</p>
            </div>
            <div class="bg-slate-50 p-4 border border-slate-100">
              <p class="text-[8px] font-black text-slate-400 uppercase mb-1">Production Volume</p>
              <p class="text-sm font-black text-slate-900">${entry.bags} Bags (${entry.totalKgs.toLocaleString()} KG)</p>
            </div>
            <div class="bg-slate-50 p-4 border border-slate-100">
              <p class="text-[8px] font-black text-slate-400 uppercase mb-1">Cost Efficiency</p>
              <p class="text-sm font-black text-emerald-600">৳${entry.kgValue.toFixed(2)} / KG</p>
            </div>
          </div>

          <h3 class="text-[10px] font-black text-[#722f37] uppercase tracking-widest mb-3">Raw Materials Consumption</h3>
          <table>
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Quantity (KG)</th>
                <th>Rate (৳)</th>
                <th>Total (৳)</th>
              </tr>
            </thead>
            <tbody>
              ${entry.formula.map(item => `
                <tr>
                  <td>${rawMaterials.find(rm => rm.id === item.materialId)?.name || item.materialId}</td>
                  <td>${item.amount.toLocaleString()}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.amount * item.price).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">Total Raw Material Cost</td>
                <td>৳${totalRawMaterialCost.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <h3 class="text-[10px] font-black text-[#722f37] uppercase tracking-widest mb-3">Additional Charges Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th>Charge Description</th>
                <th>Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Transport (Mill)</td><td>${entry.transportMill.toLocaleString()}</td></tr>
              <tr><td>Transport (Buyer/Depot)</td><td>${entry.transportBuyerDepot.toLocaleString()}</td></tr>
              <tr><td>Bag & Card Cost</td><td>${entry.bagCardCost.toLocaleString()}</td></tr>
              <tr><td>Milling/Contract Charge</td><td>${entry.millingCharge.toLocaleString()}</td></tr>
              <tr><td>Labor Cost</td><td>${entry.laborCost.toLocaleString()}</td></tr>
              <tr><td>Commission</td><td>${entry.commission.toLocaleString()}</td></tr>
              <tr><td>Bakshish/Tips</td><td>${entry.bakshish.toLocaleString()}</td></tr>
              <tr><td>Additional Expenses</td><td>${entry.additionalCost.toLocaleString()}</td></tr>
              <tr class="total-row">
                <td style="text-align: right;">Total Additional Costs</td>
                <td>৳${otherCosts.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px; border-top: 2px solid #722f37; pt-4">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total Production Cost</p>
            <h2 style="color: #722f37; margin: 0; font-size: 24px; font-weight: 900;">৳${entry.totalValue.toLocaleString()}</h2>
          </div>

          <div class="grid grid-cols-2 gap-20 mt-20">
            <div class="text-center">
              <div class="border-t border-slate-300 pt-2">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Production Manager</p>
              </div>
            </div>
            <div class="text-center">
              <div class="border-t-2 border-[#722f37] pt-2">
                <p class="text-[9px] font-black text-[#722f37] uppercase tracking-widest">Authorized Signatory</p>
              </div>
            </div>
          </div>

          <div class="mt-20 pt-6 border-t border-slate-100 text-center">
            <p class="text-[8px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-3">w w w . a b s f e e d . c o m</p>
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

  const handleExportExcel = () => {
    const headers = ['Date', 'Batch No', 'Product Code', 'Product Name', 'Party Name', 'Bags', 'Total KG', 'KG Rate', 'Total Value'];
    const csvContent = [
      headers.join(','),
      ...entries.map(e => [
        e.date,
        e.batchNo,
        e.productCode,
        `"${e.productName}"`,
        `"${e.partyName}"`,
        e.bags,
        e.totalKgs,
        e.kgValue.toFixed(2),
        e.totalValue
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Production_History_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* Left Side: Production History */}
      <div className="w-full lg:w-7/12 space-y-4">
        <div className="bg-[#722f37] rounded-t-2xl p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <ClipboardList size={20} />
            <h2 className="text-lg font-black uppercase tracking-wider">Production History</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
              <Download size={14} /> EXCEL
            </button>
            <button onClick={handlePrintFullHistory} className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-slate-900">
              <Printer size={14} /> A4 HISTORY
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Batch Info</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Bags</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">KG Rate</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total Value</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-slate-700">{entry.date}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-black text-slate-900">{entry.batchNo}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.partyName}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-black text-[#722f37]">{entry.productName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CODE: {entry.productCode}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <p className="text-sm font-black text-slate-900">{entry.bags}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.totalKgs.toLocaleString()} KG</p>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-black text-emerald-600">৳{entry.kgValue.toFixed(2)}</td>
                    <td className="px-4 py-4 text-right text-sm font-black text-emerald-600">৳{entry.totalValue.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button 
                          onClick={() => setViewingBreakdown(entry)} 
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-all shadow-sm border border-emerald-200 uppercase tracking-tighter"
                          title="View Breakdown"
                        >
                          <Eye size={14} /> VIEW
                        </button>
                        <button 
                          onClick={() => handleEdit(entry)} 
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all shadow-sm border border-blue-200 uppercase tracking-tighter"
                          title="Edit Entry"
                        >
                          <Edit size={14} /> EDIT
                        </button>
                        <button 
                          onClick={() => handleDelete(entry.id)} 
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-all shadow-sm border border-rose-200 uppercase tracking-tighter"
                          title="Delete Entry"
                        >
                          <Trash2 size={14} /> DEL
                        </button>
                        <button 
                          onClick={() => handlePrintBatch(entry)} 
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all shadow-sm border border-slate-200 uppercase tracking-tighter"
                          title="Print Batch"
                        >
                          <Printer size={14} /> PRINT
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-bold text-sm">No production history.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Side: New Production Entry Form */}
      <div className="w-full lg:w-5/12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className={`p-4 flex items-center gap-2 text-white ${editingEntryId ? 'bg-blue-600' : 'bg-[#722f37]'}`}>
            {editingEntryId ? <Edit size={20} /> : <Plus size={20} />}
            <h2 className="text-lg font-black uppercase tracking-wider">
              {editingEntryId ? (lang === 'BN' ? 'উৎপাদন এন্ট্রি সংশোধন' : 'Edit Production Entry') : (lang === 'BN' ? 'নতুন উৎপাদন এন্ট্রি' : 'New Production Entry')}
            </h2>
          </div>
          
          <form onSubmit={handleAddEntry} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">তারিখ (Date)</label>
                <input 
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#722f37] font-bold text-slate-700 text-sm"
                  value={formData.date ?? ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ব্যাচ নং (Batch No)</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#722f37] font-bold text-slate-700 text-sm"
                  value={formData.batchNo ?? ''}
                  onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#722f37] uppercase tracking-widest mb-1 flex items-center gap-1">
                <Search size={12} /> প্রোডাক্ট কোড (Product Code)
              </label>
              <input 
                type="text"
                placeholder="যেমন: 511, 620..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#722f37] font-bold text-slate-700 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {selectedProduct && (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">প্রোডাক্টের নাম (Product Name)</p>
                  <p className="text-sm font-bold text-emerald-900">{selectedProduct.name}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">পার্টি/মিল নাম (Party/Mill Name)</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#722f37] font-bold text-slate-700 text-sm"
                value={formData.partyName ?? ''}
                onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ব্যাগ সংখ্যা (Bags)</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#722f37] font-bold text-slate-700 text-sm"
                  value={formData.bags ?? ''}
                  onChange={(e) => setFormData({ ...formData, bags: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">মোট ওজন (Total KG)</label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 font-black text-slate-900 text-sm flex justify-between items-center">
                  <span>{formData.totalKgs}</span>
                  <span className="text-[10px] text-slate-400">KG</span>
                </div>
              </div>
            </div>

            {/* Charges Section */}
            <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/30">
              <h3 className="text-sm font-black text-[#d35400] mb-4 flex items-center gap-2">
                পরিবহন ও অন্যান্য চার্জ (Charges)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#d35400] uppercase tracking-widest mb-1">পরিবহন (মিল)</label>
                  <input type="number" name="transportMill" value={formData.transportMill ?? ''} onChange={handleChargeChange} className="w-full bg-white border border-orange-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-orange-400 text-sm font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#d35400] uppercase tracking-widest mb-1">পরিবহন (ক্রেতা/ডিপো)</label>
                  <input type="number" name="transportBuyerDepot" value={formData.transportBuyerDepot ?? ''} onChange={handleChargeChange} className="w-full bg-white border border-orange-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-orange-400 text-sm font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#d35400] uppercase tracking-widest mb-1">ব্যাগ/কার্ড খরচ</label>
                  <input type="number" name="bagCardCost" value={formData.bagCardCost ?? ''} onChange={handleChargeChange} className="w-full bg-white border border-orange-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-orange-400 text-sm font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#d35400] uppercase tracking-widest mb-1">মিলিং চার্জ/কন্ট্রাক</label>
                  <input type="number" name="millingCharge" value={formData.millingCharge ?? ''} onChange={handleChargeChange} className="w-full bg-white border border-orange-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-orange-400 text-sm font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#d35400] uppercase tracking-widest mb-1">লেবার (LABOR)</label>
                  <input type="number" name="laborCost" value={formData.laborCost ?? ''} onChange={handleChargeChange} className="w-full bg-white border border-orange-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-orange-400 text-sm font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#d35400] uppercase tracking-widest mb-1">কমিশন (COMM.)</label>
                  <input type="number" name="commission" value={formData.commission ?? ''} onChange={handleChargeChange} className="w-full bg-white border border-orange-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-orange-400 text-sm font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#d35400] uppercase tracking-widest mb-1">বকশিস (TIPS)</label>
                  <input type="number" name="bakshish" value={formData.bakshish ?? ''} onChange={handleChargeChange} className="w-full bg-white border border-orange-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-orange-400 text-sm font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#d35400] uppercase tracking-widest mb-1">অতিরিক্ত খরচ</label>
                  <input type="number" name="additionalCost" value={formData.additionalCost ?? ''} onChange={handleChargeChange} className="w-full bg-white border border-orange-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-orange-400 text-sm font-bold text-slate-700" />
                </div>
              </div>
            </div>

            {/* Raw Materials Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-[#722f37]">কাঁচামাল ও ফরমুলা</h3>
                <button type="button" onClick={handleAddRawMaterial} className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-200 transition-colors">
                  + কাঁচামাল
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.formula?.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex-1 space-y-2">
                      <select 
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-[#722f37]"
                        value={item.materialId}
                        onChange={(e) => handleRawMaterialChange(index, 'materialId', e.target.value)}
                        required
                      >
                        <option value="">RAW MATERIALS</option>
                        {rawMaterials.map(rm => (
                          <option key={rm.id} value={rm.id}>
                            {rm.name} (Stock: {rm.stock?.toLocaleString()} {rm.unit})
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="KG" 
                          className="w-1/2 bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-[#722f37]"
                          value={item.amount ?? ''}
                          onChange={(e) => handleRawMaterialChange(index, 'amount', Number(e.target.value))}
                          required
                        />
                        <input 
                          type="number" 
                          placeholder="৳/KG" 
                          className="w-1/2 bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-[#722f37]"
                          value={item.price ?? ''}
                          onChange={(e) => handleRawMaterialChange(index, 'price', Number(e.target.value))}
                          required
                        />
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemoveRawMaterial(index)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors mt-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-2 text-white">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Value</span>
                <span className="text-xl font-black">৳{calculateTotalValue().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rate per KG</span>
                <span className="text-sm font-black text-emerald-400">
                  ৳{formData.totalKgs && formData.totalKgs > 0 ? (calculateTotalValue() / formData.totalKgs).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              {editingEntryId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingEntryId(null);
                    setFormData({
                      date: new Date().toISOString().split('T')[0],
                      batchNo: '',
                      productCode: '',
                      partyName: '',
                      bags: 0,
                      totalKgs: 0,
                      transportMill: 0,
                      transportBuyerDepot: 0,
                      bagCardCost: 0,
                      millingCharge: 0,
                      laborCost: 0,
                      commission: 0,
                      bakshish: 0,
                      additionalCost: 0,
                      formula: []
                    });
                    setSearchTerm('');
                    setSelectedProduct(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-xl transition-all transform active:scale-95 text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
              )}
              <button type="submit" className={`flex-1 text-white font-black py-4 rounded-xl shadow-xl transition-all transform active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${editingEntryId ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20' : 'bg-[#722f37] hover:bg-[#5a252c] shadow-rose-900/20'}`}>
                <Save size={18} /> {editingEntryId ? (lang === 'BN' ? 'আপডেট করুন' : 'Update Entry') : (lang === 'BN' ? 'সংরক্ষণ করুন' : 'Save Entry')}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Breakdown Modal */}
      {viewingBreakdown && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-[#722f37] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Batch Breakdown</h3>
                <p className="text-[10px] font-bold text-rose-200 uppercase tracking-widest">Batch: {viewingBreakdown.batchNo} • {viewingBreakdown.date}</p>
              </div>
              <button onClick={() => setViewingBreakdown(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Product</p>
                  <p className="font-black text-slate-900">{viewingBreakdown.productName}</p>
                  <p className="text-xs font-bold text-slate-500">Code: {viewingBreakdown.productCode}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Production Volume</p>
                  <p className="font-black text-slate-900">{viewingBreakdown.bags} Bags</p>
                  <p className="text-xs font-bold text-slate-500">{viewingBreakdown.totalKgs.toLocaleString()} KG Total</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                  Raw Materials Consumed
                </h4>
                <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-4 py-2 font-black text-slate-500 uppercase">Material</th>
                        <th className="px-4 py-2 font-black text-slate-500 uppercase text-right">Qty (KG)</th>
                        <th className="px-4 py-2 font-black text-slate-500 uppercase text-right">Rate</th>
                        <th className="px-4 py-2 font-black text-slate-500 uppercase text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {viewingBreakdown.formula.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 font-bold text-slate-700">
                            {rawMaterials.find(rm => rm.id === item.materialId)?.name || item.materialId}
                          </td>
                          <td className="px-4 py-2 text-right font-black text-slate-900">{item.amount.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-bold text-slate-500">৳{item.price.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right font-black text-[#722f37]">৳{(item.amount * item.price).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                    <span>Raw Material Cost:</span>
                    <span className="text-slate-900">৳{viewingBreakdown.formula.reduce((sum, i) => sum + (i.amount * i.price), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                    <span>Other Charges:</span>
                    <span className="text-slate-900">৳{(viewingBreakdown.totalValue - viewingBreakdown.formula.reduce((sum, i) => sum + (i.amount * i.price), 0)).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total Value</p>
                  <p className="text-2xl font-black text-[#722f37]">৳{viewingBreakdown.totalValue.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase">৳{viewingBreakdown.kgValue.toFixed(2)} / KG</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setViewingBreakdown(null)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">
                Close
              </button>
              <button onClick={() => handlePrintBatch(viewingBreakdown)} className="flex items-center gap-2 bg-[#722f37] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-900/20 hover:bg-[#5a252c] transition-colors">
                <Printer size={16} /> Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
