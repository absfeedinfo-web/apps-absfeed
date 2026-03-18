
import React, { useState, useContext, useMemo } from 'react';
import { Officer, Sale, Customer, Product } from '../types';
import { UserPlus, Phone, MapPin, BadgeCheck, X, UserCircle2, ShieldCheck, Briefcase, Activity, FileText, Printer, Mail, Building2, Edit2, Save, Trash2, CheckCircle, AlertCircle, ShoppingBag, Edit } from 'lucide-react';
import { LanguageContext } from '../App';
import { formatDate } from '../utils';
import { PrintHeader } from '../components/PrintHeader';
import { DatabaseService } from '../database';

interface OfficerListProps {
  officers: Officer[];
  sales: Sale[];
  customers: Customer[];
  products: Product[];
  setOfficers: React.Dispatch<React.SetStateAction<Officer[]>>;
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  role: string;
}

const OfficerList: React.FC<OfficerListProps> = ({ officers, sales, customers, products, setOfficers, setSales, role }) => {
  const { t, lang, companyName } = useContext(LanguageContext)!;
  const [showModal, setShowModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [viewStatement, setViewStatement] = useState<Officer | null>(null);

  const [formData, setFormData] = useState<Partial<Officer>>({
    id: '',
    name: '',
    area: '',
    mobile: '',
    status: 'Active',
    designation: 'Sales Officer'
  });

  const handleOpenModal = (o?: Officer) => {
    if (o) {
      setEditingOfficer(o);
      setFormData({ ...o });
    } else {
      setEditingOfficer(null);
      setFormData({
        id: `O${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: '', area: '', mobile: '', designation: 'Sales Officer', status: 'Active'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'VISITOR') {
      alert(lang === 'BN' ? "ভিজিটর মোডে সেভ করা সম্ভব নয়।" : "Saving is not allowed in Visitor mode.");
      return;
    }
    if (!formData.name || !formData.id) return;

    // Check ID uniqueness if it's a new ID
    if (!editingOfficer || (editingOfficer && editingOfficer.id !== formData.id)) {
      const exists = officers.some(o => o.id === formData.id);
      if (exists) {
        alert(lang === 'BN' ? "এই অফিসার আইডি ইতিমধ্যে ব্যবহৃত হচ্ছে!" : "This Employee ID is already in use!");
        return;
      }
    }

    if (editingOfficer) {
      const oldId = editingOfficer.id;
      const newId = formData.id!;

      // Cascading update for Sales records
      if (oldId !== newId) {
        const updatedSales = sales.map(s => s.officerId === oldId ? { ...s, officerId: newId } : s);
        setSales(updatedSales);
        
        // Persist cascading sales updates
        const salesToUpdate = updatedSales.filter(s => s.officerId === newId);
        Promise.all(salesToUpdate.map(s => DatabaseService.updateSale(s))).catch(err => 
          console.error("Failed to persist cascading sales updates", err)
        );
      }

      const updatedOfficers = officers.map(o => o.id === oldId ? { ...o, ...formData as Officer } : o);
      setOfficers(updatedOfficers);
      DatabaseService.saveOfficers(updatedOfficers).catch(err => console.error("Failed to save officers", err));
    } else {
      const updatedOfficers = [...officers, formData as Officer];
      setOfficers(updatedOfficers);
      DatabaseService.saveOfficers(updatedOfficers).catch(err => console.error("Failed to save officers", err));
    }
    setShowModal(false);
    setEditingOfficer(null);
  };

  const getOfficerSales = (officerId: string) => {
    return sales.filter(s => s.officerId === officerId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const calculateTotals = (salesList: Sale[]) => {
    let totalBags = 0;
    let totalKg = 0;
    let totalAmount = 0;
    let totalPaid = 0;
    let totalDue = 0;

    salesList.forEach(sale => {
      totalAmount += sale.netAmount;
      totalPaid += sale.paidAmount;
      totalDue += sale.dueAmount;
      
      sale.items.forEach(item => {
        totalBags += item.quantity;
        const product = products.find(p => p.code === item.productCode);
        const weightMatch = product?.bagSize.match(/(\d+(\.\d+)?)/);
        const weight = weightMatch ? parseFloat(weightMatch[1]) : 50;
        totalKg += item.quantity * weight;
      });
    });

    return { totalBags, totalKg, totalAmount, totalPaid, totalDue };
  };

  const handleDelete = (id: string) => {
    if (role === 'VISITOR') {
      alert(lang === 'BN' ? "ভিজিটর মোডে ডিলিট করা সম্ভব নয়।" : "Deletion is not allowed in Visitor mode.");
      return;
    }
    if (confirm(lang === 'BN' ? 'আপনি কি নিশ্চিতভাবে এই অফিসারটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this officer?')) {
      const updatedOfficers = officers.filter(o => o.id !== id);
      setOfficers(updatedOfficers);
      DatabaseService.saveOfficers(updatedOfficers).catch(err => console.error("Failed to save officers", err));
    }
  };

  const handlePrintOfficerStatement = (officer: Officer) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const officerSales = getOfficerSales(officer.id);
    const totals = calculateTotals(officerSales);

    const html = `
      <html>
        <head>
          <title>Officer Statement - ${officer.name}</title>
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
          <div class="max-w-6xl mx-auto border-4 border-[#722f37] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-[#722f37] opacity-5 -mr-32 -mt-32 rounded-full"></div>
            
            <div class="border-b-4 border-[#722f37] pb-6 text-center mb-8 relative">
              <div class="flex justify-between items-start">
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
              </div>

              <div class="mt-8 flex justify-center">
                <div class="bg-slate-900 text-white px-10 py-2.5 rounded-full text-[12px] font-black uppercase tracking-[0.4em] shadow-xl border-2 border-white/20">
                  OFFICER STATEMENT
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-12 mb-10 relative z-10">
              <div class="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                <p class="text-[10px] font-black text-[#722f37] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 bg-[#722f37] rounded-full"></span> OFFICER IDENTITY
                </p>
                <h3 class="text-xl font-black text-slate-900 uppercase mb-1">${officer.name}</h3>
                <p class="text-sm font-bold text-slate-600 mb-1">${officer.designation}</p>
                <p class="text-xs font-bold text-slate-400 uppercase">${officer.area}</p>
                <div class="space-y-1 pt-4 border-t border-slate-200 mt-4">
                  <p class="text-xs font-bold text-slate-500"><span class="font-black text-slate-400 uppercase mr-2">ID:</span> ${officer.id}</p>
                  <p class="text-xs font-bold text-slate-500"><span class="font-black text-slate-400 uppercase mr-2">Mobile:</span> ${officer.mobile}</p>
                </div>
              </div>
              <div class="bg-[#722f37] text-white p-8 rounded-[3rem] shadow-2xl space-y-4">
                <p class="text-[10px] font-black text-rose-200 uppercase tracking-widest mb-2">Performance Summary</p>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-[9px] font-bold opacity-60 uppercase">Total Sales</p>
                    <p class="text-lg font-black">৳${totals.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p class="text-[9px] font-bold opacity-60 uppercase">Total Paid</p>
                    <p class="text-lg font-black text-emerald-300">৳${totals.totalPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p class="text-[9px] font-bold opacity-60 uppercase">Total Bags</p>
                    <p class="text-lg font-black">${totals.totalBags} Bags</p>
                  </div>
                  <div>
                    <p class="text-[9px] font-bold opacity-60 uppercase">Total Weight</p>
                    <p class="text-lg font-black">${totals.totalKg.toLocaleString()} KG</p>
                  </div>
                </div>
                <div class="pt-4 border-t border-white/20">
                  <p class="text-[9px] font-bold opacity-60 uppercase">Outstanding Due</p>
                  <p class="text-2xl font-black text-rose-300">৳${totals.totalDue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <table class="w-full text-left border-collapse mb-10 relative z-10">
              <thead>
                <tr class="bg-[#722f37] text-white">
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest rounded-tl-2xl">Date</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Dealer / Invoice</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right">Amount</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right">Paid</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right rounded-tr-2xl">Due</th>
                </tr>
              </thead>
              <tbody class="divide-y-2 divide-slate-100">
                ${officerSales.map((sale, idx) => `
                  <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}">
                    <td class="py-5 px-4 text-xs font-bold text-slate-600">${sale.date}</td>
                    <td class="py-5 px-4">
                      <div class="text-sm font-black text-slate-900 uppercase tracking-tight">${customers.find(c => c.id === sale.customerId)?.name || 'N/A'}</div>
                      <div class="text-[9px] font-bold text-[#722f37] uppercase mt-1">Invoice #ABS-${sale.invoiceNo}</div>
                    </td>
                    <td class="py-5 px-4 text-right font-black text-slate-900 text-sm">৳${sale.netAmount.toLocaleString()}</td>
                    <td class="py-5 px-4 text-right font-black text-emerald-600 text-sm">৳${sale.paidAmount.toLocaleString()}</td>
                    <td class="py-5 px-4 text-right font-black text-rose-600 text-sm">৳${sale.dueAmount.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="grid grid-cols-3 gap-12 mt-20 pt-10 relative z-10">
              <div class="text-center">
                <div class="h-12"></div>
                <div class="border-t-2 border-slate-200 pt-4">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Officer Signature</p>
                </div>
              </div>
              <div class="text-center">
                <div class="h-12"></div>
                <div class="border-t-2 border-slate-200 pt-4">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accounts Dept</p>
                </div>
              </div>
              <div class="text-center">
                <div class="h-12"></div>
                <div class="border-t-4 border-[#722f37] pt-4">
                  <p class="text-[10px] font-black text-slate-900 uppercase tracking-widest">Managing Director</p>
                </div>
              </div>
            </div>

            <div class="mt-16 pt-8 border-t border-slate-100 text-center relative z-10">
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-4">w w w . a b s f e e d . c o m</p>
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
    <div className="space-y-10">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{lang === 'BN' ? 'সেলস অফিসার তালিকা' : 'Field Personnel'}</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Management of Territory Sales Team</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 text-sm uppercase tracking-widest"
        >
          <UserPlus size={20} /> {lang === 'BN' ? 'অফিসার যোগ করুন' : 'Recruit Officer'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 no-print">
        {officers.map((officer) => (
          <div key={officer.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-black border-2 border-white shadow-inner ring-4 ring-blue-50/50 group-hover:scale-110 transition-transform">
                {officer.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-lg">{officer.name}</h3>
                  <BadgeCheck size={18} className="text-blue-500" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">ID: {officer.id} • {officer.designation}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors"><MapPin size={20} /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{lang === 'BN' ? 'কর্ম এলাকা' : 'Territory Area'}</p>
                  <p className="text-sm font-black text-slate-800">{officer.area}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors"><Phone size={20} /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{lang === 'BN' ? 'মোবাইল নম্বর' : 'Primary Contact'}</p>
                  <p className="text-sm font-black text-slate-800">{officer.mobile}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between gap-2">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${officer.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {officer.status}
              </span>
              <div className="flex gap-1.5">
                <button onClick={() => handleOpenModal(officer)} className="text-[9px] font-black text-blue-600 hover:bg-blue-50 px-2.5 py-2 rounded-lg transition-all uppercase tracking-widest flex items-center gap-1">
                  <Edit2 size={10}/> {lang === 'BN' ? 'সম্পাদনা' : 'Edit'}
                </button>
                <button onClick={() => handleDelete(officer.id)} className="text-[9px] font-black text-rose-600 hover:bg-rose-50 px-2.5 py-2 rounded-lg transition-all uppercase tracking-widest flex items-center gap-1">
                  <Trash2 size={10}/> {lang === 'BN' ? 'মুছুন' : 'Delete'}
                </button>
                <button onClick={() => setViewStatement(officer)} className="text-[9px] font-black text-white bg-slate-900 hover:bg-[#722f37] px-3 py-2 rounded-lg transition-all uppercase tracking-widest flex items-center gap-1">
                  <Activity size={10}/> {lang === 'BN' ? 'স্টেটমেন্ট' : 'Statement'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Officer Statement Modal */}
      {viewStatement && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm modal-overlay overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden print-m-0 modal-container flex flex-col max-h-[95vh]">
             <div className="bg-slate-900 p-8 text-white flex justify-between items-center no-print shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#722f37] rounded-2xl">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">{lang === 'BN' ? 'সেলস রিপোর্ট' : 'Sales Performance Statement'}</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{viewStatement.name} • Audit Log</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handlePrintOfficerStatement(viewStatement)} className="px-6 py-2.5 bg-[#722f37] text-white hover:bg-rose-950 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase shadow-lg">
                    <Printer size={18} /> Print Statement
                  </button>
                  <button onClick={() => setViewStatement(null)} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white">
                    <X size={24} />
                  </button>
                </div>
             </div>

             <div className="flex-1 p-10 space-y-10 overflow-y-auto print-p-0 print-m-0 invoice-content">
                <div className="no-print-section">
                  <PrintHeader 
                    companyName={companyName} 
                    title={lang === 'BN' ? 'অফিসার সেলস রিপোর্ট' : 'Officer Sales Performance Ledger'} 
                    subtitle={lang === 'BN' ? 'বিস্তারিত পারফরম্যান্স রিপোর্ট' : 'Detailed Performance Audit Report'}
                  />
                </div>
                
                {/* Print-only header */}
                <div className="hidden print:block">
                  <PrintHeader 
                    companyName={companyName} 
                    title={lang === 'BN' ? 'অফিসার সেলস রিপোর্ট' : 'Officer Sales Performance Ledger'} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 shrink-0">
                   <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Officer Profile</p>
                      <p className="text-lg font-black text-slate-900 uppercase leading-none mb-1">{viewStatement.name}</p>
                      <p className="text-[11px] font-bold text-[#722f37] uppercase tracking-wider">{viewStatement.designation} • ID: {viewStatement.id}</p>
                      <p className="text-[11px] font-black text-slate-800 mt-3 flex items-center gap-1.5"><Phone size={12} className="text-[#722f37]"/> {viewStatement.mobile}</p>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#722f37] p-6 rounded-[2rem] text-white flex flex-col justify-center shadow-lg">
                        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Total Sales</p>
                        <p className="text-2xl font-black mt-1">৳{getOfficerSales(viewStatement.id).reduce((s, x) => s + x.netAmount, 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Invoices</p>
                        <p className="text-2xl font-black text-blue-700 mt-1">{getOfficerSales(viewStatement.id).length}</p>
                      </div>
                      <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Qty (Bag)</p>
                        <p className="text-2xl font-black text-emerald-700 mt-1">
                          {getOfficerSales(viewStatement.id).reduce((sum, sale) => 
                            sum + sale.items.reduce((iSum, item) => iSum + item.quantity, 0), 0
                          )}
                        </p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Customer Sales Summary</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from(new Set(getOfficerSales(viewStatement.id).map(s => s.customerId))).map(cId => {
                        const customer = customers.find(c => c.id === cId);
                        const customerSales = getOfficerSales(viewStatement.id).filter(s => s.customerId === cId);
                        const totalQty = customerSales.reduce((sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
                        const totalAmount = customerSales.reduce((sum, s) => sum + s.netAmount, 0);
                        return (
                          <div key={cId} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase">ID: {cId}</p>
                                <h4 className="font-black text-slate-900 text-sm uppercase truncate w-40">{customer?.name || 'Unknown'}</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{customer?.companyName}</p>
                              </div>
                              <ShoppingBag size={16} className="text-slate-200" />
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                              <div className="text-[9px] font-black text-slate-500 uppercase">Qty: <span className="text-slate-900">{totalQty} Bag</span></div>
                              <div className="text-[9px] font-black text-slate-500 uppercase">Total: <span className="text-emerald-600">৳{totalAmount.toLocaleString()}</span></div>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </div>

                <div className="space-y-4 shrink-0">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white rounded-2xl overflow-hidden">
                      <tr>
                        <th className="px-4 py-4 uppercase font-black tracking-widest rounded-l-2xl text-[9px]">Date / Inv No</th>
                        <th className="px-4 py-4 uppercase font-black tracking-widest text-[9px]">Dealer / Customer</th>
                        <th className="px-4 py-4 uppercase font-black tracking-widest text-[9px]">Products / Qty</th>
                        <th className="px-4 py-4 uppercase font-black tracking-widest text-[9px] text-right">Net Amount</th>
                        <th className="px-4 py-4 uppercase font-black tracking-widest text-[9px] text-right">Paid</th>
                        <th className="px-4 py-4 uppercase font-black tracking-widest text-[9px] text-right rounded-r-2xl">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getOfficerSales(viewStatement.id).map((sale, i) => {
                        const customer = customers.find(c => c.id === sale.customerId);
                        return (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-4">
                              <p className="font-black text-slate-900 text-xs">{formatDate(sale.date)}</p>
                              <p className="text-[10px] font-black text-blue-600 uppercase">#ABS-{sale.invoiceNo}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-black text-slate-900 text-[10px] uppercase">{customer?.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">ID: {sale.customerId}</p>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-1 max-w-[200px]">
                                {sale.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-[8px] bg-slate-50 border border-slate-100 p-1 rounded">
                                    <span className="font-black text-slate-800 uppercase tracking-tighter truncate w-[120px]">{item.productName}</span>
                                    <span className="font-black text-[#722f37] whitespace-nowrap ml-2">{item.quantity} Bag</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right font-black text-slate-900 text-xs">৳{sale.netAmount.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-black text-emerald-600 text-xs">৳{sale.paidAmount.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-black text-rose-600 text-xs">৳{sale.dueAmount.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                      {(() => {
                        const totals = calculateTotals(getOfficerSales(viewStatement.id));
                        return (
                          <tr className="font-black text-slate-900">
                            <td colSpan={2} className="px-4 py-6 text-right uppercase tracking-widest text-[10px]">Grand Totals:</td>
                            <td className="px-4 py-6">
                              <div className="flex flex-col gap-1">
                                <span className="text-slate-900">{totals.totalBags.toLocaleString()} Bags</span>
                                <span className="text-[#722f37] text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-100 inline-block w-fit">{totals.totalKg.toLocaleString()} KG Total</span>
                              </div>
                            </td>
                            <td className="px-4 py-6 text-right">৳{totals.totalAmount.toLocaleString()}</td>
                            <td className="px-4 py-6 text-right text-emerald-600">৳{totals.totalPaid.toLocaleString()}</td>
                            <td className="px-4 py-6 text-right text-rose-600">৳{totals.totalDue.toLocaleString()}</td>
                          </tr>
                        );
                      })()}
                    </tfoot>
                  </table>
                </div>
                
                <div className="mt-auto pt-24 invoice-footer">
                  <div className="grid grid-cols-2 gap-8 px-10">
                    <div className="flex flex-col items-center">
                      <div className="w-full border-b border-slate-300 mb-2"></div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">OFFICER SIGNATURE</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-full border-b-2 border-[#722f37] mb-2"></div>
                      <p className="text-[9px] font-black text-[#722f37] uppercase tracking-widest">AUTHORIZED BY</p>
                    </div>
                  </div>
                  <div className="text-center pt-8 border-t border-slate-50 mt-12">
                     <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">w w w . a b s f e e d . c o m</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Add / Edit Officer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl shadow-xl ${editingOfficer ? 'bg-blue-600' : 'bg-[#722f37]'}`}>
                  {editingOfficer ? <Edit size={24} /> : <UserPlus size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {editingOfficer ? (lang === 'BN' ? 'অফিসার সংশোধন' : 'Modify Personnel') : (lang === 'BN' ? 'নতুন অফিসার' : 'Recruit Personnel')}
                  </h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                    {editingOfficer ? `Updating record for ID: ${formData.id}` : 'Onboarding new field sales representative'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); setEditingOfficer(null); }} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <form className="p-10 space-y-8" onSubmit={handleSubmit}>
              {editingOfficer && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-[11px] font-bold text-blue-800 leading-tight">
                    {lang === 'BN' ? 
                      "অফিসার আইডি পরিবর্তন করলে তার করা সকল পুরনো ইনভয়েস রেকর্ডে স্বয়ংক্রিয়ভাবে নতুন আইডি আপডেট হবে।" : 
                      "Changing the Employee ID will automatically update the ID in all historical invoice records created by this officer."}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'অফিসার আইডি' : 'Employee ID'}</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none font-black text-slate-700 focus:ring-2 focus:ring-rose-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'পদবী' : 'Job Designation'}</label>
                  <select 
                    value={formData.designation} 
                    onChange={e => setFormData({...formData, designation: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700"
                  >
                    <option value="Sales Officer">Sales Officer</option>
                    <option value="Field Officer">Field Officer</option>
                    <option value="Territory Manager">Territory Manager</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Regional Manager">Regional Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'নাম' : 'Officer Full Name'}</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'এলাকা' : 'Assigned Territory'}</label>
                  <input required type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'মোবাইল' : 'Primary Mobile'}</label>
                  <input required type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'অবস্থা' : 'Employment Status'}</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className={`w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none font-black ${formData.status === 'Active' ? 'text-emerald-600 focus:ring-emerald-500' : 'text-rose-600 focus:ring-rose-500'}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingOfficer(null); }} className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-2xl transition-all active:scale-95 uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl transition-all active:scale-95 shadow-xl shadow-slate-200 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                   <CheckCircle size={16} /> {editingOfficer ? 'Update Records' : 'Confirm Recruitment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerList;
