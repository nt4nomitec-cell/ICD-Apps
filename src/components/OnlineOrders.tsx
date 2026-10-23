import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { getCustomersFB } from '../firebaseStore';
import { Customer } from '../types';

export default function OnlineOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    getCustomersFB().then(setCustomers);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      ordersList.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(ordersList);
    } catch (error) {
      console.error("Orders load karne mein error:", error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string, order: any) => {
    try {
      // 1. Order ka status update karein
      await updateDoc(doc(db, "orders", id), { status: newStatus });
      
      // 2. Agar status "Completed" hai, toh ledger entries banayein
      if (newStatus === 'Completed') {
        // Check karein ke kya pehle se ledger entry hai (duplicate se bachne ke liye)
        const existingLedgerQuery = query(
          collection(db, "ledger"),
          where("customerId", "==", order.customerId),
          where("description", "==", `Online Order #${id.slice(0, 8).toUpperCase()} - Sale`)
        );
        const existingLedger = await getDocs(existingLedgerQuery);
        
        // Agar pehle se nahi hai, toh naya entry banayein
        if (existingLedger.empty) {
          const saleDate = order.createdAt ? 
            new Date(order.createdAt.seconds * 1000).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];
          
          // Calculate current balance for this customer
          const allLedger = await getDocs(collection(db, "ledger"));
          const customerLedger = allLedger.docs
            .map(d => d.data())
            .filter((l: any) => l.customerId === order.customerId);
          const currentBalance = customerLedger.reduce((sum: number, entry: any) => 
            sum + (entry.debit || 0) - (entry.credit || 0), 0);
          
          // Debit entry (Sale - Udhaar)
          await addDoc(collection(db, "ledger"), {
            customerId: order.customerId,
            date: saleDate,
            description: `Online Order #${id.slice(0, 8).toUpperCase()} - Sale`,
            debit: order.totalAmount,
            credit: 0,
            balance: currentBalance + order.totalAmount
          });
          
          // Credit entry (Cash Received - agar koi payment aayi ho)
          if (order.cashReceived && order.cashReceived > 0) {
            await addDoc(collection(db, "ledger"), {
              customerId: order.customerId,
              date: saleDate,
              description: `Online Order #${id.slice(0, 8).toUpperCase()} - Cash Received`,
              debit: 0,
              credit: order.cashReceived,
              balance: currentBalance + order.totalAmount - order.cashReceived
            });
          }
          
          console.log('✅ Ledger entries created for completed order:', id);
        }
      }
      
      // 3. List refresh karein
      fetchOrders();
      alert(`Order ${newStatus} kar diya gaya!`);
    } catch (error) {
      console.error("Status update error:", error);
      alert('Error: ' + (error as Error).message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Online Orders</h2>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg">Koi online order nahi mila.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            <p className="text-sm text-gray-600">👤 {customer?.name || order.customerName} | 📞 {order.customerPhone}</p>
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                    <p className="text-sm text-gray-500">
                      📅 {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">👤 {order.customerName} | 📞 {order.customerPhone}</p>
                    <p className="text-sm text-gray-600">📍 {order.customerAddress}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="border-t pt-3 mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                  {order.items && order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span>{item.name} × {item.qty}</span>
                      <span className="font-medium">Rs. {item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center border-t pt-3">
                  <div>
                    <p className="text-lg font-bold text-blue-600">Total: Rs. {order.totalAmount}</p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(order.id, 'Completed', order)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                          ✅ Complete
                        </button>
                        <button 
                          onClick={() => handleStatusChange(order.id, 'Cancelled', order)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
                          ❌ Cancel
                        </button>
                      </>
                    )}
                    {order.status === 'Completed' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'Pending', order)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700">
                          🔄 Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}