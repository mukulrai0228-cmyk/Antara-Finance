'use client';

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { AddExpenseModal } from './AddExpenseModal';
import {
  LayoutDashboard,
  CalendarRange,
  CreditCard,
  Car,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Plus,
  LogOut,
  Navigation,
  ChevronDown,
  Users,
} from 'lucide-react';

interface LayoutWrapperProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ activeTab, setActiveTab, children }) => {
  const { user, logout, currentMonth, setCurrentMonth } = useFinance();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: CalendarRange },
    { id: 'cards', label: 'Cards & Bills', icon: CreditCard },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'people', label: 'People & Debts', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
  ];

  const getPageTitle = () => {
    const item = menuItems.find((m) => m.id === activeTab);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Sidebar - Desktop (Fixed) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 fixed h-full z-20">
        {/* Brand Logo */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/10">
            <Navigation className="w-4 h-4 rotate-45" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-sm">Antara Finance</h1>
            <span className="text-[10px] font-semibold text-blue-600 block mt-[-2px]">MONEY COMPANION</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=Mukul`}
              alt="User Avatar"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">{user?.fullName}</h4>
              <p className="text-[10px] text-slate-450 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-red-50 hover:text-red-650 rounded-xl text-slate-400 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Sidebar - Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col transform transition-transform duration-300 lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Navigation className="w-4 h-4 rotate-45" />
            </div>
            <h1 className="font-bold text-slate-900 text-sm">Antara Finance</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-450"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatarUrl}
              alt="User"
              className="w-10 h-10 rounded-full bg-white border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">{user?.fullName}</h4>
              <p className="text-[10px] text-slate-450 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-red-50 hover:text-red-550 rounded-xl text-slate-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Main Workspace Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-250/60 hover:bg-slate-50 text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-md sm:text-lg font-bold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h2>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Current Month Selector */}
            <div className="relative">
              <button
                onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all"
              >
                <span>{currentMonth} 2026</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-450" />
              </button>
              {isMonthDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 py-1 grid grid-cols-2 p-1 gap-1">
                  {MONTHS.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setCurrentMonth(m);
                        setIsMonthDropdownOpen(false);
                      }}
                      className={`px-2 py-1.5 rounded-xl text-center text-xs font-semibold ${
                        currentMonth === m
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Expense */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 relative transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-250 rounded-2xl shadow-xl z-50 py-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark all read</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    <div className="p-3.5 hover:bg-slate-50 text-xs">
                      <p className="font-semibold text-slate-800">Salary Credited!</p>
                      <p className="text-slate-450 text-[10px] mt-0.5">Your monthly salary of ₹{user?.monthlySalary.toLocaleString('en-IN')} has been added to dashboard analytics.</p>
                    </div>
                    <div className="p-3.5 hover:bg-slate-50 text-xs">
                      <p className="font-semibold text-slate-800">Credit Card Bill Due</p>
                      <p className="text-slate-450 text-[10px] mt-0.5">Your HDFC Card payment of is upcoming. Avoid late fees by paying from the Cards tab.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User profile dropdown - mobile / quick logout */}
            <div className="relative lg:hidden">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 overflow-hidden"
              >
                <img src={user?.avatarUrl} alt="User Avatar" />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 py-2 px-1">
                  <div className="px-3 py-2 border-b border-slate-100 text-xs">
                    <p className="font-bold text-slate-850 truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-red-500 hover:bg-red-50 mt-1 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Inner Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Quick Add Expense Modal Dialog */}
      <AddExpenseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
