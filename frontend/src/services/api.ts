import { apiClient } from './apiClient';
import type { 
  UserView, 
  CreateUserCommand, 
  AccountView, 
  CreateAccountCommand, 
  CategoryView, 
  CreateCategoryCommand, 
  TransactionView, 
  CreateTransactionCommand 
} from '../types';

export const userService = {
  createUser: async (command: CreateUserCommand): Promise<UserView> => {
    const response = await apiClient.post<UserView>('users', command);
    return response.data;
  },
  
  listUsers: async (): Promise<UserView[]> => {
    const response = await apiClient.get<UserView[]>('users');
    return response.data;
  }
};

export const accountService = {
  createAccount: async (command: CreateAccountCommand): Promise<AccountView> => {
    const response = await apiClient.post<AccountView>('accounts', command);
    return response.data;
  },
  
  listAccounts: async (userId: string): Promise<AccountView[]> => {
    const response = await apiClient.get<AccountView[]>('accounts', {
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data;
  },
  
  getOwnedAccount: async (id: string, userId: string): Promise<AccountView> => {
    const response = await apiClient.get<AccountView>(`accounts/${id}`, {
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data;
  }
};

export const categoryService = {
  createCategory: async (command: CreateCategoryCommand): Promise<CategoryView> => {
    const response = await apiClient.post<CategoryView>('categories', command);
    return response.data;
  },
  
  listCategories: async (userId: string): Promise<CategoryView[]> => {
    const response = await apiClient.get<CategoryView[]>('categories', {
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data;
  }
};

export const transactionService = {
  createTransaction: async (command: CreateTransactionCommand): Promise<TransactionView> => {
    const response = await apiClient.post<TransactionView>('transactions', command);
    return response.data;
  },
  
  listTransactions: async (userId: string): Promise<TransactionView[]> => {
    const response = await apiClient.get<TransactionView[]>('transactions', {
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data;
  }
};
