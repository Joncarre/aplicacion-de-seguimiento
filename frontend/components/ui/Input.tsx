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
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full',
            'bg-white/80',
            'border-2 border-green-200 focus:border-accent-primary',
            'rounded-xl',
            'px-4 py-3',
            'text-text-primary text-base',
            'placeholder:text-text-muted/50',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary/20',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
