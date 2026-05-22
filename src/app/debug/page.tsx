'use client';

import React, { useEffect, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { supabase } from '@/lib/supabaseClient';

export default function DebugPage() {
  const {
    user,
    isAuthenticated,
    loading,
    loans,
    transactions,
    cards,
    vehicles,
    vehicleExpenses,
    resetAllData
  } = useFinance();

  const [session, setSession] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [dbTxs, setDbTxs] = useState<any[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    addLog('Debug page loaded.');
    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      if (error) {
        addLog(`Error getting session: ${error.message}`);
      } else {
        setSession(s);
        addLog(`Session retrieved. User ID: ${s?.user?.id || 'none'}`);
        if (s?.user) {
          fetchRawTxs(s.user.id);
        }
      }
    });
  }, []);

  const fetchRawTxs = async (userId: string) => {
    addLog('Fetching raw transactions from DB...');
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        setDbError(error.message);
        addLog(`DB Error fetching transactions: ${error.message}`);
      } else {
        setDbTxs(data || []);
        addLog(`Retrieved ${data?.length || 0} raw transactions.`);
      }
    } catch (err: any) {
      setDbError(err.message || String(err));
      addLog(`Catch Error fetching transactions: ${err.message || err}`);
    }
  };

  const handleManualSync = async () => {
    addLog('Triggering manual sync check...');
    if (!session?.user) {
      addLog('Error: No active auth session');
      return;
    }
    const userId = session.user.id;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    addLog(`Today string: ${todayStr}`);
    addLog(`Loans in state: ${loans.length}`);

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

    let count = 0;
    for (const loan of loans) {
      addLog(`Checking loan: ${loan.name}, tenure: ${loan.tenureMonths}, start: ${loan.startDate}`);
      for (let i = 0; i < loan.tenureMonths; i++) {
        const payDate = getPaymentDate(loan.startDate, i);
        if (payDate <= todayStr) {
          const marker = `[loan_emi_sync:${loan.id}:${i}]`;
          const exists = transactions.some((t) => t.notes && t.notes.includes(marker));
          addLog(`Month index ${i} payDate ${payDate}: marker=${marker}, exists=${exists}`);
          if (!exists) {
            count++;
            addLog(`Need to add transaction for Month ${i + 1}`);
          }
        }
      }
    }
    addLog(`Sync simulation complete. Found ${count} missing transactions.`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Antara Finance Diagnostics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Auth State */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <h2 className="text-lg font-bold text-slate-700 mb-2">Auth State</h2>
          <pre className="text-xs text-slate-600 bg-white p-2 rounded border overflow-x-auto">
            {JSON.stringify({
              isAuthenticated,
              loading,
              authUserId: session?.user?.id || null,
              userEmail: session?.user?.email || null,
              profileName: user?.fullName || null,
              hasCompletedOnboarding: user?.hasCompletedOnboarding || false
            }, null, 2)}
          </pre>
        </div>

        {/* State Summary */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <h2 className="text-lg font-bold text-slate-700 mb-2">State Summary</h2>
          <pre className="text-xs text-slate-600 bg-white p-2 rounded border overflow-x-auto">
            {JSON.stringify({
              loansCount: loans.length,
              transactionsCount: transactions.length,
              cardsCount: cards.length,
              vehiclesCount: vehicles.length,
              vehicleExpensesCount: vehicleExpenses.length
            }, null, 2)}
          </pre>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleManualSync}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
        >
          Simulate Sync Check
        </button>
        <button
          onClick={() => session?.user && fetchRawTxs(session.user.id)}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-755 text-white rounded-lg text-sm font-semibold transition"
        >
          Refresh DB Transactions
        </button>
      </div>

      {/* Diagnostics Logs */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl space-y-1">
        <h2 className="text-md font-bold text-white mb-2">Diagnostic Logs</h2>
        <div className="max-h-48 overflow-y-auto text-xs font-mono space-y-1 bg-black/30 p-2 rounded border border-white/10">
          {logs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </div>
      </div>

      {/* Database Transactions */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
        <h2 className="text-lg font-bold text-slate-700">Raw DB Transactions ({dbTxs.length})</h2>
        {dbError && (
          <div className="p-2 text-red-600 bg-red-50 border border-red-200 rounded-lg text-xs font-medium">
            Error: {dbError}
          </div>
        )}
        <div className="max-h-60 overflow-y-auto border rounded divide-y text-xs">
          {dbTxs.length === 0 ? (
            <div className="p-4 text-center text-slate-400">No transactions found in database.</div>
          ) : (
            dbTxs.map((tx) => (
              <div key={tx.id} className="p-2 flex justify-between items-start hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-700">{tx.category}</span> - <span className="text-slate-500">{tx.notes || 'No notes'}</span>
                  <div className="text-[10px] text-slate-400">Date: {tx.date} | ID: {tx.id} | Card ID: {tx.card_id || 'null'} | Vehicle ID: {tx.vehicle_id || 'null'}</div>
                </div>
                <div className="font-bold text-slate-900">₹{tx.amount.toLocaleString('en-IN')}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Loans/EMIs State */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
        <h2 className="text-lg font-bold text-slate-700">Active Loans/EMIs ({loans.length})</h2>
        <div className="max-h-60 overflow-y-auto border rounded divide-y text-xs">
          {loans.length === 0 ? (
            <div className="p-4 text-center text-slate-400">No active loans or EMIs.</div>
          ) : (
            loans.map((loan) => (
              <div key={loan.id} className="p-2 flex justify-between items-start hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-700">{loan.name}</span> ({loan.type})
                  <div className="text-[10px] text-slate-400">
                    Start: {loan.startDate} | End: {loan.endDate} | Tenure: {loan.tenureMonths} Months
                    {loan.cardId && ` | Card ID: ${loan.cardId}`}
                    {loan.vehicleId && ` | Vehicle ID: ${loan.vehicleId}`}
                  </div>
                </div>
                <div className="font-bold text-slate-900">₹{loan.amount.toLocaleString('en-IN')}/mo</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
