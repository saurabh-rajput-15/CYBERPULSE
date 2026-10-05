import React, { ReactNode } from 'react';

export type BadgeVariant = 'neutral' | 'teal' | 'pink' | 'peach' | 'ochre' | 'outline';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-[#faf5e8] text-[#0a0a0a] border border-[#e5e5e5]',
  teal: 'bg-[#1a3a3a]/10 text-[#1a3a3a] border border-[#1a3a3a]/20',
  pink: 'bg-[#ff4d8b]/15 text-[#ff4d8b] border border-[#ff4d8b]/30',
  peach: 'bg-[#ffb084]/20 text-[#0a0a0a] border border-[#ffb084]/40',
  ochre: 'bg-[#e8b94a]/20 text-[#0a0a0a] border border-[#e8b94a]/40',
  outline: 'bg-transparent text-[#6a6a6a] border border-[#e5e5e5]'
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded-full font-semibold uppercase tracking-wider ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
