import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FolderTree, Plus, AlertTriangle, ChevronRight, Folder, Tag } from 'lucide-react';
import { useCategories, useCreateCategory } from '../hooks/useApi';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Drawer } from '../components/ui/Drawer';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  type: z.enum(['INCOME', 'EXPENSE'] as const),
  icon: z.string().max(50, 'Ícone deve ter no máximo 50 caracteres').optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato HEX (Ex: #FF5733)').optional().or(z.literal('')),
  parentCategoryId: z.string().optional().or(z.literal('')),
});

type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

export const Categories: React.FC = () => {
  const currentUserId = useAuthStore((state) => state.currentUserId);
  const { data: categories, isLoading, error: fetchError } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      type: 'EXPENSE',
      color: '#6366f1',
    }
  });

  const selectedType = watch('type');

  const onSubmit = (data: CreateCategoryFormData) => {
    setApiError(null);
    createCategoryMutation.mutate(
      {
        name: data.name,
        type: data.type,
        icon: data.icon || 'folder',
        color: data.color || '#6366f1',
        parentCategoryId: data.parentCategoryId || null,
      },
      {
        onSuccess: () => {
          reset({
            name: '',
            type: selectedType,
            icon: 'folder',
            color: '#6366f1',
            parentCategoryId: '',
          });
          setIsDrawerOpen(false);
        },
        onError: (err: any) => {
          setApiError(err.message || 'Falha ao criar categoria.');
        }
      }
    );
  };

  const potentialParents = categories?.filter(cat => cat.type === selectedType && !cat.parentCategoryId) || [];
  
  const parentOptions = [
    { value: '', label: '-- Nenhuma (Categoria Raiz) --' },
    ...potentialParents.map(cat => ({ value: cat.id, label: cat.name }))
  ];

  if (!currentUserId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full w-20 h-20 mx-auto flex items-center justify-center border border-amber-500/20">
          <AlertTriangle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">Perfis Conectados</h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            Nenhum usuário ativo selecionado. Para gerenciar categorias, por favor selecione ou crie um usuário primeiro.
          </p>
        </div>
        <a href="/users" className="inline-block mt-2 text-sm text-indigo-400 hover:underline font-semibold font-display">
          Visualizar Perfis →
        </a>
      </div>
    );
  }

  const rootCategories = categories?.filter(c => !c.parentCategoryId) || [];
  const getSubcategories = (parentId: string) => categories?.filter(c => c.parentCategoryId === parentId) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <FolderTree className="text-indigo-400" size={18} />
            Categorias de Classificação
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Organize despesas e receitas para calcular com precisão suas metas financeiras.
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
          <Plus size={14} className="mr-1.5" /> Adicionar Categoria
        </Button>
      </div>

      {/* Explorer Tree List */}
      <Card className="glow-card premium-card-border overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-widest text-zinc-400 font-display font-bold">Diretório de Categorias</CardTitle>
          <CardDescription className="text-[10px] text-zinc-500 text-left">
            Árvore de categorias ativas estruturadas no sistema.
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
              Ocorreu um erro ao carregar as categorias.
            </div>
          ) : rootCategories.length === 0 ? (
            <div className="text-center py-16 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              Nenhuma categoria encontrada. Clique em "Adicionar Categoria" para começar.
            </div>
          ) : (
            <div className="space-y-3.5">
              {rootCategories.map((rootCat) => {
                const children = getSubcategories(rootCat.id);
                const isExpense = rootCat.type === 'EXPENSE';
                return (
                  <div 
                    key={rootCat.id} 
                    className="p-4 rounded-xl border border-zinc-900/60 bg-zinc-950/20 shadow-xs hover:border-zinc-800 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0 border border-white/5"
                          style={{ backgroundColor: rootCat.color || '#6366f1' }}
                        />
                        <div className="flex items-center gap-1.5">
                          <Folder size={14} className="text-zinc-500 shrink-0" />
                          <span className="font-bold text-sm text-zinc-200">
                            {rootCat.name}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[8px] px-2.5 py-0.5 rounded-full font-bold border font-display tracking-widest ${
                        isExpense 
                          ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
                          : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      }`}>
                        {isExpense ? 'DESPESA' : 'RECEITA'}
                      </span>
                    </div>

                    {/* Collapsible tree node subcategories */}
                    {children.length > 0 ? (
                      <div className="pl-6 border-l border-zinc-800/80 space-y-2 mt-2">
                        {children.map((subCat) => (
                          <div key={subCat.id} className="flex items-center justify-between text-xs py-1 hover:translate-x-0.5 transition-transform duration-100">
                            <div className="flex items-center gap-2">
                              <ChevronRight size={12} className="text-zinc-600" />
                              <Tag size={11} className="text-zinc-500 shrink-0" />
                              <span 
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: subCat.color || '#6366f1' }}
                              />
                              <span className="font-semibold text-zinc-300">{subCat.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pl-6 text-[10px] text-zinc-600 italic">
                        Sem subcategorias conectadas.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide-over Drawer for creation */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Adicionar Categoria">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nome da Categoria"
            placeholder="Ex: Supermercado, Investimentos"
            error={errors.name?.message}
            {...register('name')}
          />

          <Select
            label="Tipo"
            error={errors.type?.message}
            options={[
              { value: 'EXPENSE', label: 'Despesa (Débito)' },
              { value: 'INCOME', label: 'Receita (Crédito)' }
            ]}
            {...register('type')}
          />

          <Select
            label="Categoria Pai (Opcional)"
            error={errors.parentCategoryId?.message}
            options={parentOptions}
            {...register('parentCategoryId')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ícone"
              placeholder="Ex: shopping-bag"
              error={errors.icon?.message}
              {...register('icon')}
            />
            <Input
              label="Cor (HEX)"
              placeholder="#6366f1"
              error={errors.color?.message}
              {...register('color')}
            />
          </div>

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
              isLoading={createCategoryMutation.isPending}
            >
              Confirmar
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
