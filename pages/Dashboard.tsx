
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  X,
  Printer,
  Clock,
  User,
  UserCheck,
  Truck,
  Scale,
  Trash2,
  Edit2,
  MapPin,
  BrainCircuit,
  Languages,
  Menu,
  Factory,
  Banknote,
  PackageSearch
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Product, Sale, Customer, Officer } from '../types';
import { LanguageContext } from '../App';
import { formatDate } from '../utils';
import { PrintHeader } from '../components/PrintHeader';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  officers: Officer[];
  onDeleteSale: (id: string) => void;
  onEditSale: (sale: Sale) => void;
  currentUserId: string | null;
}

const StatCard = ({ title, value, icon: Icon, color, subValue, trend }: any) => {
  const bgColors: any = {
    wine: 'bg-rose-600 text-white border-rose-700',
    amber: 'bg-amber-500 text-white border-amber-600',
    emerald: 'bg-emerald-500 text-white border-emerald-600',
    rose: 'bg-red-500 text-white border-red-600',
    indigo: 'bg-indigo-500 text-white border-indigo-600',
    cyan: 'bg-cyan-500 text-white border-cyan-600',
    orange: 'bg-orange-500 text-white border-orange-600',
  };
  const iconBgColors: any = {
    wine: 'bg-rose-700 text-white',
    amber: 'bg-amber-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    rose: 'bg-red-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    cyan: 'bg-cyan-600 text-white',
    orange: 'bg-orange-600 text-white',
  };
  const textColors: any = {
    wine: 'text-rose-100',
    amber: 'text-amber-100',
    emerald: 'text-emerald-100',
    rose: 'text-red-100',
    indigo: 'text-indigo-100',
    cyan: 'text-cyan-100',
    orange: 'text-orange-100',
  };

  return (
    <div className={`${bgColors[color] || 'bg-white text-slate-900'} p-6 rounded-2xl shadow-sm border flex flex-col justify-between group hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`${textColors[color] || 'text-slate-400'} text-[11px] font-black uppercase tracking-widest leading-none mb-2`}>{title}</p>
          <h3 className="text-3xl font-black leading-none tracking-tight">{value}</h3>
        </div>
        <div className={`p-3.5 rounded-xl ${iconBgColors[color] || 'bg-slate-100 text-slate-600'} group-hover:scale-110 transition-transform`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {trend && (
          <span className={`text-[11px] font-black flex items-center ${trend === 'up' ? 'text-white' : 'text-white'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />} 12%
          </span>
        )}
        <span className={`text-[10px] font-bold ${textColors[color] || 'text-slate-400'} uppercase tracking-tighter`}>{subValue}</span>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ products, sales, customers, officers, onDeleteSale, onEditSale, currentUserId }) => {
  const { lang, companyName, role } = useContext(LanguageContext)!;
  const [viewInvoice, setViewInvoice] = useState<Sale | null>(null);
  const [shipping, setShipping] = useState({ driver: '', vehicle: '', phone: '' });

  const [rmStockValue, setRmStockValue] = useState(0);
  const [totalCompanyExpense, setTotalCompanyExpense] = useState(0);
  const [totalProductionValue, setTotalProductionValue] = useState(0);

  useEffect(() => {
    const loadProductionData = () => {
      try {
        const rawMaterials = JSON.parse(localStorage.getItem('abs_raw_materials') || '[]');
        const expenses = JSON.parse(localStorage.getItem('abs_expense_data') || '[]');
        const entries = JSON.parse(localStorage.getItem('abs_production_data') || '[]');

        const rmValue = rawMaterials.reduce((sum: number, rm: any) => sum + ((rm.stock || 0) * (rm.pricePerKg || 0)), 0);
        const expenseValue = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
        const prodValue = entries.reduce((sum: number, entry: any) => sum + (entry.totalValue || 0), 0);

        setRmStockValue(rmValue);
        setTotalCompanyExpense(expenseValue);
        setTotalProductionValue(prodValue);
      } catch (e) {
        console.error("Error loading production data for dashboard", e);
      }
    };

    loadProductionData();
    
    // Listen for storage changes (for other tabs)
    window.addEventListener('storage', loadProductionData);
    
    // Also poll occasionally as a fallback for same-tab updates if needed, 
    // though navigating back to dashboard usually triggers re-render.
    const interval = setInterval(loadProductionData, 5000);

    return () => {
      window.removeEventListener('storage', loadProductionData);
      clearInterval(interval);
    };
  }, []);

  const filteredSales = useMemo(() => {
    if (role === 'CUSTOMER') return sales.filter(s => s.customerId === currentUserId);
    if (role === 'OFFICER') return sales.filter(s => s.officerId === currentUserId);
    return sales;
  }, [sales, role, currentUserId]);

  const filteredCustomers = useMemo(() => {
    if (role === 'CUSTOMER') return customers.filter(c => c.id === currentUserId);
    return customers;
  }, [customers, role, currentUserId]);

  const totalSales = useMemo(() => filteredSales.reduce((sum, s) => sum + s.netAmount, 0), [filteredSales]);
  const totalCost = useMemo(() => filteredSales.reduce((sum, s) => sum + (s.totalCostAmount || 0), 0), [filteredSales]);
  const actualRevenue = totalSales - totalCost;
  const totalDue = useMemo(() => filteredCustomers.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0), [filteredCustomers]);
  const totalCash = useMemo(() => filteredSales.reduce((sum, s) => sum + s.paidAmount, 0), [filteredSales]);
  const lowStockProducts = useMemo(() => products.filter(p => p.stock < 20), [products]);
  const totalStockValue = useMemo(() => products.reduce((sum, p) => sum + (p.stock * (p.spPrice || p.tpPrice)), 0), [products]);

  const productPerformanceData = useMemo(() => {
    const counts: Record<string, { name: string, qty: number }> = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!counts[item.productCode]) {
          counts[item.productCode] = { name: item.productName, qty: 0 };
        }
        counts[item.productCode].qty += item.quantity;
      });
    });
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [filteredSales]);

  const COLORS = ['#722f37', '#be123c', '#9f1239', '#881337', '#4c0519'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{lang === 'BN' ? 'ড্যাশবোর্ড এনালাইসিস' : 'Performance Analytics'}</h1>
          <p className="text-slate-500 text-sm font-medium">Business health overview & product trends</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 shadow-sm flex items-center gap-2">
          <Clock size={14} className="text-[#722f37]" />
          {new Date().toLocaleDateString(lang === 'BN' ? 'bn-BD' : 'en-US', { dateStyle: 'full' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {role === 'ADMIN' && (
          <>
            <StatCard title={lang === 'BN' ? "প্রকৃত রেভিনিউ" : "Actual Revenue"} value={`৳${actualRevenue.toLocaleString()}`} icon={TrendingUp} color="wine" subValue="Net Profit Margin" trend="up" />
            <StatCard title={lang === 'BN' ? "স্টক ভ্যালু" : "Stock Value"} value={`৳${totalStockValue.toLocaleString()}`} icon={Scale} color="amber" subValue="Valued at SP" />
          </>
        )}
        <StatCard title={lang === 'BN' ? "নগদ সংগ্রহ" : "Cash In"} value={`৳${totalCash.toLocaleString()}`} icon={Wallet} color="emerald" subValue="Cash Collections" trend="up" />
        <StatCard title={lang === 'BN' ? "মোট বাকি" : "Accounts Due"} value={`৳${totalDue.toLocaleString()}`} icon={Receipt} color="rose" subValue="Outstanding" trend="down" />
        {role === 'ADMIN' && (
          <>
            <StatCard title={lang === 'BN' ? "মোট উৎপাদন" : "Total Production"} value={`৳${totalProductionValue.toLocaleString()}`} icon={Factory} color="indigo" subValue="Production Value" />
            <StatCard title={lang === 'BN' ? "কাঁচামাল স্টক" : "RM Stock Value"} value={`৳${rmStockValue.toLocaleString()}`} icon={PackageSearch} color="cyan" subValue="Raw Materials" />
            <StatCard title={lang === 'BN' ? "কোম্পানি খরচ" : "Company Expense"} value={`৳${totalCompanyExpense.toLocaleString()}`} icon={Banknote} color="orange" subValue="Total Expenses" />
            <StatCard title={lang === 'BN' ? "সতর্কতা স্টক" : "Low Stock"} value={lowStockProducts.length} icon={AlertCircle} color="amber" subValue="Refill Needed" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">{lang === 'BN' ? 'টপ সেলিং প্রোডাক্টস' : 'Top Items'}</h3>
          <div className="h-[300px]">
            {productPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="qty" radius={[0, 10, 10, 0]}>
                    {productPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase italic">No Sales Data</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white">
          <h3 className="font-black uppercase text-[10px] tracking-widest text-slate-400 mb-6">{lang === 'BN' ? 'সাম্প্রতিক চালান' : 'Recent Invoices'}</h3>
          <div className="space-y-3">
            {filteredSales.slice(-5).reverse().map((sale, i) => {
              const off = officers.find(o => o.id === sale.officerId);
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all cursor-pointer group border border-transparent hover:border-slate-700">
                  <div onClick={() => setViewInvoice(sale)} className="flex-1 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-rose-400 font-bold text-[10px] border border-slate-700 group-hover:bg-[#722f37] group-hover:text-white transition-all">INV</div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black">#ABS-{sale.invoiceNo}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[120px]">{off?.name || 'Agent'}</p>
                      <p className="text-[8px] text-slate-500 font-bold uppercase">{formatDate(sale.date)}</p>
                    </div>
                    <div className="text-right font-black">
                      <p className="text-xs text-rose-400">৳{sale.netAmount.toLocaleString()}</p>
                      <span className="text-[8px] text-slate-500 uppercase">{sale.paymentMethod}</span>
                    </div>
                  </div>
                  {role === 'ADMIN' && (
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditSale(sale); }}
                        className="p-2 text-slate-600 hover:text-emerald-500 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePrintInvoice(sale); }}
                        className="p-2 text-slate-600 hover:text-blue-500 transition-colors"
                        title="Print"
                      >
                        <Printer size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteSale(sale.invoiceNo); }}
                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stock Status Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        {/* Product Stock Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <PackageSearch size={16} className="text-[#722f37]" />
              {lang === 'BN' ? 'প্রোডাক্ট স্টক স্ট্যাটাস' : 'Product Stock Status'}
            </h3>
            <button 
              onClick={() => window.location.hash = '#/products'}
              className="text-[10px] font-black text-[#722f37] uppercase hover:underline"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.slice(0, 5).map((product) => (
                  <tr key={product.code} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-900 uppercase">{product.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{product.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{product.stock} Bag</span>
                        {product.stock < 20 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => window.location.hash = '#/products'}
                          className="p-1 text-slate-400 hover:text-[#722f37] transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handlePrintStock('product')}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Raw Materials Stock Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <Factory size={16} className="text-indigo-600" />
              {lang === 'BN' ? 'কাঁচামাল স্টক স্ট্যাটাস' : 'Raw Materials Stock'}
            </h3>
            <button 
              onClick={() => window.location.hash = '#/production'}
              className="text-[10px] font-black text-indigo-600 uppercase hover:underline"
            >
              Manage
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(() => {
                  const rawMaterials = JSON.parse(localStorage.getItem('abs_raw_materials') || '[]');
                  return rawMaterials.slice(0, 5).map((rm: any) => (
                    <tr key={rm.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-slate-900 uppercase">{rm.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">ID: {rm.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{rm.stock} {rm.unit}</span>
                          {rm.stock < 100 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => window.location.hash = '#/production'}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handlePrintStock('raw')}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewInvoice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm no-print modal-overlay">
          <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[95vh] modal-container">
            <div className="bg-[#722f37] p-6 text-white flex justify-between items-center no-print shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-xl"><Receipt size={20} /></div>
                <h2 className="text-lg font-black tracking-tight">Invoice Details</h2>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handlePrintInvoice(viewInvoice)} className="px-5 py-2 bg-white text-[#722f37] hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase shadow-lg">
                  <Printer size={14} /> Print
                </button>
                <button onClick={() => setViewInvoice(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto p-10 print-p-0 print-m-0 invoice-content">
              {/* Header */}
              <div className="no-print-section">
                <PrintHeader 
                  companyName={companyName} 
                  title={lang === 'BN' ? 'বিক্রয় ইনভয়েস' : 'Sales Invoice'} 
                  subtitle={lang === 'BN' ? 'কাস্টমার / অফিস কপি' : 'Customer / Office Copy'}
                />
              </div>
              
              <div className="hidden print:block">
                <PrintHeader 
                  companyName={companyName} 
                  title={lang === 'BN' ? 'বিক্রয় ইনভয়েস' : 'Sales Invoice'} 
                />
              </div>

              {/* Title Bar */}
              <div className="flex justify-between items-center bg-rose-50 p-3 rounded-2xl border border-rose-200 mt-4 shrink-0">
                <div className="bg-[#722f37] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">SALES INVOICE</div>
                <p className="font-black uppercase tracking-[0.2em] text-rose-800 text-[10px] border-b border-rose-200 pb-0.5">CUSTOMERS / OFFICE COPY</p>
                <div className="text-right flex flex-col">
                   <span className="text-[8px] font-black text-rose-400 uppercase">INVOICE NO</span>
                   <span className="text-sm font-black text-[#722f37]">#ABS-{viewInvoice.invoiceNo}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-8 mt-6 shrink-0">
                {(() => {
                  const cust = customers.find(c => c.id === viewInvoice.customerId);
                  return (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] leading-tight space-y-1">
                      <p className="font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><User size={10} /> Bill To (Dealer Detail)</p>
                      <p className="font-black text-slate-900 uppercase text-xs">{cust?.companyName || 'Establishment'}</p>
                      <p className="font-semibold text-slate-500 italic">{cust?.address || 'Address'}</p>
                      <div className="pt-2 border-t border-slate-200 mt-2 space-y-0.5">
                        <p><span className="font-black text-slate-400 mr-2">Dealer:</span> {cust?.name}</p>
                        <p><span className="font-black text-slate-400 mr-2">ID:</span> {cust?.id}</p>
                        <p><span className="font-black text-slate-400 mr-2">Mobile:</span> {cust?.mobile}</p>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="space-y-4 text-right">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[9px] font-black text-slate-400 mb-1">Date</p><p className="text-xs font-bold text-slate-900">{formatDate(viewInvoice.date)}</p></div>
                    <div><p className="text-[9px] font-black text-slate-400 mb-1">Serial No</p><p className="text-xs font-bold text-slate-900">SN-{viewInvoice.serialNo.padStart(3, '0')}</p></div>
                  </div>
                  {/* Detailed Officer Info */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block ml-auto text-right">
                    {(() => {
                      const off = officers.find(o => o.id === viewInvoice.officerId);
                      return (
                        <>
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1.5 flex justify-end gap-1"><UserCheck size={10} /> Sales Officer</p>
                          <p className="text-[11px] font-black text-slate-900 uppercase">{off?.name || 'N/A'}</p>
                          <p className="text-[9px] font-black text-[#722f37] uppercase">ID: {viewInvoice.officerId} | {off?.mobile}</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase flex items-center justify-end gap-1 mt-0.5"><MapPin size={8}/> {off?.area || 'Global'}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left mt-6 shrink-0">
                <thead>
                  <tr className="border-y border-rose-900 bg-rose-50">
                    <th className="py-3 px-2 text-[9px] font-black uppercase text-rose-900">Description</th>
                    <th className="py-3 px-2 text-[9px] font-black uppercase text-rose-900 text-center">Qty</th>
                    <th className="py-3 px-2 text-[9px] font-black uppercase text-rose-900 text-right">Rate</th>
                    <th className="py-3 px-2 text-[9px] font-black uppercase text-rose-900 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {viewInvoice.items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="py-3 px-2">
                        <span className="font-black text-[13px] text-slate-900 uppercase tracking-tight">[{item.productCode}] {item.productName}</span>
                        <span className="block text-[8px] font-bold text-[#722f37] mt-0.5 uppercase tracking-tighter">Batch: {item.batchNumber || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-2 text-center font-black text-slate-700 text-xs">{item.quantity} Bag</td>
                      <td className="py-3 px-2 text-right font-bold text-slate-700 text-xs">৳{item.unitPrice.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right font-black text-slate-900 text-xs">৳{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Totals, QR and Shipping */}
              <div className="flex justify-between items-start pt-4 border-t border-slate-100 shrink-0 gap-4">
                {/* Shipping Section */}
                <div className="flex-1 space-y-4 min-w-[30%]">
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 no-print-section">
                     <p className="text-[8px] font-black text-[#722f37] uppercase tracking-widest flex items-center gap-1.5 mb-1"><Truck size={12}/> SHIPPING DETAILS</p>
                     <div className="space-y-1.5">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-0.5">
                          <span className="text-[8px] font-black text-slate-400 uppercase w-16 shrink-0">Driver:</span>
                          <input className="bg-transparent border-none p-0 text-[10px] font-bold text-slate-700 focus:ring-0 w-full" value={shipping.driver} onChange={e => setShipping({...shipping, driver: e.target.value})} placeholder="Name..." readOnly={role === 'VISITOR'} />
                        </div>
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-0.5">
                          <span className="text-[8px] font-black text-slate-400 uppercase w-16 shrink-0">Vehicle:</span>
                          <input className="bg-transparent border-none p-0 text-[10px] font-bold text-slate-700 focus:ring-0 w-full uppercase" value={shipping.vehicle} onChange={e => setShipping({...shipping, vehicle: e.target.value})} placeholder="Truck No..." readOnly={role === 'VISITOR'} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black text-slate-400 uppercase w-16 shrink-0">Mobile:</span>
                          <input className="bg-transparent border-none p-0 text-[10px] font-bold text-slate-700 focus:ring-0 w-full" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} placeholder="01XXX..." readOnly={role === 'VISITOR'} />
                        </div>
                     </div>
                   </div>
                   <div className="hidden print:block space-y-0.5 mt-2 ml-1">
                      <p className="text-[9px] font-bold text-slate-700">Driver: <span className="font-black">{shipping.driver || 'N/A'}</span></p>
                      <p className="text-[9px] font-bold text-slate-700">Vehicle: <span className="font-black uppercase">{shipping.vehicle || 'N/A'}</span></p>
                      <p className="text-[9px] font-bold text-slate-700">Mobile: <span className="font-black">{shipping.phone || 'N/A'}</span></p>
                   </div>
                </div>

                {/* QR Code Section - Positioned between Shipping and Totals */}
                <div className="flex flex-col items-center justify-center p-3 border border-slate-100 rounded-2xl bg-white shadow-sm shrink-0 self-start">
                  <QRCodeSVG 
                    value={`INV: #ABS-${viewInvoice.invoiceNo}\nDATE: ${viewInvoice.date}\nCUST: ${viewInvoice.customerId}\nOFFICER: ${viewInvoice.officerId}\nTOTAL: ৳${viewInvoice.netAmount}`}
                    size={70}
                    level="H"
                    includeMargin={false}
                  />
                  <span className="text-[7px] font-black text-slate-400 uppercase mt-2 tracking-widest">Verify Invoice</span>
                </div>
                
                {/* Totals Section */}
                <div className="w-56 space-y-1.5 shrink-0 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600"><span>Gross Total:</span><span>৳{viewInvoice.totalAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between text-[11px] font-bold text-rose-600">
                    <span>Discount:</span>
                    <span>-৳{viewInvoice.discount.toLocaleString()} {viewInvoice.totalAmount > 0 ? `(${Math.round((viewInvoice.discount / viewInvoice.totalAmount) * 100)}%)` : ''}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#722f37] border-t-2 border-[#722f37] pt-1"><span>Net Payable:</span><span>৳{viewInvoice.netAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between text-[10px] font-bold text-emerald-600"><span>Amount Paid:</span><span>৳{viewInvoice.paidAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm font-black text-rose-600 border-t border-dashed border-rose-300 pt-1"><span>Total Due:</span><span>৳{viewInvoice.dueAmount.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Signatures and Footer */}
              <div className="mt-auto pt-24 invoice-footer">
                <div className="grid grid-cols-3 gap-8 items-end text-center pb-8">
                  <div className="flex flex-col items-center">
                    <div className="w-full border-b border-slate-300 mb-2"></div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">RECEIVED / রিসিভ</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full border-b border-slate-300 mb-2"></div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">DEALER / কাস্টমার</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full border-b-2 border-[#722f37] mb-2"></div>
                    <p className="text-[9px] font-black text-[#722f37] uppercase tracking-widest">AUTHORIZED BY</p>
                  </div>
                </div>
                
                <div className="text-center pb-4 px-4">
                  <p className="text-[9px] font-semibold text-rose-600 leading-relaxed">
                    Make all checks/payment payable to [ABS FEED INDUSTRIES LIMITED ]. If you have any questions concerning this invoice, contact [MR. SIDDIQUE-AGM-KHULNA], [01918-594466], [absfeed.info@gmail.com] [This invoice is very important for both, please keep it safe and confidential for business interest]
                  </p>
                </div>

                {/* Global Website Footer */}
                <div className="pt-4 border-t border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">w w w . a b s f e e d . c o m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
