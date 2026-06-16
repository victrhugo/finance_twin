import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Users as UsersIcon, Plus, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { useUsers, useCreateUser } from '../hooks/useApi';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Drawer } from '../components/ui/Drawer';

const createUserSchema = z.object({
  email: z.string().email('E-mail inválido').max(320),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export const Users: React.FC = () => {
  const { data: users, isLoading, error: fetchError } = useUsers();
  const createUserMutation = useCreateUser();
  const { currentUserId, setCurrentUser } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema)
  });

  const onSubmit = (data: CreateUserFormData) => {
    setApiError(null);
    setSuccessMessage(null);
    
    createUserMutation.mutate(
      {
        email: data.email,
        passwordHash: data.password
      },
      {
        onSuccess: (newUser) => {
          setSuccessMessage(`Usuário ${newUser.email} cadastrado com sucesso!`);
          reset();
          if (!currentUserId) {
            setCurrentUser(newUser.id, newUser.email);
          }
          setTimeout(() => {
            setIsDrawerOpen(false);
            setSuccessMessage(null);
          }, 1500);
        },
        onError: (err: any) => {
          setApiError(err.message || 'Falha ao cadastrar usuário. O e-mail pode já estar em uso.');
        }
      }
    );
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <UsersIcon className="text-indigo-400" size={18} />
            Perfis & Espaços de Usuários
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Selecione qual perfil está ativo para analisar ou crie novos espaços de monitoramento.
          </p>
        </div>
        <Button 
          variant="brand" 
          size="sm" 
          onClick={() => {
            setApiError(null);
            setSuccessMessage(null);
            setIsDrawerOpen(true);
          }}
        >
          <Plus size={14} className="mr-1.5" /> Adicionar Perfil
        </Button>
      </div>

      {/* Profiles grid list */}
      <Card className="glow-card premium-card-border overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-widest text-zinc-400 font-display font-bold">Perfis Registrados</CardTitle>
          <CardDescription className="text-[10px] text-zinc-500">
            Selecione o perfil desejado para carregar as contas e transações associadas.
          </CardDescription>
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
              Ocorreu um erro ao carregar a lista de usuários do backend. Verifique a conexão.
            </div>
          ) : users?.length === 0 ? (
            <div className="text-center py-16 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              Nenhum perfil cadastrado. Clique em "Adicionar Perfil" para começar!
            </div>
          ) : (
            <div className="space-y-3">
              {users?.map((user) => {
                const isActive = currentUserId === user.id;
                return (
                  <div 
                    key={user.id} 
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150 ${
                      isActive 
                        ? 'bg-zinc-900/40 border-[hsl(var(--color-brand))]/30 shadow-[0_0_15px_rgba(99,102,241,0.03)]' 
                        : 'border-zinc-900 hover:border-zinc-800 hover:bg-zinc-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Styled Initials Avatar */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
                        isActive 
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}>
                        {getInitials(user.email)}
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-zinc-100">{user.email}</span>
                        <span className="text-[10px] text-zinc-500 font-mono mt-0.5">id: {user.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 border-zinc-900/60 pt-3 sm:pt-0">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest font-display">
                          <UserCheck size={11} className="animate-pulse" />
                          Perfil Selecionado
                        </span>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs px-3.5 py-2 font-display"
                          onClick={() => setCurrentUser(user.id, user.email)}
                        >
                          Ativar Espaço
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide-over Drawer for creation */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Adicionar Novo Perfil">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="E-mail de Acesso"
            type="email"
            placeholder="exemplo@financetwin.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha da Chave"
            type="password"
            placeholder="••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          
          {apiError && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-500/5 border border-rose-500/15 text-rose-400 rounded-lg font-mono">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 text-xs bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 rounded-lg font-mono">
              <CheckCircle size={14} className="shrink-0" />
              <span>{successMessage}</span>
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
              isLoading={createUserMutation.isPending}
            >
              Confirmar
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
