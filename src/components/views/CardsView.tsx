'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { PaymentMethodType } from '../../types';

export const CardsView: React.FC = () => {
  const { cards, cardHistory, addCreditCard, payCreditCardBill } = useFinance();

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [bankName, setBankName] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [dueDate, setDueDate] = useState<number>(15);

  const [payCardId, setPayCardId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethodType>('UPI');

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

        <button
          onClick={() => setIsAddCardOpen(true)}
          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Add Credit Card</span>
        </button>
      </div>

      {/* Cards Slider/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {cards.map((card, index) => {
          const limitUsedPct = Math.min(100, Math.round((card.currentDue / (card.creditLimit || 1)) * 100));
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

    </div>
  );
};
