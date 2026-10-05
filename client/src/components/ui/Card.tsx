import React, { ReactNode } from 'react';

interface CardProps {
  id?: string;
  children: ReactNode;
  className?: string;
  variant?: 'white' | 'cream' | 'teal' | 'dark';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  onClick?: () => void;
}

const variantStyles = {
  white: 'bg-[#ffffff] border-[#e5e5e5] text-[#0a0a0a]',
  cream: 'bg-[#faf5e8] border-[#e5e5e5] text-[#0a0a0a]',
  teal: 'bg-[#1a3a3a] border-transparent text-[#ffffff]',
  dark: 'bg-[#0a0a0a] border-transparent text-[#ffffff]'
};

const paddingStyles = {
  none: '',
  sm: 'p-4 sm:p-5',
  md: 'p-6 sm:p-7',
  lg: 'p-8 sm:p-10'
};

export const Card: React.FC<CardProps> = ({
  id,
  children,
  className = '',
  variant = 'white',
  padding = 'md',
  onClick
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`border rounded-[24px] shadow-xs ${variantStyles[variant]} ${paddingStyles[padding]} ${
        onClick ? 'cursor-pointer hover:shadow-md transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
