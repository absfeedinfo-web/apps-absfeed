
import { Product, RawMaterial } from './types';

export const PRODUCTS: Product[] = [
  { code: 'P001', name: 'Broiler Starter', bagSize: 50, protein: '21%', category: 'Poultry' },
  { code: 'P002', name: 'Broiler Grower', bagSize: 50, protein: '19%', category: 'Poultry' },
  { code: 'F001', name: 'Tilapia Feed', bagSize: 25, protein: '28%', category: 'Fish' },
  { code: 'C001', name: 'Dairy Special', bagSize: 40, protein: '16%', category: 'Cattle' },
];

export const RAW_MATERIALS: RawMaterial[] = [
  { id: 'RM001', name: 'Maize', unit: 'kg', proteinPercent: 9, pricePerKg: 32 },
  { id: 'RM002', name: 'Soybean Meal', unit: 'kg', proteinPercent: 44, pricePerKg: 65 },
  { id: 'RM003', name: 'Rice Polish', unit: 'kg', proteinPercent: 12, pricePerKg: 28 },
  { id: 'RM004', name: 'Fish Meal', unit: 'kg', proteinPercent: 60, pricePerKg: 120 },
  { id: 'RM005', name: 'DCP', unit: 'kg', proteinPercent: 0, pricePerKg: 85 },
];
