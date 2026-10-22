import { Customer, Product, SaleEntry, LedgerEntry } from './types';

const STORAGE_KEYS = {
  customers: 'icd_customers',
  products: 'icd_products',
  sales: 'icd_sales',
  ledger: 'icd_ledger',
  adminPassword: 'icd_admin_password',
};

export function initializeStore() {
  if (!localStorage.getItem(STORAGE_KEYS.adminPassword)) {
    localStorage.setItem(STORAGE_KEYS.adminPassword, 'admin123');
  }
  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    const defaultProducts: Product[] = [
      { id: '1', name: 'Cotton Bottle 500ml', price: 30, stock: 500, unit: 'bottle' },
      { id: '2', name: 'Cotton Bottle 1.5L', price: 80, stock: 300, unit: 'bottle' },
      { id: '3', name: 'Cotton Bottle 250ml', price: 20, stock: 800, unit: 'bottle' },
      { id: '4', name: 'Mineral Water 1.5L', price: 50, stock: 200, unit: 'bottle' },
      { id: '5', name: 'Juice Pack 1L', price: 120, stock: 150, unit: 'pack' },
    ];
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(defaultProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.customers)) {
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.sales)) {
    localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ledger)) {
    localStorage.setItem(STORAGE_KEYS.ledger, JSON.stringify([]));
  }
}

export function getCustomers(): Customer[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.customers) || '[]');
}

export function addCustomer(customer: Customer) {
  const customers = getCustomers();
  customers.push(customer);
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
}

export function updateCustomer(customer: Customer) {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  if (index !== -1) {
    customers[index] = customer;
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  }
}

export function deleteCustomer(id: string) {
  const customers = getCustomers().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
}

export function getCustomerById(id: string): Customer | undefined {
  return getCustomers().find(c => c.id === id);
}

export function getProducts(): Product[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]');
}

export function addProduct(product: Product) {
  const products = getProducts();
  products.push(product);
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

export function updateProduct(product: Product) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index !== -1) {
    products[index] = product;
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }
}

export function deleteProduct(id: string) {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

export function getSales(): SaleEntry[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.sales) || '[]');
}

export function addSale(sale: SaleEntry) {
  const sales = getSales();
  sales.push(sale);
  localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(sales));

  const products = getProducts();
  sale.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  });
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));

  const ledger = getLedger();
  const ledgerEntry: LedgerEntry = {
    id: Date.now().toString() + '_debit',
    customerId: sale.customerId,
    date: sale.date,
    description: 'Bill #' + sale.billNumber + ' - Sale',
    debit: sale.totalAmount,
    credit: 0,
    balance: calculateCustomerBalance(sale.customerId) + sale.totalAmount - sale.cashReceived,
  };
  ledger.push(ledgerEntry);

  if (sale.cashReceived > 0) {
    const cashEntry: LedgerEntry = {
      id: Date.now().toString() + '_credit',
      customerId: sale.customerId,
      date: sale.date,
      description: 'Bill #' + sale.billNumber + ' - Cash Received',
      debit: 0,
      credit: sale.cashReceived,
      balance: calculateCustomerBalance(sale.customerId) + sale.totalAmount - sale.cashReceived,
    };
    ledger.push(cashEntry);
  }

  localStorage.setItem(STORAGE_KEYS.ledger, JSON.stringify(ledger));
}

export function getSalesByCustomer(customerId: string): SaleEntry[] {
  return getSales().filter(s => s.customerId === customerId);
}

export function getLedger(): LedgerEntry[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ledger) || '[]');
}

export function getLedgerByCustomer(customerId: string): LedgerEntry[] {
  return getLedger().filter(l => l.customerId === customerId);
}

export function calculateCustomerBalance(customerId: string): number {
  const entries = getLedgerByCustomer(customerId);
  let balance = 0;
  entries.forEach(entry => {
    balance += entry.debit - entry.credit;
  });
  return balance;
}

export function addCashPayment(customerId: string, amount: number) {
  const ledger = getLedger();
  const currentBalance = calculateCustomerBalance(customerId);
  const entry: LedgerEntry = {
    id: Date.now().toString(),
    customerId,
    date: new Date().toISOString().split('T')[0],
    description: 'Cash Payment Received',
    debit: 0,
    credit: amount,
    balance: currentBalance - amount,
  };
  ledger.push(entry);
  localStorage.setItem(STORAGE_KEYS.ledger, JSON.stringify(ledger));
}

export function getAdminPassword(): string {
  return localStorage.getItem(STORAGE_KEYS.adminPassword) || 'admin123';
}

export function generateBillNumber(): string {
  const sales = getSales();
  const num = sales.length + 1;
  return 'ICD-' + String(num).padStart(5, '0');
}


