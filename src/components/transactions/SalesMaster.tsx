import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Trash2, Search, FileText, BarChart3, Edit, Eye, Download, Printer } from 'lucide-react';
import api, { salesAPI, masterDataAPI } from '../../services/api';
import { 
  SalesTransaction, 
  Company, 
  DebitParty, 
  CreditParty, 
  Item, 
  Broker, 
  CHA,
  SalesTransactionListResponse,
  SalesTransactionResponse,
  ExportSummary
} from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Initial states for form data
const initialExporterState = {
  name: '',
  address: '',
  city: '',
  state: '',
  country: 'INDIA',
  pincode: ''
};

const initialConsigneeState = {
  name: '',
  address: '',
  city: '',
  country: '',
  trn: '',
  contact: ''
};

const initialBuyerState = {
  name: '',
  address: '',
  country: ''
};

const initialExportDetailsState = {
  countryOfOrigin: 'INDIAN ORIGIN',
  countryOfDestination: '',
  termsOfDelivery: 'SHIPMENT BY VESSEL',
  termsOfPayment: 'DA 120 DAYS',
  carriageBy: 'BY SEA VESSEL',
  portOfLoading: 'NHAVA SHEVA, INDIA',
  portOfDischarge: '',
  finalDestination: ''
};

const initialBankDetailsState = {
  bankName: '',
  branch: '',
  accountNumber: '',
  adCode: '',
  ifscCode: ''
};

const initialShippingDetailsState = {
  totalCartons: 0,
  netWeight: 0,
  grossWeight: 0,
  weightUnit: 'KGS',
  marks: ''
};

const initialShippingBillState = {
  number: '',
  date: ''
};

const initialExportSchemesState = {
  drawback: false,
  rodtep: false,
  rosctl: true,
  dfia: false,
  epcg: true
};

const initialSalesItemState = {
  itemId: '',
  hsnCode: '',
  description: '',
  quantity: 0,
  unit: 'PCS',
  rate: 0,
  exchangeRate: 86.90,
  igstRate: 5,
  marks: ''
};

const initialEPCGAuthorizationState = {
  srNo: 1,
  authorizationNo: '',
  date: '',
  manufacturer: '',
  address: ''
};

const initialPurchaseDetailState = {
  srNo: 1,
  supplier: '',
  epcgLicNo: '',
  billNumbers: [''],
  billDates: ['']
};

const initialFormData: Partial<SalesTransaction> = {
  companyId: '',
  debitPartyId: '',
  creditPartyId: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  transactionDate: new Date().toISOString().split('T')[0],
  exporter: initialExporterState,
  consignee: initialConsigneeState,
  buyer: initialBuyerState,
  exportDetails: initialExportDetailsState,
  bankDetails: initialBankDetailsState,
  items: [initialSalesItemState],
  currency: 'USD',
  exchangeRate: 86.90,
  shippingDetails: initialShippingDetailsState,
  epcgAuthorizations: [initialEPCGAuthorizationState],
  purchaseDetails: [initialPurchaseDetailState],
  exportSchemes: initialExportSchemesState,
  shippingBill: initialShippingBillState,
  brokerId: '',
  chaId: '',
  remarks: '',
  status: 'draft'
};

export const SalesMaster: React.FC = () => {
  // Main states
  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'summary'>('list');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SalesTransaction>>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string, show: boolean } | null>(null);
  
  // List states
  const [salesTransactions, setSalesTransactions] = useState<SalesTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<SalesTransaction | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Summary states
  const [exportSummary, setExportSummary] = useState<ExportSummary | null>(null);
  const [summaryDateRange, setSummaryDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Dropdown data states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [debitParties, setDebitParties] = useState<DebitParty[]>([]);
  const [creditParties, setCreditParties] = useState<CreditParty[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [chas, setChas] = useState<CHA[]>([]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsLoading(true);
      setNotification(null);
      try {
        const [companiesRes, debitPartiesRes, creditPartiesRes, itemsRes, brokersRes, chasRes] = await Promise.all([
          masterDataAPI.getCompanies(),
          masterDataAPI.getDebitParties(),
          masterDataAPI.getCreditParties(),
          masterDataAPI.getItems(),
          masterDataAPI.getBrokers(),
          masterDataAPI.getChas()
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
    fetchDropdownData();
  }, []);

  // Fetch sales transactions
  useEffect(() => {
    if (activeTab === 'list') {
      fetchSalesTransactions();
    }
  }, [activeTab, currentPage, searchTerm]);

  // Fetch export summary
  useEffect(() => {
    if (activeTab === 'summary') {
      fetchExportSummary();
    }
  }, [activeTab, summaryDateRange]);

  // API Functions
  const fetchSalesTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await salesAPI.getSalesTransactions({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined
      });
      
      if (response.data.success) {
        setSalesTransactions(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch sales transactions";
      setNotification({ type: 'error', message: errorMessage, show: true });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExportSummary = async () => {
    try {
      setIsLoading(true);
      const response = await salesAPI.getExportSummary({
        startDate: summaryDateRange.startDate,
        endDate: summaryDateRange.endDate
      });
      
      if (response.data.success) {
        setExportSummary(response.data.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch export summary";
      setNotification({ type: 'error', message: errorMessage, show: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update item rates when currency changes
    if (name === 'currency') {
      const newItems = [...(formData.items || [])];
      newItems.forEach((item, index) => {
        if (item.itemId) {
          const selectedItem = items.find(i => (i._id || i.id) === item.itemId);
          if (selectedItem) {
            const rateKey = value.toLowerCase() as keyof typeof selectedItem.itemRate;
            (newItems[index] as any).rate = selectedItem.itemRate?.[rateKey] || 0;
          }
        }
      });
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: value
      }
    }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newItems = [...(formData.items || [])];
    (newItems[index] as any)[name] = value;
    
    // Auto-populate item details when item is selected
    if (name === 'itemId' && value) {
      const selectedItem = items.find(item => (item._id || item.id) === value);
      if (selectedItem) {
        (newItems[index] as any).hsnCode = selectedItem.itemHsn || selectedItem.hsnCode || '';
        (newItems[index] as any).description = selectedItem.remarks || selectedItem.description || '';
        (newItems[index] as any).unit = selectedItem.itemUnits || selectedItem.unit || 'PCS';
        // Set rate based on currency
        const currency = formData.currency || 'USD';
        const rateKey = currency.toLowerCase() as keyof typeof selectedItem.itemRate;
        (newItems[index] as any).rate = selectedItem.itemRate?.[rateKey] || 0;
      }
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({ 
      ...prev, 
      items: [...(prev.items || []), initialSalesItemState] 
    }));
  };

  const removeItem = (index: number) => {
    const newItems = (formData.items || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await salesAPI.createSalesTransaction(formData);
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Sales transaction added successfully!', show: true });
        setShowForm(false);
        setFormData(initialFormData);
        fetchSalesTransactions(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to add transaction');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
      setNotification({ type: 'error', message: errorMessage, show: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (transaction: SalesTransaction) => {
    setSelectedTransaction(transaction);
    setFormData(transaction);
    setShowForm(true);
    setIsViewMode(false);
  };

  const handleView = (transaction: SalesTransaction) => {
    setSelectedTransaction(transaction);
    setFormData(transaction);
    setShowForm(true);
    setIsViewMode(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await salesAPI.deleteSalesTransaction(id);
        if (response.data.success) {
          setNotification({ type: 'success', message: 'Transaction deleted successfully!', show: true });
          fetchSalesTransactions();
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete transaction';
        setNotification({ type: 'error', message: errorMessage, show: true });
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedTransaction(null);
    setIsViewMode(false);
  };

  // PDF Generation
  const generateInvoicePDF = async (transaction: SalesTransaction) => {
    try {
      // Create a temporary div to render the invoice
      const invoiceDiv = document.createElement('div');
      invoiceDiv.style.width = '210mm';
      invoiceDiv.style.padding = '20mm';
      invoiceDiv.style.backgroundColor = 'white';
      invoiceDiv.style.fontFamily = 'Arial, sans-serif';
      invoiceDiv.style.fontSize = '12px';
      invoiceDiv.style.lineHeight = '1.4';
      invoiceDiv.style.position = 'absolute';
      invoiceDiv.style.left = '-9999px';
      invoiceDiv.style.top = '0';
      
      // Generate invoice HTML content
      invoiceDiv.innerHTML = generateInvoiceHTML(transaction);
      
      document.body.appendChild(invoiceDiv);
      
      // Convert to canvas and then to PDF
      const canvas = await html2canvas(invoiceDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(invoiceDiv);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      pdf.save(`Invoice_${transaction.invoiceNumber || transaction._id}.pdf`);
      
      setNotification({ type: 'success', message: 'Invoice PDF generated successfully!', show: true });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification({ type: 'error', message: 'Failed to generate PDF', show: true });
    }
  };

  const generateInvoiceHTML = (transaction: SalesTransaction): string => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-GB');
    };

    const formatCurrency = (amount: number, currency: string) => {
      return `${amount.toLocaleString()} ${currency}`;
    };

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">EXPORT CUM TAX INVOICE</h1>
          <div style="margin-top: 10px;">
            <strong>Invoice No. & Date:</strong> ${transaction.invoiceNumber || 'N/A'} Dtd. ${formatDate(transaction.invoiceDate)}
          </div>
        </div>

                 <!-- Company and Parties Details -->
         <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
           <div style="width: 32%;">
             <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">COMPANY</h3>
             <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
               <div><strong>${transaction.company?.companyName || 'N/A'}</strong></div>
               <div>GST: ${transaction.company?.gstNo || 'N/A'}</div>
               <div>PAN: ${transaction.company?.panNo || 'N/A'}</div>
             </div>
           </div>
           
           <div style="width: 32%;">
             <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">DEBIT PARTY</h3>
             <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
               <div><strong>${transaction.debitParty?.partyName || 'N/A'}</strong></div>
               <div>GST: ${transaction.debitParty?.gstNo || 'N/A'}</div>
               <div>PAN: ${transaction.debitParty?.panNo || 'N/A'}</div>
               <div>IEC: ${transaction.debitParty?.iecNo || 'N/A'}</div>
             </div>
           </div>
           
           <div style="width: 32%;">
             <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">CREDIT PARTY</h3>
             <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
               <div><strong>${transaction.creditParty?.partyName || 'N/A'}</strong></div>
               <div>Country: ${transaction.creditParty?.country || 'N/A'}</div>
               <div>Port: ${transaction.creditParty?.port || 'N/A'}</div>
             </div>
           </div>
         </div>

         <!-- Exporter and Consignee Details -->
         <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
           <div style="width: 48%;">
             <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">EXPORTER</h3>
             <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
               <div><strong>${transaction.exporter?.name || 'N/A'}</strong></div>
               <div>${transaction.exporter?.address || 'N/A'}</div>
               <div>${transaction.exporter?.city || 'N/A'}, ${transaction.exporter?.state || 'N/A'}</div>
               <div>${transaction.exporter?.country || 'N/A'} - ${transaction.exporter?.pincode || 'N/A'}</div>
             </div>
           </div>
           
           <div style="width: 48%;">
             <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">CONSIGNEE</h3>
             <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
               <div><strong>${transaction.consignee?.name || 'N/A'}</strong></div>
               <div>${transaction.consignee?.address || 'N/A'}</div>
               <div>${transaction.consignee?.city || 'N/A'}, ${transaction.consignee?.country || 'N/A'}</div>
               <div>TRN: ${transaction.consignee?.trn || 'N/A'}</div>
               <div>Contact: ${transaction.consignee?.contact || 'N/A'}</div>
             </div>
           </div>
         </div>

        <!-- Export Details -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">EXPORT DETAILS</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div><strong>Country of Origin:</strong> ${transaction.exportDetails?.countryOfOrigin || 'N/A'}</div>
              <div><strong>Country of Destination:</strong> ${transaction.exportDetails?.countryOfDestination || 'N/A'}</div>
              <div><strong>Terms of Delivery:</strong> ${transaction.exportDetails?.termsOfDelivery || 'N/A'}</div>
              <div><strong>Terms of Payment:</strong> ${transaction.exportDetails?.termsOfPayment || 'N/A'}</div>
              <div><strong>Port of Loading:</strong> ${transaction.exportDetails?.portOfLoading || 'N/A'}</div>
              <div><strong>Port of Discharge:</strong> ${transaction.exportDetails?.portOfDischarge || 'N/A'}</div>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">ITEMS DETAILS</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Sr. No.</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Description</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Quantity</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Unit</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Rate</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.items?.map((item, index) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">${index + 1}</td>
                                     <td style="border: 1px solid #ddd; padding: 10px;">
                     <div><strong>${item.description || 'N/A'}</strong></div>
                     <div style="font-size: 11px; color: #666;">HSN: ${item.hsnCode || 'N/A'}</div>
                   </td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${item.quantity || 0}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${item.unit || 'N/A'}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(item.rate || 0, transaction.currency)}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(item.amount || 0, transaction.currency)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div style="margin-bottom: 30px;">
          <div style="display: flex; justify-content: flex-end;">
            <div style="width: 300px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px; text-align: right;"><strong>Total Amount:</strong></td>
                  <td style="padding: 5px; text-align: right; font-size: 18px; font-weight: bold; color: #2563eb;">
                    ${formatCurrency(transaction.totalAmount || 0, transaction.currency)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px; text-align: right;"><strong>Taxable Value (INR):</strong></td>
                  <td style="padding: 5px; text-align: right;">₹${transaction.totalTaxableValue?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td style="padding: 5px; text-align: right;"><strong>IGST Amount:</strong></td>
                  <td style="padding: 5px; text-align: right;">₹${transaction.totalIgstAmount?.toLocaleString() || 0}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Amount in Words -->
        <div style="margin-bottom: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
          <strong>Amount in Words:</strong> ${transaction.amountInWords || 'N/A'}
        </div>

                 <!-- Broker and CHA Details -->
         <div style="margin-bottom: 30px;">
           <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">BROKER & CHA DETAILS</h3>
           <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
               <div><strong>Broker:</strong> ${transaction.broker?.brokerName || 'N/A'}</div>
               <div><strong>CHA:</strong> ${transaction.cha?.chaName || 'N/A'}</div>
             </div>
           </div>
         </div>

         <!-- Shipping Details -->
         <div style="margin-bottom: 30px;">
           <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">SHIPPING DETAILS</h3>
           <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
               <div><strong>Total Cartons:</strong> ${transaction.shippingDetails?.totalCartons || 0}</div>
               <div><strong>Net Weight:</strong> ${transaction.shippingDetails?.netWeight || 0} ${transaction.shippingDetails?.weightUnit || 'KGS'}</div>
               <div><strong>Gross Weight:</strong> ${transaction.shippingDetails?.grossWeight || 0} ${transaction.shippingDetails?.weightUnit || 'KGS'}</div>
               <div><strong>Marks:</strong> ${transaction.shippingDetails?.marks || 'N/A'}</div>
             </div>
           </div>
         </div>

        <!-- Footer -->
        <div style="margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="text-align: center;">
              <div style="margin-bottom: 10px;">
                <img src="/image.png" alt="Company Stamp" style="width: 100px; height: auto; opacity: 0.7;" />
              </div>
              <div style="font-weight: bold;">Proprietor/Auth. Sign.</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #666;">
                Generated on: ${new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sales Transactions</h1>
        <Button onClick={() => { setShowForm(true); resetForm(); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Sales Transaction
        </Button>
      </div>

      {/* Notification */}
      {notification && notification.show && (
        <div className={`p-4 mb-4 rounded-lg flex justify-between items-center ${
          notification.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 
          notification.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 
          'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="font-bold text-lg">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="inline mr-2 h-4 w-4" />
              Sales Transactions
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="inline mr-2 h-4 w-4" />
              Export Summary
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'list' && (
        <div>
          {/* Search and Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by invoice number, exporter, consignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : salesTransactions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new sales transaction.</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parties
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items & Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {transaction.invoiceNumber || 'Draft'}
                            </div>
                            <div className="text-gray-500">
                              Date: {new Date(transaction.transactionDate).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">
                              Transaction: {transaction.transactionNumber || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900">
                              <span className="font-medium">Exporter:</span> {transaction.exporter?.name || 'N/A'}
                            </div>
                            <div className="text-gray-500">
                              <span className="font-medium">Consignee:</span> {transaction.consignee?.name || 'N/A'}
                            </div>
                            <div className="text-gray-500">
                              <span className="font-medium">Buyer:</span> {transaction.buyer?.name || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900">
                              <span className="font-medium">Items:</span> {transaction.items?.length || 0}
                            </div>
                            <div className="text-gray-500">
                              <span className="font-medium">Qty:</span> {transaction.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {transaction.totalAmount?.toLocaleString()} {transaction.currency}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleView(transaction)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(transaction)}
                              title="Edit Transaction"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => generateInvoicePDF(transaction)}
                              title="Generate Invoice PDF"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(transaction._id!)}
                              title="Delete Transaction"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages} ({totalItems} total items)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Summary Tab */}
      {activeTab === 'summary' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Export Summary</h2>
            <div className="flex gap-4">
              <Input
                type="date"
                value={summaryDateRange.startDate}
                onChange={(e) => setSummaryDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-48"
              />
              <Input
                type="date"
                value={summaryDateRange.endDate}
                onChange={(e) => setSummaryDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-48"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading summary...</p>
            </div>
          ) : exportSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Total Invoices</h3>
                <p className="text-3xl font-bold text-blue-600">{exportSummary.summary.totalInvoices}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Total Amount</h3>
                <p className="text-3xl font-bold text-green-600">
                  {exportSummary.summary.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Taxable Value</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {exportSummary.summary.totalTaxableValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">IGST Amount</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {exportSummary.summary.totalIgstAmount.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No summary data</h3>
              <p className="mt-1 text-sm text-gray-500">Select a date range to view export summary.</p>
            </div>
          )}
        </div>
      )}

      {/* Sales Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {isViewMode ? 'View Sales Transaction' : selectedTransaction ? 'Edit Sales Transaction' : 'New Sales Transaction'}
                </h2>
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            {isLoading && <p className="text-center p-4">Loading dropdown data...</p>}
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select 
                  name="companyId" 
                  value={formData.companyId || ''} 
                  onChange={handleInputChange} 
                  className="p-2 border rounded"
                  disabled={isViewMode}
                >
                  <option value="">Select Company</option>
                  {companies.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.companyName || c.name}
                    </option>
                  ))}
                </select>
                <select 
                  name="debitPartyId" 
                  value={formData.debitPartyId || ''} 
                  onChange={handleInputChange} 
                  className="p-2 border rounded"
                  disabled={isViewMode}
                >
                  <option value="">Select Debit Party</option>
                  {debitParties.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.partyName}
                    </option>
                  ))}
                </select>
                <select 
                  name="creditPartyId" 
                  value={formData.creditPartyId || ''} 
                  onChange={handleInputChange} 
                  className="p-2 border rounded"
                  disabled={isViewMode}
                >
                  <option value="">Select Credit Party</option>
                  {creditParties.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name || p.partyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input 
                  type="date" 
                  name="invoiceDate" 
                  value={formData.invoiceDate || ''} 
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
                <Input 
                  type="date" 
                  name="transactionDate" 
                  value={formData.transactionDate || ''} 
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
                <select 
                  name="currency" 
                  value={formData.currency || ''} 
                  onChange={handleInputChange} 
                  className="p-2 border rounded"
                  disabled={isViewMode}
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              {/* Items Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Items</h3>
                {(formData.items || []).map((item, index) => (
                  <div key={index} className="border rounded mb-4 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center mb-4">
                      <select 
                        name="itemId" 
                        value={item.itemId || ''} 
                        onChange={e => handleItemChange(index, e)} 
                        className="p-2 border rounded"
                        disabled={isViewMode}
                      >
                        <option value="">Select Item</option>
                        {items.map(i => (
                          <option key={i._id || i.id} value={i._id || i.id}>
                            {i.itemName || i.name}
                          </option>
                        ))}
                      </select>
                      <Input 
                        type="number" 
                        name="quantity" 
                        placeholder="Qty" 
                        value={item.quantity || ''} 
                        onChange={e => handleItemChange(index, e)}
                        disabled={isViewMode}
                      />
                      <Input 
                        type="number" 
                        name="rate" 
                        placeholder="Rate" 
                        value={item.rate || ''} 
                        onChange={e => handleItemChange(index, e)}
                        disabled={isViewMode}
                      />
                      <Input 
                        type="text" 
                        name="marks" 
                        placeholder="Marks" 
                        value={item.marks || ''} 
                        onChange={e => handleItemChange(index, e)}
                        disabled={isViewMode}
                      />
                      {!isViewMode && (
                        <Button 
                          type="button" 
                          variant="danger" 
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Item Details Display */}
                    {item.itemId && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <div>
                          <span className="font-medium">HSN Code:</span> {item.hsnCode || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Unit:</span> {item.unit || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Description:</span> {item.description || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span> {((item.quantity || 0) * (item.rate || 0)).toFixed(2)} {formData.currency}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {!isViewMode && (
                  <Button type="button" onClick={addItem} className="mt-2">
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                )}
                
                {/* Total Calculation */}
                {(formData.items || []).length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Total Calculation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Amount:</span> 
                        <span className="ml-2 text-lg font-bold text-blue-600">
                          {(formData.items || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0).toFixed(2)} {formData.currency}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Total Items:</span> 
                        <span className="ml-2 text-lg font-bold text-green-600">
                          {(formData.items || []).length}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Total Quantity:</span> 
                        <span className="ml-2 text-lg font-bold text-purple-600">
                          {(formData.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Broker and CHA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select 
                  name="brokerId" 
                  value={formData.brokerId || ''} 
                  onChange={handleInputChange} 
                  className="p-2 border rounded"
                  disabled={isViewMode}
                >
                  <option value="">Select Broker</option>
                  {brokers.map(b => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.brokerName || b.name}
                    </option>
                  ))}
                </select>
                <select 
                  name="chaId" 
                  value={formData.chaId || ''} 
                  onChange={handleInputChange} 
                  className="p-2 border rounded"
                  disabled={isViewMode}
                >
                  <option value="">Select CHA</option>
                  {chas.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.chaName || c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exporter Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Exporter Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    type="text" 
                    name="exporter.name" 
                    placeholder="Exporter Name" 
                    value={formData.exporter?.name || ''} 
                    onChange={(e) => handleNestedInputChange('exporter', 'name', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exporter.address" 
                    placeholder="Address" 
                    value={formData.exporter?.address || ''} 
                    onChange={(e) => handleNestedInputChange('exporter', 'address', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exporter.city" 
                    placeholder="City" 
                    value={formData.exporter?.city || ''} 
                    onChange={(e) => handleNestedInputChange('exporter', 'city', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exporter.state" 
                    placeholder="State" 
                    value={formData.exporter?.state || ''} 
                    onChange={(e) => handleNestedInputChange('exporter', 'state', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exporter.country" 
                    placeholder="Country" 
                    value={formData.exporter?.country || ''} 
                    onChange={(e) => handleNestedInputChange('exporter', 'country', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exporter.pincode" 
                    placeholder="Pincode" 
                    value={formData.exporter?.pincode || ''} 
                    onChange={(e) => handleNestedInputChange('exporter', 'pincode', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Consignee Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Consignee Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    type="text" 
                    name="consignee.name" 
                    placeholder="Consignee Name" 
                    value={formData.consignee?.name || ''} 
                    onChange={(e) => handleNestedInputChange('consignee', 'name', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="consignee.address" 
                    placeholder="Address" 
                    value={formData.consignee?.address || ''} 
                    onChange={(e) => handleNestedInputChange('consignee', 'address', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="consignee.city" 
                    placeholder="City" 
                    value={formData.consignee?.city || ''} 
                    onChange={(e) => handleNestedInputChange('consignee', 'city', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="consignee.country" 
                    placeholder="Country" 
                    value={formData.consignee?.country || ''} 
                    onChange={(e) => handleNestedInputChange('consignee', 'country', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="consignee.trn" 
                    placeholder="TRN Number" 
                    value={formData.consignee?.trn || ''} 
                    onChange={(e) => handleNestedInputChange('consignee', 'trn', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="consignee.contact" 
                    placeholder="Contact Number" 
                    value={formData.consignee?.contact || ''} 
                    onChange={(e) => handleNestedInputChange('consignee', 'contact', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Buyer Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Buyer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input 
                    type="text" 
                    name="buyer.name" 
                    placeholder="Buyer Name" 
                    value={formData.buyer?.name || ''} 
                    onChange={(e) => handleNestedInputChange('buyer', 'name', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="buyer.address" 
                    placeholder="Address" 
                    value={formData.buyer?.address || ''} 
                    onChange={(e) => handleNestedInputChange('buyer', 'address', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="buyer.country" 
                    placeholder="Country" 
                    value={formData.buyer?.country || ''} 
                    onChange={(e) => handleNestedInputChange('buyer', 'country', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Export Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Export Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    type="text" 
                    name="exportDetails.countryOfOrigin" 
                    placeholder="Country of Origin" 
                    value={formData.exportDetails?.countryOfOrigin || ''} 
                    onChange={(e) => handleNestedInputChange('exportDetails', 'countryOfOrigin', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exportDetails.countryOfDestination" 
                    placeholder="Country of Destination" 
                    value={formData.exportDetails?.countryOfDestination || ''} 
                    onChange={(e) => handleNestedInputChange('exportDetails', 'countryOfDestination', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exportDetails.termsOfDelivery" 
                    placeholder="Terms of Delivery" 
                    value={formData.exportDetails?.termsOfDelivery || ''} 
                    onChange={(e) => handleNestedInputChange('exportDetails', 'termsOfDelivery', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exportDetails.termsOfPayment" 
                    placeholder="Terms of Payment" 
                    value={formData.exportDetails?.termsOfPayment || ''} 
                    onChange={(e) => handleNestedInputChange('exportDetails', 'termsOfPayment', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exportDetails.carriageBy" 
                    placeholder="Carriage By" 
                    value={formData.exportDetails?.carriageBy || ''} 
                    onChange={(e) => handleNestedInputChange('exportDetails', 'carriageBy', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exportDetails.portOfLoading" 
                    placeholder="Port of Loading" 
                    value={formData.exportDetails?.portOfLoading || ''} 
                    onChange={(e) => handleNestedInputChange('exportDetails', 'portOfLoading', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exportDetails.portOfDischarge" 
                    placeholder="Port of Discharge" 
                    value={formData.exportDetails?.portOfDischarge || ''} 
                    onChange={(e) => handleNestedInputChange('exportDetails', 'portOfDischarge', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="exportDetails.finalDestination" 
                    placeholder="Final Destination" 
                    value={formData.exportDetails?.finalDestination || ''} 
                    onChange={(e) => handleNestedInputChange('exportDetails', 'finalDestination', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    type="text" 
                    name="bankDetails.bankName" 
                    placeholder="Bank Name" 
                    value={formData.bankDetails?.bankName || ''} 
                    onChange={(e) => handleNestedInputChange('bankDetails', 'bankName', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="bankDetails.branch" 
                    placeholder="Branch" 
                    value={formData.bankDetails?.branch || ''} 
                    onChange={(e) => handleNestedInputChange('bankDetails', 'branch', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="bankDetails.accountNumber" 
                    placeholder="Account Number" 
                    value={formData.bankDetails?.accountNumber || ''} 
                    onChange={(e) => handleNestedInputChange('bankDetails', 'accountNumber', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="bankDetails.adCode" 
                    placeholder="AD Code" 
                    value={formData.bankDetails?.adCode || ''} 
                    onChange={(e) => handleNestedInputChange('bankDetails', 'adCode', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="text" 
                    name="bankDetails.ifscCode" 
                    placeholder="IFSC Code" 
                    value={formData.bankDetails?.ifscCode || ''} 
                    onChange={(e) => handleNestedInputChange('bankDetails', 'ifscCode', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Shipping Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Shipping Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input 
                    type="number" 
                    name="shippingDetails.totalCartons" 
                    placeholder="Total Cartons" 
                    value={formData.shippingDetails?.totalCartons || ''} 
                    onChange={(e) => handleNestedInputChange('shippingDetails', 'totalCartons', parseInt(e.target.value) || 0)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="number" 
                    name="shippingDetails.netWeight" 
                    placeholder="Net Weight" 
                    value={formData.shippingDetails?.netWeight || ''} 
                    onChange={(e) => handleNestedInputChange('shippingDetails', 'netWeight', parseFloat(e.target.value) || 0)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="number" 
                    name="shippingDetails.grossWeight" 
                    placeholder="Gross Weight" 
                    value={formData.shippingDetails?.grossWeight || ''} 
                    onChange={(e) => handleNestedInputChange('shippingDetails', 'grossWeight', parseFloat(e.target.value) || 0)}
                    disabled={isViewMode}
                  />
                  <select 
                    name="shippingDetails.weightUnit" 
                    value={formData.shippingDetails?.weightUnit || ''} 
                    onChange={(e) => handleNestedInputChange('shippingDetails', 'weightUnit', e.target.value)} 
                    className="p-2 border rounded"
                    disabled={isViewMode}
                  >
                    <option value="KGS">KGS</option>
                    <option value="LBS">LBS</option>
                    <option value="TONS">TONS</option>
                  </select>
                  <Input 
                    type="text" 
                    name="shippingDetails.marks" 
                    placeholder="Marks & Numbers" 
                    value={formData.shippingDetails?.marks || ''} 
                    onChange={(e) => handleNestedInputChange('shippingDetails', 'marks', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Shipping Bill */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Shipping Bill</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    type="text" 
                    name="shippingBill.number" 
                    placeholder="Shipping Bill Number" 
                    value={formData.shippingBill?.number || ''} 
                    onChange={(e) => handleNestedInputChange('shippingBill', 'number', e.target.value)}
                    disabled={isViewMode}
                  />
                  <Input 
                    type="date" 
                    name="shippingBill.date" 
                    placeholder="Shipping Bill Date" 
                    value={formData.shippingBill?.date || ''} 
                    onChange={(e) => handleNestedInputChange('shippingBill', 'date', e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Export Schemes */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Export Schemes</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={formData.exportSchemes?.drawback || false} 
                      onChange={(e) => handleNestedInputChange('exportSchemes', 'drawback', e.target.checked)}
                      disabled={isViewMode}
                      className="rounded"
                    />
                    <span className="text-sm">Drawback</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={formData.exportSchemes?.rodtep || false} 
                      onChange={(e) => handleNestedInputChange('exportSchemes', 'rodtep', e.target.checked)}
                      disabled={isViewMode}
                      className="rounded"
                    />
                    <span className="text-sm">RODTEP</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={formData.exportSchemes?.rosctl || false} 
                      onChange={(e) => handleNestedInputChange('exportSchemes', 'rosctl', e.target.checked)}
                      disabled={isViewMode}
                      className="rounded"
                    />
                    <span className="text-sm">ROSCTL</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={formData.exportSchemes?.dfia || false} 
                      onChange={(e) => handleNestedInputChange('exportSchemes', 'dfia', e.target.checked)}
                      disabled={isViewMode}
                      className="rounded"
                    />
                    <span className="text-sm">DFIA</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={formData.exportSchemes?.epcg || false} 
                      onChange={(e) => handleNestedInputChange('exportSchemes', 'epcg', e.target.checked)}
                      disabled={isViewMode}
                      className="rounded"
                    />
                    <span className="text-sm">EPCG</span>
                  </label>
                </div>
              </div>

              {/* EPCG Authorizations */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">EPCG Authorizations</h3>
                {(formData.epcgAuthorizations || []).map((auth, index) => (
                  <div key={index} className="border rounded mb-4 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        type="number" 
                        name="srNo" 
                        placeholder="Sr. No." 
                        value={auth.srNo || ''} 
                        onChange={(e) => {
                          const newAuths = [...(formData.epcgAuthorizations || [])];
                          (newAuths[index] as any).srNo = parseInt(e.target.value) || 1;
                          setFormData(prev => ({ ...prev, epcgAuthorizations: newAuths }));
                        }}
                        disabled={isViewMode}
                      />
                      <Input 
                        type="text" 
                        name="authorizationNo" 
                        placeholder="Authorization Number" 
                        value={auth.authorizationNo || ''} 
                        onChange={(e) => {
                          const newAuths = [...(formData.epcgAuthorizations || [])];
                          (newAuths[index] as any).authorizationNo = e.target.value;
                          setFormData(prev => ({ ...prev, epcgAuthorizations: newAuths }));
                        }}
                        disabled={isViewMode}
                      />
                      <Input 
                        type="date" 
                        name="date" 
                        placeholder="Date" 
                        value={auth.date || ''} 
                        onChange={(e) => {
                          const newAuths = [...(formData.epcgAuthorizations || [])];
                          (newAuths[index] as any).date = e.target.value;
                          setFormData(prev => ({ ...prev, epcgAuthorizations: newAuths }));
                        }}
                        disabled={isViewMode}
                      />
                      <Input 
                        type="text" 
                        name="manufacturer" 
                        placeholder="Manufacturer" 
                        value={auth.manufacturer || ''} 
                        onChange={(e) => {
                          const newAuths = [...(formData.epcgAuthorizations || [])];
                          (newAuths[index] as any).manufacturer = e.target.value;
                          setFormData(prev => ({ ...prev, epcgAuthorizations: newAuths }));
                        }}
                        disabled={isViewMode}
                      />
                      <Input 
                        type="text" 
                        name="address" 
                        placeholder="Address" 
                        value={auth.address || ''} 
                        onChange={(e) => {
                          const newAuths = [...(formData.epcgAuthorizations || [])];
                          (newAuths[index] as any).address = e.target.value;
                          setFormData(prev => ({ ...prev, epcgAuthorizations: newAuths }));
                        }}
                        disabled={isViewMode}
                        className="md:col-span-2"
                      />
                    </div>
                  </div>
                ))}
                {!isViewMode && (
                  <Button 
                    type="button" 
                    onClick={() => {
                      const newAuths = [...(formData.epcgAuthorizations || []), {
                        srNo: (formData.epcgAuthorizations?.length || 0) + 1,
                        authorizationNo: '',
                        date: '',
                        manufacturer: '',
                        address: ''
                      }];
                      setFormData(prev => ({ ...prev, epcgAuthorizations: newAuths }));
                    }}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add EPCG Authorization
                  </Button>
                )}
              </div>

              {/* Purchase Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Purchase Details</h3>
                {(formData.purchaseDetails || []).map((detail, index) => (
                  <div key={index} className="border rounded mb-4 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        type="number" 
                        name="srNo" 
                        placeholder="Sr. No." 
                        value={detail.srNo || ''} 
                        onChange={(e) => {
                          const newDetails = [...(formData.purchaseDetails || [])];
                          (newDetails[index] as any).srNo = parseInt(e.target.value) || 1;
                          setFormData(prev => ({ ...prev, purchaseDetails: newDetails }));
                        }}
                        disabled={isViewMode}
                      />
                      <Input 
                        type="text" 
                        name="supplier" 
                        placeholder="Supplier" 
                        value={detail.supplier || ''} 
                        onChange={(e) => {
                          const newDetails = [...(formData.purchaseDetails || [])];
                          (newDetails[index] as any).supplier = e.target.value;
                          setFormData(prev => ({ ...prev, purchaseDetails: newDetails }));
                        }}
                        disabled={isViewMode}
                      />
                      <Input 
                        type="text" 
                        name="epcgLicNo" 
                        placeholder="EPCG License Number" 
                        value={detail.epcgLicNo || ''} 
                        onChange={(e) => {
                          const newDetails = [...(formData.purchaseDetails || [])];
                          (newDetails[index] as any).epcgLicNo = e.target.value;
                          setFormData(prev => ({ ...prev, purchaseDetails: newDetails }));
                        }}
                        disabled={isViewMode}
                      />
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bill Numbers</label>
                        {(detail.billNumbers || []).map((billNo, billIndex) => (
                          <div key={billIndex} className="flex gap-2 mb-2">
                            <Input 
                              type="text" 
                              placeholder="Bill Number" 
                              value={billNo || ''} 
                              onChange={(e) => {
                                const newDetails = [...(formData.purchaseDetails || [])];
                                const newBillNumbers = [...(newDetails[index].billNumbers || [])];
                                newBillNumbers[billIndex] = e.target.value;
                                (newDetails[index] as any).billNumbers = newBillNumbers;
                                setFormData(prev => ({ ...prev, purchaseDetails: newDetails }));
                              }}
                              disabled={isViewMode}
                            />
                            <Input 
                              type="date" 
                              placeholder="Bill Date" 
                              value={(detail.billDates || [])[billIndex] || ''} 
                              onChange={(e) => {
                                const newDetails = [...(formData.purchaseDetails || [])];
                                const newBillDates = [...(newDetails[index].billDates || [])];
                                newBillDates[billIndex] = e.target.value;
                                (newDetails[index] as any).billDates = newBillDates;
                                setFormData(prev => ({ ...prev, purchaseDetails: newDetails }));
                              }}
                              disabled={isViewMode}
                            />
                            {!isViewMode && (
                              <Button 
                                type="button" 
                                variant="danger" 
                                size="sm"
                                onClick={() => {
                                  const newDetails = [...(formData.purchaseDetails || [])];
                                  const newBillNumbers = [...(newDetails[index].billNumbers || [])];
                                  const newBillDates = [...(newDetails[index].billDates || [])];
                                  newBillNumbers.splice(billIndex, 1);
                                  newBillDates.splice(billIndex, 1);
                                  (newDetails[index] as any).billNumbers = newBillNumbers;
                                  (newDetails[index] as any).billDates = newBillDates;
                                  setFormData(prev => ({ ...prev, purchaseDetails: newDetails }));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {!isViewMode && (
                          <Button 
                            type="button" 
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const newDetails = [...(formData.purchaseDetails || [])];
                              const newBillNumbers = [...(newDetails[index].billNumbers || []), ''];
                              const newBillDates = [...(newDetails[index].billDates || []), ''];
                              (newDetails[index] as any).billNumbers = newBillNumbers;
                              (newDetails[index] as any).billDates = newBillDates;
                              setFormData(prev => ({ ...prev, purchaseDetails: newDetails }));
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add Bill
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!isViewMode && (
                  <Button 
                    type="button" 
                    onClick={() => {
                      const newDetails = [...(formData.purchaseDetails || []), {
                        srNo: (formData.purchaseDetails?.length || 0) + 1,
                        supplier: '',
                        epcgLicNo: '',
                        billNumbers: [''],
                        billDates: ['']
                      }];
                      setFormData(prev => ({ ...prev, purchaseDetails: newDetails }));
                    }}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Purchase Detail
                  </Button>
                )}
              </div>

              <Input 
                type="text" 
                name="remarks" 
                placeholder="Remarks" 
                value={formData.remarks || ''} 
                onChange={handleInputChange}
                disabled={isViewMode}
              />

              {/* Form Actions */}
              {!isViewMode && (
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => { setShowForm(false); resetForm(); }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : selectedTransaction ? 'Update Transaction' : 'Save Transaction'}
                  </Button>
                </div>
              )}
            </form>
          </div>
                 </div>
       )}

       {/* Detailed View Modal */}
       {selectedTransaction && isViewMode && (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
           <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
             <div className="p-6 border-b border-gray-200">
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold">Transaction Details - {selectedTransaction.invoiceNumber}</h2>
                 <div className="flex space-x-2">
                   <Button
                     variant="primary"
                     size="sm"
                     onClick={() => generateInvoicePDF(selectedTransaction)}
                   >
                     <Printer className="mr-2 h-4 w-4" /> Generate PDF
                   </Button>
                   <button
                     onClick={() => { setShowForm(false); resetForm(); }}
                     className="text-gray-400 hover:text-gray-600"
                   >
                     ×
                   </button>
                 </div>
               </div>
             </div>

             <div className="p-6 space-y-6">
               {/* Basic Information */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                 <div>
                   <h3 className="font-semibold text-gray-800">Invoice Details</h3>
                   <p>Number: {selectedTransaction.invoiceNumber || 'N/A'}</p>
                   <p>Date: {new Date(selectedTransaction.invoiceDate).toLocaleDateString()}</p>
                   <p>Transaction: {selectedTransaction.transactionNumber || 'N/A'}</p>
                   <p>Status: <span className={`px-2 py-1 rounded-full text-xs ${
                     selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                     selectedTransaction.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                     'bg-red-100 text-red-800'
                   }`}>{selectedTransaction.status}</span></p>
                 </div>
                                    <div>
                     <h3 className="font-semibold text-gray-800">Parties</h3>
                     <p>Company: {selectedTransaction.company?.companyName || 'N/A'}</p>
                     <p>Debit Party: {selectedTransaction.debitParty?.partyName || 'N/A'}</p>
                     <p>Credit Party: {selectedTransaction.creditParty?.partyName || 'N/A'}</p>
                   </div>
                 <div>
                   <h3 className="font-semibold text-gray-800">Financial</h3>
                   <p>Currency: {selectedTransaction.currency}</p>
                   <p>Exchange Rate: {selectedTransaction.exchangeRate}</p>
                   <p>Total Amount: <span className="font-bold text-blue-600">{selectedTransaction.totalAmount?.toLocaleString()} {selectedTransaction.currency}</span></p>
                 </div>
               </div>

               {/* Exporter Details */}
               <div className="border rounded-lg p-4">
                 <h3 className="font-semibold text-gray-800 mb-3">Exporter Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div><strong>Name:</strong> {selectedTransaction.exporter?.name || 'N/A'}</div>
                   <div><strong>Address:</strong> {selectedTransaction.exporter?.address || 'N/A'}</div>
                   <div><strong>City:</strong> {selectedTransaction.exporter?.city || 'N/A'}</div>
                   <div><strong>State:</strong> {selectedTransaction.exporter?.state || 'N/A'}</div>
                   <div><strong>Country:</strong> {selectedTransaction.exporter?.country || 'N/A'}</div>
                   <div><strong>Pincode:</strong> {selectedTransaction.exporter?.pincode || 'N/A'}</div>
                 </div>
               </div>

               {/* Consignee Details */}
               <div className="border rounded-lg p-4">
                 <h3 className="font-semibold text-gray-800 mb-3">Consignee Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div><strong>Name:</strong> {selectedTransaction.consignee?.name || 'N/A'}</div>
                   <div><strong>Address:</strong> {selectedTransaction.consignee?.address || 'N/A'}</div>
                   <div><strong>City:</strong> {selectedTransaction.consignee?.city || 'N/A'}</div>
                   <div><strong>Country:</strong> {selectedTransaction.consignee?.country || 'N/A'}</div>
                   <div><strong>TRN:</strong> {selectedTransaction.consignee?.trn || 'N/A'}</div>
                   <div><strong>Contact:</strong> {selectedTransaction.consignee?.contact || 'N/A'}</div>
                 </div>
               </div>

               {/* Items */}
               <div className="border rounded-lg p-4">
                 <h3 className="font-semibold text-gray-800 mb-3">Items</h3>
                 <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                       <tr>
                         <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sr. No.</th>
                         <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                         <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">HSN Code</th>
                         <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                         <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                         <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                         <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                       </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                       {selectedTransaction.items?.map((item, index) => (
                         <tr key={index}>
                           <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                           <td className="px-3 py-2 text-sm text-gray-900">{item.description || 'N/A'}</td>
                           <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.hsnCode || 'N/A'}</td>
                           <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity || 0}</td>
                           <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.unit || 'N/A'}</td>
                           <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.rate?.toLocaleString()} {selectedTransaction.currency}</td>
                           <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.amount?.toLocaleString()} {selectedTransaction.currency}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>

                               {/* Broker and CHA */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Broker & CHA Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong>Broker:</strong> {selectedTransaction.broker?.brokerName || 'N/A'}
                    </div>
                    <div>
                      <strong>CHA:</strong> {selectedTransaction.cha?.chaName || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Financial Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><strong>Total Amount:</strong> <span className="font-bold text-blue-600">{selectedTransaction.totalAmount?.toLocaleString()} {selectedTransaction.currency}</span></div>
                    <div><strong>Taxable Value (INR):</strong> ₹{selectedTransaction.totalTaxableValue?.toLocaleString() || 0}</div>
                    <div><strong>IGST Amount:</strong> ₹{selectedTransaction.totalIgstAmount?.toLocaleString() || 0}</div>
                    <div><strong>Amount in Words:</strong> {selectedTransaction.amountInWords || 'N/A'}</div>
                  </div>
                </div>

               {/* Remarks */}
               {selectedTransaction.remarks && (
                 <div className="border rounded-lg p-4">
                   <h3 className="font-semibold text-gray-800 mb-3">Remarks</h3>
                   <p className="text-gray-700">{selectedTransaction.remarks}</p>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };
