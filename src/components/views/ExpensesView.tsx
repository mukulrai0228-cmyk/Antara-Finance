'use client';

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AddExpenseModal } from '../AddExpenseModal';
import {
  Calendar as CalIcon,
  List,
  Search,
  Filter,
  Trash2,
  CalendarCheck,
  PlusCircle,
  Clock,
  CircleDollarSign,
  ArrowRightLeft,
} from 'lucide-react';
import { TransactionCategory, PaymentMethodType, TransactionType } from '../../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_INDEX_MAP: { [key: string]: number } = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

export const ExpensesView: React.FC = () => {
  const {
    transactions,
    deleteTransaction,
    currentMonth,
    setCurrentMonth,
    cards,
  } = useFinance();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const year = 2026; // Track in 2026 for local consistency
  const monthIdx = MONTH_INDEX_MAP[currentMonth] ?? new Date().getMonth();

  // Get days & layout parameters for Calendar
  const getDaysInMonth = (mIdx: number, yr: number) => new Date(yr, mIdx + 1, 0).getDate();
  const getFirstDayOfMonth = (mIdx: number, yr: number) => new Date(yr, mIdx, 1).getDay();

  const daysInMonth = getDaysInMonth(monthIdx, year);
  const startDayOffset = getFirstDayOfMonth(monthIdx, year);

  // Filter Transactions for Selected Month
  const curMonthIndexStr = String(monthIdx + 1).padStart(2, '0');
  const monthPrefix = `${year}-${curMonthIndexStr}`;
  const monthTransactions = transactions.filter((t) => t.date.startsWith(monthPrefix));

  // Applied filter calculations
  const filteredTransactions = monthTransactions.filter((tx) => {
    const matchesSearch =
      (tx.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.personName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
    const matchesMethod = selectedMethod === 'All' || tx.paymentMethod === selectedMethod;
    const matchesType = selectedType === 'All' || tx.type === selectedType;

    return matchesSearch && matchesCategory && matchesMethod && matchesType;
  });

  // Calendar Box Click Action
  const handleCalendarDayClick = (day: number) => {
    const dayStr = String(day).padStart(2, '0');
    setPrefilledDate(`${year}-${curMonthIndexStr}-${dayStr}`);
    setIsModalOpen(true);
  };

  // Check if cell matches "Today" date
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === monthIdx &&
      today.getFullYear() === year
    );
  };

  const getDayAggregateSpend = (day: number) => {
    const dayStr = String(day).padStart(2, '0');
    const targetDate = `${year}-${curMonthIndexStr}-${dayStr}`;
    return monthTransactions
      .filter((t) => t.date === targetDate && t.type === 'Spent')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const CATEGORIES: TransactionCategory[] = [
    'Food', 'Petrol', 'Bills', 'Family', 'Friends', 'Shopping',
    'Insurance', 'EMI', 'Health', 'Travel', 'Entertainment', 'Relationship', 'Personal'
  ];
  const PAYMENT_METHODS: PaymentMethodType[] = ['Cash', 'UPI', 'Credit Card', 'Debit Card'];

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Month Selector & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white border border-slate-200/80 p-4 rounded-3xl shadow-sm">
        
        {/* Mobile Month Dropdown */}
        <div className="sm:hidden w-full relative">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m} 2026
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector Carousel (Desktop/Tablet) */}
        <div className="hidden sm:flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full sm:max-w-md">
          {MONTHS.map((m) => {
            const isSel = currentMonth === m;
            return (
              <button
                key={m}
                onClick={() => setCurrentMonth(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isSel
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* View togglers */}
        <div className="flex items-center gap-2 border border-slate-200 p-1 rounded-2xl bg-slate-50/50">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
            }`}
          >
            <CalIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
        </div>

      </div>

      {/* -------------------- CALENDAR VIEW -------------------- */}
      {viewMode === 'calendar' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-500" />
              <span>{currentMonth} 2026 Spend Calendar</span>
            </h3>
            <p className="text-[10px] text-slate-450 font-semibold uppercase">
              Click any date box to log spend
            </p>
          </div>

          {/* Calendar Grid Header */}
          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] sm:text-xs font-bold text-slate-400">
            <div><span className="hidden sm:inline">Sun</span><span className="inline sm:hidden">S</span></div>
            <div><span className="hidden sm:inline">Mon</span><span className="inline sm:hidden">M</span></div>
            <div><span className="hidden sm:inline">Tue</span><span className="inline sm:hidden">T</span></div>
            <div><span className="hidden sm:inline">Wed</span><span className="inline sm:hidden">W</span></div>
            <div><span className="hidden sm:inline">Thu</span><span className="inline sm:hidden">T</span></div>
            <div><span className="hidden sm:inline">Fri</span><span className="inline sm:hidden">F</span></div>
            <div><span className="hidden sm:inline">Sat</span><span className="inline sm:hidden">S</span></div>
          </div>

          {/* Calendar Grid Blocks */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            
            {/* Blank offset boxes for initial week days */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="bg-slate-50/30 border border-transparent rounded-xl sm:rounded-2xl aspect-square" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const spend = getDayAggregateSpend(dayNum);
              const isTodayDay = isToday(dayNum);

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => handleCalendarDayClick(dayNum)}
                  className={`aspect-square p-1.5 sm:p-2 border rounded-xl sm:rounded-2xl text-left flex flex-col justify-between hover:border-blue-300 hover:bg-slate-50/55 transition-all ${
                    isTodayDay
                      ? 'border-blue-600 bg-blue-50/20'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <span className={`text-[10px] sm:text-xs font-bold ${isTodayDay ? 'text-blue-600' : 'text-slate-500'}`}>
                    {dayNum}
                  </span>
                  
                  {spend > 0 ? (
                    <div className="w-full text-right leading-none mt-0.5 sm:mt-1">
                      <span className="text-[8px] sm:text-[9px] font-extrabold text-slate-800">
                        ₹{spend >= 1000 ? `${(spend / 1000).toFixed(0)}k` : spend}
                      </span>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-600 ml-auto mt-0.5" />
                    </div>
                  ) : (
                    <div className="w-full text-right opacity-0 group-hover:opacity-100 flex items-center justify-end h-3">
                      <PlusCircle className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------- LIST VIEW -------------------- */}
      {viewMode === 'list' && (
        <div className="space-y-4 animate-fade-in">
                   {/* Search & Filtering Bar */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm">
            {/* Desktop Filters Layout */}
            <div className="hidden md:flex flex-row gap-3">
              {/* Search note bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search transaction description, category, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:border-blue-500 transition-all font-medium text-slate-800"
                />
              </div>

              {/* Filters inline */}
              <div className="flex flex-wrap gap-2.5 items-center">
                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-650 focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Spent">Spent</option>
                  <option value="Sent">Sent</option>
                  <option value="Borrowed">Borrowed</option>
                  <option value="Received">Received</option>
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-650 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Payment Method Filter */}
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-655 focus:outline-none"
                >
                  <option value="All">All Methods</option>
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile Filters Layout */}
            <div className="flex flex-col gap-3 md:hidden">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search transaction description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-2xl text-xs font-semibold transition-all ${
                    showMobileFilters || selectedType !== 'All' || selectedCategory !== 'All' || selectedMethod !== 'All'
                      ? 'border-blue-200 bg-blue-50 text-blue-600'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {(selectedType !== 'All' || selectedCategory !== 'All' || selectedMethod !== 'All') && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>
              </div>

              {/* Mobile Collapsible Filters Panel */}
              {showMobileFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-200 animate-fade-in">
                  {/* Type Filter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="All">All Types</option>
                      <option value="Spent">Spent</option>
                      <option value="Sent">Sent</option>
                      <option value="Borrowed">Borrowed</option>
                      <option value="Received">Received</option>
                    </select>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method Filter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Method</label>
                    <select
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="All">All Methods</option>
                      {PAYMENT_METHODS.map((pm) => (
                        <option key={pm} value={pm}>
                          {pm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Transactions Data Table */}
          <div className="hidden lg:block bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-450 uppercase tracking-wide">
                    <th className="p-4 pl-6">Transaction</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Tags</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 pr-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Title & Date */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            {tx.type === 'Spent' ? (
                              <CircleDollarSign className="w-4 h-4 text-slate-450" />
                            ) : (
                              <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{tx.notes || tx.category}</h4>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {tx.date}
                              {tx.personName && ` • for ${tx.personName}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="text-[10px] font-bold text-slate-650 bg-slate-100 px-2 py-1 rounded-lg">
                          {tx.category}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {tx.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-bold text-blue-650 bg-blue-50/50 px-1.5 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {tx.tags.length === 0 && (
                            <span className="text-[10px] text-slate-350">--</span>
                          )}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="p-4">
                        <span className="text-slate-650 text-xs">
                          {tx.paymentMethod}
                          {tx.cardId && ' (CC)'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-4 text-right">
                        <span className={`font-extrabold text-sm ${
                          tx.type === 'Received' ? 'text-emerald-600' : 'text-slate-900'
                        }`}>
                          {tx.type === 'Received' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Delete Action */}
                      <td className="p-4 pr-6 text-center">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-red-655 rounded-lg hover:bg-red-50/55 transition-all"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-slate-400 py-12">
                        No transactions match search criteria or filter choices.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Stacked Card List */}
          <div className="block lg:hidden space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white border border-slate-200/75 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Category/Type Icon */}
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    {tx.type === 'Spent' ? (
                      <CircleDollarSign className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  {/* Details */}
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 truncate text-sm">
                      {tx.notes || tx.category}
                    </h4>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="truncate">{tx.date}</span>
                      <span>•</span>
                      <span className="truncate">{tx.paymentMethod}{tx.cardId && ' (CC)'}</span>
                    </p>
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {tx.category}
                      </span>
                      {tx.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                      {tx.personName && (
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                          for {tx.personName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and Delete Action */}
                <div className="flex flex-col items-end shrink-0 justify-between self-stretch">
                  <span className={`font-extrabold text-sm ${
                    tx.type === 'Received' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {tx.type === 'Received' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                  
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1.5 text-slate-400 hover:text-red-650 rounded-lg hover:bg-red-50/50 transition-all mt-auto"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center text-slate-400 bg-white border border-slate-200/80 rounded-2xl py-12 px-4 shadow-sm">
                No transactions match search criteria or filter choices.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add modal triggers */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPrefilledDate(undefined);
        }}
        prefilledDate={prefilledDate}
      />
    </div>
  );
};
