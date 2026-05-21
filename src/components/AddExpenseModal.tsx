'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, Calendar as CalIcon, HelpCircle, ChevronDown } from 'lucide-react';
import { TransactionCategory, TransactionTag, TransactionType, PaymentMethodType } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledDate?: string;
}

const CATEGORIES: TransactionCategory[] = [
  'Food',
  'Petrol',
  'Bills',
  'Family',
  'Friends',
  'Shopping',
  'Insurance',
  'EMI',
  'Health',
  'Travel',
  'Entertainment',
  'Relationship',
  'Personal',
];

const TAGS: TransactionTag[] = [
  'Need',
  'Want',
  'Future Saving',
  'Emergency',
  'Lifestyle',
  'Family',
  'Personal',
  'Investment',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, prefilledDate }) => {
  const { cards, vehicles, people, addTransaction, payCreditCardBill, addPerson } = useFinance();

  // Form states
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Spent' | 'Give' | 'Borrowed'>('Spent');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [selectedTags, setSelectedTags] = useState<TransactionTag[]>(['Family']);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('UPI');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [personName, setPersonName] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  // Set default date when opened or prefilledDate changes
  useEffect(() => {
    if (isOpen) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (prefilledDate) {
        setDate(prefilledDate);
      } else {
        setDate(todayStr);
      }
      // Reset form
      setAmount('');
      setType('Spent');
      setCategory('Food');
      setSelectedTags(['Family']);
      setPaymentMethod('UPI');
      setNotes('');
      setPersonName('');
      setExpectedReturnDate(todayStr);
      setSelectedVehicleId('');
      if (cards.length > 0) {
        setSelectedCardId(cards[0].id);
      } else {
        setSelectedCardId('');
      }
    }
  }, [isOpen, prefilledDate, cards]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!rawVal || rawVal === '₹' || rawVal === '₹ ') {
      setAmount('');
      return;
    }
    const cleanVal = rawVal.replace(/[^\d]/g, '');
    if (!cleanVal) {
      setAmount('');
      return;
    }
    const num = parseInt(cleanVal, 10);
    setAmount(`₹ ${num.toLocaleString('en-IN')}`);
  };

  const handlePersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__add_new__') {
      const name = prompt('Enter the name of the new person:');
      if (name && name.trim()) {
        const trimmed = name.trim();
        const existing = people.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
        if (existing) {
          setPersonName(existing.name);
        } else {
          addPerson(trimmed);
          setPersonName(trimmed);
        }
      } else {
        setPersonName('');
      }
    } else {
      setPersonName(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = amount.replace(/[^\d]/g, '');
    const amountVal = parseFloat(cleanAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    // Check CC bill payment scenario:
    if (type === 'Spent' && category === 'Bills' && paymentMethod !== 'Credit Card' && selectedCardId) {
      payCreditCardBill(selectedCardId, amountVal, paymentMethod);
    } else {
      // Auto-add new person if they don't exist
      if ((type === 'Give' || type === 'Borrowed') && personName) {
        const trimmedName = personName.trim();
        if (trimmedName && !people.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
          addPerson(trimmedName);
        }
      }

      // General transaction
      addTransaction({
        amount: amountVal,
        type,
        category: type === 'Spent' ? category : (type === 'Give' ? 'Family' : 'Bills'),
        tags: type === 'Spent' ? selectedTags : ['Need'],
        paymentMethod: type === 'Spent' ? paymentMethod : 'UPI',
        notes: notes || undefined,
        date,
        personName: (type === 'Give' || type === 'Borrowed') ? personName : undefined,
        expectedReturnDate: (type === 'Give' || type === 'Borrowed') ? expectedReturnDate || undefined : undefined,
        isSettled: (type === 'Give' || type === 'Borrowed') ? false : undefined,
        cardId: type === 'Spent' && paymentMethod === 'Credit Card' && selectedCardId ? selectedCardId : undefined,
        vehicleId: type === 'Spent' && selectedVehicleId ? selectedVehicleId : undefined,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  const isCCBillPayment = type === 'Spent' && category === 'Bills' && paymentMethod !== 'Credit Card' && cards.length > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl max-w-lg w-full max-h-[95vh] overflow-y-auto p-6 sm:p-8 animate-slide-up relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Add Transaction</h3>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all focus:outline-none"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Type Selection Tabs */}
          <div>
            <div className="flex bg-[#e5e7eb] p-1 rounded-full">
              {(['Spent', 'Give', 'Borrowed'] as const).map((t, idx, arr) => {
                const isActive = type === t;
                const showSeparator = idx > 0 && !isActive && type !== arr[idx - 1];

                return (
                  <React.Fragment key={t}>
                    {showSeparator && (
                      <div className="w-[1.5px] h-4 bg-slate-400/40 self-center" />
                    )}
                    <button
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-500 mb-2">
              Amount (₹)
            </label>
            <input
              type="text"
              required
              placeholder="₹ 2,000"
              value={amount}
              onChange={handleAmountChange}
              className="w-full px-4 py-4 bg-[#f3f4f6] rounded-2xl text-slate-900 font-bold text-lg focus:outline-none focus:ring-0 border-0"
            />
          </div>

          {/* SPENT SECTION */}
          {type === 'Spent' && (
            <div className="space-y-5 animate-fade-in">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                    <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">
                  Payment Method
                </label>
                <div className="relative">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                    className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                  >
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                    <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                  </div>
                </div>
              </div>

              {/* Credit Card Details Conditional Selection */}
              {paymentMethod === 'Credit Card' && cards.length > 0 && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Select Card
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCardId}
                      onChange={(e) => setSelectedCardId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                    >
                      {cards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.bankName} {c.cardName}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                      <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  </div>
                </div>
              )}

              {/* CC Bill Payment Conditional Linkage */}
              {category === 'Bills' && paymentMethod !== 'Credit Card' && cards.length > 0 && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1">
                    Pay Bill For Card <span title="Link this payment to a credit card to clear its due amount."><HelpCircle className="w-3 h-3 text-slate-400" /></span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCardId}
                      onChange={(e) => setSelectedCardId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                    >
                      <option value="">-- None (General Bill) --</option>
                      {cards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.bankName} {c.cardName} (Due: ₹{c.currentDue.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                      <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  </div>
                </div>
              )}

              {/* CC Bill Auto-Sync Badge */}
              {isCCBillPayment && selectedCardId && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-xs text-emerald-800 animate-fade-in">
                  🎉 <strong>Payment Auto-Sync:</strong> This will subtract {amount || '₹0'} from
                  your remaining salary/budget AND reduce the due balance of the selected Credit Card.
                </div>
              )}

              {/* Vehicle Linkage Selector */}
              {vehicles.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Link to Vehicle (Optional)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                    >
                      <option value="">-- None (General Spend) --</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.type === 'Car' ? '🚗' : '🏍️'} {v.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                      <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">
                  Tags
                </label>
                <div className="relative">
                  <select
                    value={selectedTags[0] || 'Family'}
                    onChange={(e) => setSelectedTags([e.target.value as TransactionTag])}
                    className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                  >
                    {TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                    <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                  </div>
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">
                  Date
                </label>
                <div className="relative">
                  <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-800" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                  />
                </div>
              </div>

              {/* Remark/Notes Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">
                  Remark
                </label>
                <input
                  type="text"
                  placeholder="e.g, Swiggy lunch, cab split"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                />
              </div>
            </div>
          )}

          {/* GIVE SECTION */}
          {type === 'Give' && (
            <div className="space-y-5 animate-fade-in">
              {/* Lent to Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">
                  Lent to (Person Name)
                </label>
                <div className="relative">
                  <select
                    value={personName}
                    onChange={handlePersonChange}
                    className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                    required
                  >
                    <option value="">Select contact name</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    <option value="__add_new__">+ Add New Person...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                    <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                  </div>
                </div>
              </div>

              {/* Date & Return Date Side-by-Side Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-800" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Return Date (Expected)
                  </label>
                  <div className="relative">
                    <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-800" />
                    <input
                      type="date"
                      required
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g, Emergency Need"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                />
              </div>
            </div>
          )}

          {/* BORROWED SECTION */}
          {type === 'Borrowed' && (
            <div className="space-y-5 animate-fade-in">
              {/* Borrowed From Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">
                  Borrowed From (Person Name)
                </label>
                <div className="relative">
                  <select
                    value={personName}
                    onChange={handlePersonChange}
                    className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                    required
                  >
                    <option value="">Select contact name</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    <option value="__add_new__">+ Add New Person...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                    <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                  </div>
                </div>
              </div>

              {/* Date & Return Date Side-by-Side Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-800" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Return Date (Expected)
                  </label>
                  <div className="relative">
                    <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-800" />
                    <input
                      type="date"
                      required
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Why (Notes) */}
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">
                  Why (Notes)
                </label>
                <input
                  type="text"
                  placeholder="e.g, For Bills Payment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-4 flex justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-blue-600 hover:bg-blue-50 text-blue-600 rounded-full text-base font-semibold transition-all focus:outline-none text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-base font-semibold transition-all focus:outline-none text-center shadow-sm"
            >
              Save Transaction
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
