'use client';

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  User,
  Building,
  Calendar,
  Wallet,
  Download,
  RotateCcw,
  CreditCard,
  Car,
  CheckCircle,
} from 'lucide-react';
import { PaymentMethodType } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    user,
    cards,
    vehicles,
    transactions,
    vehicleExpenses,
    cardHistory,
    completeOnboarding,
  } = useFinance();

  // Profile forms
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [monthlySalary, setMonthlySalary] = useState(String(user?.monthlySalary || ''));
  const [salaryCreditDate, setSalaryCreditDate] = useState<number>(user?.salaryCreditDate || 1);
  const [mainPaymentMethod, setMainPaymentMethod] = useState<PaymentMethodType>(user?.mainPaymentMethod || 'UPI');

  // General settings
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const salaryVal = parseFloat(monthlySalary) || 0;
    
    // Save to global context
    completeOnboarding(
      {
        fullName,
        companyName,
        monthlySalary: salaryVal,
        salaryCreditDate,
        mainPaymentMethod,
      },
      cards, // keep current cards
      vehicles // keep current vehicles
    );

    triggerSuccess('Profile and budget configurations updated successfully!');
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Export full JSON backups
  const exportAllData = () => {
    const backupState = {
      user,
      cards,
      vehicles,
      transactions,
      vehicleExpenses,
      cardHistory,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Antara_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Success Badge */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Profile and Salary Config */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <span>Profile & Budget Details</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Monthly take-home salary (₹)
              </label>
              <input
                type="number"
                required
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Salary Credit Date
              </label>
              <select
                value={salaryCreditDate}
                onChange={(e) => setSalaryCreditDate(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Main Payment Method
              </label>
              <select
                value={mainPaymentMethod}
                onChange={(e) => setMainPaymentMethod(e.target.value as PaymentMethodType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
              >
                <option value="UPI">UPI (GPAY/PhonePe)</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm"
          >
            Update Configuration
          </button>
        </form>
      </div>



      {/* Backup utilities */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          Backups
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col justify-between items-start space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-500" />
                <span>Export Configuration Data</span>
              </h4>
              <p className="text-[10px] text-slate-450 mt-1">
                Save a local copy of your transactions, cards, and garage configurations.
              </p>
            </div>
            <button
              onClick={exportAllData}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-750 rounded-full transition-all"
            >
              Export JSON File
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
