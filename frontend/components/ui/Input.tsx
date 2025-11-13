import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-text-secondary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full',
            'bg-dark-bg-tertiary bg-opacity-30',
            'border-2 border-dark-border focus:border-neon-green',
            'rounded-xl',
            'px-4 py-3',
            'text-dark-text-primary text-base',
            'placeholder:text-dark-text-muted placeholder:opacity-50',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-opacity-20',
            error && 'border-neon-pink focus:border-neon-pink focus:ring-neon-pink',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-neon-pink">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
