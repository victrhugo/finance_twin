import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div className={`fixed inset-0 z-50 flex justify-end overflow-hidden transition-all duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Slide-over Content panel */}
      <div className={`relative w-full max-w-lg bg-[hsl(var(--bg-secondary))] border-l border-[hsl(var(--border-color))] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 flex flex-col h-full transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[hsl(var(--border-color))] bg-[hsl(var(--bg-primary))]/80 backdrop-blur-md">
          <h3 className="text-lg font-bold font-display tracking-tight text-[hsl(var(--fg-primary))]">
            {title}
          </h3>
          <Button variant="ghost" size="sm" className="h-8 w-8 !p-0 rounded-full hover:bg-[hsl(var(--bg-tertiary))]" onClick={onClose}>
            <X className="h-4 w-4 text-zinc-400" />
          </Button>
        </div>
        
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
};
