'use client';

import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingDown,
  TrendingUp,
  Award,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Utensils,
  Fuel,
  FileText,
  ShoppingBag,
  CreditCard,
  HeartPulse,
  Flame,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const AnalogClock: React.FC = () => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-slate-400 animate-pulse" />
      </div>
    );
  }

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // angles
  const hrAngle = (hours % 12) * 30 + minutes * 0.5;
  const minAngle = minutes * 6;
  const secAngle = seconds * 6;

  return (
    <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center relative hover:scale-105 transition-all duration-300">
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
        <circle cx="50" cy="15" r="1.5" className="fill-slate-300 dark:fill-slate-700" />
        <circle cx="85" cy="50" r="1.5" className="fill-slate-300 dark:fill-slate-700" />
        <circle cx="50" cy="85" r="1.5" className="fill-slate-300 dark:fill-slate-700" />
        <circle cx="15" cy="50" r="1.5" className="fill-slate-300 dark:fill-slate-700" />
        
        {/* Hour */}
        <line
          x1="50"
          y1="50"
          x2={50 + 22 * Math.cos((hrAngle * Math.PI) / 180)}
          y2={50 + 22 * Math.sin((hrAngle * Math.PI) / 180)}
          className="stroke-slate-800 dark:stroke-slate-100"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Minute */}
        <line
          x1="50"
          y1="50"
          x2={50 + 32 * Math.cos((minAngle * Math.PI) / 180)}
          y2={50 + 32 * Math.sin((minAngle * Math.PI) / 180)}
          className="stroke-slate-500 dark:stroke-slate-400"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Second */}
        <line
          x1="50"
          y1="50"
          x2={50 + 36 * Math.cos((secAngle * Math.PI) / 180)}
          y2={50 + 36 * Math.sin((secAngle * Math.PI) / 180)}
          stroke="#2563eb"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="3" fill="#2563eb" />
      </svg>
    </div>
  );
};

const CalendarWidget: React.FC = () => {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(new Date());
  }, []);

  if (!date) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  return (
    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-between overflow-hidden hover:scale-105 transition-all duration-300">
      <div className="w-full bg-blue-600 dark:bg-blue-750 text-white text-[9px] font-extrabold py-0.5 text-center uppercase tracking-widest leading-none">
        {monthName}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <span className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">
          {dayNum}
        </span>
      </div>
      <div className="w-full text-center text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase pb-1 tracking-wider leading-none">
        {dayName}
      </div>
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const {
    user,
    transactions,
    financialScore,
    financialScoreLabel,
    financialScoreColor,
    currentMonth,
    cards,
    darkMode,
  } = useFinance();

  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    setMounted(true);
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good Morning');
    else if (hr < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Filter current month's transactions
  const today = new Date();
  const curYear = today.getFullYear();
  const MONTH_MAP: { [key: string]: string } = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };
  const curMonthIndex = MONTH_MAP[currentMonth] || String(today.getMonth() + 1).padStart(2, '0');
  const monthPrefix = `${curYear}-${curMonthIndex}`;

  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(monthPrefix));

  // Compute stats
  const monthlySalary = user?.monthlySalary || 0;
  const totalMonthlySpend = currentMonthTransactions
    .filter((t) => t.type === 'Spent')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalMonthlyReceived = currentMonthTransactions
    .filter((t) => t.type === 'Received')
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingSalary = monthlySalary + totalMonthlyReceived - totalMonthlySpend;
  const weeklySpend = totalMonthlySpend / 4.3; // Average weekly spend

  // Category Icon Map helper
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Food': return <Utensils className="w-4 h-4 text-blue-500" />;
      case 'Petrol': return <Fuel className="w-4 h-4 text-amber-500" />;
      case 'Bills': return <FileText className="w-4 h-4 text-red-500" />;
      case 'Shopping': return <ShoppingBag className="w-4 h-4 text-pink-500" />;
      case 'EMI': return <CreditCard className="w-4 h-4 text-purple-500" />;
      case 'Health': return <HeartPulse className="w-4 h-4 text-emerald-500" />;
      default: return <Wallet className="w-4 h-4 text-slate-500" />;
    }
  };

  // Pie chart data: categories breakdown
  const categoryTotals: { [key: string]: number } = {};
  currentMonthTransactions
    .filter((t) => t.type === 'Spent')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const categoryColors: { [key: string]: string } = {
    Food: '#3b82f6',     // Blue
    Petrol: '#f59e0b',   // Amber
    Bills: '#ef4444',    // Red
    Shopping: '#ec4899', // Pink
    EMI: '#8b5cf6',      // Purple
    Health: '#06b6d4',   // Cyan
    Travel: '#10b981',   // Emerald
    Personal: '#6366f1', // Indigo
    Family: '#14b8a6',   // Teal
    Relationship: '#f43f5e', // Rose
    Entertainment: '#a855f7', // Purple light
    Insurance: '#64748b' // Slate
  };

  const chartData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
    color: categoryColors[cat] || '#94a3b8',
  }));

  // Line chart data: weekly trends (split into weeks 1-4)
  const getWeeklyTrendData = () => {
    const weeklySums = [0, 0, 0, 0];
    currentMonthTransactions
      .filter((t) => t.type === 'Spent')
      .forEach((t) => {
        const day = parseInt(t.date.split('-')[2]) || 1;
        if (day <= 7) weeklySums[0] += t.amount;
        else if (day <= 14) weeklySums[1] += t.amount;
        else if (day <= 21) weeklySums[2] += t.amount;
        else weeklySums[3] += t.amount;
      });
    return [
      { name: 'Week 1', Spent: weeklySums[0] },
      { name: 'Week 2', Spent: weeklySums[1] },
      { name: 'Week 3', Spent: weeklySums[2] },
      { name: 'Week 4', Spent: weeklySums[3] },
    ];
  };
  const lineChartData = getWeeklyTrendData();

  // Smart Insights generator
  const generateInsights = () => {
    const insights = [];
    // Insight 1: Savings Ratio
    if (remainingSalary > monthlySalary * 0.4) {
      insights.push({
        type: 'success',
        text: 'Your savings ratio is above 40%! You are building high wealth security.',
      });
    } else if (remainingSalary < monthlySalary * 0.1) {
      insights.push({
        type: 'warning',
        text: 'Remaining budget is under 10%. Consider postponing lifestyle buys.',
      });
    } else {
      insights.push({
        type: 'neutral',
        text: 'Your monthly spending is well within standard limits.',
      });
    }

    // Insight 2: Category highlights
    const foodSum = categoryTotals['Food'] || 0;
    if (foodSum > monthlySalary * 0.25) {
      insights.push({
        type: 'warning',
        text: 'Food & Dining out has crossed 25% of your income. Home meals can save ₹3,000+.',
      });
    } else {
      insights.push({
        type: 'success',
        text: 'Food spending looks controlled and healthy this month.',
      });
    }

    // Insight 3: Credit Card checks
    const pendingCC = cards.filter((c) => c.status === 'Pending');
    if (pendingCC.length > 0) {
      insights.push({
        type: 'warning',
        text: `You have ${pendingCC.length} pending Credit Card dues. Pay them before due dates to protect your credit.`,
      });
    } else {
      insights.push({
        type: 'success',
        text: 'Credit card bill payments are fully under control.',
      });
    }

    return insights;
  };

  const insightsList = generateInsights();

  // Top spending categories list sorted
  const sortedCategories = Object.keys(categoryTotals)
    .map((cat) => ({
      name: cat,
      amount: categoryTotals[cat],
      percentage: Math.round((categoryTotals[cat] / (totalMonthlySpend || 1)) * 100),
      color: categoryColors[cat] || '#64748b',
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const firstName = (user?.fullName || 'Mukul').split(' ')[0];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Welcome Heading with Widgets */}
      <div className="flex flex-row items-center justify-between gap-4 py-2 px-1 border-b border-slate-150/60 dark:border-slate-800/60 pb-5">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {greeting}, <span className="text-blue-600 dark:text-blue-500">{firstName}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold truncate">
            {remainingSalary > 0
              ? 'Your spending looks controlled this month. Keep it up!'
              : 'Remaining funds are low. Pause non-essential purchases for a few days.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <AnalogClock />
          <CalendarWidget />
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* KPI: Monthly Salary */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Budget
            </span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5">
            <p className="text-md sm:text-lg font-bold text-slate-900">
              ₹{(monthlySalary + totalMonthlyReceived).toLocaleString('en-IN')}
            </p>
            <span className="text-[9px] text-slate-400 block truncate">
              {totalMonthlyReceived > 0 
                ? `Salary: ₹${monthlySalary.toLocaleString('en-IN')} + Extra: ₹${totalMonthlyReceived.toLocaleString('en-IN')}`
                : `Salary credited Day ${user?.salaryCreditDate}`}
            </span>
          </div>
        </div>

        {/* KPI: Total Spend */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Spend
            </span>
            <ArrowUpRight className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-md sm:text-lg font-bold text-red-650">
              ₹{totalMonthlySpend.toLocaleString('en-IN')}
            </p>
            <span className="text-[9px] text-slate-400">Spent this month</span>
          </div>
        </div>

        {/* KPI: Remaining Salary */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Remaining
            </span>
            <ArrowDownRight className={`w-4 h-4 ${remainingSalary >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
          </div>
          <div className="mt-2.5">
            <p className={`text-md sm:text-lg font-bold ${remainingSalary >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ₹{remainingSalary.toLocaleString('en-IN')}
            </p>
            <span className="text-[9px] text-slate-400">Left to spend</span>
          </div>
        </div>

        {/* KPI: Weekly Spend */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Weekly Pace
            </span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5">
            <p className="text-md sm:text-lg font-bold text-slate-800">
              ₹{Math.round(weeklySpend).toLocaleString('en-IN')}
            </p>
            <span className="text-[9px] text-slate-400">Avg weekly burn</span>
          </div>
        </div>

        {/* KPI: Financial Score */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Money Score
            </span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <p className={`text-lg font-extrabold ${financialScoreColor}`}>{financialScore}</p>
            <span className="text-[9px] text-slate-400 font-semibold">/100</span>
          </div>
          <span className="text-[9px] text-slate-500 font-semibold mt-0.5 truncate">{financialScoreLabel}</span>
        </div>

      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Trend Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Weekly Spend Trend</h3>
          <div className="h-64">
            {mounted && lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: darkMode ? '#172030' : '#ffffff',
                      borderRadius: '12px',
                      border: darkMode ? '1px solid #2b3954' : '1px solid #cbd5e1',
                      color: darkMode ? '#ffffff' : '#0f172a',
                    }}
                    labelClassName="font-bold text-xs"
                    formatter={(val) => [`₹${val}`, 'Spent']}
                  />
                  <Line
                    type="monotone"
                    dataKey="Spent"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                Analyzing transactions...
              </div>
            )}
          </div>
        </div>

        {/* Categories Donut Chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Category Distribution</h3>
          <div className="flex-1 flex items-center justify-center min-h-[160px] relative">
            {mounted && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Tooltip formatter={(val) => [`₹${val}`, 'Total Spent']} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs text-center">
                {transactions.length === 0 ? 'No spend recorded yet.' : 'Loading charts...'}
              </div>
            )}
            {chartData.length > 0 && (
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-450 uppercase">Total Spend</span>
                <span className="text-sm font-extrabold text-slate-800">
                  ₹{totalMonthlySpend.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Color legends grid */}
          <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-600">
            {chartData.slice(0, 4).map((data, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                <span className="truncate">{data.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row: Recent Transactions & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
            <span className="text-xs font-semibold text-blue-650 cursor-pointer">View All</span>
          </div>

          <div className="space-y-3.5 flex-1 max-h-[300px] overflow-y-auto pr-1">
            {currentMonthTransactions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs py-8">
                No transactions recorded this month.
              </div>
            ) : (
              currentMonthTransactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {tx.notes || tx.category}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400">{tx.date}</span>
                        {tx.tags.slice(0, 1).map((tag) => (
                          <span
                            key={tag}
                            className="text-[8px] font-bold text-blue-650 bg-blue-50/50 px-1.5 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-xs font-extrabold ${
                      tx.type === 'Received' ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                      {tx.type === 'Received' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[9px] text-slate-450">{tx.paymentMethod}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Smart Financial Insights & Top Categories Column */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3.5">Smart Insights</h3>
            <div className="space-y-3">
              {insightsList.map((ins, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl flex items-start gap-2.5 text-[11px] leading-relaxed border ${
                    ins.type === 'success'
                      ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                      : ins.type === 'warning'
                      ? 'bg-amber-50/50 border-amber-100 text-amber-800'
                      : 'bg-blue-50/30 border-blue-100 text-blue-800'
                  }`}
                >
                  {ins.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : ins.type === 'warning' ? (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <Flame className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <span>{ins.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Top Expenses
            </h4>
            <div className="space-y-2.5">
              {sortedCategories.map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{c.name}</span>
                    <span>₹{c.amount.toLocaleString('en-IN')} ({c.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-150 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              ))}
              {sortedCategories.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">No category spends yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
