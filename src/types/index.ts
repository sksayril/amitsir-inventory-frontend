export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  firmId: string;
  companyName: string;
  firmAddress1: string;
  firmAddress2?: string;
  firmAddress3?: string;
  pinCode: string;
  gstNo: string;
  panNo: string;
  contactNo: string;
  emailId: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  hsnCode: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  purchasePrice: number;
  sellingPrice: number;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PurchaseTransaction {
  id: string;
  purchaseNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  gstAmount: number;
  grandTotal: number;
  paymentStatus: 'pending' | 'partial' | 'completed';
  status: 'draft' | 'confirmed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export interface PurchaseItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  gstRate: number;
  gstAmount: number;
}



export interface ReceiptTransaction {
  id: string;
  receiptNumber: string;
  date: string;
  transactionType: 'purchase' | 'sales';
  transactionId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'cheque' | 'upi';
  referenceNumber: string;
  notes: string;
  createdAt: string;
}

export interface CreditParty {
  id: string;
  name: string;
  type: 'customer' | 'supplier' | 'both';
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  panNumber: string;
  creditLimit: number;
  currentBalance: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface DebitParty {
  id: string;
  partyName: string;
  partyAddress1: string;
  partyAddress2?: string;
  partyAddress3?: string;
  pinCode: string;
  gstNo: string;
  panNo: string;
  iecNo: string;
  epcgLicNo: {
    lic1: string;
    lic2?: string;
    lic3?: string;
  };
  epcgLicDate: string;
  epcgLicExpiryReminder: string;
  customField1?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Broker {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  commissionRate: number;
  specializations: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CHA {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  licenseNumber: string;
  services: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}