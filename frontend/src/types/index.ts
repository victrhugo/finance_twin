export interface UserPreferences {
  currency: string;
  theme: string;
  timezone: string;
}

export interface UserView {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
}

export interface CreateUserCommand {
  email: string;
  passwordHash: string;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH';
export type AccountStatus = 'ACTIVE' | 'INACTIVE';

export interface AccountView {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountCommand {
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
}

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface CategoryView {
  id: string;
  userId: string | null;
  parentCategoryId: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryCommand {
  userId: string | null;
  parentCategoryId: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  type: CategoryType;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER_IN' | 'TRANSFER_OUT';
export type TransactionOperationType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface TransactionView {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
  transferTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionCommand {
  userId: string;
  accountId: string;
  categoryId?: string | null;
  destinationAccountId?: string | null;
  operationType: TransactionOperationType;
  amount: number;
  description: string;
  transactionDate?: string | null;
}
