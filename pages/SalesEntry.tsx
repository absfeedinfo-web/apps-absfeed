
import React, { useState, useContext } from 'react';
import { Trash2, Save, User, Search, Tag, ShoppingCart, Package, Info, FileText, CheckCircle2, Hash, Plus, X, ListPlus, Phone, AlertCircle } from 'lucide-react';
import { Product, Customer, Officer, Sale, SaleItem } from '../types';
import { LanguageContext } from '../App';

interface SalesEntryProps {
  products: Product[];
  customers: Customer[];
  officers: Officer[];
  onAddSale: (sale: Sale) => void;
  onUpdateSale?: (sale: Sale) => void;
  editingSale?: Sale | null;
  onCancelEdit?: () => void;
}

const SalesEntry: React.FC<SalesEntryProps> = ({ products, customers, officers, onAddSale, onUpdateSale, editingSale, onCancelEdit }) => {
  const { t, lang, role } = useContext(LanguageContext)!;

  const [invoiceNo, setInvoiceNo] = useState(() => editingSale?.invoiceNo || Math.floor(100000 + Math.random() * 900000).toString());
  const [date, setDate] = useState(editingSale?.date || new Date().toISOString().split('T')[0]);
  const [serialNo, setSerialNo] = useState(editingSale?.serialNo || '1');
  
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => 
    editingSale ? customers.find(c => c.id === editingSale.customerId) || null : null
  );
  const [currentOfficer, setCurrentOfficer] = useState<Officer | null>(() => 
    editingSale ? officers.find(o => o.id === editingSale.officerId) || null : null
  );
  
  const [items, setItems] = useState<SaleItem[]>(editingSale?.items || []);
  const [discount, setDiscount] = useState(editingSale?.discount || 0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paidAmount, setPaidAmount] = useState(editingSale?.paidAmount || 0);
  
  const [priceType, setPriceType] = useState<'tp' | 'mrp' | 'sp'>('tp');
  const [productSearchCode, setProductSearchCode] = useState('');
  const [customerSearchId, setCustomerSearchId] = useState(editingSale?.customerId || '');
  const [officerSearchId, setOfficerSearchId] = useState(editingSale?.officerId || '');

  // Bulk Picker States
  const [showBulkPicker, setShowBulkPicker] = useState(false);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkQuantities, setBulkQuantities] = useState<Record<string, number>>({});

  const handleBulkAdd = () => {
    if (role === 'VISITOR') return;
    Object.entries(bulkQuantities).forEach(([code, qty]) => {
      if (qty > 0) {
        const product = products.find(p => p.code === code);
        if (product) {
          addItemToList(product, qty);
        }
      }
    });
    setBulkQuantities({});
    setShowBulkPicker(false);
  };

  // Update state when editingSale changes
  React.useEffect(() => {
    if (editingSale) {
      setInvoiceNo(editingSale.invoiceNo);
      setDate(editingSale.date);
      setSerialNo(editingSale.serialNo);
      setCurrentCustomer(customers.find(c => c.id === editingSale.customerId) || null);
      setCurrentOfficer(officers.find(o => o.id === editingSale.officerId) || null);
      setItems(editingSale.items);
      setDiscount(editingSale.discount);
      setPaidAmount(editingSale.paidAmount);
      setCustomerSearchId(editingSale.customerId);
      setOfficerSearchId(editingSale.officerId);
    }
  }, [editingSale, customers, officers]);

  const fetchCustomer = (id: string) => {
    const found = customers.find(c => c.id.toLowerCase() === id.toLowerCase());
    setCurrentCustomer(found || null);
  };

  const fetchOfficer = (id: string) => {
    const found = officers.find(o => o.id.toLowerCase() === id.toLowerCase());
    setCurrentOfficer(found || null);
  };

  const handleProductSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const found = products.find(p => p.code === productSearchCode);
      if (found) {
        addItemToList(found, 1);
        setProductSearchCode('');
      } else {
        alert(lang === 'BN' ? "প্রোডাক্ট কোড পাওয়া যায়নি" : "Product Code not found");
      }
    }
  };

  const addItemToList = (product: Product, qty: number) => {
    if (role === 'VISITOR') return;
    if (product.stock <= 0 && !editingSale) { // Allow adding if editing (stock already deducted)
      alert(lang === 'BN' ? `${product.name} এর স্টক নেই!` : `${product.name} is out of stock!`);
      return;
    }
    
    let price = product.tpPrice;
    if (priceType === 'mrp') price = product.mrpPrice;
    if (priceType === 'sp') price = product.spPrice || product.tpPrice;

    setItems(prev => {
      const existingItem = prev.find(i => i.productCode === product.code);
      if (existingItem) {
        return prev.map(i => i.productCode === product.code ? { 
          ...i, 
          quantity: i.quantity + qty, 
          total: (i.quantity + qty) * i.unitPrice,
          totalCost: (i.quantity + qty) * i.costPrice
        } : i);
      } else {
        return [...prev, {
          productCode: product.code,
          productName: product.name,
          quantity: qty,
          unitPrice: price,
          costPrice: product.purchasePrice,
          total: qty * price,
          totalCost: qty * product.purchasePrice,
          batchNumber: ''
        }];
      }
    });
  };

  const removeItem = (index: number) => {
    if (role === 'VISITOR') return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemQty = (index: number, qty: number) => {
    if (role === 'VISITOR') return;
    const newItems = [...items];
    newItems[index].quantity = qty;
    newItems[index].total = qty * newItems[index].unitPrice;
    newItems[index].totalCost = qty * newItems[index].costPrice;
    setItems(newItems);
  };

  const updateItemBatch = (index: number, batch: string) => {
    if (role === 'VISITOR') return;
    const newItems = [...items];
    newItems[index].batchNumber = batch;
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, i) => sum + i.total, 0);
  const totalCostAmount = items.reduce((sum, i) => sum + i.totalCost, 0);
  const netAmount = totalAmount - discount;
  const dueAmount = netAmount - paidAmount;

  // Update discount percent when editingSale changes or totalAmount changes (if we want to keep percent sync, but let's just do it on load)
  React.useEffect(() => {
    if (editingSale && totalAmount > 0) {
      setDiscountPercent(Number(((editingSale.discount / totalAmount) * 100).toFixed(2)));
    }
  }, [editingSale, totalAmount]);

  const handleDiscountPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (role === 'VISITOR') return;
    const percent = parseFloat(e.target.value) || 0;
    setDiscountPercent(percent);
    setDiscount(Number(((totalAmount * percent) / 100).toFixed(2)));
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (role === 'VISITOR') return;
    const amount = parseFloat(e.target.value) || 0;
    setDiscount(amount);
    setDiscountPercent(totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(2)) : 0);
  };

  const handleSave = () => {
    if (role === 'VISITOR') {
      alert(t('readOnlyMsg'));
      return;
    }
    if (!currentCustomer || !currentOfficer || items.length === 0) {
      alert(lang === 'BN' ? "কাস্টমার, অফিসার এবং কমপক্ষে একটি প্রোডাক্ট নির্বাচন করুন।" : "Please ensure Customer, Officer and at least one item are selected.");
      return;
    }

    const sale: Sale = {
      invoiceNo,
      date,
      serialNo,
      officerId: currentOfficer.id,
      customerId: currentCustomer.id,
      items,
      totalAmount,
      totalCostAmount,
      discount,
      netAmount,
      paidAmount,
      dueAmount,
      previousDue: currentCustomer.balance,
      netDue: currentCustomer.balance - dueAmount,
      paymentMethod: paidAmount === 0 ? 'Credit' : (paidAmount === netAmount ? 'Cash' : 'Partial')
    };

    if (editingSale && onUpdateSale) {
      onUpdateSale(sale);
      alert(lang === 'BN' ? "চালান সফলভাবে আপডেট করা হয়েছে!" : "Invoice updated successfully!");
    } else {
      onAddSale(sale);
      alert(lang === 'BN' ? "বিক্রয় সফলভাবে সংরক্ষিত হয়েছে!" : "Sale saved successfully!");
    }

    setItems([]);
    setDiscount(0);
    setPaidAmount(0);
    setInvoiceNo(Math.floor(100000 + Math.random() * 900000).toString());
    setCurrentCustomer(null);
    setCurrentOfficer(null);
    setCustomerSearchId('');
    setOfficerSearchId('');
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShoppingCart className="text-[#722f37]" size={32} /> {lang === 'BN' ? 'নতুন বিক্রয় এন্ট্রি' : 'New Sales Transaction'}
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Point of Sale System</p>
        </div>
        {role === 'ADMIN' && (
          <div className="flex gap-3">
            {editingSale && (
              <button 
                onClick={onCancelEdit}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95"
              >
                <X size={20} /> {lang === 'BN' ? 'বাতিল' : 'Cancel Edit'}
              </button>
            )}
            <button 
              onClick={() => setShowBulkPicker(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
            >
              <ListPlus size={20} /> {lang === 'BN' ? 'বাল্ক আইটেম নির্বাচন' : 'Bulk Select Items'}
            </button>
            <button onClick={handleSave} className="bg-[#722f37] hover:bg-[#5a252c] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-rose-900/20 active:scale-95">
              <Save size={20} /> {editingSale ? (lang === 'BN' ? 'আপডেট করুন' : 'Update Invoice') : (lang === 'BN' ? 'চালান সংরক্ষণ' : 'Save Invoice')}
            </button>
          </div>
        )}
      </div>

      {role === 'VISITOR' && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-center gap-4 text-amber-700">
           <AlertCircle size={32} />
           <div>
              <p className="font-black uppercase tracking-widest text-xs">{t('readOnlyMsg')}</p>
              <p className="text-xs font-bold opacity-80">You can simulate entries, but saving to the database is restricted.</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
              <Tag size={18} className="text-[#722f37]" /> {lang === 'BN' ? 'চালান হেড' : 'Invoice Metadata'}
            </h3>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{lang === 'BN' ? 'চালান নং' : 'Inv No'}</label>
                  <input type="text" value={invoiceNo} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-black text-[#722f37]" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{lang === 'BN' ? 'তারিখ' : 'Date'}</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 font-bold text-slate-700" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{lang === 'BN' ? 'সিরিয়াল নম্বর' : 'Serial No'}</label>
                <input type="text" value={serialNo} onChange={(e) => setSerialNo(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 font-bold text-slate-700" placeholder="001" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
              <User size={18} className="text-emerald-500" /> {lang === 'BN' ? 'পার্টনার সিলেকশন' : 'Partner Assignment'}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{lang === 'BN' ? 'অফিসার আইডি' : 'Officer ID'}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={officerSearchId}
                    onChange={(e) => {setOfficerSearchId(e.target.value); fetchOfficer(e.target.value);}}
                    className="w-full border border-slate-200 rounded-xl p-4 pl-12 font-bold text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-rose-800 transition-all" 
                    placeholder="e.g. O001" 
                  />
                  <Search className="absolute left-4 top-4 text-slate-300" size={18} />
                </div>
                {currentOfficer && (
                  <div className="mt-3 p-4 bg-rose-50/50 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2">
                    <p className="font-black text-[#722f37] text-sm uppercase">{currentOfficer.name}</p>
                    <p className="text-[10px] font-black text-rose-500 uppercase mt-0.5 tracking-tight">{currentOfficer.designation} • {currentOfficer.mobile}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">ID: {currentOfficer.id}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{lang === 'BN' ? 'কাস্টমার আইডি' : 'Customer ID'}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={customerSearchId}
                    onChange={(e) => {setCustomerSearchId(e.target.value); fetchCustomer(e.target.value);}}
                    className="w-full border border-slate-200 rounded-xl p-4 pl-12 font-bold text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                    placeholder="e.g. C001" 
                  />
                  <Search className="absolute left-4 top-4 text-slate-300" size={18} />
                </div>
                {currentCustomer && (
                  <div className="mt-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-emerald-900 text-sm uppercase">{currentCustomer.name}</p>
                        <p className="text-[10px] font-black text-emerald-600 uppercase mt-0.5">{currentCustomer.companyName}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1"><Phone size={10}/> {currentCustomer.mobile}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">ID: {currentCustomer.id}</p>
                        
                        {/* Due Information */}
                        <div className="mt-3 pt-3 border-t border-emerald-200 space-y-1">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                            <span className="text-slate-500">Previous Due:</span>
                            <span className="text-rose-600">৳{(currentCustomer.balance < 0 ? Math.abs(currentCustomer.balance) : 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                            <span className="text-slate-500">Current Invoice Due:</span>
                            <span className="text-rose-600">৳{dueAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-black uppercase tracking-tight pt-1 border-t border-emerald-100">
                            <span className="text-emerald-800">Net Due:</span>
                            <span className="text-rose-700">৳{((currentCustomer.balance < 0 ? Math.abs(currentCustomer.balance) : 0) + dueAmount).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">{currentCustomer.type}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase text-xs tracking-widest">
                <Package size={18} className="text-orange-500" /> {lang === 'BN' ? 'অর্ডার আইটেম' : 'Line Items'}
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                {(['tp', 'mrp', 'sp'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPriceType(type)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${priceType === type ? 'bg-white text-[#722f37] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {type.toUpperCase()} Price
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={productSearchCode}
                  onChange={(e) => setProductSearchCode(e.target.value)}
                  onKeyDown={handleProductSearch}
                  className="w-full border-2 border-slate-100 focus:border-[#722f37] outline-none rounded-2xl p-4 pl-14 text-xl font-black transition-all shadow-sm bg-slate-50/50 placeholder:text-slate-300"
                  placeholder={lang === 'BN' ? "কোড লিখে এন্টার দিন..." : "Type Code & Press Enter..."} 
                />
                <Package className="absolute left-5 top-4.5 text-slate-300" size={28} />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Description</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Rate</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900 text-sm uppercase tracking-tight">[{item.productCode}] {item.productName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          placeholder="Batch"
                          value={item.batchNumber ?? ''}
                          onChange={(e) => updateItemBatch(idx, e.target.value)}
                          readOnly={role === 'VISITOR'}
                          className="w-20 border rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-600 focus:border-[#722f37] outline-none bg-slate-50"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="number" 
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQty(idx, parseInt(e.target.value) || 1)}
                          readOnly={role === 'VISITOR'}
                          className="w-16 border rounded-xl text-center py-1.5 font-black text-slate-900 focus:border-[#722f37] outline-none" 
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input 
                          type="number" 
                          value={item.unitPrice}
                          onChange={(e) => {
                            if (role === 'VISITOR') return;
                            const newItems = [...items];
                            newItems[idx].unitPrice = parseFloat(e.target.value) || 0;
                            newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
                            setItems(newItems);
                          }}
                          readOnly={role === 'VISITOR'}
                          className="w-20 text-right bg-transparent font-bold text-slate-600 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">৳{item.total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => removeItem(idx)} disabled={role === 'VISITOR'} className="p-2 text-slate-300 hover:text-rose-600 transition-all disabled:opacity-30">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 border-t-2 border-slate-100 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                    <span>Gross Total:</span>
                    <span className="text-slate-900 font-black text-sm">৳{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                    <span>Special Discount:</span>
                    <div className="flex gap-2 items-center">
                      <div className="relative">
                        <input type="number" value={discountPercent} onChange={handleDiscountPercentChange} readOnly={role === 'VISITOR'} className="w-16 text-right border rounded-lg px-2 py-1 font-black text-rose-600 outline-none bg-rose-50 pr-6" />
                        <span className="absolute right-2 top-1.5 text-rose-400 font-black text-[10px]">%</span>
                      </div>
                      <span className="text-slate-300">=</span>
                      <input type="number" value={discount} onChange={handleDiscountChange} readOnly={role === 'VISITOR'} className="w-24 text-right border rounded-lg px-2 py-1 font-black text-rose-600 outline-none bg-rose-50" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900 font-black">
                    <span className="text-slate-900 uppercase">Net Amount:</span>
                    <span className="text-2xl text-slate-900">৳{netAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Cash Payment Received:</span>
                    <div className="relative">
                      <input type="number" value={paidAmount} onChange={e => setPaidAmount(parseFloat(e.target.value)||0)} readOnly={role === 'VISITOR'} className="w-32 text-right bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-emerald-400 font-black outline-none focus:ring-1 focus:ring-emerald-500" />
                      <span className="absolute left-2 top-2.5 text-emerald-500/30 font-black">৳</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-800 font-black">
                    <span className="text-slate-500 uppercase tracking-widest text-[10px]">Accounts Due:</span>
                    <span className={`text-xl ${dueAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>৳{dueAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Product Picker Modal */}
      {showBulkPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
            <div className="bg-emerald-600 p-8 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <ListPlus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{lang === 'BN' ? 'বাল্ক প্রোডাক্ট নির্বাচন' : 'Bulk Product Selector'}</h2>
                  <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest">Inventory Fast-Entry</p>
                </div>
              </div>
              <button onClick={() => { setBulkQuantities({}); setShowBulkPicker(false); }} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 border-b border-slate-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-5 top-4.5 text-slate-300" size={24} />
                <input 
                  type="text"
                  placeholder={lang === 'BN' ? "নাম বা কোড দিয়ে খুজুন..." : "Filter items by name or code..."}
                  value={bulkSearch}
                  onChange={(e) => setBulkSearch(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {products
                .filter(p => p.name.toLowerCase().includes(bulkSearch.toLowerCase()) || p.code.includes(bulkSearch))
                .map(p => (
                  <div key={p.code} className={`p-4 border rounded-3xl transition-all flex items-center justify-between group ${bulkQuantities[p.code] > 0 ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">#{p.code}</p>
                      <p className="font-black text-slate-900 text-sm truncate uppercase pr-2">{p.name}</p>
                      <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Stock: {p.stock} Bag</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setBulkQuantities(prev => ({ ...prev, [p.code]: Math.max(0, (prev[p.code] || 0) - 1) }))}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                      <input 
                        type="number"
                        min="0"
                        value={bulkQuantities[p.code] ?? ''}
                        onChange={(e) => setBulkQuantities(prev => ({ ...prev, [p.code]: parseInt(e.target.value) || 0 }))}
                        className="w-16 border rounded-xl p-2 text-center font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        placeholder="0"
                      />
                      <button 
                        onClick={() => setBulkQuantities(prev => ({ ...prev, [p.code]: (prev[p.code] || 0) + 1 }))}
                        className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-8 border-t border-slate-100 shrink-0 flex justify-between items-center bg-slate-50">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Selected: {(Object.values(bulkQuantities) as number[]).filter(q => q > 0).length} Product Types
              </p>
              <div className="flex gap-4">
                <button onClick={() => { setBulkQuantities({}); setShowBulkPicker(false); }} className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                  {lang === 'BN' ? 'বাতিল' : 'Cancel'}
                </button>
                <button onClick={handleBulkAdd} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95">
                  {lang === 'BN' ? 'এন্ট্রি করুন' : 'Add to Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesEntry;
