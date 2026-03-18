
import { Product, Customer, Officer } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  // Poultry Feed (ব্রয়লার, লেয়ার, সোনালী)
  { code: '511', name: 'ব্রয়লার স্টার্টার', category: 'Poultry Feed', unit: 'Bag', bagSize: '50 kg', purchasePrice: 3200, tpPrice: 3253.50, mrpPrice: 3425.00, spPrice: 3082, stock: 100, status: 'Active' },
  { code: '512', name: 'ব্রয়লার গ্রোয়ার', category: 'Poultry Feed', unit: 'Bag', bagSize: '50 kg', purchasePrice: 3100, tpPrice: 3230.00, mrpPrice: 3400.00, spPrice: 3060, stock: 85, status: 'Active' },
  { code: '513', name: 'ব্রয়লার ফিনিশার', category: 'Poultry Feed', unit: 'Bag', bagSize: '50 kg', purchasePrice: 3050, tpPrice: 3206.00, mrpPrice: 3375.00, spPrice: 3038, stock: 120, status: 'Active' },
  { code: '514', name: 'লেয়ার স্টার্টার', category: 'Poultry Feed', unit: 'Bag', bagSize: '50 kg', purchasePrice: 2800, tpPrice: 2981.50, mrpPrice: 3100.00, spPrice: 2812, stock: 50, status: 'Active' },
  { code: '515', name: 'লেয়ার গ্রোয়ার', category: 'Poultry Feed', unit: 'Bag', bagSize: '50 kg', purchasePrice: 2700, tpPrice: 2870.00, mrpPrice: 3000.00, spPrice: 2715, stock: 45, status: 'Active' },
  { code: '516', name: 'লেয়ার লেয়ার-১', category: 'Poultry Feed', unit: 'Bag', bagSize: '50 kg', purchasePrice: 2500, tpPrice: 2624.00, mrpPrice: 2762.50, spPrice: 2486, stock: 30, status: 'Active' },
  { code: '517', name: 'সোনালী স্টার্টার', category: 'Poultry Feed', unit: 'Bag', bagSize: '50 kg', purchasePrice: 2750, tpPrice: 2873.50, mrpPrice: 3025.00, spPrice: 2722, stock: 40, status: 'Active' },
  { code: '618', name: 'সোনালী গ্রোয়ার', category: 'Poultry Feed', unit: 'Bag', bagSize: '50 kg', purchasePrice: 2700, tpPrice: 2848.50, mrpPrice: 3000.00, spPrice: 2700, stock: 55, status: 'Active' },
  { code: '519', name: 'ব্রয়লার হাউজ ফিড (ক্রাম্বল)', category: 'Poultry Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 1100, tpPrice: 1228.00, mrpPrice: 1350.00, spPrice: 1148, stock: 200, status: 'Active' },
  { code: '510', name: 'ব্রয়লার হাউজ ফিড', category: 'Poultry Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 900, tpPrice: 1080.00, mrpPrice: 1200.00, spPrice: 960, stock: 150, status: 'Active' },

  // Fish/Shrimp Feed (ভাসমান, ডুবন্ত, পাউডার)
  { code: '610', name: 'নার্সারী/হ্যাচারী (পাউডার)', category: 'Fish Feed', unit: 'Bag', bagSize: '10 kg', purchasePrice: 850, tpPrice: 903.00, mrpPrice: 1050.00, spPrice: 800, stock: 45, status: 'Active' },
  { code: '611', name: 'তেলাপিয়া/পাঙ্গাস স্টার্টার', category: 'Fish Feed', unit: 'Bag', bagSize: '20 kg', purchasePrice: 1350, tpPrice: 1453.00, mrpPrice: 1530.00, spPrice: 1377, stock: 60, status: 'Active' },
  { code: '612', name: 'তেলাপিয়া/পাঙ্গাস গ্রোয়ার', category: 'Fish Feed', unit: 'Bag', bagSize: '20 kg', purchasePrice: 1300, tpPrice: 1396.00, mrpPrice: 1470.00, spPrice: 1323, stock: 70, status: 'Active' },
  { code: '613', name: 'তেলাপিয়া/পাঙ্গাস ফিনিশার', category: 'Fish Feed', unit: 'Bag', bagSize: '20 kg', purchasePrice: 1250, tpPrice: 1340.00, mrpPrice: 1410.00, spPrice: 1270, stock: 80, status: 'Active' },
  { code: '614', name: 'মিশ্র কার্প স্টার্টার', category: 'Fish Feed', unit: 'Bag', bagSize: '20 kg', purchasePrice: 1100, tpPrice: 1199.00, mrpPrice: 1290.00, spPrice: 1135, stock: 50, status: 'Active' },
  { code: '615', name: 'মিশ্র কার্প গ্রোয়ার', category: 'Fish Feed', unit: 'Bag', bagSize: '20 kg', purchasePrice: 1050, tpPrice: 1181.00, mrpPrice: 1270.00, spPrice: 1120, stock: 40, status: 'Active' },
  { code: '616', name: 'মিশ্র কার্প ফিনিশার', category: 'Fish Feed', unit: 'Bag', bagSize: '20 kg', purchasePrice: 1000, tpPrice: 1158.00, mrpPrice: 1246.00, spPrice: 1100, stock: 35, status: 'Active' },
  { code: '617', name: 'মিশ্র কার্প গ্রোয়ার (ইকো)', category: 'Fish Feed', unit: 'Bag', bagSize: '20 kg', purchasePrice: 950, tpPrice: 1125.00, mrpPrice: 1250.00, spPrice: 990, stock: 25, status: 'Active' },
  { code: '618_F', name: 'তেলাপিয়া/পাঙ্গাস গ্রোয়ার (ডুবন্ত)', category: 'Fish Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 1300, tpPrice: 1410.00, mrpPrice: 1500.00, spPrice: 1335, stock: 45, status: 'Active' },
  { code: '619', name: 'মিশ্র কার্প গ্রোয়ার (ডুবন্ত)', category: 'Fish Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 1200, tpPrice: 1276.00, mrpPrice: 1450.00, spPrice: 1185, stock: 30, status: 'Active' },
  { code: '620', name: 'গলদা/বাগদা গ্রোয়ার গোল্ড (ডুবন্ত)', category: 'Fish Feed', unit: 'Bag', bagSize: '20 kg', purchasePrice: 1200, tpPrice: 1278.00, mrpPrice: 1360.00, spPrice: 1200, stock: 30, status: 'Active' },
  { code: '621', name: 'গলদা/বাগদা গ্রোয়ার গোল্ড (ডুবন্ত) - ২৫', category: 'Fish Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 1400, tpPrice: 1501.00, mrpPrice: 1650.00, spPrice: 1320, stock: 20, status: 'Active' },

  // Cattle Feed (মিল্ক, বীফ, বুস্টার)
  { code: '710', name: 'ক্যাটল মিল্ক প্রিমিয়াম', category: 'Cattle Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 1200, tpPrice: 1254.00, mrpPrice: 1320.00, spPrice: 0, stock: 75, status: 'Active' },
  { code: '711', name: 'ক্যাটল বীফ প্রিমিয়াম', category: 'Cattle Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 1100, tpPrice: 1178.00, mrpPrice: 1240.00, spPrice: 0, stock: 80, status: 'Active' },
  { code: '712', name: 'ক্যাটল মিল্ক ক্লাসিক', category: 'Cattle Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 1050, tpPrice: 1156.50, mrpPrice: 1217.00, spPrice: 0, stock: 65, status: 'Active' },
  { code: '713', name: 'ক্যাটল বীফ ক্লাসিক', category: 'Cattle Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 1000, tpPrice: 1128.00, mrpPrice: 1187.00, spPrice: 0, stock: 60, status: 'Active' },
  { code: '714', name: 'ক্যাটল মিল্ক পপুলার', category: 'Cattle Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 950, tpPrice: 1075.75, mrpPrice: 1132.00, spPrice: 989, stock: 95, status: 'Active' },
  { code: '715', name: 'ক্যাটল বীফ পপুলার', category: 'Cattle Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 900, tpPrice: 1073.50, mrpPrice: 1130.00, spPrice: 987, stock: 85, status: 'Active' },
  { code: '716', name: 'ক্যাটল বুস্টার সোফডিমেন্ট (ম্যাশ)', category: 'Cattle Feed', unit: 'Bag', bagSize: '25 kg', purchasePrice: 1100, tpPrice: 1171.75, mrpPrice: 1233.00, spPrice: 1125, stock: 50, status: 'Active' }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'C001', name: 'জনাব আবুল কাশেম', companyName: 'Kashem Traders', address: 'Gazipur, Dhaka', mobile: '01711223344', type: 'Dealer', creditLimit: 500000, balance: -25000 },
  { id: 'C002', name: 'রহিম মিয়া', companyName: 'Rahim Poultry', address: 'Tangail', mobile: '01811556677', type: 'Customer', creditLimit: 50000, balance: 1200 },
  { id: 'C003', name: 'সুজন আহমেদ', companyName: 'Fishery Hub', address: 'Mymensingh', mobile: '01922334455', type: 'Dealer', creditLimit: 1000000, balance: -150000 }
];

export const INITIAL_OFFICERS: Officer[] = [
  { id: 'O001', name: 'সাজ্জাদ হোসেন', area: 'Dhaka North', mobile: '01511223344', designation: 'Sales Manager', status: 'Active' },
  { id: 'O002', name: 'তানভীর রহমান', area: 'Chittagong', mobile: '01611223344', designation: 'Field Officer', status: 'Active' }
];
