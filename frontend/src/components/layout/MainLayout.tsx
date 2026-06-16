import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  FolderTree, 
  ArrowLeftRight, 
  ChevronLeft, 
  ChevronRight,
  User,
  LogOut,
  Search,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUsers } from '../../hooks/useApi';
import { CommandCenter } from '../ui/CommandCenter';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);
  
  const { currentUserId, currentUserEmail, setCurrentUser } = useAuthStore();
  const { data: users, isLoading: loadingUsers } = useUsers();
  const location = useLocation();

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Keyboard shortcut listener for '/' and 'cmd+k' / 'ctrl+k'
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.tagName === 'SELECT' ||
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }
      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsCommandCenterOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transações', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Contas', path: '/accounts', icon: Wallet },
    { name: 'Categorias', path: '/categories', icon: FolderTree },
    { name: 'Usuários', path: '/users', icon: Users },
  ];

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#020204] vercel-grid text-white">
      {/* Sidebar - Inspired by Vercel, Stripe & Linear */}
      <aside 
        className={`h-full border-r border-zinc-900/60 bg-zinc-950/20 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 ease-in-out z-20 shrink-0 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        <div>
          {/* Logo / Monogram FT (SVG Geometric twins curves) */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-900/30 shrink-0">
            {!isCollapsed ? (
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-5 h-5 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3h8a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H8" />
                  <path d="M16 21H8a4 4 0 0 1-4-4v0a4 4 0 0 1 4-4h8" />
                </svg>
                <span className="font-display font-medium text-sm tracking-[0.15em] text-zinc-100 truncate">
                  Finance Twin
                </span>
              </div>
            ) : (
              <svg className="w-5 h-5 text-indigo-400 mx-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3h8a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H8" />
                <path d="M16 21H8a4 4 0 0 1-4-4v0a4 4 0 0 1 4-4h8" />
              </svg>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900/60 cursor-pointer transition-colors"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Quick Command Launcher (Raycast / Spotlight style) */}
          <div className="px-4 pt-3.5 shrink-0">
            <button
              onClick={() => setIsCommandCenterOpen(true)}
              className="w-full flex items-center justify-between bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/80 text-left text-zinc-500 hover:text-zinc-300 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-inner"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search size={14} className="text-zinc-600 shrink-0" />
                {!isCollapsed && <span className="truncate text-zinc-500">Pesquisar comando...</span>}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <kbd className="text-[9px] bg-zinc-950 border border-zinc-800/80 text-zinc-500 px-1.5 py-0.5 rounded font-mono font-bold">
                  {isMac ? '⌘K' : 'Ctrl+K'}
                </kbd>
              </div>
            </button>
          </div>

          {/* User Workspace Switcher (Vercel style) */}
          {!isCollapsed && (
            <div className="px-4 pt-3.5">
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  disabled={loadingUsers}
                  className="w-full flex items-center justify-between bg-zinc-900/10 hover:bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/80 rounded-xl p-3 text-left transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold font-display text-indigo-400 shrink-0">
                      {currentUserId ? getInitials(currentUserEmail || '') : 'FT'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-zinc-200 truncate">
                        {currentUserId ? currentUserEmail?.split('@')[0] : 'Selecionar'}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-medium tracking-wide uppercase font-display mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-status shrink-0" />
                        Personal Space
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={12} className="text-zinc-600 shrink-0 ml-1" />
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsProfileMenuOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1.5 bg-[#09090b] border border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.85)] rounded-xl py-1.5 z-30 max-h-52 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[8px] uppercase tracking-widest text-zinc-500 font-bold font-display">
                        Alternar Workspace
                      </div>
                      {users?.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setCurrentUser(u.id, u.email);
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-zinc-900/60 text-left ${
                            u.id === currentUserId ? 'text-[hsl(var(--color-brand))] font-semibold bg-zinc-900/20' : 'text-zinc-300'
                          }`}
                        >
                          <span className="truncate">{u.email}</span>
                          {u.id === currentUserId && <span className="w-1 h-1 rounded-full bg-[hsl(var(--color-brand))]" />}
                        </button>
                      ))}
                      <div className="border-t border-zinc-900 my-1" />
                      <button
                        onClick={() => {
                          setCurrentUser(null, null);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/5 transition-colors font-medium"
                      >
                        Desconectar Espaço
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3.5 flex flex-col gap-1.5 mt-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative border ${
                    isActive 
                      ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.2)]' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:translate-x-[2px]'
                  }`}
                >
                  <Icon size={14} className={`shrink-0 transition-all ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                  {!isCollapsed && <span className="font-display tracking-wide">{item.name}</span>}
                  {isActive && !isCollapsed && (
                    <span className="absolute right-3.5 w-1 h-1 rounded-full bg-indigo-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-900/30 bg-zinc-950/10">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              {currentUserId ? (
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 shrink-0">
                    <User size={13} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      {currentUserEmail?.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-zinc-500 truncate font-mono">
                      {currentUserEmail}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-zinc-500">Nenhum perfil ativo</span>
              )}
              {currentUserId && (
                <button 
                  onClick={() => setCurrentUser(null, null)}
                  className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-900/80 cursor-pointer transition-colors"
                  title="Sair"
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className={`w-2 h-2 rounded-full ${currentUserId ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-amber-500'}`} />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Unified Search & Page title Header */}
        <header className="h-16 border-b border-zinc-900/40 bg-zinc-950/10 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-bold font-display tracking-widest text-zinc-400 uppercase">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Finance Twin'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUserId && (
              <span className="text-[10px] text-zinc-500 bg-zinc-950 border border-zinc-900 px-3 py-1 rounded-full font-mono">
                id: {currentUserId.substring(0, 8)}
              </span>
            )}
          </div>
        </header>

        {/* Dynamic View Panel */}
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          {children}
        </main>
      </div>

      {/* CommandCenter Overlay */}
      <CommandCenter 
        isOpen={isCommandCenterOpen}
        onClose={() => setIsCommandCenterOpen(false)}
      />
    </div>
  );
};
