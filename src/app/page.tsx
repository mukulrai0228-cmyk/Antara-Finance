'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { LoginScreen } from '@/components/LoginScreen';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { DashboardView } from '@/components/views/DashboardView';
import { ExpensesView } from '@/components/views/ExpensesView';
import { CardsView } from '@/components/views/CardsView';
import { VehiclesView } from '@/components/views/VehiclesView';
import { PeopleView } from '@/components/views/PeopleView';
import { ReportsView } from '@/components/views/ReportsView';
import { SettingsView } from '@/components/views/SettingsView';

export default function Home() {
  const { isAuthenticated, user, loading } = useFinance();
  const [activeTab, setActiveTab] = useState('dashboard');

  // 1. Loading state (recovering session or fetching data)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-50 animate-pulse"></div>
            <div className="w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Spendly</p>
          <p className="text-xs text-slate-500 font-medium font-sans">Syncing with database...</p>
        </div>
      </div>
    );
  }

  // 2. Authenticated check
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // 2. Onboarding check
  if (!user?.hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  // 3. Render Dashboard Tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'expenses':
        return <ExpensesView />;
      case 'cards':
        return <CardsView />;
      case 'vehicles':
        return <VehiclesView />;
      case 'people':
        return <PeopleView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <LayoutWrapper activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </LayoutWrapper>
  );
}
