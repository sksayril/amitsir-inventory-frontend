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
  _id?: string;
  id?: string;
  firmId: string;
  companyName: string;
  name?: string; // For backward compatibility
  firmAddress1: string;
  firmAddress2?: string;
  firmAddress3?: string;
  pinCode: string;
  gstNo: string;
  panNo: string;
  contactNo: string;
  emailId: string;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Item {
  id?: string;
  _id?: string;
  itemName: string;
  name?: string; // For backward compatibility
  itemHsn: string;
  hsnCode?: string; // For backward compatibility
  itemQty: number;
  itemUnits: string;
  unit?: string; // For backward compatibility
  itemRate: {
    inr: number;
    usd: number;
  };
  purchasePrice?: number; // For backward compatibility
  sellingPrice?: number; // For backward compatibility
  remarks: string;
  description?: string; // For backward compatibility
  customField1?: string;
  isActive: boolean;
  status?: 'active' | 'inactive'; // For backward compatibility
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
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
  id?: string;
  _id?: string;
  name: string;
  partyName?: string; // For backward compatibility
  type?: 'customer' | 'supplier' | 'both';
  address?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  panNumber?: string;
  creditLimit?: number;
  currentBalance?: number;
  country?: string;
  port?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
}

export interface DebitParty {
  id?: string;
  _id?: string;
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
  createdAt?: string;
}

export interface Broker {
  id?: string;
  _id?: string;
  brokerName: string;
  name?: string; // For backward compatibility
  address?: string;
  phone?: string;
  email?: string;
  commissionRate?: number;
  specializations?: string[];
  customField1?: string;
  isActive: boolean;
  status?: 'active' | 'inactive'; // For backward compatibility
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CHA {
  id?: string;
  _id?: string;
  chaName: string;
  name?: string; // For backward compatibility
  address?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  services?: string[];
  customField1?: string;
  isActive: boolean;
  status?: 'active' | 'inactive'; // For backward compatibility
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Sales Transaction Types
export interface SalesTransaction {
  _id?: string;
  invoiceNumber?: string;
  transactionNumber?: string;
  companyId: string;
  debitPartyId: string;
  creditPartyId: string;
  company?: Company;
  debitParty?: DebitParty;
  creditParty?: CreditParty;
  broker?: Broker;
  cha?: CHA;
  invoiceDate: string;
  transactionDate: string;
  exporter: ExporterDetails;
  consignee: ConsigneeDetails;
  buyer: BuyerDetails;
  exportDetails: ExportDetails;
  bankDetails: BankDetails;
  items: SalesItem[];
  currency: string;
  exchangeRate: number;
  shippingDetails: ShippingDetails;
  epcgAuthorizations: EPCGAuthorization[];
  purchaseDetails: PurchaseDetail[];
  exportSchemes: ExportSchemes;
  shippingBill: ShippingBill;
  brokerId: string;
  chaId: string;
  remarks: string;
  totalAmount?: number;
  totalTaxableValue?: number;
  totalIgstAmount?: number;
  amountInWords?: string;
  status: 'draft' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface ExporterDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface ConsigneeDetails {
  name: string;
  address: string;
  city: string;
  country: string;
  trn: string;
  contact: string;
}

export interface BuyerDetails {
  name: string;
  address: string;
  country: string;
}

export interface ExportDetails {
  countryOfOrigin: string;
  countryOfDestination: string;
  termsOfDelivery: string;
  termsOfPayment: string;
  carriageBy: string;
  portOfLoading: string;
  portOfDischarge: string;
  finalDestination: string;
}

export interface BankDetails {
  bankName: string;
  branch: string;
  accountNumber: string;
  adCode: string;
  ifscCode: string;
}

export interface SalesItem {
  itemId: string;
  hsnCode: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  exchangeRate: number;
  igstRate: number;
  marks: string;
  amount?: number;
  taxableValue?: number;
  igstAmount?: number;
}

export interface ShippingDetails {
  totalCartons: number;
  netWeight: number;
  grossWeight: number;
  weightUnit: string;
  marks: string;
}

export interface EPCGAuthorization {
  srNo: number;
  authorizationNo: string;
  date: string;
  manufacturer: string;
  address: string;
}

export interface PurchaseDetail {
  srNo: number;
  supplier: string;
  epcgLicNo: string;
  billNumbers: string[];
  billDates: string[];
}

export interface ExportSchemes {
  drawback: boolean;
  rodtep: boolean;
  rosctl: boolean;
  dfia: boolean;
  epcg: boolean;
}

export interface ShippingBill {
  number: string;
  date: string;
}

export interface SalesTransactionListResponse {
  success: boolean;
  data: SalesTransaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SalesTransactionResponse {
  success: boolean;
  message: string;
  data: SalesTransaction;
}

export interface ExportSummary {
  summary: {
    totalInvoices: number;
    totalAmount: number;
    totalTaxableValue: number;
    totalIgstAmount: number;
    averageAmount: number;
  };
  currencyBreakdown: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  countryBreakdown: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}