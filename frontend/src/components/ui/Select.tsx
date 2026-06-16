import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-display">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full px-3.5 py-2.5 text-sm bg-zinc-950/80 border border-zinc-800/80 rounded-lg text-white focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer ${
              error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500' : ''
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-950 text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && (
          <span className="text-xs text-rose-400 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
