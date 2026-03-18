
'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  UserPlus, 
  BarChart3, 
  LogOut, 
  Menu, 
  Languages,
  Lock,
  User as UserIcon,
  Building2,
  Loader2,
  CloudUpload,
  Wifi,
  WifiOff,
  Sparkles,
  Zap,
  BrainCircuit,
  X,
  RefreshCw,
  History,
  CheckCircle2,
  AlertCircle,
  Database,
  Activity,
  ShieldCheck,
  Eye
} from 'lucide-react';
import Dashboard from '@/pages/Dashboard';
import SalesEntry from '@/pages/SalesEntry';
import ProductList from '@/pages/ProductList';
import CustomerList from '@/pages/CustomerList';
import OfficerList from '@/pages/OfficerList';
import Reports from '@/pages/Reports';
import StockManagement from '@/pages/StockManagement';
import { Product, Customer, Officer, Sale } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_OFFICERS } from '@/constants';
import { DatabaseService } from '@/lib/database-client';
import { GoogleGenAI } from "@google/genai";

// Language Context
type Lang = 'EN' | 'BN';
type Role = 'ADMIN' | 'VISITOR' | 'CUSTOMER' | 'OFFICER';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  companyName: string;
  role: Role;
  userId?: string;
}

const translations: Record<Lang, Record<string, string>> = {
  EN: {
    dashboard: 'Dashboard',
    salesEntry: 'Sales Entry',
    products: 'Product List',
    inventory: 'Stock Management',
    customers: 'Customer/Dealer',
    officers: 'Sales Officers',
    reports: 'Reports & Invoices',
    settings: 'Settings',
    signOut: 'Log Out',
    erpTitle: 'ABS FEED ERP',
    subtitle: 'Sales & Inventory System',
    login: 'Login',
    welcome: 'Management Portal',
    admin: 'Admin Panel',
    visitor: 'Visitor Mode',
    customer: 'Dealer Portal',
    officer: 'Officer Portal',
    toggleLang: 'বাংলা ভার্সন',
    companyLabel: 'ABS FEED INDUSTRIES LIMITED',
    smartAnalysis: 'Smart AI Analysis',
    analysisWait: 'Gemini is analyzing your product portfolio...',
    analysisDone: 'Business Intelligence Report',
    syncStatus: 'Database Sync Log',
    dbLive: 'Database Live',
    dbOffline: 'Database Offline',
    readOnlyMsg: 'Read-Only Mode: View & Print Only',
    username: 'Username / ID',
    password: 'Password',
    invalidCreds: 'Invalid Credentials. Please try again.'
  },
  BN: {
    dashboard: 'ড্যাশবোর্ড',
    salesEntry: 'বিক্রয় এন্ট্রি',
    products: 'পণ্য তালিকা',
    inventory: 'স্টক ম্যানেজমেন্ট',
    customers: 'কাস্টমার / ডিলার',
    officers: 'সেলস অফিসার',
    reports: 'রিপোর্ট ও ইনভয়েজ',
    settings: 'সেটিংস',
    signOut: 'লগ আউট',
    erpTitle: 'এবিএস ফিড ইআরপি',
    subtitle: 'সেলস ও ইনভেন্টরি সিস্টেম',
    login: 'লগইন করুন',
    welcome: 'ম্যানেজমেন্ট পোর্টাল',
    admin: 'অ্যাডমিন প্যানেল',
    visitor: 'ভিজিটর মোড',
    customer: 'ডিলার পোর্টাল',
    officer: 'অফিসার পোর্টাল',
    toggleLang: 'English Version',
    companyLabel: 'এবিএস ফিড ইন্ডাস্ট্রিজ লিমিটেড',
    smartAnalysis: 'স্মার্ট এআই এনালাইসিস',
    analysisWait: 'জেমিনি আপনার পণ্যের তথ্য বিশ্লেষণ করছে...',
    analysisDone: 'বিজনেস ইন্টেলিজেন্স রিপোর্ট',
    syncStatus: 'ডেটাবেস সিঙ্ক লগ',
    dbLive: 'ডেটাবেস লাইভ',
    dbOffline: 'ডেটাবেস অফলাইন',
    readOnlyMsg: 'শুধুমাত্র দেখার অনুমতি: আপনি তথ্য পরিবর্তন করতে পারবেন না।',
    username: 'ইউজারনেম / আইডি',
    password: 'পাসওয়ার্ড',
    invalidCreds: 'ভুল তথ্য দিয়েছেন। আবার চেষ্টা করুন।'
  }
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Views handling
type View = 'dashboard' | 'sales' | 'products' | 'stock' | 'customers' | 'officers' | 'reports' | 'settings';

interface SyncLogEntry {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: string;
}

const Sidebar = ({ currentView, setView, isOpen, toggle }: { currentView: View, setView: (v: View) => void, isOpen: boolean, toggle: () => void }) => {
  const context = useContext(LanguageContext);
  if (!context) return null;
  const { t, role } = context;
  
  const menuItems = [
    { id: 'dashboard' as View, name: t('dashboard'), icon: LayoutDashboard, roles: ['ADMIN', 'VISITOR', 'CUSTOMER', 'OFFICER'] },
    { id: 'sales' as View, name: t('salesEntry'), icon: ShoppingCart, roles: ['ADMIN'] },
    { id: 'products' as View, name: t('products'), icon: Package, roles: ['ADMIN', 'VISITOR'] },
    { id: 'stock' as View, name: t('inventory'), icon: Package, roles: ['ADMIN'] },
    { id: 'customers' as View, name: t('customers'), icon: Users, roles: ['ADMIN'] },
    { id: 'officers' as View, name: t('officers'), icon: UserPlus, roles: ['ADMIN'] },
    { id: 'reports' as View, name: t('reports'), icon: BarChart3, roles: ['ADMIN', 'VISITOR', 'CUSTOMER', 'OFFICER'] },
    { id: 'settings' as View, name: t('settings'), icon: RefreshCw, roles: ['ADMIN'] },
  ].filter(item => item.roles.includes(role));

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:relative md:translate-x-0`}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#722f37] rounded-xl shadow-lg shadow-rose-950/20">
              <Building2 size={24} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight block leading-tight">{t('erpTitle')}</span>
              <div className="flex items-center gap-1 mt-1">
                {role === 'ADMIN' ? <ShieldCheck size={10} className="text-emerald-400" /> : <Eye size={10} className="text-amber-400" />}
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  {role === 'ADMIN' ? t('admin') : role === 'CUSTOMER' ? t('customer') : role === 'OFFICER' ? t('officer') : t('visitor')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setView(item.id); if(window.innerWidth < 768) toggle(); }}
              className={`flex items-center gap-3 p-3.5 w-full rounded-xl transition-all duration-200 group ${currentView === item.id ? 'bg-[#722f37] text-white shadow-lg shadow-rose-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon size={20} className={currentView === item.id ? '' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-bold text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => { localStorage.removeItem('erp_logged_in'); localStorage.removeItem('erp_role'); window.location.reload(); }}
            className="flex items-center gap-3 p-3.5 w-full hover:bg-rose-600/10 text-rose-400 rounded-xl transition-colors font-bold text-sm"
          >
            <LogOut size={20} />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin, customers, officers }: { onLogin: (role: Role, id?: string) => void, customers: Customer[], officers: Officer[] }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const context = useContext(LanguageContext);
  if (!context) return null;
  const { t } = context;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'admin' && pass === '4466') {
      onLogin('ADMIN');
    } else if (user === 'visitor' && pass === '7595') {
      onLogin('VISITOR');
    } else {
      // Check for Customer ID
      const customer = customers.find(c => c.id === user);
      if (customer && pass === user) { // Using ID as password for now as requested "ID number দিবে, সেটা দিয়ে ডিলার এবং অফিসার তাদের স্টেটমেন্ট দেখতে পারবে"
        onLogin('CUSTOMER', user);
        return;
      }
      // Check for Officer ID
      const officer = officers.find(o => o.id === user);
      if (officer && pass === user) {
        onLogin('OFFICER', user);
        return;
      }
      alert(t('invalidCreds'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-10 text-white text-center">
          <div className="w-20 h-20 bg-[#722f37] rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl">
            <Building2 size={40} />
          </div>
          <h2 className="text-3xl font-black tracking-tight">{t('erpTitle')}</h2>
          <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-widest">{t('welcome')}</p>
        </div>
        <form className="p-10 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('username')}</label>
            <input 
              type="text" value={user} onChange={(e) => setUser(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#722f37] transition-all" 
              placeholder={t('username')}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('password')}</label>
            <input 
              type="password" value={pass} onChange={(e) => setPass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#722f37] transition-all" 
              placeholder="••••••••"
            />
          </div>
          <button className="w-full bg-[#722f37] hover:bg-[#5a252c] text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest transform active:scale-95">
            {t('login')}
          </button>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure Cloud Database Access</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<Role>('VISITOR');
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [view, setView] = useState<View>('dashboard');
  const [lang, setLang] = useState<Lang>('BN');
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const t = (key: string) => translations[lang][key] || key;
  const companyName = t('companyLabel');

  const addLog = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setSyncLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 50));
  };

  const checkStatus = async () => {
    const connected = await DatabaseService.checkConnection();
    if (connected !== isOnline) {
      setIsOnline(connected);
    }
    return connected;
  };

  const initDb = async () => {
    setIsDbLoading(true);
    addLog("Initializing database connection...", "info");
    try {
      const connected = await checkStatus();

      if (connected) {
        addLog("MongoDB Connected. Fetching remote data...", "success");
        const [pRes, cRes, oRes, sRes] = await Promise.all([
          DatabaseService.getProducts(),
          DatabaseService.getCustomers(),
          DatabaseService.getOfficers(),
          DatabaseService.getSales()
        ]);
        
        setProducts(pRes.success ? pRes.data : INITIAL_PRODUCTS);
        setCustomers(cRes.success ? cRes.data : INITIAL_CUSTOMERS);
        setOfficers(oRes.success ? oRes.data : INITIAL_OFFICERS);
        setSales(sRes.success ? sRes.data : []);
        addLog("Sync with Atlas completed.", "success");
      } else {
        addLog("Backend unreachable. Using Local Storage.", "error");
        setProducts(INITIAL_PRODUCTS);
        setCustomers(INITIAL_CUSTOMERS);
        setOfficers(INITIAL_OFFICERS);
        setSales([]);
      }
    } catch (err: any) {
      addLog(`Initialization Error: ${err.message}`, "error");
    } finally {
      setIsDbLoading(false);
    }
  };

  useEffect(() => {
    const logged = localStorage.getItem('erp_logged_in') === 'true';
    const role = localStorage.getItem('erp_role') as Role;
    const uid = localStorage.getItem('erp_user_id');
    setIsLoggedIn(logged);
    if(role) setUserRole(role);
    if(uid) setUserId(uid);
    
    const l = localStorage.getItem('erp_lang') as Lang;
    if(l) setLang(l);
    initDb();

    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync Master Logic (Only for ADMIN)
  useEffect(() => {
    if (isDbLoading || userRole !== 'ADMIN') return;
    
    const syncWithDb = async () => {
      if (isOnline) {
        setIsSyncing(true);
        try {
          await Promise.all([
            DatabaseService.saveProducts(products),
            DatabaseService.saveCustomers(customers),
            DatabaseService.saveOfficers(officers),
            DatabaseService.saveSales(sales)
          ]);
          addLog("Auto-sync success.", "success");
        } catch (err: any) {
          setIsOnline(false);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    const timeout = setTimeout(syncWithDb, 20000);
    return () => clearTimeout(timeout);
  }, [products, customers, officers, sales, isDbLoading, isOnline, userRole]);

  const addSale = async (newSale: Sale) => {
    if (userRole === 'VISITOR' || userRole === 'CUSTOMER' || userRole === 'OFFICER') return;
    setSales(prev => [...prev, newSale]);
    setProducts(prev => prev.map(p => {
      const soldItem = newSale.items.find(si => si.productCode === p.code);
      if (soldItem) return { ...p, stock: p.stock - soldItem.quantity };
      return p;
    }));
    
    if (isOnline) {
      await DatabaseService.addSale(newSale);
      addLog(`Invoice #ABS-${newSale.invoiceNo} synced.`, "success");
    }
  };

  const updateSale = async (updatedSale: Sale) => {
    if (userRole !== 'ADMIN') return;
    setSales(prev => prev.map(s => s.invoiceNo === updatedSale.invoiceNo ? updatedSale : s));
    if (isOnline) {
      await DatabaseService.saveSales(sales.map(s => s.invoiceNo === updatedSale.invoiceNo ? updatedSale : s));
      addLog(`Invoice #ABS-${updatedSale.invoiceNo} updated.`, "success");
    }
    setEditingSale(null);
    setView('reports');
  };

  const deleteSale = async (invoiceNo: string) => {
    if (userRole !== 'ADMIN') return;
    if (!confirm('Are you sure?')) return;
    setSales(prev => prev.filter(s => s.invoiceNo !== invoiceNo));
    if (isOnline) {
      await DatabaseService.deleteSale(invoiceNo);
      addLog(`Invoice #ABS-${invoiceNo} deleted from cloud.`, "info");
    }
  };

  const handleLogin = (role: Role, id?: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    if(id) setUserId(id);
    localStorage.setItem('erp_logged_in', 'true');
    localStorage.setItem('erp_role', role);
    if(id) localStorage.setItem('erp_user_id', id);
  };

  const runSmartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `As a senior business analyst for ${companyName}, analyze this product inventory and performance data: ${JSON.stringify(products)}. 
      Please provide a detailed strategic report in ${lang === 'BN' ? 'Bengali' : 'English'} covering:
      1. Inventory Health (Stock Warnings)
      2. Profitability Analysis
      3. Strategic Sales Recommendations.
      Format with professional headers and bullet points.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiAnalysis(response.text || "No response.");
    } catch (err: any) {
      setAiAnalysis("AI Analysis service is currently unavailable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <LanguageContext.Provider value={{ lang, setLang, t, companyName, role: 'VISITOR' }}>
        <LoginPage onLogin={handleLogin} customers={customers} officers={officers} />
      </LanguageContext.Provider>
    );
  }

  if (isDbLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6 font-black">
        <Loader2 className="animate-spin text-[#722f37]" size={60} />
        <p className="uppercase tracking-[0.3em] text-xs">Synchronizing with Atlas...</p>
      </div>
    );
  }

  // Filter data based on role
  const filteredSales = sales.filter(s => {
    if (userRole === 'ADMIN' || userRole === 'VISITOR') return true;
    if (userRole === 'CUSTOMER') return s.customerId === userId;
    if (userRole === 'OFFICER') return s.officerId === userId;
    return false;
  });

  const filteredCustomers = customers.filter(c => {
    if (userRole === 'ADMIN' || userRole === 'VISITOR') return true;
    if (userRole === 'CUSTOMER') return c.id === userId;
    return false;
  });

  const filteredOfficers = officers.filter(o => {
    if (userRole === 'ADMIN' || userRole === 'VISITOR') return true;
    if (userRole === 'OFFICER') return o.id === userId;
    return false;
  });

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, companyName, role: userRole, userId }}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar currentView={view} setView={setView} isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-200 no-print">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
              <h2 className="text-xl font-black text-[#722f37] tracking-tight hidden sm:block">{companyName}</h2>
              
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                {isOnline ? 'Cloud Live' : 'Offline'}
              </div>

              {userRole === 'VISITOR' && (
                <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 border border-amber-100 shadow-sm animate-in fade-in zoom-in duration-500">
                  <Eye size={12} /> {t('readOnlyMsg')}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button onClick={runSmartAnalysis} className="hidden lg:flex bg-slate-900 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black items-center gap-2 shadow-lg active:scale-95 transition-all"><BrainCircuit size={16} /> Analysis</button>
              <button onClick={() => { setLang(lang === 'EN' ? 'BN' : 'EN'); localStorage.setItem('erp_lang', lang === 'EN' ? 'BN' : 'EN'); }} className="bg-[#722f37] text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 active:scale-95 transition-all shadow-xl shadow-rose-900/20"><Languages size={16} /> {t('toggleLang')}</button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            {view === 'dashboard' && <Dashboard products={products} sales={filteredSales} customers={filteredCustomers} officers={filteredOfficers} onDeleteSale={deleteSale} onEditSale={(s: Sale) => { setEditingSale(s); setView('sales'); }} />}
            {view === 'sales' && <SalesEntry products={products} customers={customers} officers={officers} onAddSale={addSale} onUpdateSale={updateSale} editingSale={editingSale} onCancelEdit={() => setEditingSale(null)} />}
            {view === 'products' && <ProductList products={products} setProducts={setProducts} onAnalyze={runSmartAnalysis} />}
            {view === 'stock' && <StockManagement products={products} setProducts={setProducts} />}
            {view === 'customers' && <CustomerList customers={customers} sales={sales} officers={officers} setCustomers={setCustomers} setSales={setSales} />}
            {view === 'officers' && <OfficerList officers={officers} sales={sales} setOfficers={setOfficers} setSales={setSales} />}
            {view === 'reports' && <Reports sales={filteredSales} products={products} officers={filteredOfficers} customers={filteredCustomers} onDeleteSale={deleteSale} onEditSale={(s: Sale) => { setEditingSale(s); setView('sales'); }} />}
            {view === 'settings' && (
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">System Settings</h2>
                <p className="text-slate-500 font-medium">Configure your ERP preferences here.</p>
                <div className="mt-8 space-y-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Database Connection</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Status: {isOnline ? 'Connected to MongoDB Atlas' : 'Disconnected'}</p>
                    </div>
                    <button onClick={initDb} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Reconnect</button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Analysis Modal */}
      {(isAnalyzing || aiAnalysis) && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col h-[80vh]">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Sparkles size={24} className="text-emerald-400" />
                <h2 className="text-2xl font-black uppercase tracking-tight">{t('analysisDone')}</h2>
              </div>
              <button onClick={() => setAiAnalysis(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-[#722f37]" size={48} />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">{t('analysisWait')}</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed text-slate-700 font-medium bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  {aiAnalysis}
                </div>
              )}
            </div>
            {!isAnalyzing && (
              <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-center shrink-0">
                <button onClick={() => setAiAnalysis(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-xl shadow-slate-200">Close Report</button>
              </div>
            )}
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
}
