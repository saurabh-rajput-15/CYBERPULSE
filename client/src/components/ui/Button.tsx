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
  secondary: 'bg-[#ffffff] text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#faf5e8] shadow-xs active:scale-[0.98]',
  pill: 'rounded-full bg-[#faf5e8] text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#f5f0e0] active:scale-[0.98]',
  ghost: 'bg-transparent text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-[#faf5e8]',
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
