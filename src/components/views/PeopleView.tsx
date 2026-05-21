'use client';

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Users,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Check,
  CheckCircle2,
  X,
  Search,
  Trash2,
  AlertCircle,
  ChevronRight,
  Clock,
  Info,
} from 'lucide-react';
import { Person, Transaction } from '../../types';

export const PeopleView: React.FC = () => {
  const {
    people,
    transactions,
    addPerson,
    deletePerson,
    toggleSettleTransaction,
  } = useFinance();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debtFilter, setDebtFilter] = useState<'All' | 'Pending' | 'Lent' | 'Borrowed' | 'Settled'>('Pending');
  const [peopleSearchTerm, setPeopleSearchTerm] = useState('');
  
  // Quick-add states
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');
  const [addError, setAddError] = useState('');

  // Selected person for modal details
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Helper: calculate balance for a specific person
  const getPersonBalance = (name: string) => {
    const personTxs = transactions.filter(
      (t) => t.personName?.toLowerCase() === name.toLowerCase() && !t.isSettled
    );
    let balance = 0;
    personTxs.forEach((t) => {
      if (t.type === 'Give') {
        balance += t.amount;
      } else if (t.type === 'Borrowed') {
        balance -= t.amount;
      }
    });
    return balance;
  };

  // Helper: calculate total stats
  const activeDebts = transactions.filter(
    (t) => (t.type === 'Give' || t.type === 'Borrowed') && !t.isSettled
  );
  
  const totalLent = activeDebts
    .filter((t) => t.type === 'Give')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBorrowed = activeDebts
    .filter((t) => t.type === 'Borrowed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalLent - totalBorrowed;

  // Handle manual contact addition
  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const name = newPersonName.trim();
    if (!name) return;

    if (people.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setAddError('A contact with this name already exists.');
      return;
    }

    addPerson(name, newPersonPhone.trim() || undefined);
    setNewPersonName('');
    setNewPersonPhone('');
  };

  // Check if debt is overdue
  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const returnDate = new Date(dateStr);
    returnDate.setHours(0, 0, 0, 0);
    return returnDate < today;
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Filtered transactions for the main debt table
  const filteredDebts = transactions
    .filter((t) => t.type === 'Give' || t.type === 'Borrowed')
    .filter((t) => {
      // 1. Search term filter
      if (searchTerm) {
        const matchesName = t.personName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesNotes = t.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesName && !matchesNotes) return false;
      }
      // 2. Tab filter
      if (debtFilter === 'Pending') return !t.isSettled;
      if (debtFilter === 'Lent') return t.type === 'Give' && !t.isSettled;
      if (debtFilter === 'Borrowed') return t.type === 'Borrowed' && !t.isSettled;
      if (debtFilter === 'Settled') return t.isSettled;
      return true; // 'All'
    });

  // Filtered people list
  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(peopleSearchTerm.toLowerCase())
  );

  // Selected person's transaction history list (unsettled + settled)
  const selectedPersonTxs = selectedPerson
    ? transactions.filter(
        (t) => t.personName?.toLowerCase() === selectedPerson.name.toLowerCase() &&
               (t.type === 'Give' || t.type === 'Borrowed')
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const selectedPersonBalance = selectedPerson ? getPersonBalance(selectedPerson.name) : 0;

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header Info banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" /> People & Debts
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 mt-1">
          Keep track of money lent to and borrowed from your friends, family, and colleagues.
        </p>
      </div>

      {/* 2. KPI Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Lent Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              You Lent (Active Dues)
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ArrowUpRight className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-blue-650">
              ₹{totalLent.toLocaleString('en-IN')}
            </p>
            <span className="text-[9px] text-slate-400">Money people owe you</span>
          </div>
        </div>

        {/* Borrowed Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              You Borrowed (Active Dues)
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-650">
              <ArrowDownLeft className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-800">
              ₹{totalBorrowed.toLocaleString('en-IN')}
            </p>
            <span className="text-[9px] text-slate-400">Money you owe others</span>
          </div>
        </div>

        {/* Net Status Card */}
        <div className={`border rounded-2xl p-5 shadow-sm flex flex-col justify-between ${
          netBalance > 0
            ? 'bg-blue-50/20 border-blue-200/60'
            : netBalance < 0
            ? 'bg-amber-50/20 border-amber-200/60'
            : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Net Relationship Dues
            </span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              netBalance >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
            }`}>
              ₹
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-2xl font-extrabold ${
              netBalance > 0
                ? 'text-blue-750'
                : netBalance < 0
                ? 'text-amber-750'
                : 'text-slate-800'
            }`}>
              ₹{Math.abs(netBalance).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] font-semibold block mt-0.5">
              {netBalance > 0 ? (
                <span className="text-blue-600">Overall, people owe you ₹{netBalance.toLocaleString('en-IN')}</span>
              ) : netBalance < 0 ? (
                <span className="text-amber-600">Overall, you owe people ₹{Math.abs(netBalance).toLocaleString('en-IN')}</span>
              ) : (
                <span className="text-slate-500">All debts settled! Clean slate.</span>
              )}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Active Debts List & Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-bold text-slate-800">Debts Tracker</h3>
            
            {/* Search debt */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by contact or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-850"
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200/40 w-fit">
            {([
              { id: 'Pending', label: 'Pending Dues' },
              { id: 'Lent', label: 'You Lent' },
              { id: 'Borrowed', label: 'You Borrowed' },
              { id: 'Settled', label: 'Settled' },
              { id: 'All', label: 'All Logs' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDebtFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  debtFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Debts Table / Cards */}
          <div className="overflow-x-auto">
            {filteredDebts.length === 0 ? (
              <div className="text-center py-10 text-slate-450 space-y-2">
                <Info className="w-8 h-8 text-slate-350 mx-auto" />
                <p className="text-xs font-semibold">No debt transactions found matching this filter.</p>
                <p className="text-[10px]">Use the global Add Expense button at the top to record a new Lent/Borrowed debt.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 min-w-full">
                {filteredDebts.map((tx) => {
                  const active = !tx.isSettled;
                  const isLent = tx.type === 'Give';
                  const overdue = active && tx.expectedReturnDate && isOverdue(tx.expectedReturnDate);
                  
                  return (
                    <div key={tx.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                      
                      {/* Left: icon & details */}
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          tx.isSettled
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : isLent
                            ? 'bg-blue-50 border-blue-100 text-blue-600'
                            : 'bg-slate-100 border-slate-200 text-slate-650'
                        }`}>
                          {tx.isSettled ? (
                            <Check className="w-4 h-4" />
                          ) : isLent ? (
                            <ArrowUpRight className="w-4.5 h-4.5" />
                          ) : (
                            <ArrowDownLeft className="w-4.5 h-4.5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-800">
                              {tx.personName}
                            </h4>
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                              tx.isSettled
                                ? 'bg-emerald-100 text-emerald-700'
                                : isLent
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {tx.isSettled ? 'Settled' : isLent ? 'Lent' : 'Borrowed'}
                            </span>
                            {overdue && (
                              <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-red-100 text-red-650 rounded-md animate-pulse">
                                Overdue
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate max-w-xs sm:max-w-md">
                            {tx.notes || (isLent ? 'Lent money' : 'Borrowed money')}
                          </p>

                          {/* Dates row */}
                          <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400 font-semibold">
                            <span>Logged: {formatDate(tx.date)}</span>
                            {tx.expectedReturnDate && (
                              <>
                                <span>•</span>
                                <span className={`flex items-center gap-0.5 ${overdue ? 'text-red-500 font-bold' : ''}`}>
                                  <Clock className="w-2.5 h-2.5" />
                                  Return by: {formatDate(tx.expectedReturnDate)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount and settle button */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-50 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className={`text-xs font-extrabold ${
                            tx.isSettled
                              ? 'text-slate-400 line-through'
                              : isLent
                              ? 'text-blue-650'
                              : 'text-slate-800'
                          }`}>
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </p>
                          <span className="text-[8px] text-slate-400 font-bold">UPI</span>
                        </div>

                        {/* Settle Action button */}
                        <button
                          onClick={() => toggleSettleTransaction(tx.id)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold transition-all border flex items-center gap-1.5 ${
                            tx.isSettled
                              ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm hover:shadow'
                          }`}
                        >
                          {tx.isSettled ? (
                            <>
                              <Clock className="w-3 h-3" /> Reopen
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Settle Dues
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Contact Directory (1/3 width) */}
        <div className="space-y-6">
          
          {/* Section: Contacts List */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Contacts Directory</h3>
              <span className="text-[10px] font-bold text-slate-450">{people.length} Contacts</span>
            </div>

            {/* People search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search contact name..."
                value={peopleSearchTerm}
                onChange={(e) => setPeopleSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
              />
            </div>

            {/* Contact list scroll block */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredPeople.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4 font-semibold">No contacts registered yet.</p>
              ) : (
                filteredPeople.map((person) => {
                  const bal = getPersonBalance(person.name);
                  
                  return (
                    <div
                      key={person.id}
                      onClick={() => setSelectedPerson(person)}
                      className="flex justify-between items-center p-2 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-blue-550/10 text-blue-650 flex items-center justify-center font-bold text-xs uppercase">
                          {person.name.substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {person.name}
                          </h4>
                          {person.phone && (
                            <p className="text-[8px] font-bold text-slate-400">{person.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          {bal > 0 ? (
                            <>
                              <p className="text-[10px] font-bold text-blue-600">+₹{bal.toLocaleString('en-IN')}</p>
                              <span className="text-[7px] text-slate-400 uppercase font-bold">Owes You</span>
                            </>
                          ) : bal < 0 ? (
                            <>
                              <p className="text-[10px] font-bold text-amber-600">-₹{Math.abs(bal).toLocaleString('en-IN')}</p>
                              <span className="text-[7px] text-slate-400 uppercase font-bold">You Owe</span>
                            </>
                          ) : (
                            <span className="text-[8px] font-bold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded-md">Settled</span>
                          )}
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Section: Add Contact Form */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3.5">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-blue-500" /> Quick Add Contact
            </h4>
            
            <form onSubmit={handleAddPerson} className="space-y-2.5">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name (e.g. Rahul Sen)"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/85 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Phone Number (Optional)"
                  value={newPersonPhone}
                  onChange={(e) => setNewPersonPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/85 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
                />
              </div>

              {addError && (
                <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {addError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" /> Save Contact
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* 4. Single Contact History Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 animate-slide-up relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                  {selectedPerson.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-md font-bold text-slate-900">{selectedPerson.name}</h3>
                  <p className="text-[10px] text-slate-450 font-bold">
                    {selectedPerson.phone ? `Phone: ${selectedPerson.phone}` : 'No phone details'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedPerson(null)}
                className="p-1.5 rounded-full hover:bg-slate-150 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content stats */}
            <div className="py-4 flex justify-between items-center bg-slate-50/50 my-4 px-4 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-650">Current Balance Status:</span>
              <div>
                {selectedPersonBalance > 0 ? (
                  <p className="text-xs font-black text-blue-650">
                    Owes you ₹{selectedPersonBalance.toLocaleString('en-IN')}
                  </p>
                ) : selectedPersonBalance < 0 ? (
                  <p className="text-xs font-black text-amber-650">
                    You owe them ₹{Math.abs(selectedPersonBalance).toLocaleString('en-IN')}
                  </p>
                ) : (
                  <p className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    Fully Settled
                  </p>
                )}
              </div>
            </div>

            {/* List history transactions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Relationship Transaction Logs ({selectedPersonTxs.length})
              </h4>
              
              <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
                {selectedPersonTxs.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400 font-semibold">No debt transaction records found with this person.</p>
                ) : (
                  selectedPersonTxs.map((tx) => {
                    const isLent = tx.type === 'Give';
                    return (
                      <div key={tx.id} className="py-3 flex justify-between items-center gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            tx.isSettled
                              ? 'bg-slate-50 border-slate-100 text-slate-400'
                              : isLent
                              ? 'bg-blue-50 border-blue-100 text-blue-500'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}>
                            {isLent ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${tx.isSettled ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                              {tx.notes || (isLent ? 'Lent' : 'Borrowed')}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400">
                              <span>{formatDate(tx.date)}</span>
                              {tx.expectedReturnDate && (
                                <>
                                  <span>•</span>
                                  <span className={!tx.isSettled && isOverdue(tx.expectedReturnDate) ? 'text-red-500 font-bold' : ''}>
                                    Return: {formatDate(tx.expectedReturnDate)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <p className={`text-xs font-extrabold ${
                            tx.isSettled
                              ? 'text-slate-350 line-through'
                              : isLent
                              ? 'text-blue-650'
                              : 'text-slate-800'
                          }`}>
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </p>

                          <button
                            onClick={() => toggleSettleTransaction(tx.id)}
                            className={`p-1.5 rounded-full border transition-all ${
                              tx.isSettled
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                                : 'bg-white hover:bg-slate-50 text-slate-450 border-slate-200'
                            }`}
                            title={tx.isSettled ? 'Mark as Pending' : 'Mark as Settled'}
                          >
                            <Check className="w-3.5 h-3.5 font-bold" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-4 border-t border-slate-100 mt-6 flex justify-between items-center">
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedPerson.name} from your contact directory?`)) {
                    deletePerson(selectedPerson.id);
                    setSelectedPerson(null);
                  }
                }}
                className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-full transition-all"
                title="Delete Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedPerson(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-bold text-slate-700 transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
