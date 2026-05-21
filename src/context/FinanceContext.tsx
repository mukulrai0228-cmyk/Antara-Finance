'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  CreditCard,
  Vehicle,
  VehicleExpense,
  UserProfile,
  CardPaymentHistory,
  TransactionCategory,
  TransactionTag,
  PaymentMethodType,
  Person,
  VehicleExpenseType,
  CardStatus,
  LoanEMI,
} from '../types';
import { supabase } from '../lib/supabaseClient';

interface FinanceContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  transactions: Transaction[];
  cards: CreditCard[];
  vehicles: Vehicle[];
  vehicleExpenses: VehicleExpense[];
  cardHistory: CardPaymentHistory[];
  people: Person[];
  loading: boolean;
  addPerson: (name: string, phone?: string) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  toggleSettleTransaction: (txId: string) => Promise<void>;
  login: (fullName: string, email: string) => void;
  logout: () => Promise<void>;
  completeOnboarding: (
    profile: Omit<UserProfile, 'hasCompletedOnboarding'>,
    initialCards: Omit<CreditCard, 'id' | 'currentDue' | 'status'>[],
    initialVehicles: Omit<Vehicle, 'id'>[]
  ) => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id'>, skipVehicleExpenseLog?: boolean) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCreditCard: (c: Omit<CreditCard, 'id' | 'currentDue' | 'status'>) => Promise<void>;
  payCreditCardBill: (cardId: string, amount: number, paymentMethod: PaymentMethodType) => Promise<void>;
  addVehicle: (v: Omit<Vehicle, 'id'>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  updateVehicle: (id: string, updatedFields: Omit<Vehicle, 'id'>) => Promise<void>;
  addVehicleExpense: (ve: Omit<VehicleExpense, 'id'>) => Promise<void>;
  deleteVehicleExpense: (id: string) => Promise<void>;
  financialScore: number;
  financialScoreLabel: string;
  financialScoreColor: string;
  resetAllData: () => Promise<void>;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  loans: LoanEMI[];
  addLoan: (l: Omit<LoanEMI, 'id'>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Mapping Helpers: Database (snake_case) <-> Application (camelCase)
const mapProfileFromDB = (dbProfile: any, email?: string): UserProfile => {
  return {
    fullName: dbProfile.full_name || '',
    companyName: dbProfile.company_name || '',
    monthlySalary: Number(dbProfile.monthly_salary) || 0,
    salaryCreditDate: Number(dbProfile.salary_credit_date) || 1,
    mainPaymentMethod: (dbProfile.main_payment_method as PaymentMethodType) || 'UPI',
    hasCompletedOnboarding: dbProfile.has_completed_onboarding || false,
    avatarUrl: dbProfile.avatar_url || '',
    email: email || '',
  };
};

const mapCreditCardFromDB = (dbCard: any): CreditCard => {
  return {
    id: dbCard.id,
    cardName: dbCard.card_name,
    bankName: dbCard.bank_name,
    dueDate: Number(dbCard.due_date),
    creditLimit: Number(dbCard.credit_limit),
    currentDue: Number(dbCard.current_due) || 0,
    status: (dbCard.status as CardStatus) || 'Paid',
  };
};

const mapVehicleFromDB = (dbVeh: any): Vehicle => {
  return {
    id: dbVeh.id,
    type: dbVeh.type as 'Bike' | 'Car',
    name: dbVeh.name,
    registrationNumber: dbVeh.registration_number || undefined,
  };
};

const mapVehicleExpenseFromDB = (dbVE: any): VehicleExpense => {
  return {
    id: dbVE.id,
    vehicleId: dbVE.vehicle_id,
    type: dbVE.type as VehicleExpenseType,
    amount: Number(dbVE.amount),
    date: dbVE.date,
    notes: dbVE.notes || undefined,
    mileage: dbVE.mileage ? Number(dbVE.mileage) : undefined,
  };
};

const mapCardHistoryFromDB = (dbHist: any): CardPaymentHistory => {
  return {
    id: dbHist.id,
    cardId: dbHist.card_id,
    amount: Number(dbHist.amount),
    date: dbHist.date,
    notes: dbHist.notes || undefined,
  };
};

const mapPersonFromDB = (dbPerson: any): Person => {
  return {
    id: dbPerson.id,
    name: dbPerson.name,
    phone: dbPerson.phone || undefined,
  };
};

const mapTransactionFromDB = (dbTx: any): Transaction => {
  return {
    id: dbTx.id,
    amount: Number(dbTx.amount),
    type: dbTx.type as any,
    category: dbTx.category as TransactionCategory,
    tags: (dbTx.tags || []) as TransactionTag[],
    paymentMethod: dbTx.payment_method as PaymentMethodType,
    notes: dbTx.notes || undefined,
    date: dbTx.date,
    personName: dbTx.person_name || undefined,
    expectedReturnDate: dbTx.expected_return_date || undefined,
    isSettled: dbTx.is_settled !== null && dbTx.is_settled !== undefined ? dbTx.is_settled : undefined,
    cardId: dbTx.card_id || undefined,
    vehicleId: dbTx.vehicle_id || undefined,
  };
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleExpenses, setVehicleExpenses] = useState<VehicleExpense[]>([]);
  const [cardHistory, setCardHistory] = useState<CardPaymentHistory[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [loans, setLoans] = useState<LoanEMI[]>([]);
  
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const d = new Date();
    return MONTHS[d.getMonth()];
  });

  // Fetch all data for the authenticated user from Supabase
  const fetchUserData = async (authUser: any) => {
    const userId = authUser.id;
    const email = authUser.email || '';
    setLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
      }

      if (!profileData) {
        // User has no profile record yet (needs onboarding)
        const metadata = authUser.user_metadata || {};
        const fullName = metadata.full_name || email.split('@')[0] || 'User';
        const tempUser: UserProfile = {
          fullName,
          email,
          companyName: '',
          monthlySalary: 0,
          salaryCreditDate: 1,
          mainPaymentMethod: 'UPI',
          hasCompletedOnboarding: false,
          avatarUrl: metadata.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
        };
        setUser(tempUser);
        setLoading(false);
        return;
      }

      // Profile exists! Map details
      const parsedUser = mapProfileFromDB(profileData, email);
      setUser(parsedUser);

      if (!parsedUser.hasCompletedOnboarding) {
        setLoading(false);
        return;
      }

      // 2. Fetch all other collections in parallel
      const [
        txRes,
        cardsRes,
        vehiclesRes,
        vExpensesRes,
        cardHistRes,
        peopleRes
      ] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('credit_cards').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('vehicles').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('vehicle_expenses').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('card_history').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('people').select('*').eq('user_id', userId).order('name', { ascending: true }),
      ]);

      if (txRes.error) console.error('Error fetching transactions:', txRes.error);
      if (cardsRes.error) console.error('Error fetching cards:', cardsRes.error);
      if (vehiclesRes.error) console.error('Error fetching vehicles:', vehiclesRes.error);
      if (vExpensesRes.error) console.error('Error fetching vehicle expenses:', vExpensesRes.error);
      if (cardHistRes.error) console.error('Error fetching card history:', cardHistRes.error);
      if (peopleRes.error) console.error('Error fetching people:', peopleRes.error);

      // Set mapped state
      setTransactions((txRes.data || []).map(mapTransactionFromDB));
      setCards((cardsRes.data || []).map(mapCreditCardFromDB));
      setVehicles((vehiclesRes.data || []).map(mapVehicleFromDB));
      setVehicleExpenses((vExpensesRes.data || []).map(mapVehicleExpenseFromDB));
      setCardHistory((cardHistRes.data || []).map(mapCardHistoryFromDB));
      setPeople((peopleRes.data || []).map(mapPersonFromDB));

      // Load loans/EMIs from localStorage
      const savedLoans = localStorage.getItem(`antara_loans_emis_${userId}`);
      if (savedLoans) {
        try {
          setLoans(JSON.parse(savedLoans));
        } catch (err) {
          console.error('Error parsing saved loans:', err);
          setLoans([]);
        }
      } else {
        setLoans([]);
      }
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auth Listener
  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (active) {
          setAuthUserId(session.user.id);
          setIsAuthenticated(true);
          await fetchUserData(session.user);
        }
      } else {
        if (active) {
          setAuthUserId(null);
          setIsAuthenticated(false);
          setUser(null);
          setTransactions([]);
          setCards([]);
          setVehicles([]);
          setVehicleExpenses([]);
          setCardHistory([]);
          setPeople([]);
          setLoans([]);
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = (fullName: string, email: string) => {
    // Legacy support: Auth is now handled directly by signInWithOAuth
    console.log('Login stub called for:', fullName, email);
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during signout:', err);
      setLoading(false);
    }
  };

  const resetAllData = async () => {
    if (!authUserId) return;
    try {
      setLoading(true);
      // Wipe user records from all DB tables (keeping the auth user account intact)
      await Promise.all([
        supabase.from('transactions').delete().eq('user_id', authUserId),
        supabase.from('vehicle_expenses').delete().eq('user_id', authUserId),
        supabase.from('vehicles').delete().eq('user_id', authUserId),
        supabase.from('card_history').delete().eq('user_id', authUserId),
        supabase.from('credit_cards').delete().eq('user_id', authUserId),
        supabase.from('people').delete().eq('user_id', authUserId),
        supabase.from('profiles').delete().eq('id', authUserId),
      ]);
      localStorage.removeItem(`antara_loans_emis_${authUserId}`);
      setLoans([]);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error resetting all database data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = async (name: string, phone?: string) => {
    if (!authUserId) return;
    if (people.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;

    try {
      const { data, error } = await supabase
        .from('people')
        .insert({
          user_id: authUserId,
          name,
          phone: phone || null,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setPeople((prev) => [...prev, mapPersonFromDB(data)]);
      }
    } catch (err) {
      console.error('Error adding contact:', err);
    }
  };

  const deletePerson = async (id: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPeople((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const toggleSettleTransaction = async (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    const newSettled = !tx.isSettled;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({ is_settled: newSettled })
        .eq('id', txId);

      if (error) throw error;

      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, isSettled: newSettled } : t))
      );
    } catch (err) {
      console.error('Error toggling settle transaction:', err);
    }
  };

  const completeOnboarding = async (
    profile: Omit<UserProfile, 'hasCompletedOnboarding'>,
    initialCards: Omit<CreditCard, 'id' | 'currentDue' | 'status'>[],
    initialVehicles: Omit<Vehicle, 'id'>[]
  ) => {
    if (!authUserId) return;

    try {
      setLoading(true);
      const alreadyCompleted = user?.hasCompletedOnboarding;

      const avatarUrl = user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.fullName}`;

      // 1. Update/Upsert profile record
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUserId,
          full_name: profile.fullName,
          company_name: profile.companyName,
          monthly_salary: profile.monthlySalary,
          salary_credit_date: profile.salaryCreditDate,
          main_payment_method: profile.mainPaymentMethod,
          has_completed_onboarding: true,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // If already completed onboarding, this is just a profile details update from SettingsView
      if (alreadyCompleted) {
        setUser(mapProfileFromDB(profileData, user?.email));
        setLoading(false);
        return;
      }

      // If it's a first time onboarding, initialize user configurations
      // 2. Initialize Cards
      const cardsToInsert = initialCards.map((card) => ({
        user_id: authUserId,
        card_name: card.cardName,
        bank_name: card.bankName,
        due_date: card.dueDate,
        credit_limit: card.creditLimit,
        current_due: 0,
        status: 'Paid',
      }));
      const { data: cardsData, error: cardsError } = await supabase
        .from('credit_cards')
        .insert(cardsToInsert)
        .select();

      if (cardsError) console.error('Error seeding credit cards:', cardsError);

      // 3. Initialize Vehicles
      const vehiclesToInsert = initialVehicles.map((veh) => ({
        user_id: authUserId,
        type: veh.type,
        name: veh.name,
        registration_number: veh.registrationNumber || null,
      }));
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .insert(vehiclesToInsert)
        .select();

      if (vehiclesError) console.error('Error seeding vehicles:', vehiclesError);

      const dbCards = cardsData || [];
      const dbVehicles = vehiclesData || [];

      // Commit State updates (starting completely empty for transactional registers)
      setUser(mapProfileFromDB(profileData, user?.email));
      setPeople([]);
      setCards(dbCards.map(mapCreditCardFromDB));
      setVehicles(dbVehicles.map(mapVehicleFromDB));
      setTransactions([]);
      setVehicleExpenses([]);
      setCardHistory([]);

    } catch (err) {
      console.error('Error during onboarding submission:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>, skipVehicleExpenseLog?: boolean) => {
    if (!authUserId) return;

    try {
      // 1. Insert transaction
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: authUserId,
          amount: t.amount,
          type: t.type,
          category: t.category,
          tags: t.tags,
          payment_method: t.paymentMethod,
          notes: t.notes || null,
          date: t.date,
          person_name: t.personName || null,
          expected_return_date: t.expectedReturnDate || null,
          is_settled: t.isSettled !== undefined ? t.isSettled : null,
          card_id: t.cardId || null,
          vehicle_id: t.vehicleId || null,
        })
        .select()
        .single();

      if (txError) throw txError;
      if (!txData) return;

      const mappedTx = mapTransactionFromDB(txData);
      setTransactions((prev) => [mappedTx, ...prev]);

      // 2. If CC, update card due
      if (t.paymentMethod === 'Credit Card' && t.cardId) {
        const card = cards.find((c) => c.id === t.cardId);
        if (card) {
          const newDue = card.currentDue + t.amount;
          const newStatus = newDue > card.creditLimit ? 'Pending' : card.status;

          const { error: cardError } = await supabase
            .from('credit_cards')
            .update({ current_due: newDue, status: newStatus })
            .eq('id', t.cardId);

          if (cardError) console.error('Error updating credit card due:', cardError);
          else {
            setCards((prev) =>
              prev.map((c) =>
                c.id === t.cardId ? { ...c, currentDue: newDue, status: newStatus as any } : c
              )
            );
          }
        }
      }

      // 3. If mapped to vehicle, create vehicle expense log
      if (t.vehicleId && !skipVehicleExpenseLog) {
        let vType: VehicleExpenseType = 'Petrol';
        if (t.category === 'Petrol') vType = 'Petrol';
        else if (t.category === 'Bills') vType = 'Service';
        else if (t.category === 'Insurance') vType = 'Insurance';
        else if (t.category === 'Shopping') vType = 'Accessories';
        else if (t.category === 'EMI') vType = 'Service';
        else vType = 'Repairs';

        const { data: veData, error: veError } = await supabase
          .from('vehicle_expenses')
          .insert({
            user_id: authUserId,
            vehicle_id: t.vehicleId,
            type: vType,
            amount: t.amount,
            date: t.date,
            notes: t.notes || `${vType} linked from transaction`,
          })
          .select()
          .single();

        if (veError) console.error('Error creating vehicle expense log:', veError);
        if (veData) {
          setVehicleExpenses((prev) => [mapVehicleExpenseFromDB(veData), ...prev]);
        }
      }

    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const deleteTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions((prev) => prev.filter((t) => t.id !== id));

      // Revert Credit Card balance if needed
      if (tx.paymentMethod === 'Credit Card' && tx.cardId) {
        const card = cards.find((c) => c.id === tx.cardId);
        if (card) {
          const newDue = Math.max(0, card.currentDue - tx.amount);
          const { error: cardError } = await supabase
            .from('credit_cards')
            .update({ current_due: newDue })
            .eq('id', tx.cardId);

          if (cardError) console.error('Error reverting credit card due:', cardError);
          else {
            setCards((prev) =>
              prev.map((c) => (c.id === tx.cardId ? { ...c, currentDue: newDue } : c))
            );
          }
        }
      }

      // Cascade delete matching vehicle expense if vehicleId is present
      if (tx.vehicleId) {
        const matchingVe = vehicleExpenses.find(
          (ve) =>
            ve.vehicleId === tx.vehicleId &&
            ve.amount === tx.amount &&
            ve.date === tx.date
        );
        if (matchingVe) {
          const { error: veError } = await supabase
            .from('vehicle_expenses')
            .delete()
            .eq('id', matchingVe.id);

          if (veError) console.error('Error cascade deleting vehicle expense:', veError);
          setVehicleExpenses((prev) => prev.filter((ve) => ve.id !== matchingVe.id));
        }
      }

    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const addCreditCard = async (c: Omit<CreditCard, 'id' | 'currentDue' | 'status'>) => {
    if (!authUserId) return;

    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .insert({
          user_id: authUserId,
          card_name: c.cardName,
          bank_name: c.bankName,
          due_date: c.dueDate,
          credit_limit: c.creditLimit,
          current_due: 0,
          status: 'Paid',
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCards((prev) => [...prev, mapCreditCardFromDB(data)]);
      }
    } catch (err) {
      console.error('Error adding credit card:', err);
    }
  };

  const payCreditCardBill = async (cardId: string, amount: number, paymentMethod: PaymentMethodType) => {
    if (!authUserId) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const newDue = Math.max(0, card.currentDue - amount);
    const newStatus = newDue === 0 ? 'Paid' : 'Pending';

    try {
      // 1. Update Card due balance
      const { error: cardError } = await supabase
        .from('credit_cards')
        .update({ current_due: newDue, status: newStatus })
        .eq('id', cardId);

      if (cardError) throw cardError;

      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, currentDue: newDue, status: newStatus as any } : c))
      );

      // 2. Add history entry
      const todayDateStr = new Date().toISOString().split('T')[0];
      const { data: histData, error: histError } = await supabase
        .from('card_history')
        .insert({
          user_id: authUserId,
          card_id: cardId,
          amount,
          date: todayDateStr,
          notes: `Bill payment via ${paymentMethod}`,
        })
        .select()
        .single();

      if (histError) console.error('Error saving credit card payment history:', histError);
      if (histData) {
        setCardHistory((prev) => [mapCardHistoryFromDB(histData), ...prev]);
      }

      // 3. Log spent transaction
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: authUserId,
          amount,
          type: 'Spent',
          category: 'Bills',
          tags: ['Need'],
          payment_method: paymentMethod,
          notes: `Paid ${card.bankName} ${card.cardName} Bill`,
          date: todayDateStr,
          card_id: cardId,
        })
        .select()
        .single();

      if (txError) console.error('Error logging payment transaction:', txError);
      if (txData) {
        setTransactions((prev) => [mapTransactionFromDB(txData), ...prev]);
      }

    } catch (err) {
      console.error('Error during credit card payment transaction:', err);
    }
  };

  const addVehicle = async (v: Omit<Vehicle, 'id'>) => {
    if (!authUserId) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          user_id: authUserId,
          type: v.type,
          name: v.name,
          registration_number: v.registrationNumber || null,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setVehicles((prev) => [...prev, mapVehicleFromDB(data)]);
      }
    } catch (err) {
      console.error('Error adding vehicle to garage:', err);
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setVehicleExpenses((prev) => prev.filter((ve) => ve.vehicleId !== id));
    } catch (err) {
      console.error('Error deleting vehicle:', err);
    }
  };

  const updateVehicle = async (id: string, updatedFields: Omit<Vehicle, 'id'>) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          type: updatedFields.type,
          name: updatedFields.name,
          registration_number: updatedFields.registrationNumber || null,
        })
        .eq('id', id);

      if (error) throw error;

      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
      );
    } catch (err) {
      console.error('Error updating vehicle:', err);
    }
  };

  const addVehicleExpense = async (ve: Omit<VehicleExpense, 'id'>) => {
    if (!authUserId) return;

    try {
      const { data, error } = await supabase
        .from('vehicle_expenses')
        .insert({
          user_id: authUserId,
          vehicle_id: ve.vehicleId,
          type: ve.type,
          amount: ve.amount,
          date: ve.date,
          notes: ve.notes || null,
          mileage: ve.mileage || null,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setVehicleExpenses((prev) => [mapVehicleExpenseFromDB(data), ...prev]);
      }

      // Also map this as a standard transaction in general logs
      let category: TransactionCategory = 'Petrol';
      if (ve.type === 'Service' || ve.type === 'Repairs') {
        category = 'Bills';
      } else if (ve.type === 'Insurance' || ve.type === 'Challan') {
        category = 'Insurance';
      } else if (ve.type === 'Accessories') {
        category = 'Shopping';
      }

      const vehicleObj = vehicles.find((v) => v.id === ve.vehicleId);
      const vehicleName = vehicleObj ? vehicleObj.name : 'Vehicle';

      await addTransaction({
        amount: ve.amount,
        type: 'Spent',
        category,
        tags: ['Need'],
        paymentMethod: 'UPI',
        notes: `${ve.type} for ${vehicleName} - ${ve.notes || ''}`,
        date: ve.date,
        vehicleId: ve.vehicleId,
      }, true);

    } catch (err) {
      console.error('Error adding vehicle expense:', err);
    }
  };

  const deleteVehicleExpense = async (id: string) => {
    const ve = vehicleExpenses.find((e) => e.id === id);
    if (!ve) return;

    try {
      const { error } = await supabase
        .from('vehicle_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setVehicleExpenses((prev) => prev.filter((e) => e.id !== id));

      // Cascade delete to matching transaction
      const matchingTx = transactions.find(
        (t) =>
          t.vehicleId === ve.vehicleId &&
          t.amount === ve.amount &&
          t.date === ve.date
      );

      if (matchingTx) {
        await deleteTransaction(matchingTx.id);
      }
    } catch (err) {
      console.error('Error deleting vehicle expense:', err);
    }
  };

  const addLoan = async (l: Omit<LoanEMI, 'id'>) => {
    if (!authUserId) return;
    const newLoan: LoanEMI = {
      ...l,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
    };
    const updatedLoans = [...loans, newLoan];
    setLoans(updatedLoans);
    localStorage.setItem(`antara_loans_emis_${authUserId}`, JSON.stringify(updatedLoans));
  };

  const deleteLoan = async (id: string) => {
    if (!authUserId) return;
    const updatedLoans = loans.filter((l) => l.id !== id);
    setLoans(updatedLoans);
    localStorage.setItem(`antara_loans_emis_${authUserId}`, JSON.stringify(updatedLoans));

    // Cascade delete any transactions generated by this loan/EMI
    const markerPrefix = `[loan_emi_sync:${id}:`;
    const txsToDelete = transactions.filter((t) => t.notes && t.notes.includes(markerPrefix));
    
    for (const tx of txsToDelete) {
      await deleteTransaction(tx.id);
    }
  };

  const syncRunningRef = React.useRef(false);

  // Helper to compute payment date timezone-safely
  const getPaymentDate = (startDateStr: string, monthIndex: number): string => {
    const [y, m, d] = startDateStr.split('-').map(Number);
    const startMonth = m - 1; // 0-indexed month
    const targetMonthTotal = startMonth + monthIndex;
    const targetYear = y + Math.floor(targetMonthTotal / 12);
    const targetMonth = targetMonthTotal % 12;
    const maxDaysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const targetDay = Math.min(d, maxDaysInTargetMonth);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${targetYear}-${pad(targetMonth + 1)}-${pad(targetDay)}`;
  };

  useEffect(() => {
    if (!authUserId || loading || syncRunningRef.current || loans.length === 0) return;

    const runSync = async () => {
      syncRunningRef.current = true;
      try {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const toAdd: { loan: LoanEMI; monthIndex: number; payDate: string; marker: string }[] = [];

        for (const loan of loans) {
          for (let i = 0; i < loan.tenureMonths; i++) {
            const payDate = getPaymentDate(loan.startDate, i);
            if (payDate <= todayStr) {
              const marker = `[loan_emi_sync:${loan.id}:${i}]`;
              const exists = transactions.some((t) => t.notes && t.notes.includes(marker));
              if (!exists) {
                toAdd.push({ loan, monthIndex: i, payDate, marker });
              }
            }
          }
        }

        if (toAdd.length > 0) {
          // Sort toAdd chronologically so transactions are created in order
          toAdd.sort((a, b) => a.payDate.localeCompare(b.payDate));

          for (const item of toAdd) {
            const { loan, monthIndex, payDate, marker } = item;
            
            const tag: TransactionTag = 'Need';
            const paymentMethod: PaymentMethodType = loan.cardId ? 'Credit Card' : (user?.mainPaymentMethod || 'UPI');
            const skipLog = !loan.vehicleId;

            await addTransaction({
              amount: loan.amount,
              type: 'Spent',
              category: 'EMI',
              tags: [tag],
              paymentMethod,
              notes: `${marker} ${loan.name} (${loan.subType || loan.type} Month ${monthIndex + 1}/${loan.tenureMonths})`,
              date: payDate,
              vehicleId: loan.vehicleId,
              cardId: loan.cardId,
            }, skipLog);
          }
        }
      } catch (err) {
        console.error('Error running loans/EMIs transaction sync:', err);
      } finally {
        syncRunningRef.current = false;
      }
    };

    runSync();
  }, [loans, transactions, authUserId, loading, user?.mainPaymentMethod]);

  // FINANCIAL SCORE SYSTEM
  // Savings Ratio (30%) + Budget Discipline (30%) + Credit Card Health (20%) + Savings Habit (20%)
  const calculateFinancialScore = (): { score: number; label: string; color: string } => {
    if (!user || user.monthlySalary <= 0) {
      return { score: 70, label: 'Good', color: 'text-blue-500' };
    }

    // 1. Savings Ratio (30 pts max)
    const today = new Date();
    
    const curYear = today.getFullYear();
    const curMonthIndex = String(today.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${curYear}-${curMonthIndex}`;
    
    const monthlyIncome = user.monthlySalary;
    const monthlySpent = transactions
      .filter((t) => t.date.startsWith(monthPrefix) && t.type === 'Spent')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = monthlyIncome - monthlySpent;
    const savingsRatio = savings / monthlyIncome;

    let savingsPoints = 0;
    if (savingsRatio >= 0.4) savingsPoints = 30;
    else if (savingsRatio >= 0.2) savingsPoints = 20;
    else if (savingsRatio >= 0.05) savingsPoints = 10;
    else if (savingsRatio >= 0) savingsPoints = 5;

    // 2. Budget Discipline (30 pts max)
    const weeklyBudget = monthlyIncome / 4;
    const weeklySpent = monthlySpent / 4;

    let budgetPoints = 0;
    if (weeklySpent <= weeklyBudget * 0.8) budgetPoints = 30;
    else if (weeklySpent <= weeklyBudget) budgetPoints = 20;
    else if (weeklySpent <= weeklyBudget * 1.2) budgetPoints = 10;

    // 3. Credit Card Health (20 pts max)
    let cardPoints = 20;
    if (cards.length > 0) {
      const pendingCards = cards.filter((c) => c.status === 'Pending' && c.currentDue > 0);
      if (pendingCards.length > 0) {
        cardPoints = 10;
      }
      const totalDue = cards.reduce((sum, c) => sum + c.currentDue, 0);
      const totalLimit = cards.reduce((sum, c) => sum + c.creditLimit, 0);
      if (totalLimit > 0 && (totalDue / totalLimit) > 0.5) {
        cardPoints = Math.max(0, cardPoints - 10);
      }
    }

    // 4. Savings Habit (20 pts max)
    const savingTxs = transactions.filter((t) => 
      t.tags.includes('Future Saving') || 
      t.tags.includes('Emergency') || 
      t.tags.includes('Investment')
    );
    let savingHabitPoints = 0;
    if (savingTxs.length >= 3) savingHabitPoints = 20;
    else if (savingTxs.length >= 1) savingHabitPoints = 10;

    const totalScore = Math.min(100, Math.max(10, savingsPoints + budgetPoints + cardPoints + savingHabitPoints));

    let label = 'Needs Control';
    let color = 'text-amber-500';
    if (totalScore >= 90) {
      label = 'Excellent';
      color = 'text-emerald-500';
    } else if (totalScore >= 70) {
      label = 'Good';
      color = 'text-blue-500';
    } else if (totalScore >= 50) {
      label = 'Needs Control';
      color = 'text-amber-500';
    } else {
      label = 'High Spending Pattern';
      color = 'text-red-500';
    }

    return { score: totalScore, label, color };
  };

  const { score: financialScore, label: financialScoreLabel, color: financialScoreColor } = calculateFinancialScore();

  return (
    <FinanceContext.Provider
      value={{
        user,
        isAuthenticated,
        transactions,
        cards,
        vehicles,
        vehicleExpenses,
        cardHistory,
        people,
        loading,
        addPerson,
        deletePerson,
        toggleSettleTransaction,
        login,
        logout,
        completeOnboarding,
        addTransaction,
        deleteTransaction,
        addCreditCard,
        payCreditCardBill,
        addVehicle,
        deleteVehicle,
        updateVehicle,
        addVehicleExpense,
        deleteVehicleExpense,
        financialScore,
        financialScoreLabel,
        financialScoreColor,
        resetAllData,
        currentMonth,
        setCurrentMonth,
        loans,
        addLoan,
        deleteLoan,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
