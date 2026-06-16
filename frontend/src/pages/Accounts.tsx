import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wallet, Plus, AlertTriangle, Landmark, PiggyBank, Coins } from 'lucide-react';
import { useAccounts, useCreateAccount } from '../hooks/useApi';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Drawer } from '../components/ui/Drawer';
import type { AccountType } from '../types';

const createAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(120, 'Nome muito longo'),
  type: z.enum(['CHECKING', 'SAVINGS', 'CASH'] as const),
  currency: z.string().length(3, 'Moeda deve ter 3 letras').toUpperCase(),
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export const Accounts: React.FC = () => {
  const currentUserId = useAuthStore((state) => state.currentUserId);
  const { data: accounts, isLoading, error: fetchError } = useAccounts();
  const createAccountMutation = useCreateAccount();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      type: 'CHECKING',
      currency: 'BRL',
    }
  });

  const onSubmit = (data: CreateAccountFormData) => {
    setApiError(null);
    createAccountMutation.mutate(
      data,
      {
        onSuccess: () => {
          reset({
            name: '',
            type: 'CHECKING',
            currency: 'BRL',
          });
          setIsDrawerOpen(false);
        },
        onError: (err: any) => {
          setApiError(err.message || 'Falha ao criar conta. Verifique os dados inseridos.');
        }
      }
    );
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'CHECKING':
        return <Landmark size={18} className="text-blue-400" />;
      case 'SAVINGS':
        return <PiggyBank size={18} className="text-pink-400" />;
      case 'CASH':
        return <Coins size={18} className="text-emerald-400" />;
      default:
        return <Wallet size={18} />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const renderFormattedCurrency = (amount: number, currency: string) => {
    const formatted = formatCurrency(amount, currency);
    const parts = formatted.split(',');
    if (parts.length === 2) {
      return (
        <span className="font-display font-black text-2xl tracking-tight">
          {parts[0]}
          <span className="text-sm font-semibold opacity-40">,{parts[1]}</span>
        </span>
      );
    }
    return <span className="font-display font-black text-2xl tracking-tight">{formatted}</span>;
  };

  if (!currentUserId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full w-20 h-20 mx-auto flex items-center justify-center border border-amber-500/20">
          <AlertTriangle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">Perfis Conectados</h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            Nenhum usuário ativo selecionado. Para gerenciar contas e saldos, por favor selecione ou crie um usuário primeiro.
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
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <Wallet className="text-indigo-400" size={18} />
            Minhas Contas Conectadas
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Gerencie saldos correntes, poupanças e cofres físicos sob custódia do seu Twin.
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
          <Plus size={14} className="mr-1.5" /> Adicionar Conta
        </Button>
      </div>

      {/* Grid container */}
      <Card className="glow-card premium-card-border overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-widest text-zinc-400 font-display font-bold">Contas Conectadas</CardTitle>
          <CardDescription className="text-[10px] text-zinc-500">Saldos atuais consolidados.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : fetchError ? (
            <div className="p-4 text-xs text-rose-400 bg-rose-500/5 rounded-xl border border-rose-500/10 font-mono">
              Ocorreu um erro ao carregar as contas do servidor.
            </div>
          ) : accounts?.length === 0 ? (
            <div className="text-center py-16 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              Nenhuma conta cadastrada. Clique em "Adicionar Conta" para criar a primeira!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts?.map((acc) => (
                <div 
                  key={acc.id}
                  className={`p-6 rounded-2xl border flex flex-col justify-between h-36 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer hover:shadow-2xl ${
                    acc.type === 'CHECKING' 
                      ? 'gradient-card-blue shadow-[0_4px_30px_rgba(59,130,246,0.05)]' 
                      : acc.type === 'SAVINGS'
                        ? 'gradient-card-pink shadow-[0_4px_30px_rgba(244,63,94,0.05)]'
                        : 'gradient-card-emerald shadow-[0_4px_30px_rgba(16,185,129,0.05)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {getAccountIcon(acc.type)}
                      </div>
                      <span className="font-bold text-sm text-zinc-100 tracking-wide">
                        {acc.name}
                      </span>
                    </div>
                    <span className="text-[7px] bg-white/10 px-2.5 py-1 rounded font-mono uppercase tracking-widest text-zinc-300 font-bold border border-white/5">
                      {acc.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">
                      Saldo Disponível
                    </span>
                    <div className="text-white">
                      {renderFormattedCurrency(acc.balance, acc.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide-over Drawer for creation */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Conectar Nova Conta">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Identificação da Conta"
            placeholder="Ex: Itaú Personalité, Inter Invest"
            error={errors.name?.message}
            {...register('name')}
          />
          
          <Select
            label="Tipo de Conta"
            error={errors.type?.message}
            options={[
              { value: 'CHECKING', label: 'Conta Corrente' },
              { value: 'SAVINGS', label: 'Poupança / Investimento' },
              { value: 'CASH', label: 'Dinheiro em Espécie (Carteira)' }
            ]}
            {...register('type')}
          />

          <Input
            label="Moeda"
            placeholder="BRL, USD, EUR"
            error={errors.currency?.message}
            {...register('currency')}
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
              isLoading={createAccountMutation.isPending}
            >
              Criar Conta
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
