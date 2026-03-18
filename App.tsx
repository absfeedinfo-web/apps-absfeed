
import React, { useState, useEffect, createContext, useContext } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { HashRouter, Routes, Route, Link, useLocation, Navigate } = ReactRouterDOM;
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
  Database,
  Loader2,
  CloudUpload,
  CloudCheck,
  Server,
  Wifi,
  WifiOff,
  Sparkles,
  Zap,
  BrainCircuit,
  X,
  RefreshCw,
  Eye,
  Edit2,
  ClipboardList,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import SalesEntry from './pages/SalesEntry';
import ProductList from './pages/ProductList';
import CustomerList from './pages/CustomerList';
import OfficerList from './pages/OfficerList';
import Reports from './pages/Reports';
import StockManagement from './pages/StockManagement';
import Settings from './pages/Settings';
import { ProductionModule } from './modules/production/ProductionModule';
import { Product, Customer, Officer, Sale, User, UserRole } from './types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_OFFICERS } from './constants';
import { DatabaseService } from './database';
import { GoogleGenAI } from "@google/genai";

// Language Context
type Lang = 'EN' | 'BN';
// Role type to support access control
type Role = 'ADMIN' | 'SALES' | 'ACCOUNTS' | 'VISITOR' | 'CUSTOMER' | 'OFFICER';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  companyName: string;
  role: Role;
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
    username: 'Username',
    password: 'Password',
    welcome: 'Management Portal',
    admin: 'Admin Panel',
    superAdmin: 'System Administrator',
    toggleLang: 'বাংলা ভার্সন',
    companyLabel: 'ABS FEED INDUSTRIES LIMITED',
    add: 'Add New',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save Changes',
    cancel: 'Cancel',
    smartAnalysis: 'Smart AI Analysis',
    analysisWait: 'Gemini is analyzing your product portfolio...',
    analysisDone: 'Business Intelligence Report',
    invalidCreds: 'Invalid Credentials',
    production: 'Production Management'
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
    username: 'ইউজারনেম',
    password: 'পাসওয়ার্ড',
    welcome: 'ম্যানেজমেন্ট পোর্টাল',
    admin: 'অ্যাডমিন প্যানেল',
    superAdmin: 'সিস্টেম অ্যাডমিনিস্ট্রেটর',
    toggleLang: 'English Version',
    companyLabel: 'এবিএস ফিড ইন্ডাস্ট্রিজ লিমিটেড',
    add: 'নতুন যোগ করুন',
    edit: 'সম্পাদনা',
    delete: 'মুছে ফেলুন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    smartAnalysis: 'স্মার্ট এআই এনালাইসিস',
    analysisWait: 'জেমিনি আপনার পণ্যের তথ্য বিশ্লেষণ করছে...',
    analysisDone: 'বিজনেস ইন্টেলিজেন্স রিপোর্ট',
    invalidCreds: 'ভুল তথ্য দিয়েছেন',
    production: 'উৎপাদন ব্যবস্থাপনা'
  }
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const Sidebar = ({ isOpen, toggle, role }: { isOpen: boolean, toggle: () => void, role: Role }) => {
  const location = useLocation();
  const context = useContext(LanguageContext);
  if (!context) return null;
  const { t, customLogo } = context;
  
  const menuItems = [
    { name: t('dashboard'), icon: LayoutDashboard, path: '/', roles: ['ADMIN', 'SALES', 'ACCOUNTS', 'VISITOR'] },
    { name: t('salesEntry'), icon: ShoppingCart, path: '/sales', roles: ['ADMIN', 'SALES', 'VISITOR'] },
    { name: t('products'), icon: Package, path: '/products', roles: ['ADMIN', 'SALES', 'ACCOUNTS', 'VISITOR', 'CUSTOMER', 'OFFICER'] },
    { name: t('inventory'), icon: Package, path: '/stock', roles: ['ADMIN', 'ACCOUNTS', 'VISITOR'] },
    { name: t('customers'), icon: Users, path: '/customers', roles: ['ADMIN', 'ACCOUNTS', 'VISITOR'] },
    { name: t('officers'), icon: UserPlus, path: '/officers', roles: ['ADMIN', 'ACCOUNTS', 'VISITOR'] },
    { name: t('production'), icon: ClipboardList, path: '/production', roles: ['ADMIN', 'ACCOUNTS', 'VISITOR'] },
    { name: t('reports'), icon: BarChart3, path: '/reports', roles: ['ADMIN', 'SALES', 'ACCOUNTS', 'CUSTOMER', 'OFFICER', 'VISITOR'] },
    { name: t('settings'), icon: Database, path: '/settings', roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

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
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('subtitle')}</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={() => window.innerWidth < 768 && toggle()}
              className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 group ${location.pathname === item.path ? 'bg-[#722f37] text-white shadow-lg shadow-rose-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon size={20} className={location.pathname === item.path ? '' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-bold text-sm">{item.name}</span>
            </Link>
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

const LoginPage = ({ onLogin, users }: { onLogin: (role: Role, userId?: string) => void, users: User[] }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  
  // Force English for Login Page as requested
  const t = (key: string) => translations['EN'][key] || key;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check dynamic users first
    const foundUser = users.find(u => u.username === user && u.password === pass);
    if (foundUser) {
      onLogin(foundUser.role as Role, foundUser.id);
      return;
    }

    // Admin password (4466) and Visitor password (7595)
    if (user === 'admin' && pass === '4466') {
      onLogin('ADMIN', 'admin');
    } else if (user === 'visitor' && pass === '7595') {
      onLogin('VISITOR', 'visitor');
    } else {
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
            <div className="relative">
              <UserIcon className="absolute left-4 top-3.5 text-slate-300" size={20} />
              <input 
                type="text" 
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-rose-800 transition-all font-bold text-slate-700" 
                placeholder={t('username')}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-300" size={20} />
              <input 
                type="password" 
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-rose-800 transition-all font-bold text-slate-700" 
                placeholder="••••••••"
              />
            </div>
          </div>
          <button className="w-full bg-[#722f37] hover:bg-[#5a252c] text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-900/20 transition-all transform active:scale-95 text-sm uppercase tracking-widest">
            {t('login')}
          </button>
        </form>
        <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            © 2025 ABS FEED INDUSTRIES LTD. | ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('erp_logged_in') === 'true');
  const [userRole, setUserRole] = useState<Role>(() => (localStorage.getItem('erp_role') as Role) || 'ADMIN');
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('erp_user_id'));
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('erp_lang') as Lang) || 'BN');
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const t = (key: string) => translations[lang][key] || key;
  const companyName = t('companyLabel');

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const initDb = async () => {
    setIsDbLoading(true);
    try {
      const connected = await DatabaseService.checkConnection();
      setIsOnline(connected);

      const [p, c, o, s, u] = await Promise.all([
        DatabaseService.getProducts(),
        DatabaseService.getCustomers(),
        DatabaseService.getOfficers(),
        DatabaseService.getSales(),
        DatabaseService.getUsers()
      ]);
      
      setProducts(p && p.length > 0 ? p : INITIAL_PRODUCTS);
      setCustomers(c && c.length > 0 ? c : INITIAL_CUSTOMERS);
      setOfficers(o && o.length > 0 ? o : INITIAL_OFFICERS);
      setSales(s || []);
      setUsers(u || []);
    } catch (err) {
      console.warn("Initial load fallbacked to local data", err);
      setIsOnline(false);
      setProducts(INITIAL_PRODUCTS);
      setCustomers(INITIAL_CUSTOMERS);
      setOfficers(INITIAL_OFFICERS);
      setSales([]);
      setUsers([]);
    } finally {
      setIsDbLoading(false);
    }
  };

  useEffect(() => {
    initDb();
  }, []);

  useEffect(() => {
    const syncWithDb = async () => {
      if (!isDbLoading && isOnline && userRole === 'ADMIN') {
        setIsSyncing(true);
        try {
          await Promise.all([
            DatabaseService.saveProducts(products),
            DatabaseService.saveCustomers(customers),
            DatabaseService.saveOfficers(officers),
            DatabaseService.saveUsers(users)
          ]);
        } catch (err) {
          console.error("Sync failed", err);
          setIsOnline(false);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    const timeout = setTimeout(syncWithDb, 3000); 
    return () => clearTimeout(timeout);
  }, [products, customers, officers, users, isDbLoading, isOnline, userRole]);

  const handleLogin = (role: Role, userId?: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    if (userId) setCurrentUserId(userId);
    localStorage.setItem('erp_logged_in', 'true');
    localStorage.setItem('erp_role', role);
    if (userId) localStorage.setItem('erp_user_id', userId);
  };

  const addSale = async (newSale: Sale) => {
    if (userRole === 'VISITOR') return;
    
    // Update local state
    const updatedProducts = products.map(p => {
      const soldItem = newSale.items.find(si => si.productCode === p.code);
      if (soldItem) return { ...p, stock: p.stock - soldItem.quantity };
      return p;
    });
    setProducts(updatedProducts);

    let updatedCustomers = customers;
    if (newSale.dueAmount > 0) {
      updatedCustomers = customers.map(c => {
        if (c.id === newSale.customerId) return { ...c, balance: c.balance - newSale.dueAmount };
        return c;
      });
      setCustomers(updatedCustomers);
    }

    setSales(prev => [...prev, newSale]);

    if (isOnline) {
      setIsSyncing(true);
      try {
        await DatabaseService.addSale(newSale);
        await DatabaseService.saveProducts(updatedProducts);
        await DatabaseService.saveCustomers(updatedCustomers);
      } catch (err) {
        console.error("Failed to add sale or sync related data via API", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    window.location.hash = '#/sales';
  };

  const updateSale = async (updatedSale: Sale) => {
    if (userRole === 'VISITOR') return;
    
    const oldSale = sales.find(s => s.invoiceNo === updatedSale.invoiceNo);
    if (!oldSale) return;

    // 1. Reverse old sale effects
    const tempProducts = products.map(p => {
      const item = oldSale.items.find(si => si.productCode === p.code);
      if (item) return { ...p, stock: p.stock + item.quantity };
      return p;
    });

    let tempCustomers = customers;
    if (oldSale.dueAmount > 0) {
      tempCustomers = customers.map(c => {
        if (c.id === oldSale.customerId) return { ...c, balance: c.balance + oldSale.dueAmount };
        return c;
      });
    }

    // 2. Apply new sale effects
    const finalProducts = tempProducts.map(p => {
      const item = updatedSale.items.find(si => si.productCode === p.code);
      if (item) return { ...p, stock: p.stock - item.quantity };
      return p;
    });

    const finalCustomers = tempCustomers.map(c => {
      if (c.id === updatedSale.customerId) return { ...c, balance: c.balance - updatedSale.dueAmount };
      return c;
    });

    // Update local state
    setProducts(finalProducts);
    setCustomers(finalCustomers);
    setSales(prev => prev.map(s => s.invoiceNo === updatedSale.invoiceNo ? updatedSale : s));
    setEditingSale(null);

    if (isOnline) {
      setIsSyncing(true);
      try {
        await DatabaseService.updateSale(updatedSale);
        await DatabaseService.saveProducts(finalProducts);
        await DatabaseService.saveCustomers(finalCustomers);
      } catch (err) {
        console.error("Failed to update sale or sync related data via API", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const deleteSale = async (invoiceNo: string) => {
    if (userRole === 'VISITOR') return;
    const saleToDelete = sales.find(s => s.invoiceNo === invoiceNo);
    if (!saleToDelete) return;

    // Reverse stock
    const updatedProducts = products.map(p => {
      const item = saleToDelete.items.find(si => si.productCode === p.code);
      if (item) return { ...p, stock: p.stock + item.quantity };
      return p;
    });
    setProducts(updatedProducts);

    // Reverse customer balance if there was due
    let updatedCustomers = customers;
    if (saleToDelete.dueAmount > 0) {
      updatedCustomers = customers.map(c => {
        if (c.id === saleToDelete.customerId) return { ...c, balance: c.balance + saleToDelete.dueAmount };
        return c;
      });
      setCustomers(updatedCustomers);
    }

    // Remove sale
    const updatedSales = sales.filter(s => s.invoiceNo !== invoiceNo);
    setSales(updatedSales);
    setConfirmDelete(null);

    if (isOnline) {
      setIsSyncing(true);
      try {
        await DatabaseService.deleteSale(invoiceNo);
        await DatabaseService.saveProducts(updatedProducts);
        await DatabaseService.saveCustomers(updatedCustomers);
      } catch (err) {
        console.error("Failed to delete sale or sync related data via API", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const runSmartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `As a business analyst for ${companyName}, analyze this product data: ${JSON.stringify(products.map(p => ({ name: p.name, stock: p.stock, cost: p.purchasePrice, tp: p.tpPrice })))}. Provide a detailed analysis in ${lang === 'BN' ? 'Bengali' : 'English'} with strategic insights.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiAnalysis(response.text || "Could not generate analysis.");
    } catch (err) {
      setAiAnalysis("AI Analysis failed. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <LanguageContext.Provider value={{ lang, setLang, t, companyName, role: userRole }}>
        <LoginPage onLogin={handleLogin} users={users} />
      </LanguageContext.Provider>
    );
  }

  if (isDbLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black overflow-hidden">
        <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
          <Loader2 className="animate-spin text-[#722f37]" size={80} />
          <h2 className="text-2xl tracking-[0.2em] uppercase font-black">Synchronizing Data...</h2>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, companyName, role: userRole }}>
      <HashRouter>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} role={userRole} />
          
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-200 no-print">
              <div className="flex items-center gap-4">
                <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setSidebarOpen(true)}>
                  <Menu size={24} />
                </button>
                <div>
                  <h2 className="text-xl font-black text-[#722f37] tracking-tight">{companyName}</h2>
                  {userRole === 'VISITOR' && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black uppercase mt-0.5">
                      <Eye size={10} /> Visitor Read-Only
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {isSyncing && (
                  <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Syncing...</span>
                  </div>
                )}
                <button onClick={runSmartAnalysis} className="hidden lg:flex items-center gap-2 bg-slate-900 text-emerald-400 px-5 py-2.5 rounded-2xl text-xs font-black transition-all hover:bg-black active:scale-95 shadow-lg">
                  <BrainCircuit size={18} /> <span>Analysis</span>
                </button>
                <button onClick={() => setLang(lang === 'EN' ? 'BN' : 'EN')} className="flex items-center gap-2 bg-[#722f37] text-white px-5 py-2.5 rounded-2xl text-xs font-black transition-all hover:bg-[#5a252c] active:scale-95 shadow-lg">
                  <Languages size={18} /> <span>{t('toggleLang')}</span>
                </button>
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#722f37] font-black text-xs border border-white shadow-sm">
                  {userRole.charAt(0)}
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-10">
              <Routes>
                <Route path="/" element={<Dashboard products={products} sales={sales} customers={customers} officers={officers} onDeleteSale={(id) => setConfirmDelete(id)} onEditSale={handleEditSale} currentUserId={currentUserId} role={userRole} />} />
                <Route path="/sales" element={<SalesEntry products={products} customers={customers} officers={officers} onAddSale={addSale} onUpdateSale={updateSale} editingSale={editingSale} onCancelEdit={() => setEditingSale(null)} role={userRole} />} />
                <Route path="/products" element={<ProductList products={products} setProducts={setProducts} onAnalyze={runSmartAnalysis} role={userRole} />} />
                <Route path="/stock" element={<StockManagement products={products} setProducts={setProducts} role={userRole} />} />
                <Route path="/customers" element={<CustomerList customers={customers} sales={sales} officers={officers} products={products} setCustomers={setCustomers} setSales={setSales} role={userRole} onDeleteSale={(id) => setConfirmDelete(id)} />} />
                <Route path="/officers" element={<OfficerList officers={officers} sales={sales} customers={customers} products={products} setOfficers={setOfficers} setSales={setSales} role={userRole} />} />
                <Route path="/production" element={<ProductionModule userRole={userRole} products={products} setProducts={setProducts} />} />
                <Route path="/reports" element={<Reports sales={sales} products={products} officers={officers} customers={customers} onDeleteSale={(id) => setConfirmDelete(id)} onEditSale={handleEditSale} currentUserId={currentUserId} role={userRole} />} />
                <Route path="/settings" element={<Settings users={users} setUsers={setUsers} customers={customers} officers={officers} role={userRole} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>

        {/* Custom Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="bg-rose-600 p-8 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <Trash2 size={32} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">{lang === 'BN' ? 'ইনভয়েস মুছে ফেলুন' : 'Delete Invoice'}</h2>
                <p className="text-rose-100 text-xs font-bold mt-2 uppercase tracking-widest">
                  {lang === 'BN' ? 'আপনি কি নিশ্চিতভাবে এই ইনভয়েসটি মুছে ফেলতে চান?' : 'Are you sure you want to permanently delete this invoice?'}
                </p>
              </div>
              <div className="p-8 space-y-4">
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-[10px] font-bold text-rose-800 leading-tight">
                    {lang === 'BN' ? 
                      "এটি ডিলিট করলে স্টক এবং কাস্টমার ব্যালেন্স স্বয়ংক্রিয়ভাবে সমন্বয় হয়ে যাবে। এই কাজটি আর ফিরিয়ে আনা সম্ভব নয়।" : 
                      "Deleting this will automatically reverse stock and customer balance. This action cannot be undone."}
                  </p>
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-slate-100 text-slate-500 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95">Cancel</button>
                  <button onClick={() => deleteSale(confirmDelete)} className="flex-1 bg-rose-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-200">Confirm Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(isAnalyzing || aiAnalysis) && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[80vh]">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <Sparkles size={24} className="text-emerald-400" />
                  <h2 className="text-2xl font-black uppercase tracking-tight">Business Analysis</h2>
                </div>
                <button onClick={() => setAiAnalysis(null)} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors text-slate-400"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
                {isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-[#722f37]" size={48} />
                    <p className="font-black text-slate-400 text-xs uppercase">Generating Insights...</p>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm leading-relaxed whitespace-pre-wrap text-slate-700 font-medium">
                    {aiAnalysis}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </HashRouter>
    </LanguageContext.Provider>
  );
}
