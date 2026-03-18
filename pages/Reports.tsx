
import React, { useState, useContext } from 'react';
import { Sale, Product, Officer, Customer } from '../types';
import { Download, Printer, FileText, User, Eye, Receipt, X, Phone, UserCheck, Truck, Trash2, Edit2, QrCode, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LanguageContext } from '../App';
import { formatDate } from '../utils';
import { PrintHeader } from '../components/PrintHeader';

interface ReportsProps {
  sales: Sale[];
  products: Product[];
  officers: Officer[];
  customers: Customer[];
  onDeleteSale: (id: string) => void;
  onEditSale: (sale: Sale) => void;
  currentUserId: string | null;
}

const Reports: React.FC<ReportsProps> = ({ sales, products, officers, customers, onDeleteSale, onEditSale, currentUserId }) => {
  const { lang, companyName, role } = useContext(LanguageContext)!;
  const [viewInvoice, setViewInvoice] = useState<Sale | null>(null);
  const [shipping, setShipping] = useState({ driver: '', vehicle: '', phone: '' });

  const filteredSales = React.useMemo(() => {
    if (role === 'CUSTOMER') return sales.filter(s => s.customerId === currentUserId);
    if (role === 'OFFICER') return sales.filter(s => s.officerId === currentUserId);
    return sales;
  }, [sales, role, currentUserId]);

  const filteredCustomers = React.useMemo(() => {
    if (role === 'CUSTOMER') return customers.filter(c => c.id === currentUserId);
    return customers;
  }, [customers, role, currentUserId]);

  const totalPaid = React.useMemo(() => filteredSales.reduce((sum, s) => sum + s.paidAmount, 0), [filteredSales]);
  const totalDue = React.useMemo(() => filteredCustomers.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0), [filteredCustomers]);
  const grossSales = totalPaid + totalDue;

  const handlePrintAllReports = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Audit Report - ${companyName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .no-print { display: none; }
              body { padding: 0; background: white; }
            }
            body { font-family: 'Inter', sans-serif; background: #f8fafc; padding: 40px; }
          </style>
        </head>
        <body>
          <div class="max-w-5xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
            <!-- Decorative Elements -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
            <div class="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full -ml-32 -mb-32 opacity-50"></div>

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
                  SALES AUDIT REPORT
                </div>
              </div>
              <p class="text-slate-400 text-[10px] font-bold mt-3 uppercase tracking-widest">Report Date: ${new Date().toLocaleString()}</p>
            </div>

              <div class="grid grid-cols-3 gap-8 mb-12">
                <div class="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Sales</p>
                  <p class="text-3xl font-black text-slate-900">৳${grossSales.toLocaleString()}</p>
                </div>
                <div class="bg-emerald-50 p-8 rounded-[2rem] border-2 border-emerald-100">
                  <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Realised Cash</p>
                  <p class="text-3xl font-black text-emerald-700">৳${totalPaid.toLocaleString()}</p>
                </div>
                <div class="bg-rose-50 p-8 rounded-[2rem] border-2 border-rose-100">
                  <p class="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Outstanding</p>
                  <p class="text-3xl font-black text-rose-700">৳${totalDue.toLocaleString()}</p>
                </div>
              </div>

              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-900 text-white">
                    <th class="py-5 px-6 text-[10px] font-black uppercase tracking-widest rounded-tl-2xl">Date / Inv</th>
                    <th class="py-5 px-6 text-[10px] font-black uppercase tracking-widest">Customer / Dealer</th>
                    <th class="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-right rounded-tr-2xl">Net Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y-2 divide-slate-100">
                  ${filteredSales.map((sale, idx) => `
                    <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}">
                      <td class="py-5 px-6">
                        <p class="text-sm font-black text-slate-900">${formatDate(sale.date)}</p>
                        <p class="text-[10px] font-black text-rose-800 uppercase tracking-widest mt-1">#ABS-${sale.invoiceNo}</p>
                      </td>
                      <td class="py-5 px-6">
                        <p class="text-sm font-black text-slate-900 uppercase">${customers.find(c => c.id === sale.customerId)?.name || 'N/A'}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">ID: ${sale.customerId}</p>
                      </td>
                      <td class="py-5 px-6 text-right font-black text-slate-900 text-base">৳${sale.netAmount.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="mt-20 pt-12 border-t border-slate-100">
                <div class="grid grid-cols-3 gap-12 text-center">
                  <div>
                    <div class="border-b-2 border-slate-200 mb-3"></div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prepared By</p>
                  </div>
                  <div>
                    <div class="border-b-2 border-slate-200 mb-3"></div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified By</p>
                  </div>
                  <div>
                    <div class="border-b-2 border-[#722f37] mb-3"></div>
                    <p class="text-[10px] font-black text-[#722f37] uppercase tracking-widest">Authorized Signature</p>
                  </div>
                </div>
              </div>

              <div class="mt-12 text-center">
                <p class="text-[10px] font-black text-slate-300 tracking-[0.5em] uppercase">w w w . a b s f e e d . c o m</p>
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              // window.close(); // Optional: close window after printing
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintInvoice = (sale: Sale) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cust = customers.find(c => c.id === sale.customerId);
    const off = officers.find(o => o.id === sale.officerId);

    const html = `
      <html>
        <head>
          <title>Invoice - ${sale.invoiceNo}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .no-print { display: none; }
              body { padding: 0; margin: 0; }
            }
            body { font-family: 'Inter', sans-serif; }
          </style>
        </head>
        <body class="p-6">
          <div class="max-w-4xl mx-auto border-2 border-slate-200 p-8 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-48 h-48 bg-[#722f37] opacity-5 -mr-24 -mt-24 rounded-full"></div>
            
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

              <div class="mt-6 flex justify-center">
                <div class="bg-slate-900 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-lg border border-white/20">
                  SALES INVOICE
                </div>
              </div>
              <div class="mt-2 flex justify-between items-center px-4">
                <div class="text-left">
                  <p class="text-slate-400 text-[9px] font-black uppercase tracking-widest">Invoice Number</p>
                  <p class="text-lg font-black text-[#722f37]">#ABS-${sale.invoiceNo}</p>
                </div>
                <div class="text-right">
                  <p class="text-slate-400 text-[9px] font-black uppercase tracking-widest">Date</p>
                  <p class="text-lg font-black text-slate-900">${formatDate(sale.date)}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-8 mb-8 relative z-10">
              <div class="bg-slate-50 p-5 border border-slate-100">
                <p class="text-[9px] font-black text-[#722f37] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-[#722f37] rounded-full"></span> BILL TO / কাস্টমার
                </p>
                <h3 class="text-lg font-black text-slate-900 uppercase mb-1">${cust?.companyName || 'Establishment'}</h3>
                <p class="text-xs font-bold text-slate-600 mb-3">${cust?.address || 'Address Not Provided'}</p>
                <div class="space-y-1 pt-3 border-t border-slate-200">
                  <p class="text-[10px] font-bold text-slate-500"><span class="font-black text-slate-400 uppercase mr-2">Dealer:</span> ${cust?.name}</p>
                  <p class="text-[10px] font-bold text-slate-500"><span class="font-black text-slate-400 uppercase mr-2">ID:</span> ${cust?.id}</p>
                  <p class="text-[10px] font-bold text-slate-500"><span class="font-black text-slate-400 uppercase mr-2">Mobile:</span> ${cust?.mobile}</p>
                </div>
              </div>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-slate-50 p-3 border border-slate-100">
                    <p class="text-[8px] font-black text-slate-400 uppercase mb-1">Date</p>
                    <p class="text-xs font-black text-slate-900">${formatDate(sale.date)}</p>
                  </div>
                  <div class="bg-slate-50 p-3 border border-slate-100">
                    <p class="text-[8px] font-black text-slate-400 uppercase mb-1">Serial</p>
                    <p class="text-xs font-black text-slate-900">SN-${sale.serialNo.padStart(3, '0')}</p>
                  </div>
                </div>
                <div class="bg-[#722f37]/5 p-5 border border-[#722f37]/10">
                  <p class="text-[9px] font-black text-[#722f37] uppercase tracking-widest mb-2">Sales Officer / অফিসার</p>
                  <p class="text-base font-black text-slate-900 uppercase">${off?.name || 'N/A'}</p>
                  <p class="text-[10px] font-bold text-[#722f37] uppercase">ID: ${sale.officerId} | ${off?.mobile}</p>
                  <p class="text-[9px] font-black text-slate-400 uppercase mt-1">${off?.area || 'Global Area'}</p>
                </div>
              </div>
            </div>

            <table class="w-full text-left border-collapse mb-8 relative z-10">
              <thead>
                <tr class="bg-[#722f37] text-white">
                  <th class="py-3 px-4 text-[9px] font-black uppercase tracking-widest">Description</th>
                  <th class="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-center">Qty</th>
                  <th class="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right">Rate</th>
                  <th class="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${sale.items.map((item, idx) => `
                  <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}">
                    <td class="py-4 px-4">
                      <div class="text-xs font-black text-slate-900 uppercase tracking-tight">[${item.productCode}] ${item.productName}</div>
                      <div class="text-[8px] font-bold text-[#722f37] uppercase mt-1">Batch: ${item.batchNumber || 'N/A'}</div>
                    </td>
                    <td class="py-4 px-4 text-center font-black text-slate-700 text-xs">${item.quantity} Bag</td>
                    <td class="py-4 px-4 text-right font-bold text-slate-600 text-xs">৳${item.unitPrice.toLocaleString()}</td>
                    <td class="py-4 px-4 text-right font-black text-slate-900 text-xs">৳${item.total.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="flex justify-between items-start gap-10 relative z-10">
              <div class="flex-1 space-y-4">
                <div class="bg-slate-50 p-5 border border-slate-100">
                  <p class="text-[9px] font-black text-[#722f37] uppercase tracking-widest mb-3">Shipping Details</p>
                  <div class="space-y-1.5">
                    <p class="text-[10px] font-bold text-slate-600"><span class="font-black text-slate-400 uppercase mr-4 w-16 inline-block">Driver:</span> ${shipping.driver || 'N/A'}</p>
                    <p class="text-[10px] font-bold text-slate-600"><span class="font-black text-slate-400 uppercase mr-4 w-16 inline-block">Vehicle:</span> <span class="uppercase">${shipping.vehicle || 'N/A'}</span></p>
                    <p class="text-[10px] font-bold text-slate-600"><span class="font-black text-slate-400 uppercase mr-4 w-16 inline-block">Mobile:</span> ${shipping.phone || 'N/A'}</p>
                  </div>
                </div>
                <div class="text-center p-5 border border-dashed border-slate-200">
                  <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Authorized Signature</p>
                  <div class="h-12"></div>
                  <div class="border-t border-[#722f37] w-40 mx-auto"></div>
                </div>
              </div>

              <div class="w-64 bg-rose-50 p-6 border border-rose-100 space-y-3">
                <div class="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  <span>Gross Total</span>
                  <span>৳${sale.totalAmount.toLocaleString()}</span>
                </div>
                <div class="flex justify-between text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                  <span>Discount</span>
                  <span>-৳${sale.discount.toLocaleString()}</span>
                </div>
                <div class="pt-3 border-t border-[#722f37] flex justify-between items-center text-[#722f37]">
                  <span class="text-xs font-black uppercase tracking-tighter">Net Payable</span>
                  <span class="text-xl font-black">৳${sale.netAmount.toLocaleString()}</span>
                </div>
                <div class="flex justify-between text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  <span>Paid Amount</span>
                  <span>৳${sale.paidAmount.toLocaleString()}</span>
                </div>
                <div class="pt-3 border-t border-dashed border-rose-300 flex justify-between items-center text-rose-600">
                  <span class="text-xs font-black uppercase tracking-tighter">Invoice Due</span>
                  <span class="text-lg font-black">৳${sale.dueAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="mt-8 text-center pb-6">
              <p class="text-[8px] font-semibold text-rose-600 leading-relaxed max-w-2xl mx-auto">
                Make all checks/payment payable to [ABS FEED INDUSTRIES LIMITED ]. If you have any questions concerning this invoice, contact [MR. SIDDIQUE-AGM-KHULNA], [01918-594466], [absfeed.info@gmail.com] [This invoice is very important for both, please keep it safe and confidential for business interest]
              </p>
            </div>

            <div class="mt-12 pt-6 border-t border-slate-100 text-center relative z-10">
              <p class="text-[8px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-3">w w w . a b s f e e d . c o m</p>
              <p class="text-[7px] font-medium text-slate-400 max-w-2xl mx-auto leading-relaxed">
                This invoice is a legal document. Please keep it safe for your records. ABS Feed Industries Limited is committed to quality and excellence in every bag.
              </p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{lang === 'BN' ? 'রিপোর্ট ও বিশ্লেষণ' : 'Reports & Analytics'}</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit Ledger & Transaction History</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all text-xs uppercase tracking-widest"><Download size={18} /> Excel</button>
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all text-xs uppercase tracking-widest"><Printer size={18} /> Print</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 no-print">
        <div className="bg-[#722f37] p-8 rounded-[2.5rem] text-white shadow-2xl group hover:-translate-y-1 transition-all">
          <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest">Gross Sales</p>
          <h2 className="text-3xl font-black mt-3">৳{grossSales.toLocaleString()}</h2>
        </div>
        <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-2xl group hover:-translate-y-1 transition-all">
          <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest">Realised Cash</p>
          <h2 className="text-3xl font-black mt-3">৳{totalPaid.toLocaleString()}</h2>
        </div>
        <div className="bg-rose-600 p-8 rounded-[2.5rem] text-white shadow-2xl group hover:-translate-y-1 transition-all">
          <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest">Outstanding</p>
          <h2 className="text-3xl font-black mt-3">৳{totalDue.toLocaleString()}</h2>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden no-print">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 rounded-2xl text-white"><FileText size={20} /></div>
            <h3 className="font-black text-slate-900 tracking-tight">Invoice Audit History</h3>
          </div>
          <button 
            onClick={handlePrintAllReports}
            className="px-6 py-3 bg-[#722f37] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-rose-900 transition-all shadow-lg shadow-rose-900/20"
          >
            <Printer size={16} /> Print All Reports
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date & Inv</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer / Dealer</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Net Amount</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => (
                <tr key={sale.invoiceNo} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-900">{formatDate(sale.date)}</p>
                    <p className="text-[9px] font-black text-rose-800 uppercase tracking-widest mt-0.5">#ABS-{sale.invoiceNo}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[11px] font-black text-slate-900 uppercase">{customers.find(c => c.id === sale.customerId)?.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">ID: {sale.customerId}</p>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-slate-900 text-right">৳{sale.netAmount.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => setViewInvoice(sale)} className="p-2 text-slate-400 hover:text-[#722f37] transition-all" title="View"><Eye size={18} /></button>
                      <button onClick={() => handlePrintInvoice(sale)} className="p-2 text-slate-400 hover:text-blue-600 transition-all" title="Print"><Printer size={18} /></button>
                      {role === 'ADMIN' && (
                        <>
                          <button onClick={() => onEditSale(sale)} className="p-2 text-slate-400 hover:text-emerald-600 transition-all" title="Edit"><Edit2 size={18} /></button>
                          <button onClick={() => onDeleteSale(sale.invoiceNo)} className="p-2 text-slate-400 hover:text-rose-600 transition-all" title="Delete"><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print-only General Report View */}
      <div className="hidden print:block p-10 space-y-10">
        <PrintHeader 
          companyName={companyName} 
          title={lang === 'BN' ? 'বিক্রয় রিপোর্ট' : 'Sales Audit Report'} 
          subtitle={lang === 'BN' ? 'বিস্তারিত বিক্রয় ইতিহাস' : 'Detailed Sales History Audit'}
        />
        
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Sales</p>
            <p className="text-xl font-black text-slate-900 mt-1">৳{grossSales.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Realised Cash</p>
            <p className="text-xl font-black text-emerald-600 mt-1">৳{totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding</p>
            <p className="text-xl font-black text-rose-600 mt-1">৳{totalDue.toLocaleString()}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-4 py-3 text-[9px] font-black uppercase rounded-l-xl">Date / Inv</th>
              <th className="px-4 py-3 text-[9px] font-black uppercase">Customer</th>
              <th className="px-4 py-3 text-[9px] font-black uppercase text-right rounded-r-xl">Net Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.map((sale) => (
              <tr key={sale.invoiceNo}>
                <td className="px-4 py-4">
                  <p className="text-[10px] font-black text-slate-900">{formatDate(sale.date)}</p>
                  <p className="text-[8px] font-black text-rose-800 uppercase">#ABS-{sale.invoiceNo}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-[10px] font-black text-slate-900 uppercase">{customers.find(c => c.id === sale.customerId)?.name}</p>
                </td>
                <td className="px-4 py-4 text-[10px] font-black text-slate-900 text-right">৳{sale.netAmount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewInvoice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm no-print modal-overlay">
          <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[95vh] modal-container">
            <div className="bg-[#722f37] p-6 text-white flex justify-between items-center no-print shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-xl"><Receipt size={20} /></div>
                <h2 className="text-lg font-black tracking-tight">Invoice Audit #ABS-{viewInvoice.invoiceNo}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handlePrintInvoice(viewInvoice)} className="px-5 py-2 bg-white text-[#722f37] hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase shadow-lg"><Printer size={16} /> Print</button>
                <button onClick={() => setViewInvoice(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"><X size={20} /></button>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto p-10 print-p-0 print-m-0 invoice-content">
              {/* Header */}
              <div className="no-print-section">
                <PrintHeader 
                  companyName={companyName} 
                  title={lang === 'BN' ? 'বিক্রয় ইনভয়েস' : 'Sales Invoice'} 
                  subtitle={lang === 'BN' ? 'কাস্টমার / অফিস কপি' : 'Customer / Office Copy'}
                  showLogo={false}
                />
              </div>
              
              <div className="hidden print:block">
                <PrintHeader 
                  companyName={companyName} 
                  title={lang === 'BN' ? 'বিক্রয় ইনভয়েস' : 'Sales Invoice'} 
                  showLogo={false}
                />
              </div>

              <div className="flex justify-between items-center bg-rose-50 p-3 rounded-2xl border border-rose-200 mt-4 shrink-0">
                <div className="bg-[#722f37] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-sm">SALES INVOICE</div>
                <p className="font-black uppercase tracking-[0.2em] text-rose-800 text-[10px] border-b border-rose-200 pb-0.5">CUSTOMERS / OFFICE COPY</p>
                <div className="text-right flex flex-col">
                   <span className="text-[8px] font-black text-rose-400 uppercase">INVOICE NO</span>
                   <span className="text-sm font-black text-[#722f37]">#ABS-{viewInvoice.invoiceNo}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-6 shrink-0">
                {(() => {
                  const cust = customers.find(c => c.id === viewInvoice.customerId);
                  return (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] leading-tight space-y-1">
                      <p className="font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><User size={10} /> Dealer Detail</p>
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
                
                <div className="text-right space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-right">
                    <div><p className="text-[9px] font-black text-slate-400 mb-1 uppercase">Date</p><p className="text-xs font-bold text-slate-900">{formatDate(viewInvoice.date)}</p></div>
                    <div><p className="text-[9px] font-black text-slate-400 mb-1 uppercase">Serial</p><p className="text-xs font-bold text-slate-900">SN-{viewInvoice.serialNo.padStart(3, '0')}</p></div>
                  </div>
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
                            <input className="bg-transparent border-none p-0 text-[10px] font-bold text-slate-700 focus:ring-0 w-full" value={shipping.driver} onChange={e => setShipping({...shipping, driver: e.target.value})} placeholder="Driver..." readOnly={role === 'VISITOR'} />
                          </div>
                          <div className="flex items-center gap-2 border-b border-slate-200 pb-0.5">
                            <span className="text-[8px] font-black text-slate-400 uppercase w-16 shrink-0">Vehicle:</span>
                            <input className="bg-transparent border-none p-0 text-[10px] font-bold text-slate-700 focus:ring-0 w-full uppercase" value={shipping.vehicle} onChange={e => setShipping({...shipping, vehicle: e.target.value})} placeholder="Truck..." readOnly={role === 'VISITOR'} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black text-slate-400 uppercase w-16 shrink-0">Mobile:</span>
                            <input className="bg-transparent border-none p-0 text-[10px] font-bold text-slate-700 focus:ring-0 w-full" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} placeholder="Mobile..." readOnly={role === 'VISITOR'} />
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
                  <div className="w-56 space-y-1.5 shrink-0 text-right bg-rose-50 p-4 border border-rose-100">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600"><span>Gross Total:</span><span>৳{viewInvoice.totalAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-[11px] font-bold text-rose-600">
                      <span>Discount:</span>
                      <span>-৳{viewInvoice.discount.toLocaleString()} {viewInvoice.totalAmount > 0 ? `(${Math.round((viewInvoice.discount / viewInvoice.totalAmount) * 100)}%)` : ''}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-[#722f37] border-t-2 border-[#722f37] pt-1"><span>Net Payable:</span><span>৳{viewInvoice.netAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-[10px] font-bold text-emerald-600"><span>Paid:</span><span>৳{viewInvoice.paidAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm font-black text-rose-600 border-t border-dashed border-rose-300 pt-1"><span>Due:</span><span>৳{viewInvoice.dueAmount.toLocaleString()}</span></div>
                  </div>
              </div>

              {/* Signatures and Footer */}
              <div className="mt-auto pt-24 invoice-footer">
                <div className="grid grid-cols-3 gap-8 items-end text-center pb-8">
                  <div className="flex flex-col items-center"><div className="w-full border-b border-slate-300 mb-2"></div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">RECEIVED / রিসিভ</p></div>
                  <div className="flex flex-col items-center"><div className="w-full border-b border-slate-300 mb-2"></div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">DEALER / কাস্টমার</p></div>
                  <div className="flex flex-col items-center"><div className="w-full border-b-2 border-[#722f37] mb-2"></div><p className="text-[9px] font-black text-[#722f37] uppercase tracking-widest">AUTHORIZED BY</p></div>
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

export default Reports;
