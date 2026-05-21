'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Car,
  Bike,
  Plus,
  Trash2,
  Edit2,
  Fuel,
  Wrench,
  ShieldCheck,
  CreditCard,
  Navigation,
  Compass,
  Gauge,
  Sparkles,
  AlertCircle,
  X,
  ChevronDown,
  Calendar as CalIcon,
} from 'lucide-react';
import { VehicleType, VehicleExpenseType, Vehicle } from '../../types';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';

export const VehiclesView: React.FC = () => {
  const { 
    vehicles, 
    vehicleExpenses, 
    addVehicle, 
    deleteVehicle, 
    updateVehicle, 
    addVehicleExpense, 
    deleteVehicleExpense,
    loans,
    addLoan,
    deleteLoan
  } = useFinance();

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [vehName, setVehName] = useState('');
  const [vehType, setVehType] = useState<VehicleType>('Car');
  const [regNum, setRegNum] = useState('');

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'vehicle' | 'expense' | 'loan' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');

  const [isLogExpenseOpen, setIsLogExpenseOpen] = useState(false);
  const [selectedVehId, setSelectedVehId] = useState('');
  const [expType, setExpType] = useState<VehicleExpenseType>('Petrol');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');

  // Edit vehicle states
  const [isEditVehicleOpen, setIsEditVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editVehName, setEditVehName] = useState('');
  const [editVehType, setEditVehType] = useState<VehicleType>('Car');
  const [editRegNum, setEditRegNum] = useState('');

  // Loan & EMI states
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [loanName, setLoanName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanInterest, setLoanInterest] = useState('');
  const [loanStartDate, setLoanStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loanTenure, setLoanTenure] = useState('1 Year');
  const [loanCustomMonths, setLoanCustomMonths] = useState('');
  const [loanEndDate, setLoanEndDate] = useState('');
  const [loanVehicleId, setLoanVehicleId] = useState('');
  const [loanSubType, setLoanSubType] = useState('Car Loan');

  // Helper to compute payment date timezone-safely
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

  useEffect(() => {
    if (isAddLoanOpen && vehicles.length > 0 && !loanVehicleId) {
      setLoanVehicleId(vehicles[0].id);
    }
  }, [isAddLoanOpen, vehicles, loanVehicleId]);

  // Auto calculate loan end date
  useEffect(() => {
    if (!loanStartDate) return;

    let months = 12;
    if (loanTenure === '3 Month') months = 3;
    else if (loanTenure === '6 Month') months = 6;
    else if (loanTenure === '1 Year') months = 12;
    else if (loanTenure === '2 Year') months = 24;
    else if (loanTenure === '3 Year') months = 36;
    else if (loanTenure === '4 Year') months = 48;
    else if (loanTenure === '5 Year') months = 60;
    else if (loanTenure === 'Custom') {
      months = parseInt(loanCustomMonths) || 0;
    }

    if (months <= 0) {
      setLoanEndDate('');
      return;
    }

    const [y, m, d] = loanStartDate.split('-').map(Number);
    const startMonth = m - 1;
    const targetMonthTotal = startMonth + months;
    const targetYear = y + Math.floor(targetMonthTotal / 12);
    const targetMonth = targetMonthTotal % 12;
    const maxDaysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const targetDay = Math.min(d, maxDaysInTargetMonth);
    const pad = (n: number) => String(n).padStart(2, '0');
    setLoanEndDate(`${targetYear}-${pad(targetMonth + 1)}-${pad(targetDay)}`);
  }, [loanStartDate, loanTenure, loanCustomMonths]);

  // Auto-reset and configure form states when popup opens
  useEffect(() => {
    if (isLogExpenseOpen) {
      const todayStr = new Date().toISOString().split('T')[0];
      setExpDate(todayStr);
      setExpAmount('');
      setExpNotes('');
      setExpType('Petrol');
      if (vehicles.length > 0) {
        setSelectedVehId(vehicles[0].id);
      } else {
        setSelectedVehId('');
      }
    }
  }, [isLogExpenseOpen, vehicles]);

  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanName || !loanAmount || !loanStartDate || !loanEndDate || !loanVehicleId) {
      alert('Please fill in all required fields and select a vehicle.');
      return;
    }

    let tenure = 12;
    if (loanTenure === '3 Month') tenure = 3;
    else if (loanTenure === '6 Month') tenure = 6;
    else if (loanTenure === '1 Year') tenure = 12;
    else if (loanTenure === '2 Year') tenure = 24;
    else if (loanTenure === '3 Year') tenure = 36;
    else if (loanTenure === '4 Year') tenure = 48;
    else if (loanTenure === '5 Year') tenure = 60;
    else if (loanTenure === 'Custom') {
      tenure = parseInt(loanCustomMonths) || 12;
    }

    try {
      await addLoan({
        type: 'Loan',
        name: loanName,
        amount: Number(loanAmount),
        interestRate: loanInterest ? Number(loanInterest) : undefined,
        tenureMonths: tenure,
        startDate: loanStartDate,
        endDate: loanEndDate,
        vehicleId: loanVehicleId,
        subType: loanSubType,
      });

      // Reset form and close
      setLoanName('');
      setLoanAmount('');
      setLoanInterest('');
      setLoanStartDate(new Date().toISOString().split('T')[0]);
      setLoanTenure('1 Year');
      setLoanCustomMonths('');
      setLoanEndDate('');
      setLoanVehicleId('');
      setLoanSubType('Car Loan');
      setIsAddLoanOpen(false);
    } catch (err) {
      console.error('Error adding vehicle loan:', err);
    }
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehName) return;

    addVehicle({
      name: vehName,
      type: vehType,
      registrationNumber: regNum || undefined,
    });

    setVehName('');
    setRegNum('');
    setIsAddVehicleOpen(false);
  };

  const handleUpdateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle || !editVehName) return;

    updateVehicle(editingVehicle.id, {
      name: editVehName,
      type: editVehType,
      registrationNumber: editRegNum || undefined,
    });

    setEditingVehicle(null);
    setEditVehName('');
    setEditRegNum('');
    setIsEditVehicleOpen(false);
  };

  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = expAmount.replace(/[^\d]/g, '');
    const amountVal = parseFloat(cleanAmount);
    if (!selectedVehId || isNaN(amountVal) || amountVal <= 0) return;

    addVehicleExpense({
      vehicleId: selectedVehId,
      type: expType,
      amount: amountVal,
      date: expDate,
      notes: expNotes || undefined,
    });

    setExpAmount('');
    setExpNotes('');
    setIsLogExpenseOpen(false);
  };

  // Compute Stats
  const today = new Date();
  const curMonthIndex = String(today.getMonth() + 1).padStart(2, '0');
  const curYear = today.getFullYear();
  const monthPrefix = `${curYear}-${curMonthIndex}`;

  const currentMonthExpenses = vehicleExpenses.filter((ve) => ve.date.startsWith(monthPrefix));

  const monthlyFuelSpend = currentMonthExpenses
    .filter((ve) => ve.type === 'Petrol')
    .reduce((sum, ve) => sum + ve.amount, 0);

  const monthlyMaintenanceSpend = currentMonthExpenses
    .filter((ve) => ['Service', 'Repairs', 'Accessories'].includes(ve.type))
    .reduce((sum, ve) => sum + ve.amount, 0);

  const getExpenseIcon = (type: VehicleExpenseType) => {
    switch (type) {
      case 'Petrol': return <Fuel className="w-4 h-4 text-amber-500" />;
      case 'Service': return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'Repairs': return <Wrench className="w-4 h-4 text-red-500" />;
      case 'Insurance': return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'Challan': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'Accessories': return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* KPI summaries specific to vehicles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">
            Fuel Spend (This Month)
          </span>
          <p className="text-md sm:text-lg font-bold text-slate-800 mt-1.5">
            ₹{monthlyFuelSpend.toLocaleString('en-IN')}
          </p>
          <span className="text-[9px] text-slate-400">Total spent on petrol</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">
            Maintenance Spend
          </span>
          <p className="text-md sm:text-lg font-bold text-slate-805 mt-1.5">
            ₹{monthlyMaintenanceSpend.toLocaleString('en-IN')}
          </p>
          <span className="text-[9px] text-slate-400">Service + Repairs + Accessories</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">
              Garage Fleet
            </span>
            <p className="text-md sm:text-lg font-bold text-slate-800 mt-0.5">
              {vehicles.length} Active
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddVehicleOpen(true)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition-all"
            >
              Add Vehicle
            </button>
            {vehicles.length > 0 && (
              <button
                onClick={() => {
                  setSelectedVehId(vehicles[0].id);
                  setIsLogExpenseOpen(true);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[10px] font-bold transition-all"
              >
                Log Expense
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Garage fleet displays */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          My Garage Fleet
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((veh) => {
            const vehExps = vehicleExpenses.filter((ve) => ve.vehicleId === veh.id);
            const fuelSum = vehExps.filter((ve) => ve.type === 'Petrol').reduce((sum, ve) => sum + ve.amount, 0);
            const maintSum = vehExps.filter((ve) => ['Service', 'Repairs', 'Accessories'].includes(ve.type)).reduce((sum, ve) => sum + ve.amount, 0);
            
            return (
              <div
                key={veh.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      {veh.type === 'Car' ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{veh.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                        {veh.registrationNumber || 'No Plate Registered'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingVehicle(veh);
                        setEditVehName(veh.name);
                        setEditVehType(veh.type);
                        setEditRegNum(veh.registrationNumber || '');
                        setIsEditVehicleOpen(true);
                      }}
                      className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition-all"
                      title="Edit Vehicle"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteType('vehicle');
                        setDeleteId(veh.id);
                        setDeleteName(veh.name);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                      title="Remove Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Substats */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">
                      Petrol
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5">
                      ₹{fuelSum.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">
                      Maintenance
                    </span>
                    <span className="text-xs font-bold text-slate-805 mt-0.5">
                      ₹{maintSum.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}

          {vehicles.length === 0 && (
            <div className="col-span-full bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 text-xs">
              No vehicles registered yet. Click "Add Vehicle" to register your Car or Bike.
            </div>
          )}
        </div>
      </div>

      {/* Active Vehicle Loans Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Active Vehicle Loans</h3>
            <p className="text-[10px] text-slate-400 font-medium">Automatic monthly EMI deductions from budget</p>
          </div>
          {vehicles.length > 0 && (
            <button
              onClick={() => {
                if (vehicles.length > 0) {
                  setLoanVehicleId(vehicles[0].id);
                }
                setIsAddLoanOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[10px] font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Loan
            </button>
          )}
        </div>

        {(!loans || loans.filter(l => l.type === 'Loan').length === 0) ? (
          <div className="text-center text-slate-450 text-xs py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            No vehicle loans added yet. {vehicles.length === 0 ? "Add a vehicle first to link a loan." : "Click 'Add Loan' to register one."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loans.filter(l => l.type === 'Loan').map((loan) => {
              const vehicle = vehicles.find((v) => v.id === loan.vehicleId);
              
              // Calculate paid months
              const calculatePaidMonths = (startDateStr: string, tenureMonths: number): number => {
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                let paid = 0;
                for (let i = 0; i < tenureMonths; i++) {
                  const payDate = getPaymentDate(loan.startDate, i);
                  if (payDate <= todayStr) {
                    paid++;
                  }
                }
                return Math.min(paid, tenureMonths);
              };

              const paidMonths = calculatePaidMonths(loan.startDate, loan.tenureMonths);
              const progressPercent = Math.min(100, Math.round((paidMonths / loan.tenureMonths) * 100));
              const remainingMonths = loan.tenureMonths - paidMonths;
              const remainingAmount = loan.amount * remainingMonths;

              return (
                <div
                  key={loan.id}
                  className="bg-slate-50/40 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {loan.subType || 'Loan'}
                        </span>
                        {vehicle && (
                          <span className="text-[10px] text-slate-450 font-bold flex items-center gap-1">
                            {vehicle.type === 'Car' ? '🚗' : '🏍️'} {vehicle.name}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{loan.name}</h4>
                    </div>

                    <button
                      onClick={() => {
                        setDeleteType('loan');
                        setDeleteId(loan.id);
                        setDeleteName(loan.name);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete Loan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide block">
                        Monthly EMI
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        ₹{loan.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide block">
                        Interest Rate
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {loan.interestRate ? `${loan.interestRate}%` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-slate-450">
                      <span>{paidMonths} / {loan.tenureMonths} Months Paid</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] pt-1 border-t border-slate-100 text-slate-450 font-medium">
                    <span>Ends: {loan.endDate}</span>
                    <span className="font-bold text-slate-700">Remaining: ₹{remainingAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent vehicle expense list */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Recent Garage Activity</h3>
        
        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {vehicleExpenses.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-8">
              No vehicle running expenses logged yet.
            </div>
          ) : (
            vehicleExpenses.map((ve) => {
              const vehicleObj = vehicles.find((v) => v.id === ve.vehicleId);
              return (
                <div key={ve.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {getExpenseIcon(ve.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {ve.type} - {vehicleObj?.name || 'Vehicle'}
                      </h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{ve.date}</span>
                        {ve.notes && <span>• {ve.notes}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        - ₹{ve.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDeleteType('expense');
                        setDeleteId(ve.id);
                        const vehicleObj = vehicles.find((v) => v.id === ve.vehicleId);
                        setDeleteName(`${ve.type} - ${vehicleObj?.name || 'Vehicle'}`);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ---------------- MODAL: Add Vehicle ---------------- */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 animate-slide-up relative">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-md font-bold text-slate-800">Register Vehicle</h3>
              <button
                onClick={() => setIsAddVehicleOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVehType('Car')}
                    className={`py-2 rounded-full text-xs font-bold border transition-all ${
                      vehType === 'Car'
                        ? 'border-blue-600 bg-blue-50 text-blue-650'
                        : 'border-slate-200 text-slate-505 hover:bg-slate-50'
                    }`}
                  >
                    🚗 Car
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehType('Bike')}
                    className={`py-2 rounded-full text-xs font-bold border transition-all ${
                      vehType === 'Bike'
                        ? 'border-blue-600 bg-blue-50 text-blue-650'
                        : 'border-slate-200 text-slate-505 hover:bg-slate-50'
                    }`}
                  >
                    🏍️ Bike
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Model / Nickname
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honda City, Pulsar 150"
                  value={vehName}
                  onChange={(e) => setVehName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Registration Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH 12 AB 1234"
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 uppercase font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all mt-4"
              >
                Save Vehicle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: Edit Vehicle ---------------- */}
      {isEditVehicleOpen && editingVehicle && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 animate-slide-up relative">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-md font-bold text-slate-800">Edit Vehicle Details</h3>
              <button
                onClick={() => {
                  setIsEditVehicleOpen(false);
                  setEditingVehicle(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpdateVehicle} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditVehType('Car')}
                    className={`py-2 rounded-full text-xs font-bold border transition-all ${
                      editVehType === 'Car'
                        ? 'border-blue-600 bg-blue-50 text-blue-650'
                        : 'border-slate-200 text-slate-505 hover:bg-slate-50'
                    }`}
                  >
                    🚗 Car
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditVehType('Bike')}
                    className={`py-2 rounded-full text-xs font-bold border transition-all ${
                      editVehType === 'Bike'
                        ? 'border-blue-600 bg-blue-50 text-blue-650'
                        : 'border-slate-200 text-slate-505 hover:bg-slate-50'
                    }`}
                  >
                    🏍️ Bike
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Model / Nickname
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honda City, Pulsar 150"
                  value={editVehName}
                  onChange={(e) => setEditVehName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Registration Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH 12 AB 1234"
                  value={editRegNum}
                  onChange={(e) => setEditRegNum(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 uppercase font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all mt-4"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: Log Vehicle Expense ---------------- */}
      {isLogExpenseOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-up relative">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-slate-100 bg-white">
              <h3 className="text-2xl font-bold text-slate-900">Log Vehicle Expense</h3>
              <button
                onClick={() => setIsLogExpenseOpen(false)}
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all focus:outline-none"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogExpense} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              
              {/* Scrollable Fields */}
              <div className="flex-grow overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
                
                {/* Select Vehicle */}
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Select Vehicle
                  </label>
                  <div className="relative">
                    <select
                      value={selectedVehId}
                      onChange={(e) => setSelectedVehId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.type})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                      <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  </div>
                </div>

                {/* Expense Type & Amount side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      Expense Type
                    </label>
                    <div className="relative">
                      <select
                        value={expType}
                        onChange={(e) => setExpType(e.target.value as VehicleExpenseType)}
                        className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Service">Service</option>
                        <option value="Repairs">Repairs</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Challan">Challan</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                        <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="₹ 2,000"
                      value={expAmount}
                      onChange={(e) => {
                        const rawVal = e.target.value;
                        if (!rawVal || rawVal === '₹' || rawVal === '₹ ') {
                          setExpAmount('');
                          return;
                        }
                        const cleanVal = rawVal.replace(/[^\d]/g, '');
                        if (!cleanVal) {
                          setExpAmount('');
                          return;
                        }
                        const num = parseInt(cleanVal, 10);
                        setExpAmount(`₹ ${num.toLocaleString('en-IN')}`);
                      }}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-bold text-base focus:outline-none focus:ring-0 border-0"
                    />
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
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full min-w-0 pl-12 pr-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                    />
                  </div>
                </div>

                {/* Remark / Notes Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Remark / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HP Petrol Pump, oil change"
                    value={expNotes}
                    onChange={(e) => setExpNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                  />
                </div>

                {/* Sync Badge */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-xs text-blue-800">
                  💡 Logging a vehicle expense automatically updates your general transactions ledger, keeping monthly charts in sync.
                </div>

              </div>

              {/* Fixed Footer Buttons */}
              <div className="border-t border-slate-100 bg-white px-6 sm:px-8 py-4 flex justify-between gap-4 z-10">
                <button
                  type="button"
                  onClick={() => setIsLogExpenseOpen(false)}
                  className="flex-1 py-3.5 border border-blue-600 hover:bg-blue-50 text-blue-600 rounded-full text-base font-semibold transition-all focus:outline-none text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-base font-semibold transition-all focus:outline-none text-center shadow-sm"
                >
                  Confirm Expense
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: Add Vehicle Loan ---------------- */}
      {isAddLoanOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-up relative">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-slate-100 bg-white">
              <h3 className="text-2xl font-bold text-slate-900">Add Vehicle Loan</h3>
              <button
                onClick={() => setIsAddLoanOpen(false)}
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all focus:outline-none"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddLoan} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              
              {/* Scrollable Fields */}
              <div className="flex-grow overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
                
                {/* Loan Name & Subtype side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      Loan Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC Car Loan"
                      value={loanName}
                      onChange={(e) => setLoanName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      Loan Type / Subtype
                    </label>
                    <div className="relative">
                      <select
                        value={loanSubType}
                        onChange={(e) => setLoanSubType(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                      >
                        <option value="Car Loan">🚗 Car Loan</option>
                        <option value="Bike Loan">🏍️ Bike Loan</option>
                        <option value="Personal Loan">👤 Personal Loan</option>
                        <option value="Other Loan">💵 Other Loan</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                        <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Select Vehicle */}
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Link to Vehicle
                  </label>
                  <div className="relative">
                    <select
                      value={loanVehicleId}
                      required
                      onChange={(e) => setLoanVehicleId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.type}) {v.registrationNumber ? `- ${v.registrationNumber}` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                      <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  </div>
                </div>

                {/* Amount & Interest side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      Monthly EMI (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 15000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-bold text-base focus:outline-none focus:ring-0 border-0 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      Interest Rate (% p.a. optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 8.5"
                      value={loanInterest}
                      onChange={(e) => setLoanInterest(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-800" />
                    <input
                      type="date"
                      required
                      value={loanStartDate}
                      onChange={(e) => setLoanStartDate(e.target.value)}
                      className="w-full min-w-0 pl-12 pr-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0"
                    />
                  </div>
                </div>

                {/* Tenure Selection & End Date Calculation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                      Tenure / Duration
                    </label>
                    <div className="relative">
                      <select
                        value={loanTenure}
                        onChange={(e) => setLoanTenure(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base appearance-none focus:outline-none focus:ring-0 border-0"
                      >
                        <option value="3 Month">3 Months</option>
                        <option value="6 Month">6 Months</option>
                        <option value="1 Year">1 Year</option>
                        <option value="2 Year">2 Years</option>
                        <option value="3 Year">3 Years</option>
                        <option value="4 Year">4 Years</option>
                        <option value="5 Year">5 Years</option>
                        <option value="Custom">Custom</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                        <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                      </div>
                    </div>
                  </div>

                  {loanTenure === 'Custom' ? (
                    <div>
                      <label className="block text-sm font-semibold text-slate-505 mb-2">
                        Custom Tenure (Months)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 18"
                        value={loanCustomMonths}
                        onChange={(e) => setLoanCustomMonths(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f3f4f6] rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 border-0 placeholder-slate-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-slate-505 mb-2">
                        Calculated End Date
                      </label>
                      <input
                        type="date"
                        disabled
                        readOnly
                        value={loanEndDate}
                        className="w-full px-4 py-3 bg-[#e5e7eb] rounded-2xl text-slate-500 font-semibold text-base border-0 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>

                {loanTenure === 'Custom' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-505 mb-2">
                      Calculated End Date
                    </label>
                    <input
                      type="date"
                      disabled
                      readOnly
                      value={loanEndDate}
                      className="w-full px-4 py-3 bg-[#e5e7eb] rounded-2xl text-slate-500 font-semibold text-base border-0 cursor-not-allowed"
                    />
                  </div>
                )}

                <div className="bg-blue-550/10 border border-blue-100 rounded-2xl p-3 text-xs text-blue-800">
                  💡 This loan will automatically generate monthly payments on your expenses timeline from {loanStartDate} until {loanEndDate || 'completion'}.
                </div>

              </div>

              {/* Fixed Footer Buttons */}
              <div className="border-t border-slate-100 bg-white px-6 sm:px-8 py-4 flex justify-between gap-4 z-10">
                <button
                  type="button"
                  onClick={() => setIsAddLoanOpen(false)}
                  className="flex-1 py-3.5 border border-blue-600 hover:bg-blue-50 text-blue-600 rounded-full text-base font-semibold transition-all focus:outline-none text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-base font-semibold transition-all focus:outline-none text-center shadow-sm"
                >
                  Save Loan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteId(null);
          setDeleteType(null);
        }}
        onConfirm={async () => {
          if (!deleteId || !deleteType) return;
          if (deleteType === 'vehicle') {
            await deleteVehicle(deleteId);
          } else if (deleteType === 'expense') {
            await deleteVehicleExpense(deleteId);
          } else if (deleteType === 'loan') {
            await deleteLoan(deleteId);
          }
        }}
        title={deleteType === 'vehicle' ? `Delete ${deleteName}` : deleteType === 'loan' ? `Delete Loan` : 'Delete this Expense'}
        message={
          deleteType === 'vehicle'
            ? `Are you sure you want to delete ${deleteName}?`
            : deleteType === 'loan'
            ? `Are you sure you want to delete the loan "${deleteName}"? This will also remove all associated auto-generated monthly expenses.`
            : 'Are you sure you want to delete this?'
        }
      />
    </div>
  );
};
