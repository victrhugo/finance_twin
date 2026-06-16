import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeftRight, Plus, AlertTriangle, Search, Calendar } from 'lucide-react';
import { useTransactions, useCreateTransaction, useAccounts, useCategories } from '../hooks/useApi';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Drawer } from '../components/ui/Drawer';

const createTransactionSchema = z.object({
  accountId: z.string().min(1, 'Conta de origem é obrigatória'),
  categoryId: z.string().optional().nullable().or(z.literal('')),
  destinationAccountId: z.string().optional().nullable().or(z.literal('')),
  operationType: z.enum(['INCOME', 'EXPENSE', 'TRANSFER'] as const),
  amount: z.coerce.number().positive('O valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição muito longa'),
  transactionDate: z.string().optional().or(z.literal('')),
});

type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

export const Transactions: React.FC = () => {
  const currentUserId = useAuthStore((state) => state.currentUserId);
  const { data: transactions, isLoading, error: fetchError } = useTransactions();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createTransactionMutation = useCreateTransaction();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema) as any,
    defaultValues: {
      operationType: 'EXPENSE',
      transactionDate: new Date().toISOString().substring(0, 16),
    }
  });

  const selectedOperationType = watch('operationType');

  const onSubmit = (data: CreateTransactionFormData) => {
    setApiError(null);
    
    const isoDate = data.transactionDate 
      ? new Date(data.transactionDate).toISOString() 
      : new Date().toISOString();

    const isTransfer = data.operationType === 'TRANSFER';

    createTransactionMutation.mutate(
      {
        accountId: data.accountId,
        categoryId: isTransfer ? null : (data.categoryId || null),
        destinationAccountId: isTransfer ? (data.destinationAccountId || null) : null,
        operationType: data.operationType,
        amount: data.amount,
        description: data.description,
        transactionDate: isoDate,
      },
      {
        onSuccess: () => {
          reset({
            accountId: data.accountId,
            categoryId: '',
            destinationAccountId: '',
            operationType: data.operationType,
            amount: 0,
            description: '',
            transactionDate: new Date().toISOString().substring(0, 16),
          });
          setIsDrawerOpen(false);
        },
        onError: (err: any) => {
          setApiError(err.message || 'Falha ao processar lançamento. Verifique o saldo ou os campos.');
        }
      }
    );
  };

  const getAccountName = (id: string) => accounts?.find(a => a.id === id)?.name || 'Conta desconhecida';
  const getCategoryName = (id: string | null) => {
    if (!id) return '-';
    return categories?.find(c => c.id === id)?.name || 'Categoria desconhecida';
  };

  const formatCurrency = (amount: number, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const accountOptions = [
    { value: '', label: '-- Selecione --' },
    ...(accounts?.map(a => ({ value: a.id, label: `${a.name} (${formatCurrency(a.balance, a.currency)})` })) || [])
  ];

  const categoryOptions = [
    { value: '', label: '-- Selecione (Opcional) --' },
    ...(categories?.filter(c => c.type === (selectedOperationType === 'INCOME' ? 'INCOME' : 'EXPENSE'))
      .map(c => ({ value: c.id, label: c.name })) || [])
  ];

  const filteredTransactions = transactions?.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAccountName(t.accountId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryName(t.categoryId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUserId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full w-20 h-20 mx-auto flex items-center justify-center border border-amber-500/20">
          <AlertTriangle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">Perfis Conectados</h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            Nenhum usuário ativo selecionado. Selecione ou crie um usuário para lançar e consultar movimentações.
          </p>
        </div>
        <a href="/users" className="inline-block mt-2 text-sm text-indigo-400 hover:underline font-semibold font-display">
          Visualizar Perfis →
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <ArrowLeftRight className="text-indigo-400" size={18} />
            Movimentações do Livro-Razão
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Histórico atômico e lançamentos financeiros em tempo real.
          </p>
        </div>
        <Button 
          variant="brand" 
          size="sm" 
          onClick={() => {
            setApiError(null);
            setIsDrawerOpen(true);
          }}
        >
          <Plus size={14} className="mr-1.5" /> Novo Lançamento
        </Button>
      </div>

      {/* Extrato Listing */}
      <Card className="glow-card premium-card-border overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-900/60">
          <div>
            <CardTitle className="text-xs uppercase tracking-widest text-zinc-400 font-display font-bold">Extrato Geral</CardTitle>
            <CardDescription className="text-[10px] text-zinc-500">Lista cronológica de entradas, saídas e transferências.</CardDescription>
          </div>
          {/* List Quick Search Input (Linear style) */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Buscar por descrição, conta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 text-xs pl-9.5 pr-4 py-2 rounded-xl focus:outline-none focus:border-zinc-700 placeholder-zinc-500 text-zinc-200"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : fetchError ? (
            <div className="p-4 text-xs text-rose-400 bg-rose-500/5 rounded-xl border border-rose-500/10 font-mono">
              Erro ao recuperar transações do servidor.
            </div>
          ) : filteredTransactions?.length === 0 ? (
            <div className="text-center py-16 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              Nenhuma movimentação registrada. Comece criando um lançamento acima!
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTransactions?.map((t) => {
                const isExpense = t.type === 'EXPENSE' || t.type === 'TRANSFER_OUT';
                const isIncome = t.type === 'INCOME' || t.type === 'TRANSFER_IN';
                const isTransfer = t.type === 'TRANSFER_IN' || t.type === 'TRANSFER_OUT';
                const displayAmount = isExpense ? -t.amount : t.amount;
                
                return (
                  <div 
                    key={t.id} 
                    className="linear-row flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isExpense 
                          ? 'bg-rose-500/5 border-rose-500/10 text-rose-400' 
                          : isIncome 
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                            : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400'
                      }`}>
                        <ArrowLeftRight size={14} />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-zinc-100 truncate">{t.description}</span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-mono bg-zinc-950 border border-zinc-800/80 px-2 py-0.5 rounded text-zinc-400">
                            {getAccountName(t.accountId)}
                          </span>
                          {isTransfer ? (
                            <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded font-mono text-indigo-400 font-bold uppercase tracking-wider">
                              Transferência
                            </span>
                          ) : (
                            <span className="text-[8px] bg-zinc-900 border border-zinc-800/60 text-zinc-400 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                              {getCategoryName(t.categoryId)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 border-zinc-900/60 pt-2.5 sm:pt-0">
                      <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1.5">
                        <Calendar size={11} className="text-zinc-600" />
                        {new Date(t.transactionDate).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className={`text-sm font-bold font-mono text-right min-w-[100px] ${
                        isExpense 
                          ? 'text-rose-400' 
                          : isIncome 
                            ? 'text-emerald-400' 
                            : 'text-white'
                      }`}>
                        {displayAmount > 0 ? '+' : ''}{formatCurrency(displayAmount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide-over Drawer for creation */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Registrar Lançamento">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <Select
            label="Tipo de Lançamento"
            error={errors.operationType?.message}
            options={[
              { value: 'EXPENSE', label: 'Despesa (Débito de Origem)' },
              { value: 'INCOME', label: 'Receita (Entrada de Origem)' },
              { value: 'TRANSFER', label: 'Transferência (Débito -> Crédito)' }
            ]}
            {...register('operationType')}
          />

          <Select
            label="Conta de Origem"
            error={errors.accountId?.message}
            options={accountOptions}
            {...register('accountId')}
          />

          {selectedOperationType === 'TRANSFER' ? (
            <Select
              label="Conta de Destino"
              error={errors.destinationAccountId?.message}
              options={accountOptions}
              {...register('destinationAccountId')}
            />
          ) : (
            <Select
              label="Categoria"
              error={errors.categoryId?.message}
              options={categoryOptions}
              {...register('categoryId')}
            />
          )}

          <Input
            label="Valor do Lançamento"
            type="number"
            step="0.01"
            placeholder="0,00"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Input
            label="Descrição"
            placeholder="Ex: Compra Mercado Livre, Pix Recebido"
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="Data de Competência"
            type="datetime-local"
            error={errors.transactionDate?.message}
            {...register('transactionDate')}
          />

          {apiError && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-500/5 border border-rose-500/15 text-rose-400 rounded-lg font-mono">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900/60">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createTransactionMutation.isPending}
            >
              Confirmar
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
