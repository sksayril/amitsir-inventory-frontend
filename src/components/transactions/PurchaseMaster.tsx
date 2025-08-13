import React, { useState, useEffect } from 'react';
import { PurchaseTransaction, PurchaseItem } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Search, Edit, Trash2, ShoppingCart, Building2, Calendar, AlertTriangle, X } from 'lucide-react';

interface DebitParty {
  id: string;
  partyName: string;
  address1: string;
  address2?: string;
  address3?: string;
  pinCode: string;
  gstNumber: string;
  panNumber: string;
  iecNumber: string;
  epcgLic1: string;
  epcgLic2: string;
  epcgLic3: string;
  epcgLicDate: string;
  epcgLicExpiry: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const PurchaseMaster: React.FC = () => {
  const [debitParties, setDebitParties] = useState<DebitParty[]>([]);
  const [purchaseTransactions, setPurchaseTransactions] = useState<PurchaseTransaction[]>([]);
  const [showPartyForm, setShowPartyForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingParty, setEditingParty] = useState<DebitParty | undefined>();
  const [editingPurchase, setEditingPurchase] = useState<PurchaseTransaction | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'parties' | 'transactions'>('parties');

  // Mock data for Debit Parties
  useEffect(() => {
    const mockDebitParties: DebitParty[] = [
      {
        id: '1',
        partyName: 'Global Steel Suppliers',
        address1: '123 Industrial Estate',
        address2: 'Phase 2, Sector A',
        address3: 'Mumbai, Maharashtra',
        pinCode: '400001',
        gstNumber: '27AABGS1234Z1Z5',
        panNumber: 'AABGS1234Z',
        iecNumber: '0300001234',
        epcgLic1: 'EPCG001',
        epcgLic2: 'EPCG002',
        epcgLic3: 'EPCG003',
        epcgLicDate: '2024-01-15',
        epcgLicExpiry: '2027-01-15',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        partyName: 'Tech Components Ltd',
        address1: '456 Electronics Park',
        address2: 'Block B, Floor 3',
        address3: 'Bangalore, Karnataka',
        pinCode: '560001',
        gstNumber: '29AABTC5678Z1Z5',
        panNumber: 'AABTC5678Z',
        iecNumber: '0300005678',
        epcgLic1: 'EPCG004',
        epcgLic2: 'EPCG005',
        epcgLic3: '',
        epcgLicDate: '2024-03-20',
        epcgLicExpiry: '2027-03-20',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];
    setDebitParties(mockDebitParties);
  }, []);

  // Mock data for Purchase Transactions
  useEffect(() => {
    const mockPurchases: PurchaseTransaction[] = [
      {
        id: '1',
        purchaseNumber: 'PO-001',
        date: '2024-01-15',
        supplierId: '1',
        supplierName: 'Global Steel Suppliers',
        items: [
          {
            itemId: '1',
            itemName: 'Steel Pipes 6 inch',
            quantity: 100,
            unitPrice: 450.00,
            totalPrice: 45000.00,
            gstRate: 18,
            gstAmount: 8100.00,
          }
        ],
        totalAmount: 45000.00,
        gstAmount: 8100.00,
        grandTotal: 53100.00,
        paymentStatus: 'pending',
        status: 'confirmed',
        notes: 'Steel pipes for construction project',
        createdAt: new Date().toISOString(),
      },
    ];
    setPurchaseTransactions(mockPurchases);
  }, []);

  const filteredParties = debitParties.filter(party => {
    const matchesSearch = party.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         party.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         party.panNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || party.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddParty = (partyData: Omit<DebitParty, 'id' | 'createdAt'>) => {
    const newParty: DebitParty = {
      ...partyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setDebitParties(prev => [...prev, newParty]);
    setShowPartyForm(false);
  };

  const handleEditParty = (partyData: Omit<DebitParty, 'id' | 'createdAt'>) => {
    if (editingParty) {
      setDebitParties(prev => prev.map(p => 
        p.id === editingParty.id 
          ? { ...partyData, id: p.id, createdAt: p.createdAt }
          : p
      ));
      setEditingParty(undefined);
      setShowPartyForm(false);
    }
  };

  const handleDeleteParty = (id: string) => {
    if (window.confirm('Are you sure you want to delete this debit party?')) {
      setDebitParties(prev => prev.filter(p => p.id !== id));
    }
  };

  const startEditParty = (party: DebitParty) => {
    setEditingParty(party);
    setShowPartyForm(true);
  };

  const handleCancelParty = () => {
    setShowPartyForm(false);
    setEditingParty(undefined);
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Purchase Master</h1>
          <p className="text-gray-600 mt-2">Manage purchase transactions and debit party information</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setShowPartyForm(true)} 
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Building2 className="w-4 h-4" />
            <span>Add Debit Party</span>
          </Button>
          <Button 
            onClick={() => setShowPurchaseForm(true)} 
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>New Purchase</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('parties')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'parties'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Debit Party Master
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Purchase Transactions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'parties' ? (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search parties by name, GST, or PAN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Debit Parties Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Party Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address & Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tax & License Info
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EPCG License
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredParties.map((party) => {
                        const expiringSoon = isExpiringSoon(party.epcgLicExpiry);
                        const expired = isExpired(party.epcgLicExpiry);
                        
                        return (
                          <tr key={party.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <Building2 className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{party.partyName}</div>
                                  <div className="text-sm text-gray-500">ID: {party.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div>{party.address1}</div>
                                {party.address2 && <div className="text-gray-500">{party.address2}</div>}
                                {party.address3 && <div className="text-gray-500">{party.address3}</div>}
                                <div className="text-gray-500">Pin: {party.pinCode}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div>GST: {party.gstNumber}</div>
                                <div>PAN: {party.panNumber}</div>
                                <div>IEC: {party.iecNumber}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div className="flex items-center space-x-2">
                                  <span>Lic 1: {party.epcgLic1}</span>
                                  {expired && <AlertTriangle className="w-4 h-4 text-red-600" />}
                                  {expiringSoon && !expired && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                                </div>
                                {party.epcgLic2 && <div>Lic 2: {party.epcgLic2}</div>}
                                {party.epcgLic3 && <div>Lic 3: {party.epcgLic3}</div>}
                                <div className="text-xs text-gray-500">
                                  Expiry: {new Date(party.epcgLicExpiry).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                party.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {party.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => startEditParty(party)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteParty(party.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredParties.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No debit parties found</h3>
                    <p className="text-gray-500">Start by adding your first debit party to the system.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Purchase Transactions Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purchase Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items & Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchaseTransactions.map((purchase) => (
                        <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">{purchase.purchaseNumber}</div>
                              <div className="text-gray-500">{new Date(purchase.date).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-400">{purchase.notes}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{purchase.supplierName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <div>{purchase.items.length} items</div>
                              <div className="text-gray-500">Total: ₹{purchase.totalAmount.toFixed(2)}</div>
                              <div className="text-gray-500">GST: ₹{purchase.gstAmount.toFixed(2)}</div>
                              <div className="font-medium">Grand Total: ₹{purchase.grandTotal.toFixed(2)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              purchase.paymentStatus === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : purchase.paymentStatus === 'partial'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {purchase.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {purchaseTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase transactions found</h3>
                    <p className="text-gray-500">Start by creating your first purchase transaction.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debit Party Form Modal */}
      {showPartyForm && (
        <DebitPartyForm
          party={editingParty}
          onSubmit={editingParty ? handleEditParty : handleAddParty}
          onCancel={handleCancelParty}
        />
      )}
    </div>
  );
};

// Debit Party Form Component
interface DebitPartyFormProps {
  party?: DebitParty;
  onSubmit: (party: Omit<DebitParty, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const DebitPartyForm: React.FC<DebitPartyFormProps> = ({ party, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    partyName: '',
    address1: '',
    address2: '',
    address3: '',
    pinCode: '',
    gstNumber: '',
    panNumber: '',
    iecNumber: '',
    epcgLic1: '',
    epcgLic2: '',
    epcgLic3: '',
    epcgLicDate: '',
    epcgLicExpiry: '',
    status: 'active' as 'active' | 'inactive',
  });

  React.useEffect(() => {
    if (party) {
      setFormData({
        partyName: party.partyName,
        address1: party.address1,
        address2: party.address2 || '',
        address3: party.address3 || '',
        pinCode: party.pinCode,
        gstNumber: party.gstNumber,
        panNumber: party.panNumber,
        iecNumber: party.iecNumber,
        epcgLic1: party.epcgLic1,
        epcgLic2: party.epcgLic2 || '',
        epcgLic3: party.epcgLic3 || '',
        epcgLicDate: party.epcgLicDate,
        epcgLicExpiry: party.epcgLicExpiry,
        status: party.status,
      });
    }
  }, [party]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {party ? 'Edit Debit Party' : 'Add New Debit Party'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Party Name"
              value={formData.partyName}
              onChange={(e) => setFormData(prev => ({ ...prev, partyName: e.target.value }))}
              placeholder="Enter party name"
              required
            />
            <Input
              label="Pin Code"
              value={formData.pinCode}
              onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
              placeholder="Enter pin code"
              required
            />
          </div>

          <Input
            label="Party Address Line 1"
            value={formData.address1}
            onChange={(e) => setFormData(prev => ({ ...prev, address1: e.target.value }))}
            placeholder="Enter address line 1"
            required
          />

          <Input
            label="Party Address Line 2"
            value={formData.address2}
            onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
            placeholder="Enter address line 2 (optional)"
          />

          <Input
            label="Party Address Line 3"
            value={formData.address3}
            onChange={(e) => setFormData(prev => ({ ...prev, address3: e.target.value }))}
            placeholder="Enter address line 3 (optional)"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="GST Number"
              value={formData.gstNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
              placeholder="Enter GST number"
              required
            />
            <Input
              label="PAN Number"
              value={formData.panNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value }))}
              placeholder="Enter PAN number"
              required
            />
            <Input
              label="IEC Number"
              value={formData.iecNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, iecNumber: e.target.value }))}
              placeholder="Enter IEC number"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="EPCG License 1"
              value={formData.epcgLic1}
              onChange={(e) => setFormData(prev => ({ ...prev, epcgLic1: e.target.value }))}
              placeholder="Enter EPCG license 1"
              required
            />
            <Input
              label="EPCG License 2"
              value={formData.epcgLic2}
              onChange={(e) => setFormData(prev => ({ ...prev, epcgLic2: e.target.value }))}
              placeholder="Enter EPCG license 2 (optional)"
            />
            <Input
              label="EPCG License 3"
              value={formData.epcgLic3}
              onChange={(e) => setFormData(prev => ({ ...prev, epcgLic3: e.target.value }))}
              placeholder="Enter EPCG license 3 (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="EPCG License Date"
              type="date"
              value={formData.epcgLicDate}
              onChange={(e) => setFormData(prev => ({ ...prev, epcgLicDate: e.target.value }))}
              required
            />
            <Input
              label="EPCG License Expiry"
              type="date"
              value={formData.epcgLicExpiry}
              onChange={(e) => setFormData(prev => ({ ...prev, epcgLicExpiry: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-8 p-6">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {party ? 'Update Debit Party' : 'Add Debit Party'}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onCancel}
              className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
