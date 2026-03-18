
import React, { useState, useContext } from 'react';
import { Customer, Sale, Officer, Product } from '../types';
import { Search, Plus, MapPin, Phone, Building, User, X, Printer, FileText, Calendar, UserCheck, ShieldCheck, Receipt, PieChart, Activity, Mail, Edit2, Trash2, CheckCircle, Save, AlertCircle, DollarSign, Edit } from 'lucide-react';
import { LanguageContext } from '../App';
import { PrintHeader } from '../components/PrintHeader';
import { DatabaseService } from '../database';

interface CustomerListProps {
  customers: Customer[];
  sales: Sale[];
  officers: Officer[];
  products: Product[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  role: string;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, sales, officers, products, setCustomers, setSales, role }) => {
  const { t, lang, companyName } = useContext(LanguageContext)!;
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewStatement, setViewStatement] = useState<Customer | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ sale: Sale, customer: Customer } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const [formData, setFormData] = useState<Partial<Customer>>({
    id: '',
    name: '',
    companyName: '',
    address: '',
    mobile: '',
    type: 'Dealer',
    creditLimit: 0,
    balance: 0
  });

  const handleOpenModal = (c?: Customer) => {
    if (c) {
      setEditingCustomer(c);
      setFormData({ ...c });
    } else {
      setEditingCustomer(null);
      setFormData({
        id: `C${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: '', 
        companyName: '', 
        address: '', 
        mobile: '', 
        type: 'Dealer', 
        creditLimit: 500000, 
        balance: 0
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
    if (!editingCustomer || (editingCustomer && editingCustomer.id !== formData.id)) {
      const exists = customers.some(c => c.id === formData.id);
      if (exists) {
        alert(lang === 'BN' ? "এই আইডি ইতিমধ্যে অন্য কাস্টমারের জন্য ব্যবহৃত হচ্ছে!" : "This ID is already used by another customer!");
        return;
      }
    }

    if (editingCustomer) {
      const oldId = editingCustomer.id;
      const newId = formData.id!;

      // Cascading Update for Sales records if ID changed
      if (oldId !== newId) {
        const updatedSales = sales.map(s => s.customerId === oldId ? { ...s, customerId: newId } : s);
        setSales(updatedSales);
        
        // Persist cascading sales updates
        const salesToUpdate = updatedSales.filter(s => s.customerId === newId);
        Promise.all(salesToUpdate.map(s => DatabaseService.updateSale(s))).catch(err => 
          console.error("Failed to persist cascading sales updates", err)
        );
      }

      // Update customer object
      const updatedCustomers = customers.map(c => c.id === oldId ? { ...c, ...formData as Customer } : c);
      setCustomers(updatedCustomers);
      DatabaseService.saveCustomers(updatedCustomers).catch(err => console.error("Failed to save customers", err));
    } else {
      // Add new customer
      const updatedCustomers = [...customers, formData as Customer];
      setCustomers(updatedCustomers);
      DatabaseService.saveCustomers(updatedCustomers).catch(err => console.error("Failed to save customers", err));
    }
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'VISITOR') {
      alert(lang === 'BN' ? "ভিজিটর মোডে পেমেন্ট করা সম্ভব নয়।" : "Payments are not allowed in Visitor mode.");
      return;
    }
    if (!paymentModal || paymentAmount <= 0) return;

    const { sale, customer } = paymentModal;

    if (paymentAmount > sale.dueAmount) {
      alert(lang === 'BN' ? "পেমেন্ট পরিমাণ বকেয়ার চেয়ে বেশি হতে পারে না!" : "Payment amount cannot exceed due amount!");
      return;
    }

    // Update Sale
    const updatedSale = {
      ...sale,
      paidAmount: sale.paidAmount + paymentAmount,
      dueAmount: sale.dueAmount - paymentAmount
    };

    const updatedSales = sales.map(s => {
      if (s.invoiceNo === sale.invoiceNo) {
        return updatedSale;
      }
      return s;
    });
    setSales(updatedSales);

    // Update Customer Balance
    const updatedCustomer = {
      ...customer,
      balance: customer.balance + paymentAmount
    };

    const updatedCustomers = customers.map(c => {
      if (c.id === customer.id) {
        return updatedCustomer;
      }
      return c;
    });
    setCustomers(updatedCustomers);

    // Update viewStatement if it's open
    if (viewStatement && viewStatement.id === customer.id) {
      setViewStatement(updatedCustomer);
    }

    // Persist to Database
    try {
      await DatabaseService.updateSale(updatedSale);
      await DatabaseService.saveCustomers(updatedCustomers);
    } catch (err) {
      console.error("Failed to persist payment update", err);
    }

    setPaymentModal(null);
    setPaymentAmount(0);
  };

  const handleDelete = (id: string) => {
    if (confirm(lang === 'BN' ? 'আপনি কি নিশ্চিতভাবে এই কাস্টমারটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this customer?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const handlePrintStatement = (customer: Customer) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const customerSales = sales.filter(s => s.customerId === customer.id);
    const off = officers.find(o => o.id === customer.officerId);

    const html = `
      <html>
        <head>
          <title>Statement - ${customer.name}</title>
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
                  ACCOUNT STATEMENT
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-12 mb-10 relative z-10">
              <div class="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                <p class="text-[10px] font-black text-[#722f37] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 bg-[#722f37] rounded-full"></span> DEALER IDENTITY
                </p>
                <h3 class="text-xl font-black text-slate-900 uppercase mb-1">${customer.name}</h3>
                <p class="text-sm font-bold text-slate-600 mb-1">${customer.companyName}</p>
                <p class="text-xs font-bold text-slate-400 uppercase">${customer.address}</p>
                <div class="space-y-1 pt-4 border-t border-slate-200 mt-4">
                  <p class="text-xs font-bold text-slate-500"><span class="font-black text-slate-400 uppercase mr-2">ID:</span> ${customer.id}</p>
                  <p class="text-xs font-bold text-slate-500"><span class="font-black text-slate-400 uppercase mr-2">Mobile:</span> ${customer.mobile}</p>
                </div>
              </div>
              <div class="bg-rose-50 p-8 rounded-[3rem] border-2 border-rose-100 text-right flex flex-col justify-center">
                <p class="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Current Balance</p>
                <h3 class="text-4xl font-black ${customer.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}">
                  ৳${Math.abs(customer.balance).toLocaleString()} ${customer.balance < 0 ? 'DUE' : 'CR'}
                </h3>
                <div class="pt-4 mt-4 border-t border-rose-200">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">Credit Limit: ৳${customer.creditLimit.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <table class="w-full text-left border-collapse mb-10 relative z-10">
              <thead>
                <tr class="bg-[#722f37] text-white">
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest rounded-tl-2xl">Date</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Description</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right">Debit (Sales)</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right">Credit (Paid)</th>
                  <th class="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right rounded-tr-2xl">Balance</th>
                </tr>
              </thead>
              <tbody class="divide-y-2 divide-slate-100">
                ${customerSales.map((sale, idx) => `
                  <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}">
                    <td class="py-5 px-4 text-xs font-bold text-slate-600">${sale.date}</td>
                    <td class="py-5 px-4">
                      <div class="text-sm font-black text-slate-900 uppercase tracking-tight">Invoice #ABS-${sale.invoiceNo}</div>
                      <div class="text-[9px] font-bold text-[#722f37] uppercase mt-1">Officer: ${officers.find(o => o.id === sale.officerId)?.name || 'N/A'}</div>
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
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dealer Signature</p>
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

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerSales = (customerId: string) => {
    return sales.filter(s => s.customerId === customerId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{lang === 'BN' ? 'কাস্টমার ও ডিলার' : 'Customer Network'}</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Partnership & Credit Management</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#722f37] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-rose-900/20 hover:bg-rose-950 transition-all active:scale-95 text-sm uppercase tracking-widest"
        >
          <Plus size={20} /> {lang === 'BN' ? 'নতুন কাস্টমার' : 'Add Partner'}
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 no-print">
        <div className="relative">
          <input 
            type="text" 
            placeholder={lang === 'BN' ? "আইডি, নাম বা কোম্পানি দিয়ে খুজুন..." : "Search by ID, name or company..."} 
            className="w-full pl-14 pr-4 py-4 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-800 bg-slate-50/50 font-bold text-slate-700 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-5 top-4.5 text-slate-300" size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 no-print">
        {filtered.map((customer) => (
          <div key={customer.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-2xl hover:border-rose-100 transition-all duration-300 group">
            <div className="p-8 border-b border-slate-50 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-[#722f37] bg-rose-50 px-2 py-1 rounded-lg uppercase tracking-widest">{customer.id}</span>
                <h3 className="text-xl font-black text-slate-900 mt-3 group-hover:text-[#722f37] transition-colors">{customer.name}</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase mt-1 tracking-wider">
                  <Building size={14} className="text-slate-300" /> {customer.companyName}
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${customer.type === 'Dealer' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-[#722f37]'}`}>
                {customer.type}
              </span>
            </div>
            
            <div className="p-8 space-y-4 bg-slate-50/30">
              <div className="flex items-start gap-4 text-xs text-slate-600 font-bold leading-relaxed">
                <MapPin size={18} className="text-slate-300 shrink-0" />
                <span className="line-clamp-2">{customer.address}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600 font-black">
                <Phone size={18} className="text-slate-300 shrink-0" />
                <span>{customer.mobile}</span>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{lang === 'BN' ? 'ক্রেডিট লিমিট' : 'Limit'}</p>
                  <p className="text-sm font-black text-slate-800 mt-1">৳{customer.creditLimit.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm text-right">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{lang === 'BN' ? 'বর্তমান ব্যালেন্স' : 'Balance'}</p>
                  <p className={`text-sm font-black mt-1 ${customer.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ৳{Math.abs(customer.balance).toLocaleString()} {customer.balance < 0 ? 'DUE' : 'CR'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white flex gap-2">
              <button 
                onClick={() => handleOpenModal(customer)} 
                className="flex-1 text-[9px] font-black uppercase tracking-widest py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Edit2 size={12} /> {lang === 'BN' ? 'সম্পাদনা' : 'Edit'}
              </button>
              <button 
                onClick={() => handleDelete(customer.id)} 
                className="flex-1 text-[9px] font-black uppercase tracking-widest py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 size={12} /> {lang === 'BN' ? 'মুছুন' : 'Delete'}
              </button>
              <button 
                onClick={() => setViewStatement(customer)} 
                className="flex-1 text-[9px] font-black uppercase tracking-widest py-3 bg-slate-900 text-white rounded-xl hover:bg-[#722f37] transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-1.5"
              >
                <Activity size={12} /> {lang === 'BN' ? 'স্টেটমেন্ট' : 'Statement'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Account Statement Modal */}
      {viewStatement && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm modal-overlay overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden print-m-0 modal-container flex flex-col max-h-[95vh]">
             <div className="bg-[#722f37] p-8 text-white flex justify-between items-center no-print shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">{lang === 'BN' ? 'অ্যাকাউন্ট স্টেটমেন্ট' : 'Account Statement'}</h2>
                    <p className="text-rose-200 text-[10px] font-bold uppercase tracking-widest">Dealer Ledger Detail</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handlePrintStatement(viewStatement)} className="px-6 py-2.5 bg-white text-[#722f37] hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase shadow-lg">
                    <Printer size={18} /> {lang === 'BN' ? 'প্রিন্ট' : 'Print Statement'}
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
                    title={lang === 'BN' ? 'ডিলার লেজার রিপোর্ট' : 'Dealer Account Ledger Statement'} 
                    subtitle={lang === 'BN' ? 'বিস্তারিত লেনদেন রিপোর্ট' : 'Detailed Transaction History Report'}
                  />
                </div>
                
                {/* Print-only header to ensure it shows up on every page if needed, but for now just once at top */}
                <div className="hidden print:block">
                  <PrintHeader 
                    companyName={companyName} 
                    title={lang === 'BN' ? 'ডিলার লেজার রিপোর্ট' : 'Dealer Account Ledger Statement'} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 shrink-0">
                   <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Dealer Identity</p>
                      <p className="text-lg font-black text-slate-900 uppercase leading-none mb-1">{viewStatement.name}</p>
                      <p className="text-[11px] font-bold text-[#722f37] uppercase tracking-wider">DEALER ID: {viewStatement.id}</p>
                      <p className="text-[11px] font-bold text-slate-500 uppercase">{viewStatement.companyName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{viewStatement.address}</p>
                      <p className="text-[11px] font-black text-slate-800 mt-3 flex items-center gap-1.5"><Phone size={12} className="text-[#722f37]"/> {viewStatement.mobile}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Outstanding Due</p>
                        <p className="text-2xl font-black text-rose-700 mt-1">৳{Math.abs(viewStatement.balance).toLocaleString()}</p>
                        <span className="text-[9px] font-black text-rose-400 uppercase mt-2">DUE BALANCE</span>
                      </div>
                      <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Credit Limit</p>
                        <p className="text-2xl font-black text-emerald-700 mt-1">৳{viewStatement.creditLimit.toLocaleString()}</p>
                        <span className="text-[9px] font-black text-emerald-400 uppercase mt-2">ACCOUNT LIMIT</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 shrink-0">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-900 text-white rounded-2xl overflow-hidden">
                      <tr>
                        <th className="px-4 py-4 uppercase font-black tracking-widest rounded-l-2xl">Date / Invoice</th>
                        <th className="px-4 py-4 uppercase font-black tracking-widest">Officer Detail</th>
                        <th className="px-4 py-4 uppercase font-black tracking-widest">Products</th>
                        <th className="px-4 py-4 uppercase font-black tracking-widest text-right">Net Amount</th>
                        <th className="px-4 py-4 uppercase font-black tracking-widest text-right">Paid</th>
                        <th className="px-4 py-4 uppercase font-black tracking-widest text-right">Due</th>
                        <th className="px-4 py-4 uppercase font-black tracking-widest text-right rounded-r-2xl no-print">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getCustomerSales(viewStatement.id).map((sale, i) => {
                        const off = officers.find(o => o.id === sale.officerId);
                        return (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-5">
                              <p className="font-black text-slate-900">{sale.date}</p>
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">#ABS-{sale.invoiceNo}</p>
                            </td>
                            <td className="px-4 py-5">
                              <p className="font-black text-slate-800 uppercase text-[10px] leading-tight">{off?.name || 'Agent'}</p>
                              <p className="text-[9px] font-bold text-[#722f37] uppercase mt-0.5">ID: {sale.officerId}</p>
                            </td>
                            <td className="px-4 py-5">
                              <div className="flex flex-col gap-1.5 max-w-[280px]">
                                {sale.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-[9px] bg-slate-50 border border-slate-100 p-1.5 rounded">
                                    <span className="font-black text-slate-800 uppercase tracking-tighter truncate w-[180px]">[{item.productCode}] {item.productName}</span>
                                    <span className="font-black text-[#722f37] whitespace-nowrap ml-2">{item.quantity} Bag</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-5 text-right font-black text-slate-900">৳{sale.netAmount.toLocaleString()}</td>
                            <td className="px-4 py-5 text-right font-black text-emerald-600">৳{sale.paidAmount.toLocaleString()}</td>
                            <td className="px-4 py-5 text-right font-black text-rose-600">৳{sale.dueAmount.toLocaleString()}</td>
                            <td className="px-4 py-5 text-right no-print">
                              {sale.dueAmount > 0 && (
                                <button 
                                  onClick={() => { setPaymentModal({ sale, customer: viewStatement }); setPaymentAmount(sale.dueAmount); }}
                                  className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                                >
                                  {lang === 'BN' ? 'পেমেন্ট' : 'Pay'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                      {(() => {
                        const totals = calculateTotals(getCustomerSales(viewStatement.id));
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
                            <td className="no-print"></td>
                          </tr>
                        );
                      })()}
                    </tfoot>
                  </table>
                </div>
                
                <div className="mt-auto pt-24 invoice-footer">
                   <div className="grid grid-cols-2 gap-8 px-10">
                      <div className="flex flex-col items-center">
                         <div className="w-full border-b-2 border-slate-200 mb-3"></div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dealer Signature</p>
                      </div>
                      <div className="flex flex-col items-center">
                         <div className="w-full border-b-2 border-slate-200 mb-3"></div>
                         <p className="text-[10px] font-black uppercase text-[#722f37] tracking-widest">Authorized Signature</p>
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

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm no-print">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl shadow-xl">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {lang === 'BN' ? 'পেমেন্ট গ্রহণ' : 'Receive Payment'}
                  </h2>
                  <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mt-1">
                    Invoice #ABS-{paymentModal.sale.invoiceNo}
                  </p>
                </div>
              </div>
              <button onClick={() => setPaymentModal(null)} className="p-3 hover:bg-emerald-700 rounded-2xl transition-colors text-emerald-100">
                <X size={24} />
              </button>
            </div>
            
            <form className="p-10 space-y-8" onSubmit={handlePaymentSubmit}>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">Total Due:</span>
                  <span className="font-black text-rose-600">৳{paymentModal.sale.dueAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'পেমেন্ট পরিমাণ (৳)' : 'Payment Amount (৳)'}</label>
                <input 
                  required 
                  type="number" 
                  max={paymentModal.sale.dueAmount}
                  value={paymentAmount || ''} 
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none font-black text-2xl text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button type="button" onClick={() => setPaymentModal(null)} className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-2xl transition-all active:scale-95 uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-5 rounded-2xl transition-all active:scale-95 shadow-xl shadow-emerald-200 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                   <CheckCircle size={16} /> Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl shadow-xl ${editingCustomer ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                  {editingCustomer ? <Edit size={24} /> : <User size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {editingCustomer ? (lang === 'BN' ? 'তথ্য সংশোধন' : 'Edit Dealer Profile') : (lang === 'BN' ? 'নতুন কাস্টমার' : 'Create Partner Account')}
                  </h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                    {editingCustomer ? `Modify record for ${formData.id}` : 'Enroll new distribution partner'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); setEditingCustomer(null); }} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <form className="p-10 space-y-8" onSubmit={handleSubmit}>
              {editingCustomer && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-[11px] font-bold text-amber-800 leading-tight">
                    {lang === 'BN' ? 
                      "পার্টনার আইডি পরিবর্তন করলে পুরনো সকল বিক্রয় ও ইনভয়েস রেকর্ডে স্বয়ংক্রিয়ভাবে নতুন আইডি আপডেট হবে।" : 
                      "Changing the Partner ID will automatically update the ID in all historical sales and invoice records."}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'পার্টনার আইডি' : 'Partner ID'}</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none font-black text-slate-700 focus:ring-2 focus:ring-rose-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'ধরণ' : 'Type'}</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700"
                  >
                    <option value="Dealer">Dealer</option>
                    <option value="Retail">Retailer</option>
                    <option value="Customer">General Customer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'নাম' : 'Representative Name'}</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'কোম্পানি' : 'Establishment Name'}</label>
                  <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'মোবাইল' : 'Contact Number'}</label>
                  <input required type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'ক্রেডিট লিমিট' : 'Credit Authorization'}</label>
                  <input type="number" value={formData.creditLimit} onChange={e => setFormData({...formData, creditLimit: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-600" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'বর্তমান ব্যালেন্স' : 'Current Ledger Balance'}</label>
                <input type="number" value={formData.balance} onChange={e => setFormData({...formData, balance: parseFloat(e.target.value) || 0})} className={`w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 font-black text-xl ${formData.balance && formData.balance < 0 ? 'text-rose-600 focus:ring-rose-500' : 'text-emerald-600 focus:ring-emerald-500'}`} />
                <p className="text-[9px] text-slate-400 font-bold uppercase ml-1">* Use Negative (-) for DUE, Positive for Advance Credit</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'BN' ? 'ঠিকানা' : 'Physical Address'}</label>
                <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-rose-800 font-bold text-slate-700 resize-none" />
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingCustomer(null); }} className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-2xl transition-all active:scale-95 uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl transition-all active:scale-95 shadow-xl shadow-slate-200 uppercase text-[10px] tracking-widest">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
