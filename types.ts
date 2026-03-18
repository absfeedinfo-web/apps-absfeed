
export enum UserRole {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  ACCOUNTS = 'ACCOUNTS',
  CUSTOMER = 'CUSTOMER',
  OFFICER = 'OFFICER',
  VISITOR = 'VISITOR'
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface Product {
  code: string;
  name: string;
  category: string;
  unit: string;
  bagSize: string;
  purchasePrice: number;
  tpPrice: number; // Trade Price
  mrpPrice: number;
  spPrice: number; // Special Price
  stock: number;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  address: string;
  mobile: string;
  type: 'Dealer' | 'Retail' | 'Customer';
  creditLimit: number;
  balance: number;
}

export interface Officer {
  id: string;
  name: string;
  area: string;
  mobile: string;
  designation: string;
  status: 'Active' | 'Inactive';
}

export interface SaleItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number; // Purchase price at time of sale
  total: number;
  totalCost: number;
  batchNumber?: string;
}

export interface Sale {
  invoiceNo: string;
  date: string;
  serialNo: string;
  officerId: string;
  customerId: string;
  items: SaleItem[];
  totalAmount: number;
  totalCostAmount: number; // Total cost of products
  discount: number;
  netAmount: number;
  paidAmount: number;
  dueAmount: number;
  previousDue: number; // Customer balance before this invoice
  netDue: number; // Total balance after this invoice
  paymentMethod: 'Cash' | 'Credit' | 'Partial';
  paymentDate?: string;
}

export interface StockTransaction {
  id: string;
  date: string;
  productCode: string;
  quantity: number;
  type: 'IN' | 'OUT';
  note: string;
  batchNumber?: string;
}
