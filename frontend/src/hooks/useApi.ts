import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, accountService, categoryService, transactionService } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import type { CreateUserCommand, CreateAccountCommand, CreateCategoryCommand, CreateTransactionCommand } from '../types';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.listUsers(),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: CreateUserCommand) => userService.createUser(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useAccounts = () => {
  const currentUserId = useAuthStore((state) => state.currentUserId);
  return useQuery({
    queryKey: ['accounts', currentUserId],
    queryFn: () => accountService.listAccounts(currentUserId || ''),
    enabled: !!currentUserId,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.currentUserId);
  return useMutation({
    mutationFn: (command: Omit<CreateAccountCommand, 'userId'>) => {
      if (!currentUserId) throw new Error('Nenhum usuário ativo selecionado.');
      return accountService.createAccount({ ...command, userId: currentUserId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', currentUserId] });
    },
  });
};

export const useCategories = () => {
  const currentUserId = useAuthStore((state) => state.currentUserId);
  return useQuery({
    queryKey: ['categories', currentUserId],
    queryFn: () => categoryService.listCategories(currentUserId || ''),
    enabled: !!currentUserId,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.currentUserId);
  return useMutation({
    mutationFn: (command: Omit<CreateCategoryCommand, 'userId'>) => {
      if (!currentUserId) throw new Error('Nenhum usuário ativo selecionado.');
      return categoryService.createCategory({ ...command, userId: currentUserId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentUserId] });
    },
  });
};

export const useTransactions = () => {
  const currentUserId = useAuthStore((state) => state.currentUserId);
  return useQuery({
    queryKey: ['transactions', currentUserId],
    queryFn: () => transactionService.listTransactions(currentUserId || ''),
    enabled: !!currentUserId,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.currentUserId);
  return useMutation({
    mutationFn: (command: Omit<CreateTransactionCommand, 'userId'>) => {
      if (!currentUserId) throw new Error('Nenhum usuário ativo selecionado.');
      return transactionService.createTransaction({ ...command, userId: currentUserId });
    },
    onSuccess: () => {
      // Invalidate both transactions and accounts since balance changes on transaction create!
      queryClient.invalidateQueries({ queryKey: ['transactions', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['accounts', currentUserId] });
    },
  });
};
