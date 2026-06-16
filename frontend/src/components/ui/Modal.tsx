import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-xl shadow-2xl z-10 overflow-hidden transform scale-100 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border-color))] bg-[hsl(var(--bg-primary))]/50">
          <h3 className="text-base font-semibold font-display tracking-tight text-[hsl(var(--fg-primary))]">
            {title}
          </h3>
          <Button variant="ghost" size="sm" className="h-8 w-8 !p-0 rounded-full hover:bg-[hsl(var(--bg-tertiary))]" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Body */}
        <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
