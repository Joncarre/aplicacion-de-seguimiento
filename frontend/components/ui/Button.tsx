import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'font-medium rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-neon-green hover:bg-accent-hover active:bg-accent-active text-dark-bg-primary',
      secondary: 'bg-dark-bg-tertiary bg-opacity-50 hover:bg-opacity-70 text-dark-text-primary border-2 border-neon-green',
      outline: 'bg-transparent hover:bg-dark-bg-tertiary hover:bg-opacity-30 text-neon-green border-2 border-neon-green',
      ghost: 'bg-transparent hover:bg-dark-bg-tertiary hover:bg-opacity-30 text-neon-green',
      destructive: 'bg-neon-pink hover:bg-opacity-80 active:bg-opacity-60 text-white',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
