
export interface Product {
  code: string;
  name: string;
  bagSize: number;
  protein: string;
  category: 'Poultry' | 'Fish' | 'Cattle';
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  proteinPercent?: number;
  pricePerKg?: number;
  stock?: number;
  totalValue?: number;
}

export interface FormulaItem {
  materialId: string;
  amount: number;
  price: number;
  proteinPercent: number;
}

export interface Formula {
  id: string;
  productCode: string;
  productName: string;
  items: FormulaItem[];
  date: string;
  lastUpdated: string;
}

export interface ProductionEntry {
  id: string;
  batchNo: string;
  date: string;
  productCode: string;
  productName: string;
  partyName: string;
  bags: number;
  totalKgs: number;
  transportMill: number;
  transportBuyerDepot: number;
  bagCardCost: number;
  millingCharge: number; 
  laborCost: number;
  commission: number;
  bakshish: number;
  additionalCost: number;
  totalValue: number;
  formula: FormulaItem[];
  kgValue: number;
}

export type ExpenseCategory = 'Transport' | 'Food' | 'Labor' | 'Salary' | 'Permanent Asset' | 'Event' | 'Others';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  paymentMethod: 'Cash' | 'Bank' | 'Mobile Banking';
}

export type UserRole = 'admin' | 'visitor';
