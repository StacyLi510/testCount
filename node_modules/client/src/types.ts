export type RecordType = 'income' | 'expense';

export interface RecordItem {
  id: number;
  type: RecordType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
  createdAt: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface RecordInput {
  type: RecordType;
  amount: number;
  category: string;
  date: string;
  note: string;
}
