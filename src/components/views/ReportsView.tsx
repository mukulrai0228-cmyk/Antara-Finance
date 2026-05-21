'use client';

import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Sparkles,
  TrendingDown,
  TrendingUp,
  CircleDollarSign,
  Fuel,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { transactions, user, currentMonth, cards } = useFinance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  const curYear = today.getFullYear();

  // Compute metrics
  const monthlySalary = user?.monthlySalary || 0;
  const MONTH_MAP: { [key: string]: string } = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };
  const curMonthIndex = MONTH_MAP[currentMonth] || String(today.getMonth() + 1).padStart(2, '0');
  const monthPrefix = `${curYear}-${curMonthIndex}`;

  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(monthPrefix));

  const monthlySpent = currentMonthTransactions
    .filter((t) => t.type === 'Spent')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyReceived = currentMonthTransactions
    .filter((t) => t.type === 'Received')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = Math.max(0, monthlySalary + monthlyReceived - monthlySpent);
  
  // Projected yearly savings: sum of actual recorded savings + projection for remaining months
  const yearlySavings = monthlySavings * 12;

  // Biggest Monthly Expense
  const spentList = currentMonthTransactions.filter((t) => t.type === 'Spent');
  const biggestExpenseObj = spentList.length > 0 
    ? spentList.reduce((max, t) => (t.amount > max.amount ? t : max), spentList[0])
    : null;

  // Petrol Yearly Spending (simulated based on actual logs this month * 12)
  const petrolThisMonth = spentList
    .filter((t) => t.category === 'Petrol')
    .reduce((sum, t) => sum + t.amount, 0);
  const petrolYearlyProjected = petrolThisMonth * 12;

  // Credit Card Bill totals
  const totalCardsDue = cards.reduce((sum, c) => sum + c.currentDue, 0);

  // Category statistics for Bar Chart
  const categoryTotals: { [key: string]: number } = {};
  spentList.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const barChartData = Object.keys(categoryTotals).map((cat) => ({
    category: cat,
    Amount: categoryTotals[cat],
  })).sort((a, b) => b.Amount - a.Amount);

  // Tag breakdown for Donut Chart (Need vs. Want analysis)
  const tagTotals: { [key: string]: number } = {};
  spentList.forEach((t) => {
    t.tags.forEach((tag) => {
      tagTotals[tag] = (tagTotals[tag] || 0) + t.amount;
    });
  });

  const donutColors = ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];
  const tagChartData = Object.keys(tagTotals).map((tag, idx) => ({
    name: tag,
    value: tagTotals[tag],
    color: donutColors[idx % donutColors.length],
  }));

  // CSV Exporter Action
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Category,Type,Payment Method,Tags,Amount,Notes\r\n';
    
    transactions.forEach((t) => {
      const row = [
        t.date,
        t.category,
        t.type,
        t.paymentMethod,
        t.tags.join(';'),
        t.amount,
        `"${t.notes || ''}"`,
      ].join(',');
      csvContent += row + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Antara_Financial_Report_${currentMonth}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Print Action
  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:bg-white print:p-8">
      
      {/* Top action section */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Financial Analytics Report
          </h2>
          <p className="text-xs text-slate-400">Month: {currentMonth} 2026</p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Report Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wide">Monthly Savings</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-md sm:text-lg font-bold text-slate-805 mt-2">
            ₹{monthlySavings.toLocaleString('en-IN')}
          </p>
          <span className="text-[9px] text-slate-400">Savings ratio: {monthlySalary + monthlyReceived > 0 ? Math.round((monthlySavings / (monthlySalary + monthlyReceived)) * 100) : 0}%</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wide">Projected Annual Savings</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-md sm:text-lg font-bold text-blue-605 mt-2">
            ₹{yearlySavings.toLocaleString('en-IN')}
          </p>
          <span className="text-[9px] text-slate-400">Est. yearly growth</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wide">Biggest Monthly Expense</span>
            <CircleDollarSign className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-md sm:text-lg font-bold text-slate-805 mt-2">
            ₹{biggestExpenseObj ? biggestExpenseObj.amount.toLocaleString('en-IN') : 0}
          </p>
          <span className="text-[9px] text-slate-450 truncate block mt-0.5">
            {biggestExpenseObj ? biggestExpenseObj.notes || biggestExpenseObj.category : 'None'}
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-slate-450">
            <span className="text-[10px] font-bold uppercase tracking-wide">Petrol Projected (Annual)</span>
            <Fuel className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-md sm:text-lg font-bold text-slate-800 mt-2">
            ₹{petrolYearlyProjected.toLocaleString('en-IN')}
          </p>
          <span className="text-[9px] text-slate-400">₹{petrolThisMonth.toLocaleString('en-IN')} this month</span>
        </div>

      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Spending Bars */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span>Category Spending Rankings</span>
          </h3>

          <div className="h-64">
            {mounted && barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(val) => [`₹${val}`, 'Spent']}
                  />
                  <Bar dataKey="Amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                No spending data registered for category ranking.
              </div>
            )}
          </div>
        </div>

        {/* Tags breakdown - Needs vs. Wants Donut */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-805 mb-4">Discipline Tag Breakdown</h3>
          </div>
          
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 justify-center">
            
            {/* Pie circle */}
            <div className="w-40 h-40 relative flex items-center justify-center">
              {mounted && tagChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tagChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {tagChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-xs">No tag records.</div>
              )}
            </div>

            {/* Legends list */}
            <div className="space-y-1.5 flex-1 max-h-48 overflow-y-auto">
              {tagChartData.map((data, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                    <span className="text-slate-750">{data.name}</span>
                  </div>
                  <span className="text-slate-900">₹{data.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {tagChartData.length === 0 && (
                <p className="text-xs text-slate-400 text-center">Assign tags (Need/Want) to logs to view discipline analytics.</p>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Credit Card Totals Box */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-800">Dues Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">Active Cards Dues</span>
            <span className="text-md sm:text-lg font-bold text-red-650 mt-1 block">
              ₹{totalCardsDue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">Projected Monthly Savings</span>
            <span className="text-md sm:text-lg font-bold text-emerald-650 mt-1 block">
              ₹{monthlySavings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
