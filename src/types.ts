export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  password: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
}

export interface SaleEntry {
  id: string;
  customerId: string;
  items: SaleItem[];
  totalAmount: number;
  cashReceived: number;
  balance: number;
  date: string;
  billNumber: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface LedgerEntry {
  id: string;
  customerId: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

