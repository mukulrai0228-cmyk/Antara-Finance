'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, Calendar as CalIcon, Tag, User as PersonIcon, CreditCard, HelpCircle } from 'lucide-react';
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
  const [selectedTags, setSelectedTags] = useState<TransactionTag[]>([]);
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
      if (prefilledDate) {
        setDate(prefilledDate);
      } else {
        setDate(new Date().toISOString().split('T')[0]);
      }
      // Reset form
      setAmount('');
      setType('Spent');
      setCategory('Food');
      setSelectedTags([]);
      setPaymentMethod('UPI');
      setNotes('');
      setPersonName('');
      setExpectedReturnDate('');
      setSelectedVehicleId('');
      if (cards.length > 0) {
        setSelectedCardId(cards[0].id);
      } else {
        setSelectedCardId('');
      }
    }
  }, [isOpen, prefilledDate, cards]);

  // Handle Tag toggle
  const toggleTag = (tag: TransactionTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    // Check HDFC CC bill payment scenario:
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-slide-up relative">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Add Transaction</h3>
            <p className="text-xs text-slate-500">Record your logs instantly.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          
          {/* Amount Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                ₹
              </span>
              <input
                type="number"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-blue-500 transition-all text-lg"
              />
            </div>
          </div>

          {/* Type Selection Tabs */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Type
            </label>
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/40">
              {(['Spent', 'Give', 'Borrowed'] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    type === t
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t === 'Give' ? 'Give' : t === 'Borrowed' ? 'Borrowed' : 'Spent'}
                </button>
              ))}
            </div>
          </div>

          {/* SPENT SECTION */}
          {type === 'Spent' && (
            <div className="space-y-4 animate-fade-in">
              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-blue-500 transition-all font-semibold text-base sm:text-xs appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method & Card Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-blue-500 transition-all font-semibold text-base sm:text-xs appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                    >
                      <option value="UPI">UPI (GPay/PhonePe)</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                    </select>
                  </div>
                </div>

                {paymentMethod === 'Credit Card' && cards.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Select Card
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCardId}
                        onChange={(e) => setSelectedCardId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-blue-500 transition-all font-semibold text-base sm:text-xs appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                      >
                        {cards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.bankName} {c.cardName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {category === 'Bills' && paymentMethod !== 'Credit Card' && cards.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      Pay Bill For Card <span title="Link this payment to a credit card to clear its due amount."><HelpCircle className="w-3 h-3 text-slate-400" /></span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCardId}
                        onChange={(e) => setSelectedCardId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-blue-500 transition-all font-semibold text-base sm:text-xs appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                      >
                        <option value="">-- None (General Bill) --</option>
                        {cards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.bankName} {c.cardName} (Due: ₹{c.currentDue})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Show a helper badge when CC bill payment is triggered */}
              {isCCBillPayment && selectedCardId && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800">
                  🎉 <strong>Payment Auto-Sync:</strong> This will subtract ₹{amount || '0'} from
                  your remaining salary/budget AND reduce the due balance of the selected Credit Card.
                </div>
              )}

              {/* Vehicle integration selector */}
              {vehicles.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Link to Vehicle (Optional)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-blue-500 transition-all font-semibold text-base sm:text-xs appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                    >
                      <option value="">-- None (General Spend) --</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.type === 'Car' ? '🚗' : '🏍️'} {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                  <span>Tags</span>
                  {selectedTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTags([])}
                      className="text-[9px] text-blue-600 hover:text-blue-700 font-bold normal-case hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </label>
                <div className="relative mb-2">
                  <select
                    value=""
                    onChange={(e) => {
                      const tag = e.target.value as TransactionTag;
                      if (tag) {
                        toggleTag(tag);
                        e.target.value = "";
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-blue-500 transition-all font-semibold text-base sm:text-xs appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                  >
                    <option value="">-- Choose tags... --</option>
                    {TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag} {selectedTags.includes(tag) ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-2xl">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-[10px] font-semibold flex items-center gap-1 cursor-pointer hover:bg-blue-100 transition-all select-none"
                      >
                        <Tag className="w-3 h-3 text-blue-500" />
                        {tag}
                        <X className="w-3.5 h-3.5 text-blue-400 hover:text-blue-600" />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Date and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <div className="relative">
                    <CalIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-base sm:text-xs focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Swiggy lunch, cab split"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-base sm:text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* GIVE SECTION */}
          {type === 'Give' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Lent To (Person Name)
                </label>
                <input
                  type="text"
                  required
                  list="people-list"
                  placeholder="Select or enter contact name"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-base sm:text-xs focus:outline-none focus:border-blue-500 font-semibold"
                />
                <datalist id="people-list">
                  {people.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-base sm:text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Return Date (Expected)
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-base sm:text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner share, cab split"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-base sm:text-xs focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>
            </div>
          )}

          {/* BORROWED SECTION */}
          {type === 'Borrowed' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Borrowed From (Person Name)
                </label>
                <input
                  type="text"
                  required
                  list="people-list"
                  placeholder="Select or enter contact name"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-base sm:text-xs focus:outline-none focus:border-blue-500 font-semibold"
                />
                <datalist id="people-list">
                  {people.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Borrowed When (Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-base sm:text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Return When (Expected Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-base sm:text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Why (Notes)
                </label>
                <input
                  type="text"
                  placeholder="e.g. For movie tickets advance"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-base sm:text-xs focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md"
            >
              Save Transaction
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
