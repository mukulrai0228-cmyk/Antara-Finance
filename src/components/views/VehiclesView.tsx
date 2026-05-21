'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { VehicleType, VehicleExpenseType, Vehicle } from '../../types';

export const VehiclesView: React.FC = () => {
  const { 
    vehicles, 
    vehicleExpenses, 
    addVehicle, 
    deleteVehicle, 
    updateVehicle, 
    addVehicleExpense, 
    deleteVehicleExpense 
  } = useFinance();

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [vehName, setVehName] = useState('');
  const [vehType, setVehType] = useState<VehicleType>('Car');
  const [regNum, setRegNum] = useState('');

  const [isLogExpenseOpen, setIsLogExpenseOpen] = useState(false);
  const [selectedVehId, setSelectedVehId] = useState('');
  const [expType, setExpType] = useState<VehicleExpenseType>('Petrol');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');
  const [expMileage, setExpMileage] = useState('');

  // Edit vehicle states
  const [isEditVehicleOpen, setIsEditVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editVehName, setEditVehName] = useState('');
  const [editVehType, setEditVehType] = useState<VehicleType>('Car');
  const [editRegNum, setEditRegNum] = useState('');

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
    const amountVal = parseFloat(expAmount);
    if (!selectedVehId || isNaN(amountVal) || amountVal <= 0) return;

    addVehicleExpense({
      vehicleId: selectedVehId,
      type: expType,
      amount: amountVal,
      date: expDate,
      notes: expNotes || undefined,
      mileage: expType === 'Petrol' && expMileage ? parseFloat(expMileage) : undefined,
    });

    setExpAmount('');
    setExpNotes('');
    setExpMileage('');
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
            
            // Get latest mileage
            const petrolLogs = vehExps.filter((ve) => ve.type === 'Petrol' && ve.mileage);
            const latestMileage = petrolLogs.length > 0 ? petrolLogs[0].mileage : undefined;

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
                      onClick={() => deleteVehicle(veh.id)}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                      title="Remove Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Substats */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-center">
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
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">
                      Mileage Log
                    </span>
                    <span className="text-xs font-bold text-blue-650 mt-0.5 flex items-center justify-center gap-0.5">
                      <Gauge className="w-3.5 h-3.5 text-blue-500" />
                      {latestMileage ? `${latestMileage} km` : '--'}
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
                        {ve.mileage && (
                          <span className="bg-slate-100 text-[9px] px-1.5 rounded-full font-semibold text-slate-500">
                            {ve.mileage} km reading
                          </span>
                        )}
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
                      onClick={() => deleteVehicleExpense(ve.id)}
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 animate-slide-up relative">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-md font-bold text-slate-805">Log Vehicle Expense</h3>
              <button
                onClick={() => setIsLogExpenseOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleLogExpense} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Select Vehicle
                </label>
                <select
                  value={selectedVehId}
                  onChange={(e) => setSelectedVehId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Expense Type
                  </label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value as VehicleExpenseType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Service">Service</option>
                    <option value="Repairs">Repairs</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Challan">Challan</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              {/* Only show mileage field for Petrol logs */}
              {expType === 'Petrol' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Current Mileage (km reading - Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 15420"
                    value={expMileage}
                    onChange={(e) => setExpMileage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. HP Petrol Pump, oil change"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-[10px] text-blue-800">
                💡 Logging a vehicle expense automatically updates your general transactions ledger, keeping monthly charts in sync.
              </div>

              <button
                type="submit"
                onClick={(e) => {
                  // Let's manually trigger log submit helper since we have that.
                  // Wait, onSubmit of the form is already handled, let's keep it simple!
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all mt-4"
              >
                Confirm Expense
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
