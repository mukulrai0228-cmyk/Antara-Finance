export type TransactionType = 'Spent' | 'Borrowed' | 'Give' | 'Received';

export type TransactionCategory =
  | 'Food'
  | 'Petrol'
  | 'Bills'
  | 'Family'
  | 'Friends'
  | 'Shopping'
  | 'Insurance'
  | 'EMI'
  | 'Health'
  | 'Travel'
  | 'Entertainment'
  | 'Relationship'
  | 'Personal';

export type TransactionTag =
  | 'Need'
  | 'Want'
  | 'Future Saving'
  | 'Emergency'
  | 'Lifestyle'
  | 'Family'
  | 'Personal'
  | 'Investment';

export type PaymentMethodType = 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  tags: TransactionTag[];
  paymentMethod: PaymentMethodType;
  notes?: string;
  date: string; // YYYY-MM-DD
  personName?: string; // Linked person name
  expectedReturnDate?: string; // YYYY-MM-DD for debts
  isSettled?: boolean; // For debts (Borrowed/Give)
  cardId?: string; // Links to credit card if paid using CC or CC bill payment
  vehicleId?: string; // Links to vehicle
}

export interface Person {
  id: string;
  name: string;
  phone?: string;
}

export type CardStatus = 'Paid' | 'Pending' | 'Upcoming';

export interface CreditCard {
  id: string;
  cardName: string;
  bankName: string;
  dueDate: number; // day of the month (e.g. 15)
  creditLimit: number;
  currentDue: number;
  status: CardStatus;
}

export type VehicleType = 'Bike' | 'Car';

export type VehicleExpenseType =
  | 'Petrol'
  | 'Service'
  | 'Insurance'
  | 'Challan'
  | 'Repairs'
  | 'Accessories';

export interface Vehicle {
  id: string;
  type: VehicleType;
  name: string;
  registrationNumber?: string;
}

export interface VehicleExpense {
  id: string;
  vehicleId: string;
  type: VehicleExpenseType;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  mileage?: number; // Optional mileage tracker for fuel logs
}

export interface UserProfile {
  fullName: string;
  companyName: string;
  monthlySalary: number;
  salaryCreditDate: number; // day of the month
  mainPaymentMethod: PaymentMethodType;
  hasCompletedOnboarding: boolean;
  email?: string;
  avatarUrl?: string;
}

export interface CardPaymentHistory {
  id: string;
  cardId: string;
  amount: number;
  date: string;
  notes?: string;
}
