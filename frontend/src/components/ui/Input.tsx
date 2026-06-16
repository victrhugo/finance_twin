import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-display">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3.5 py-2.5 text-sm bg-zinc-950/80 border border-zinc-800/80 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-rose-400 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
