import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Customer, Product, SaleEntry, LedgerEntry } from './types';

export async function syncLocalStorageToFirebase() {
  try {
    console.log('🔄 Firebase sync shuru...');
    
    const customers = JSON.parse(localStorage.getItem('icd_customers') || '[]');
    console.log('📦 Local Customers mil gaye:', customers.length);

    for (const c of customers) {
      console.log('➡️ Sync kar raha hoon customer ID:', c.id);
      if (!c.id) {
        console.warn('⚠️ Customer ke paas ID nahi hai, skip kar raha hoon:', c);
        continue;
      }
      const { id, ...data } = c;
      await setDoc(doc(db, 'customers', id), data);
      console.log('✅ Customer synced:', id);
    }
    console.log('✅ Customers sync complete!');

    // Baqi cheezein (Products, Sales, Ledger) bhi isi tarah debug ke saath
    const products = JSON.parse(localStorage.getItem('icd_products') || '[]');
    for (const p of products) {
      if (!p.id) continue;
      const { id, ...data } = p;
      await setDoc(doc(db, 'products', id), data);
    }
    console.log('✅ Products sync complete!');

  } catch (error: any) {
    console.error('❌ SYNC FAILED WITH ERROR:', error);
    // Yeh alert aapko screen par exact error dikhayega
    alert('SYNC ERROR: ' + (error.message || error)); 
    throw error;
  }
}
// ============ CUSTOMERS ============
export async function getCustomersFB(): Promise<Customer[]> {
  const snapshot = await getDocs(collection(db, 'customers'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
}

export async function addCustomerFB(customer: Omit<Customer, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'customers'), customer);
  return ref.id;
}

export async function updateCustomerFB(id: string, data: Partial<Customer>): Promise<void> {
  await updateDoc(doc(db, 'customers', id), data);
}

export async function deleteCustomerFB(id: string): Promise<void> {
  await deleteDoc(doc(db, 'customers', id));
}

export async function getCustomerByPhoneFB(phone: string): Promise<Customer | null> {
  const snapshot = await getDocs(collection(db, 'customers'));
  const found = snapshot.docs.find(d => d.data().phone === phone);
  return found ? { id: found.id, ...found.data() } as Customer : null;
}

// ============ PRODUCTS ============
export async function getProductsFB(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, 'products'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
}

export async function addProductFB(product: Omit<Product, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'products'), product);
  return ref.id;
}

export async function updateProductFB(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, 'products', id), data);
}

export async function deleteProductFB(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

// ============ SALES ============
export async function getSalesFB(): Promise<SaleEntry[]> {
  const snapshot = await getDocs(collection(db, 'sales'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SaleEntry));
}

export async function addSaleFB(sale: Omit<SaleEntry, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'sales'), sale);
  return ref.id;
}

// ============ LEDGER ============
export async function getLedgerFB(): Promise<LedgerEntry[]> {
  const snapshot = await getDocs(collection(db, 'ledger'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LedgerEntry));
}

export async function addLedgerEntryFB(entry: Omit<LedgerEntry, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'ledger'), entry);
  return ref.id;
}
// Simple test function - sirf ek customer sync kare
export async function testFirebaseConnection() {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    const customers = JSON.parse(localStorage.getItem('icd_customers') || '[]');
    
    if (customers.length === 0) {
      console.log('⚠️ Koi customer nahi mila localStorage mein');
      return;
    }
    
    const firstCustomer = customers[0];
    console.log('📦 First customer:', firstCustomer);
    
    if (!firstCustomer.id) {
      console.error('❌ Customer ke paas ID nahi hai!');
      alert('Customer ID missing!');
      return;
    }
    
    console.log('➡️ Sending to Firebase...');
    
    const { id, ...data } = firstCustomer;
    
    // Timeout add karein - agar 5 second mein response na aaye
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Firebase timeout - 5 seconds')), 5000);
    });
    
    const setDocPromise = setDoc(doc(db, 'customers', id), data);
    
    await Promise.race([setDocPromise, timeoutPromise]);
    
    console.log('✅ SUCCESS! Customer synced to Firebase');
    alert('Firebase connection successful! Customer synced.');
    
  } catch (error: any) {
    console.error('❌ TEST FAILED:', error);
    alert('Firebase Test Failed: ' + error.message);
  }
}