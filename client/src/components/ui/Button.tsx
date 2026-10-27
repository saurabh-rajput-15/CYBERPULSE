import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'pill' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#0a0a0a] text-[#ffffff] hover:bg-[#1f1f1f] shadow-xs active:scale-[0.98]',
  secondary: 'bg-[#ffffff] dark:bg-[#0c121e] text-[#0a0a0a] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#1e293b] hover:bg-[#faf5e8] dark:bg-[#1e293b] shadow-xs active:scale-[0.98]',
  pill: 'rounded-full bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#1e293b] hover:bg-[#f5f0e0] dark:bg-[#2a374a] active:scale-[0.98]',
  ghost: 'bg-transparent text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff] hover:bg-[#faf5e8] dark:bg-[#1e293b]',
  danger: 'bg-[#ff4d8b] text-[#ffffff] hover:bg-[#e03d78] shadow-xs active:scale-[0.98]'
};

const sizeStyles = {
  sm: 'px-3.5 py-1.5 text-xs rounded-[10px]',
  md: 'px-5 py-2.5 text-xs font-semibold rounded-[12px]',
  lg: 'px-6 py-3 text-sm font-semibold rounded-[14px]'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClass = variant === 'pill' ? 'px-4 py-1.5 text-xs' : sizeStyles[size];

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center space-x-2 font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeClass} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
