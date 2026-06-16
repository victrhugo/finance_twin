import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Terminal, ArrowRight, User, LayoutDashboard, ArrowLeftRight, Wallet, FolderTree, Users, LogOut, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUsers } from '../../hooks/useApi';

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateTransaction?: () => void;
  onOpenCreateAccount?: () => void;
  onOpenCreateCategory?: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ 
  isOpen, 
  onClose,
  onOpenCreateTransaction,
  onOpenCreateAccount,
  onOpenCreateCategory
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { data: users } = useUsers();
  const { currentUserId, setCurrentUser } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Command items definition
  const getCommands = () => {
    const list = [
      { id: 'dash', title: 'Ir para Dashboard', category: 'Navegação', icon: LayoutDashboard, action: () => navigate('/') },
      { id: 'txs', title: 'Ver Transações', category: 'Navegação', icon: ArrowLeftRight, action: () => navigate('/transactions') },
      { id: 'accs', title: 'Gerenciar Contas', category: 'Navegação', icon: Wallet, action: () => navigate('/accounts') },
      { id: 'cats', title: 'Explorar Categorias', category: 'Navegação', icon: FolderTree, action: () => navigate('/categories') },
      { id: 'users', title: 'Ver Perfis de Usuário', category: 'Navegação', icon: Users, action: () => navigate('/users') },
    ];

    if (onOpenCreateTransaction) {
      list.push({ id: 'new-tx', title: 'Registrar Nova Transação', category: 'Ações', icon: Plus, action: onOpenCreateTransaction });
    }
    if (onOpenCreateAccount) {
      list.push({ id: 'new-acc', title: 'Adicionar Nova Conta', category: 'Ações', icon: Plus, action: onOpenCreateAccount });
    }
    if (onOpenCreateCategory) {
      list.push({ id: 'new-cat', title: 'Adicionar Nova Categoria', category: 'Ações', icon: Plus, action: onOpenCreateCategory });
    }

    if (currentUserId) {
      list.push({ id: 'logout', title: 'Desconectar Sessão Ativa', category: 'Sessão', icon: LogOut, action: () => setCurrentUser(null, null) });
    }

    // Add users to switch session
    if (users && users.length > 0) {
      users.forEach(u => {
        if (u.id !== currentUserId) {
          list.push({
            id: `switch-${u.id}`,
            title: `Alternar para perfil: ${u.email}`,
            category: 'Alternar Usuário',
            icon: User,
            action: () => setCurrentUser(u.id, u.email)
          });
        }
      });
    }

    return list;
  };

  const commands = getCommands();

  // Filter commands by search query
  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Command dialog */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] shadow-[0_0_80px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden flex flex-col max-h-[50vh] transition-all"
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(var(--border-color))] bg-zinc-950/50 shrink-0">
          <Search className="text-zinc-500 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite um comando, tela ou perfil de usuário..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {filteredCommands.length > 0 ? (
            <div className="space-y-1.5">
              {filteredCommands.map((cmd, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = cmd.icon;
                
                return (
                  <div
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className={`flex items-center justify-between px-4.5 py-3.5 rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-zinc-900 border-l-2 border-[hsl(var(--color-brand))] text-white' 
                        : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[hsl(var(--color-brand))]' : 'text-zinc-500'}`} />
                      <span className="text-sm font-medium">{cmd.title}</span>
                      <span className="text-[10px] uppercase tracking-wider bg-zinc-950 border border-zinc-800/80 px-2 py-0.5 rounded-md text-zinc-500 font-bold font-display ml-1">
                        {cmd.category}
                      </span>
                    </div>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <Terminal className="text-zinc-600 w-8 h-8" />
              <p className="text-xs font-semibold text-zinc-400">Nenhum comando ou usuário encontrado</p>
              <p className="text-[10px] text-zinc-600">Experimente buscar por "dashboard", "transações" ou e-mail do usuário.</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3 border-t border-[hsl(var(--border-color))] bg-zinc-950/30 flex items-center justify-between text-[10px] text-zinc-500 shrink-0 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-zinc-900 border border-zinc-800 px-1 rounded">↑↓</kbd> Navegar</span>
            <span className="flex items-center gap-1"><kbd className="bg-zinc-900 border border-zinc-800 px-1 rounded">Enter</kbd> Executar</span>
          </div>
          <div>
            <span>Atalho Global: <kbd className="bg-zinc-900 border border-zinc-800 px-1 rounded">/</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
};
