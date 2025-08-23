import React, { useState, useEffect } from 'react';
import { Company, Item, PurchaseTransaction, ReceiptTransaction, CreditParty, DebitParty, Broker, CHA } from '../types';
import { Header } from '../components/layout/Header';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { Sidebar } from '../components/layout/Sidebar';
import { CompanyMaster } from '../components/masters/CompanyMaster';
import { ItemMaster } from '../components/masters/ItemMaster';
import { PurchaseMaster } from '../components/transactions/PurchaseMaster';
import { ReceiptMaster } from '../components/transactions/ReceiptMaster';
import { SalesMaster } from '../components/transactions/SalesMaster';
import { CreditPartyMaster } from '../components/masters/CreditPartyMaster';
import { DebitPartyMaster } from '../components/masters/DebitPartyMaster';
import { BrokerMaster } from '../components/masters/BrokerMaster';
import { CHAMaster } from '../components/masters/CHAMaster';

export type ActiveView = 
  | 'overview'
  | 'company'
  | 'item'
  | 'purchase'
  | 'sales'
  | 'receipt'
  | 'credit-party'
  | 'debit-party'
  | 'broker'
  | 'cha';

export const DashboardPage: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mock data for overview
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalItems: 0,
    totalPurchase: 0,
    totalReceipts: 0,
    totalCreditParties: 0,
    totalBrokers: 0,
    totalCHAs: 0,
  });

  useEffect(() => {
    // Mock data - in real app this would come from API
    setStats({
      totalCompanies: 12,
      totalItems: 156,
      totalPurchase: 89,
      totalReceipts: 156,
      totalCreditParties: 45,
      totalBrokers: 8,
      totalCHAs: 3,
    });
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <DashboardOverview stats={stats} />;
      case 'company':
        return <CompanyMaster />;
      case 'item':
        return <ItemMaster />;
      case 'purchase':
        return <PurchaseMaster />;
      case 'sales':
        return <SalesMaster />;

      case 'receipt':
        return <ReceiptMaster />;
      case 'credit-party':
        return <CreditPartyMaster />;
      case 'debit-party':
        return <DebitPartyMaster />;
      case 'broker':
        return <BrokerMaster />;
      case 'cha':
        return <CHAMaster />;
      default:
        return <DashboardOverview stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex pt-16">
        <Sidebar 
          isOpen={isSidebarOpen}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};