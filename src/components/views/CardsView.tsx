'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  CreditCard as CardIcon,
  Plus,
  CheckCircle2,
  Clock,
  History,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  X,
  ChevronDown,
  Calendar as CalIcon,
  Trash2,
} from 'lucide-react';
import { PaymentMethodType } from '../../types';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';

export const CardsView: React.FC = () => {
  const { cards, cardHistory, addCreditCard, payCreditCardBill, loans, addLoan, deleteLoan } = useFinance();

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [bankName, setBankName] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [dueDate, setDueDate] = useState<number>(15);

  const [payCardId, setPayCardId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethodType>('UPI');

  // EMI Form States
  const [isAddEMIOpen, setIsAddEMIOpen] = useState(false);
  const [emiName, setEmiName] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [emiInterest, setEmiInterest] = useState('');
  const [emiStartDate, setEmiStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [emiTenure, setEmiTenure] = useState('1 Year');
  const [emiCustomMonths, setEmiCustomMonths] = useState('');
  const [emiEndDate, setEmiEndDate] = useState('');
  const [emiCardId, setEmiCardId] = useState('');
  const [emiSubType, setEmiSubType] = useState('No Cost EMI');

  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');

  // Helper to compute payment date timezone-safely
  const getPaymentDate = (startDateStr: string, monthIndex: number): string => {
    const [y, m, d] = startDateStr.split('-').map(Number);
    const startMonth = m - 1;
    const targetMonthTotal = startMonth + monthIndex;
    const targetYear = y + Math.floor(targetMonthTotal / 12);
    const targetMonth = targetMonthTotal % 12;
    const maxDaysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const targetDay = Math.min(d, maxDaysInTargetMonth);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${targetYear}-${pad(targetMonth + 1)}-${pad(targetDay)}`;
  };

  // Helper to calculate paid months
  const calculatePaidMonths = (startDateStr: string, tenureMonths: number): number => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let paid = 0;
    for (let i = 0; i < tenureMonths; i++) {
      const payDate = getPaymentDate(startDateStr, i);
      if (payDate <= todayStr) {
        paid++;
      }
    }
    return Math.min(paid, tenureMonths);
  };

  useEffect(() => {
    if (isAddEMIOpen && cards.length > 0 && !emiCardId) {
      setEmiCardId(cards[0].id);
    }
  }, [isAddEMIOpen, cards, emiCardId]);

  // Auto calculate EMI end date
  useEffect(() => {
    if (!emiStartDate) return;

    let months = 12;
    if (emiTenure === '3 Month') months = 3;
    else if (emiTenure === '6 Month') months = 6;
    else if (emiTenure === '1 Year') months = 12;
    else if (emiTenure === '2 Year') months = 24;
    else if (emiTenure === '3 Year') months = 36;
    else if (emiTenure === '4 Year') months = 48;
    else if (emiTenure === '5 Year') months = 60;
    else if (emiTenure === 'Custom') {
      months = parseInt(emiCustomMonths) || 0;
    }

    if (months <= 0) {
      setEmiEndDate('');
      return;
    }

    const [y, m, d] = emiStartDate.split('-').map(Number);
    const startMonth = m - 1;
    const targetMonthTotal = startMonth + months;
    const targetYear = y + Math.floor(targetMonthTotal / 12);
    const targetMonth = targetMonthTotal % 12;
    const maxDaysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const targetDay = Math.min(d, maxDaysInTargetMonth);
    const pad = (n: number) => String(n).padStart(2, '0');
    setEmiEndDate(`${targetYear}-${pad(targetMonth + 1)}-${pad(targetDay)}`);
  }, [emiStartDate, emiTenure, emiCustomMonths]);

  const handleAddEMI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emiName || !emiAmount || !emiStartDate || !emiEndDate || !emiCardId) {
      alert('Please fill in all required fields and select a credit card.');
      return;
    }

    let tenure = 12;
    if (emiTenure === '3 Month') tenure = 3;
    else if (emiTenure === '6 Month') tenure = 6;
    else if (emiTenure === '1 Year') tenure = 12;
    else if (emiTenure === '2 Year') tenure = 24;
    else if (emiTenure === '3 Year') tenure = 36;
    else if (emiTenure === '4 Year') tenure = 48;
    else if (emiTenure === '5 Year') tenure = 60;
    else if (emiTenure === 'Custom') {
      tenure = parseInt(emiCustomMonths) || 12;
    }

    try {
      await addLoan({
        type: 'EMI',
        name: emiName,
        amount: Number(emiAmount),
        interestRate: emiInterest ? Number(emiInterest) : undefined,
        tenureMonths: tenure,
        startDate: emiStartDate,
        endDate: emiEndDate,
        cardId: emiCardId,
        subType: emiSubType,
      });

      setEmiName('');
      setEmiAmount('');
      setEmiInterest('');
      setEmiStartDate(new Date().toISOString().split('T')[0]);
      setEmiTenure('1 Year');
      setEmiCustomMonths('');
      setEmiEndDate('');
      setEmiCardId('');
      setEmiSubType('No Cost EMI');
      setIsAddEMIOpen(false);
    } catch (err) {
      console.error('Error adding card EMI:', err);
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const limitVal = parseFloat(creditLimit);
    if (!cardName || !bankName || isNaN(limitVal) || limitVal <= 0) return;

    addCreditCard({
      cardName,
      bankName,
      creditLimit: limitVal,
      dueDate,
    });

    setCardName('');
    setBankName('');
    setCreditLimit('');
    setDueDate(15);
    setIsAddCardOpen(false);
  };

  const handlePayBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(payAmount);
    if (!payCardId || isNaN(amountVal) || amountVal <= 0) return;

    payCreditCardBill(payCardId, amountVal, payMethod);

    setPayCardId(null);
    setPayAmount('');
  };

  const getStatusBadge = (status: string, due: number) => {
    if (due === 0) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>Paid</span>
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-650 bg-amber-50 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3 text-amber-500" />
          <span>Pending</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-650 bg-blue-50 px-2 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3 text-blue-500" />
        <span>Upcoming</span>
      </span>
    );
  };

  // Predefined gorgeous background gradients for credit cards based on bank or index
  const getCardGradient = (index: number) => {
    const gradients = [
      'from-slate-900 via-slate-800 to-slate-950 text-white', // Dark Slate (Millennial)
      'from-blue-700 via-blue-600 to-indigo-800 text-white', // Blue Indigo
      'from-emerald-800 via-teal-700 to-emerald-950 text-white', // Teal Green
      'from-purple-800 via-purple-700 to-indigo-900 text-white', // Deep Purple
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Saved Credit Cards ({cards.length})
          </h2>
          <p className="text-xs text-slate-400">Track billing limit usage & due dates</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddCardOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Credit Card</span>
          </button>
          {cards.length > 0 && (
            <button
              onClick={() => {
                setEmiCardId(cards[0].id);
                setIsAddEMIOpen(true);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card EMI</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {cards.map((card, index) => {
          const limitUsedPct = Math.min(100, Math.round((card.currentDue / (card.creditLimit || 1)) * 100));
          const cardMonthlyEMIs = loans
            ? loans
                .filter((l) => l.type === 'EMI' && l.cardId === card.id && calculatePaidMonths(l.startDate, l.tenureMonths) < l.tenureMonths)
                .reduce((sum, l) => sum + l.amount, 0)
            : 0;

          return (
            <div
              key={card.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              {/* Virtual Card Graphic */}
              <div className={`p-5 rounded-2xl bg-gradient-to-br ${getCardGradient(index)} shadow-md relative overflow-hidden h-40 flex flex-col justify-between`}>
                <div className="absolute right-[-10%] bottom-[-10%] w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
                
                {/* Chip and Bank name */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-75">
                      {card.bankName}
                    </span>
                    <span className="text-xs font-semibold mt-0.5">{card.cardName}</span>
                  </div>
                  
                  {/* Card Logo / Chip shape */}
                  <div className="w-8 h-6 bg-amber-400/80 rounded-md border border-amber-300/40 opacity-90" />
                </div>

                {/* Card Number Simulation */}
                <div className="text-md font-mono tracking-widest opacity-80 py-2">
                  ••••  ••••  ••••  {1204 + index}
                </div>

                {/* Current Due and Limit details */}
                <div className="flex justify-between items-end border-t border-white/10 pt-2 text-[10px]">
                  <div>
                    <span className="opacity-75 block">CURRENT DUE</span>
                    <span className="text-xs font-extrabold">₹{card.currentDue.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="text-right">
                    <span className="opacity-75 block">DUE DATE</span>
                    <span className="text-xs font-extrabold">Day {card.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Status and Limits Progress */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-650">
                  <span className="flex items-center gap-1">Card Status</span>
                  {getStatusBadge(card.status, card.currentDue)}
                </div>

                {/* Show Monthly EMIs if any */}
                {cardMonthlyEMIs > 0 && (
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-650">
                    <span>Monthly EMIs</span>
                    <span className="font-bold text-slate-800">₹{cardMonthlyEMIs.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Credit limit Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>LIMIT USED ({limitUsedPct}%)</span>
                    <span>₹{card.creditLimit.toLocaleString('en-IN')} Limit</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        limitUsedPct > 80 ? 'bg-red-500' : limitUsedPct > 50 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${limitUsedPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {card.currentDue > 0 ? (
                <button
                  onClick={() => {
                    setPayCardId(card.id);
                    setPayAmount(String(card.currentDue));
                  }}
                  className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-blue-550 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all"
                >
                  Pay Card Bill
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 bg-slate-50 border border-transparent rounded-full text-xs font-bold text-slate-350 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Dues Cleared</span>
                </button>
              )}

            </div>
          );
        })}

        {cards.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 text-xs">
            No credit cards saved yet. Click "Add Credit Card" to save card.
          </div>
        )}
      </div>

      {/* Active Card EMIs Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Active Card EMIs</h3>
            <p className="text-[10px] text-slate-400 font-medium">Automatic monthly EMI deductions linked to credit cards</p>
          </div>
          {cards.length > 0 && (
            <button
              onClick={() => {
                if (cards.length > 0) {
                  setEmiCardId(cards[0].id);
                }
                setIsAddEMIOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[10px] font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add EMI
            </button>
          )}
        </div>

        {(!loans || loans.filter(l => l.type === 'EMI').length === 0) ? (
          <div className="text-center text-slate-450 text-xs py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            No active EMIs added yet. {cards.length === 0 ? "Add a credit card first to link an EMI." : "Click 'Add EMI' to register one."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loans.filter(l => l.type === 'EMI').map((loan) => {
              const card = cards.find((c) => c.id === loan.cardId);
              
              const paidMonths = calculatePaidMonths(loan.startDate, loan.tenureMonths);
              const progressPercent = Math.min(100, Math.round((paidMonths / loan.tenureMonths) * 100));
              const remainingMonths = loan.tenureMonths - paidMonths;
              const remainingAmount = loan.amount * remainingMonths;

              return (
                <div
                  key={loan.id}
                  className="bg-slate-50/40 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {loan.subType || 'EMI'}
                        </span>
                        {card && (
                          <span className="text-[10px] text-slate-455 font-bold flex items-center gap-1">
                            💳 {card.bankName} {card.cardName}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{loan.name}</h4>
                    </div>

                    <button
                      onClick={() => {
                        setDeleteId(loan.id);
                        setDeleteName(loan.name);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete EMI"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide block">
                        Monthly EMI
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        ₹{loan.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide block">
                        Interest Rate
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {loan.interestRate ? `${loan.interestRate}%` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-slate-450">
                      <span>{paidMonths} / {loan.tenureMonths} Months Paid</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] pt-1 border-t border-slate-100 text-slate-450 font-medium">
                    <span>Ends: {loan.endDate}</span>
                    <span className="font-bold text-slate-700">Remaining: ₹{remainingAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Payment History Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-500" />
          <span>Card Payment History</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wide">
                <th className="p-3 pl-4">Card / Bank</th>
                <th className="p-3">Method</th>
                <th className="p-3">Payment Date</th>
                <th className="p-3 text-right pr-4">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-750">
              {cardHistory.map((hist) => {
                const card = cards.find((c) => c.id === hist.cardId);
                return (
                  <tr key={hist.id}>
                    <td className="p-3 pl-4">
                      <h4 className="font-bold text-slate-800">
                        {card ? `${card.bankName} ${card.cardName}` : 'Credit Card'}
                      </h4>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold text-blue-650 bg-blue-50 px-2 py-0.5 rounded-lg">
                        {hist.notes?.replace('Bill payment via ', '') || 'UPI'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-450">{hist.date}</td>
                    <td className="p-3 text-right pr-4 font-extrabold text-emerald-650">
                      ₹{hist.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}

              {cardHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-slate-400 py-8">
                    No credit card payment logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- MODAL: Add Credit Card ----------------- */}
      {isAddCardOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 animate-slide-up relative">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-md font-bold text-slate-800">Add Credit Card</h3>
              <button
                onClick={() => setIsAddCardOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank, ICICI"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Card Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Millennia, Regalia"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Billing Due Date
                  </label>
                  <select
                    value={dueDate}
                    onChange={(e) => setDueDate(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Day {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all mt-4"
              >
                Save Credit Card
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Pay Bill Input ----------------- */}
      {payCardId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 animate-slide-up relative">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-md font-bold text-slate-800">Clear Card Due</h3>
              <button
                onClick={() => setPayCardId(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handlePayBill} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Payment Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethodType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="UPI">UPI (GPAY/PhonePe)</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-[10px] text-emerald-800">
                💡 Paying bill triggers an automatic <strong>Bills</strong> category transaction, keeping your dashboard budget calculation in sync.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all mt-4"
              >
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: Add Card EMI ---------------- */}
      {isAddEMIOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-up relative">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-slate-100 bg-white">
              <h3 className="text-2xl font-bold text-slate-900">Add Card EMI</h3>
              <button
                onClick={() => setIsAddEMIOpen(false)}
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all focus:outline-none"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddEMI} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              
              {/* Scrollable Fields */}
              <div className="flex-grow overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
                
                {/* EMI Name & Subtype side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      EMI Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MacBook EMI"
                      value={emiName}
                      onChange={(e) => setEmiName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      EMI Type / Subtype
                    </label>
                    <div className="relative">
                      <select
                        value={emiSubType}
                        onChange={(e) => setEmiSubType(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                      >
                        <option value="No Cost EMI">🏷️ No Cost EMI</option>
                        <option value="Regular EMI">📈 Regular EMI</option>
                        <option value="Other">💵 Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                        <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Select Credit Card */}
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Link to Credit Card
                  </label>
                  <div className="relative">
                    <select
                      value={emiCardId}
                      required
                      onChange={(e) => setEmiCardId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                    >
                      {cards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.bankName} {c.cardName} (Limit: ₹{c.creditLimit.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                      <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  </div>
                </div>

                {/* Amount & Interest side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      Monthly EMI (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 5000"
                      value={emiAmount}
                      onChange={(e) => setEmiAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-bold text-base focus:outline-none focus:ring-0 border-0 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      Interest Rate (% p.a. optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 14.5"
                      value={emiInterest}
                      onChange={(e) => setEmiInterest(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-800" />
                    <input
                      type="date"
                      required
                      value={emiStartDate}
                      onChange={(e) => setEmiStartDate(e.target.value)}
                      className="w-full min-w-0 pl-12 pr-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                    />
                  </div>
                </div>

                {/* Tenure Selection & End Date Calculation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      Tenure / Duration
                    </label>
                    <div className="relative">
                      <select
                        value={emiTenure}
                        onChange={(e) => setEmiTenure(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                      >
                        <option value="3 Month">3 Months</option>
                        <option value="6 Month">6 Months</option>
                        <option value="1 Year">1 Year</option>
                        <option value="2 Year">2 Years</option>
                        <option value="3 Year">3 Years</option>
                        <option value="4 Year">4 Years</option>
                        <option value="5 Year">5 Years</option>
                        <option value="Custom">Custom</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                        <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                      </div>
                    </div>
                  </div>

                  {emiTenure === 'Custom' ? (
                    <div>
                      <label className="block text-sm font-semibold text-slate-550 mb-2">
                        Custom Tenure (Months)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 18"
                        value={emiCustomMonths}
                        onChange={(e) => setEmiCustomMonths(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0 placeholder-slate-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-slate-550 mb-2">
                        Calculated End Date
                      </label>
                      <input
                        type="date"
                        disabled
                        readOnly
                        value={emiEndDate}
                        className="w-full px-4 py-3 bg-[#e5e7eb] rounded-2xl text-slate-500 font-semibold text-base border-0 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>

                {emiTenure === 'Custom' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-550 mb-2">
                      Calculated End Date
                    </label>
                    <input
                      type="date"
                      disabled
                      readOnly
                      value={emiEndDate}
                      className="w-full px-4 py-3 bg-[#e5e7eb] rounded-2xl text-slate-500 font-semibold text-base border-0 cursor-not-allowed"
                    />
                  </div>
                )}

                <div className="bg-blue-550/10 border border-blue-100 rounded-2xl p-3 text-xs text-blue-800">
                  💡 This EMI will automatically generate monthly payments on your expenses timeline from {emiStartDate} until {emiEndDate || 'completion'}.
                </div>

              </div>

              {/* Fixed Footer Buttons */}
              <div className="border-t border-slate-100 bg-white px-6 sm:px-8 py-4 flex justify-between gap-4 z-10">
                <button
                  type="button"
                  onClick={() => setIsAddEMIOpen(false)}
                  className="flex-1 py-3.5 border border-blue-600 hover:bg-blue-50 text-blue-600 rounded-full text-base font-semibold transition-all focus:outline-none text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-base font-semibold transition-all focus:outline-none text-center shadow-sm"
                >
                  Save EMI
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteId(null);
          setDeleteName('');
        }}
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deleteLoan(deleteId);
          } catch (err) {
            console.error('Error deleting EMI:', err);
          } finally {
            setDeleteConfirmOpen(false);
            setDeleteId(null);
            setDeleteName('');
          }
        }}
        title={`Delete EMI`}
        message={`Are you sure you want to delete the EMI "${deleteName}"? This will also remove all associated auto-generated monthly expenses.`}
      />

    </div>
  );
};
