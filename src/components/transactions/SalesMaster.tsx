import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../services/api'; // Assuming you have an api service

const initialItemState = {
  itemId: '',
  quantity: 0,
  rate: 0,
  description: ''
};

const initialFormData = {
  companyId: '',
  debitPartyId: '',
  creditPartyId: '',
  transactionDate: new Date().toISOString().split('T')[0],
  items: [initialItemState],
  currency: 'INR',
  brokerId: '',
  chaId: '',
  remarks: '',
  customField1: ''
};

export const SalesMaster: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string, show: boolean } | null>(null);
  // States for dropdown data
  const [companies, setCompanies] = useState<any[]>([]);
  const [debitParties, setDebitParties] = useState<any[]>([]);
  const [creditParties, setCreditParties] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [chas, setChas] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      setNotification({ type: 'error', message: 'No authentication token found', show: true });
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      setIsLoading(true);
      setNotification(null);
      try {
        const [companiesRes, debitPartiesRes, creditPartiesRes, itemsRes, brokersRes, chasRes] = await Promise.all([
          api.get('/company', { headers }),
          api.get('/debit-party', { headers }),
          api.get('/credit-party', { headers }),
          api.get('/item', { headers }),
          api.get('/broker', { headers }),
          api.get('/cha', { headers })
        ]);

        setCompanies(companiesRes.data.data || []);
        setDebitParties(debitPartiesRes.data.data || []);
        setCreditParties(creditPartiesRes.data.data || []);
        setItems(itemsRes.data.data || []);
        setBrokers(brokersRes.data.data || []);
        setChas(chasRes.data.data || []);

      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch dropdown data";
        setNotification({ type: 'error', message: errorMessage, show: true });
        console.error("Failed to fetch dropdown data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    (newItems[index] as any)[name] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, initialItemState] }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const headers = { Authorization: `Bearer ${token}` };
      const response = await api.post('/sales-transactions', formData, { headers });
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Sales transaction added successfully!', show: true });
        setShowForm(false);
        setFormData(initialFormData);
      } else {
        throw new Error(response.data.message || 'Failed to add transaction');
      }
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'An unexpected error occurred', show: true });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sales Transactions</h1>
        {notification && notification.show && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {notification.message}
            <button onClick={() => setNotification(null)} className="ml-4 font-bold">X</button>
          </div>
        )}
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Sales Transaction
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {isLoading && <p className="text-center p-4">Loading dropdown data...</p>}
            <h2 className="text-xl font-bold mb-6">New Sales Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select name="companyId" value={formData.companyId} onChange={handleInputChange} className="p-2 border rounded">
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select name="debitPartyId" value={formData.debitPartyId} onChange={handleInputChange} className="p-2 border rounded">
                  <option value="">Select Debit Party</option>
                  {debitParties.map(p => <option key={p._id} value={p._id}>{p.partyName}</option>)}
                </select>
                <select name="creditPartyId" value={formData.creditPartyId} onChange={handleInputChange} className="p-2 border rounded">
                  <option value="">Select Credit Party</option>
                  {creditParties.map(p => <option key={p._id} value={p._id}>{p.partyName}</option>)}
                </select>
                <Input type="date" name="transactionDate" value={formData.transactionDate} onChange={handleInputChange} />
                <select name="currency" value={formData.currency} onChange={handleInputChange} className="p-2 border rounded">
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <h3 className="text-lg font-semibold mt-6 border-b pb-2">Items</h3>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center p-2 border-b">
                  <select name="itemId" value={item.itemId} onChange={e => handleItemChange(index, e)} className="p-2 border rounded col-span-2">
                    <option value="">Select Item</option>
                    {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                  </select>
                  <Input type="number" name="quantity" placeholder="Quantity" value={item.quantity} onChange={e => handleItemChange(index, e)} />
                  <Input type="number" name="rate" placeholder="Rate" value={item.rate} onChange={e => handleItemChange(index, e)} />
                  <Button type="button" variant="danger" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" onClick={addItem} className="mt-2">
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <select name="brokerId" value={formData.brokerId} onChange={handleInputChange} className="p-2 border rounded">
                  <option value="">Select Broker</option>
                  {brokers.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
                <select name="chaId" value={formData.chaId} onChange={handleInputChange} className="p-2 border rounded">
                  <option value="">Select CHA</option>
                  {chas.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <Input type="text" name="remarks" placeholder="Remarks" value={formData.remarks} onChange={handleInputChange} />
              <Input type="text" name="customField1" placeholder="Custom Field 1" value={formData.customField1} onChange={handleInputChange} />

              <div className="flex justify-end space-x-4 pt-6">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Transaction</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Transaction list will be displayed here */}
    </div>
  );
};
