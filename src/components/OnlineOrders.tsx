import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, addDoc, query, where, deleteDoc, writeBatch } from 'firebase/firestore';
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
      await updateDoc(doc(db, "orders", id), { status: newStatus });
      
      if (newStatus === 'Completed') {
        const existingLedgerQuery = query(
          collection(db, "ledger"),
          where("customerId", "==", order.customerId),
          where("description", "==", `Online Order #${id.slice(0, 8).toUpperCase()} - Sale`)
        );
        const existingLedger = await getDocs(existingLedgerQuery);
        
        if (existingLedger.empty) {
          const saleDate = order.createdAt ? 
            new Date(order.createdAt.seconds * 1000).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];
          
          const allLedger = await getDocs(collection(db, "ledger"));
          const customerLedger = allLedger.docs
            .map(d => d.data())
            .filter((l: any) => l.customerId === order.customerId);
          const currentBalance = customerLedger.reduce((sum: number, entry: any) => 
            sum + (entry.debit || 0) - (entry.credit || 0), 0);
          
          await addDoc(collection(db, "ledger"), {
            customerId: order.customerId,
            date: saleDate,
            description: `Online Order #${id.slice(0, 8).toUpperCase()} - Sale`,
            debit: order.totalAmount,
            credit: 0,
            balance: currentBalance + order.totalAmount
          });
          
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
        }
      }
      
      fetchOrders();
    } catch (error) {
      console.error("Status update error:", error);
      alert('Error: ' + (error as Error).message);
    }
  };

  // 🗑️ NAYA: Order Delete Function
  const handleDeleteOrder = async (id: string, order: any) => {
    const confirmMsg = `⚠️ WARNING: Kya aap waqai yeh order delete karna chahte hain?\n\nOrder #${id.slice(0, 8).toUpperCase()}\nCustomer: ${order.customerName}\nAmount: Rs. ${order.totalAmount}\n\nYeh action undo nahi hoga!`;
    
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      // 1. Order delete karein
      await deleteDoc(doc(db, "orders", id));
      
      // 2. Agar order Completed tha, toh uski ledger entries bhi delete karein
      if (order.status === 'Completed') {
        const ledgerQuery = query(
          collection(db, "ledger"),
          where("customerId", "==", order.customerId),
          where("description", "in", [
            `Online Order #${id.slice(0, 8).toUpperCase()} - Sale`,
            `Online Order #${id.slice(0, 8).toUpperCase()} - Cash Received`
          ])
        );
        const ledgerSnapshot = await getDocs(ledgerQuery);
        
        const batch = writeBatch(db);
        ledgerSnapshot.docs.forEach(d => batch.delete(doc(db, "ledger", d.id)));
        await batch.commit();
        
        console.log('✅ Order aur uski ledger entries delete ho gayi');
      }
      
      fetchOrders();
      alert('✅ Order delete ho gaya!');
    } catch (error) {
      console.error("Delete error:", error);
      alert('❌ Delete karne mein masla: ' + (error as Error).message);
    }
  };

  // 🗑️ NAYA: Sab Orders Ek Saath Delete (Fresh Start ke liye)
  const handleDeleteAllOrders = async () => {
    if (orders.length === 0) {
      alert('Koi order nahi hai delete karne ke liye!');
      return;
    }
    
    const confirmMsg = `⚠️ DANGER: Kya aap waqai SAB orders delete karna chahte hain?\n\nTotal Orders: ${orders.length}\n\nYeh action undo nahi hoga! Fresh start ke liye yeh option use karein.`;
    
    if (!window.confirm(confirmMsg)) {
      return;
    }
    
    // Double confirmation
    const doubleConfirm = window.confirm('⚠️ LAST WARNING: SAB orders delete ho jayenge. Kya aap 100% sure hain?');
    if (!doubleConfirm) return;

    try {
      const batch = writeBatch(db);
      orders.forEach(order => {
        batch.delete(doc(db, "orders", order.id));
      });
      await batch.commit();
      
      setOrders([]);
      alert(`✅ Sab ${orders.length} orders delete ho gaye!`);
    } catch (error) {
      console.error("Delete all error:", error);
      alert('❌ Delete karne mein masla: ' + (error as Error).message);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📦 Online Orders</h2>
        
        {/* ️ NAYA: Sab Orders Delete Button */}
        {orders.length > 0 && (
          <button 
            onClick={handleDeleteAllOrders}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center gap-2">
            🗑️ Delete All Orders
          </button>
        )}
      </div>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg">Koi online order nahi mila.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                    <p className="text-sm text-gray-500">
                      📅 {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600"> {order.customerName} | 📞 {order.customerPhone}</p>
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
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700">
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
                    {/* 🗑️ NAYA: Delete Button */}
                    <button 
                      onClick={() => handleDeleteOrder(order.id, order)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
                      🗑️ Delete
                    </button>
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