'use client';

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  User,
  Building,
  Calendar,
  CreditCard as CardIcon,
  Car as CarIcon,
  Bike as BikeIcon,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PaymentMethodType } from '../types';

export const OnboardingFlow: React.FC = () => {
  const { user, completeOnboarding } = useFinance();
  const [step, setStep] = useState(1);

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [companyName, setCompanyName] = useState('');
  const [monthlySalary, setMonthlySalary] = useState<string>('75000');
  const [salaryCreditDate, setSalaryCreditDate] = useState<number>(1);
  const [mainPaymentMethod, setMainPaymentMethod] = useState<PaymentMethodType>('UPI');

  // Cards
  const [cardsList, setCardsList] = useState<{ cardName: string; bankName: string; creditLimit: number; dueDate: number }[]>([]);
  const [newCardName, setNewCardName] = useState('');
  const [newCardBank, setNewCardBank] = useState('');
  const [newCardLimit, setNewCardLimit] = useState('');
  const [newCardDueDate, setNewCardDueDate] = useState<string>('15');

  // Vehicles
  const [vehiclesList, setVehiclesList] = useState<{ type: 'Car' | 'Bike'; name: string }[]>([]);
  const [newVehicleType, setNewVehicleType] = useState<'Car' | 'Bike'>('Car');
  const [newVehicleName, setNewVehicleName] = useState('');

  const addCard = () => {
    if (!newCardName || !newCardBank || !newCardLimit) return;
    setCardsList([
      ...cardsList,
      {
        cardName: newCardName,
        bankName: newCardBank,
        creditLimit: parseFloat(newCardLimit) || 50000,
        dueDate: parseInt(newCardDueDate) || 15,
      },
    ]);
    setNewCardName('');
    setNewCardBank('');
    setNewCardLimit('');
    setNewCardDueDate('15');
  };

  const removeCard = (idx: number) => {
    setCardsList(cardsList.filter((_, i) => i !== idx));
  };

  const addVehicle = () => {
    if (!newVehicleName) return;
    setVehiclesList([
      ...vehiclesList,
      {
        type: newVehicleType,
        name: newVehicleName,
      },
    ]);
    setNewVehicleName('');
  };

  const removeVehicle = (idx: number) => {
    setVehiclesList(vehiclesList.filter((_, i) => i !== idx));
  };

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    const salaryVal = parseFloat(monthlySalary) || 0;
    completeOnboarding(
      {
        fullName,
        companyName,
        monthlySalary: salaryVal,
        salaryCreditDate,
        mainPaymentMethod,
      },
      cardsList,
      vehiclesList
    );
  };

  // Calculations for summary step
  const salaryNum = parseFloat(monthlySalary) || 0;
  const estimatedSavingsGoal = Math.round(salaryNum * 0.3); // 30% savings recommendation
  const estimatedBudget = salaryNum - estimatedSavingsGoal;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-50/70 blur-3xl -z-10" />
      <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-slate-100 blur-3xl -z-10" />

      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-10 relative">
        {/* Progress bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-2">
              <span>STEP {step} OF 4</span>
              <span>{Math.round(((step - 1) / 3) * 100)}% COMPLETE</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Basic Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Getting Started
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-3">Let's get to know you</h2>
              <p className="text-sm text-slate-500 mt-1">
                We'll customize your dashboard based on these details.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Where do you work?
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name (e.g. TCS, Google)"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Salary & Preferences */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Financials
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-3">Monthly Income Details</h2>
              <p className="text-sm text-slate-500 mt-1">
                We'll calculate your budgets using your monthly salary.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Monthly Take-Home Salary (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    placeholder="e.g. 100000"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Salary Credit Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={salaryCreditDate}
                      onChange={(e) => setSalaryCreditDate(parseInt(e.target.value))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 focus:outline-none focus:border-blue-500 transition-all appearance-none font-medium text-sm"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          Day {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Main Payment Method
                  </label>
                  <select
                    value={mainPaymentMethod}
                    onChange={(e) => setMainPaymentMethod(e.target.value as PaymentMethodType)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 focus:outline-none focus:border-blue-500 transition-all font-medium text-sm"
                  >
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Credit Cards */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Credit Cards
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-3">Do you use Credit Cards?</h2>
              <p className="text-sm text-slate-500 mt-1">
                We'll track your billing cycles and limits to prevent overspending.
              </p>
            </div>

            {/* Existing lists */}
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {cardsList.map((card, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <CardIcon className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        {card.bankName} {card.cardName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Limit: ₹{card.creditLimit.toLocaleString('en-IN')} | Due: Day {card.dueDate}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCard(i)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Card Form */}
            <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-200/50 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                Add Active Card
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Bank Name (e.g. HDFC)"
                  value={newCardBank}
                  onChange={(e) => setNewCardBank(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Card Name (e.g. Millennia)"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Credit Limit (₹)"
                  value={newCardLimit}
                  onChange={(e) => setNewCardLimit(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                />
                <select
                  value={newCardDueDate}
                  onChange={(e) => setNewCardDueDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-700 font-medium"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      Due: Day {day}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addCard}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Card
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Vehicles */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Vehicles
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-3">Vehicles Owned</h2>
              <p className="text-sm text-slate-500 mt-1">
                Do you own a car or bike? We'll log fuel, service, and insurance dues.
              </p>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {vehiclesList.map((vehicle, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    {vehicle.type === 'Car' ? (
                      <CarIcon className="w-5 h-5 text-blue-500" />
                    ) : (
                      <BikeIcon className="w-5 h-5 text-blue-500" />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{vehicle.name}</h4>
                      <p className="text-[11px] text-slate-400 capitalize">{vehicle.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeVehicle(i)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add form */}
            <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-200/50 flex gap-2 items-center">
              <select
                value={newVehicleType}
                onChange={(e) => setNewVehicleType(e.target.value as 'Car' | 'Bike')}
                className="px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Car">🚗 Car</option>
                <option value="Bike">🏍️ Bike</option>
              </select>
              <input
                type="text"
                placeholder="Model (e.g. Honda City, Activa)"
                value={newVehicleName}
                onChange={(e) => setNewVehicleName(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-medium"
              />
              <button
                type="button"
                onClick={addVehicle}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Dynamic Financial Plan Summary */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-2">
              <Sparkles className="w-8 h-8 animate-pulse-subtle" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Your companion plan is ready!</h2>
              <p className="text-sm text-slate-500 mt-1">
                We've configured your personal finance command center, {fullName}.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 my-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Monthly Budget
                </span>
                <p className="text-md font-bold text-slate-800 mt-1">
                  ₹{estimatedBudget.toLocaleString('en-IN')}
                </p>
                <span className="text-[9px] text-slate-400">70% of pay</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Financial Score
                </span>
                <p className="text-md font-bold text-emerald-600 mt-1">100/100</p>
                <span className="text-[9px] text-emerald-500 font-semibold">Clean Slate</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Target Savings
                </span>
                <p className="text-md font-bold text-blue-600 mt-1">
                  ₹{estimatedSavingsGoal.toLocaleString('en-IN')}
                </p>
                <span className="text-[9px] text-blue-500 font-semibold">30% target</span>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-left text-xs text-blue-800 leading-relaxed">
              <strong>💡 Companion Insight:</strong> Since your salary is credited on Day{' '}
              {salaryCreditDate}, we have set your monthly budget cycle to start then. Your
              highest safety limit is set to {cardsList.length} credit card
              {cardsList.length > 1 ? 's' : ''}. Your companion is ready to track your actual transactions!
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
          {step > 1 && step < 5 ? (
            <button
              onClick={handlePrevStep}
              className="px-5 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl text-sm font-semibold transition-all hover:bg-slate-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={handleNextStep}
              disabled={step === 1 && !fullName}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
