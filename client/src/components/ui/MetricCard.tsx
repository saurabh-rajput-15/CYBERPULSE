import React, { ReactNode } from 'react';

export type MetricVariant = 'teal' | 'pink' | 'peach' | 'ochre' | 'white' | 'dark';

interface MetricCardProps {
  id?: string;
  variant?: MetricVariant;
  label: string;
  value: string | number;
  subtext?: string;
  footer?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<MetricVariant, { bg: string; text: string; subtext: string; border: string }> = {
  teal: {
    bg: 'bg-[#1a3a3a]',
    text: 'text-[#ffffff]',
    subtext: 'text-[#a4d4c5]',
    border: 'border-transparent'
  },
  pink: {
    bg: 'bg-[#ff4d8b]',
    text: 'text-[#ffffff]',
    subtext: 'text-[#ffffff]/80',
    border: 'border-transparent'
  },
  peach: {
    bg: 'bg-[#ffb084]',
    text: 'text-[#0a0a0a]',
    subtext: 'text-[#0a0a0a]/70',
    border: 'border-transparent'
  },
  ochre: {
    bg: 'bg-[#e8b94a]',
    text: 'text-[#0a0a0a]',
    subtext: 'text-[#0a0a0a]/70',
    border: 'border-transparent'
  },
  white: {
    bg: 'bg-[#ffffff]',
    text: 'text-[#0a0a0a]',
    subtext: 'text-[#6a6a6a]',
    border: 'border-[#e5e5e5]'
  },
  dark: {
    bg: 'bg-[#0a0a0a]',
    text: 'text-[#ffffff]',
    subtext: 'text-[#9a9a9a]',
    border: 'border-transparent'
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  variant = 'white',
  label,
  value,
  subtext,
  footer,
  icon,
  badge,
  className = '',
  onClick
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`${styles.bg} ${styles.text} ${styles.border} border rounded-[24px] p-7 shadow-xs flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[11px] uppercase tracking-[1.5px] font-semibold ${styles.subtext}`}>
            {label}
          </span>
          {icon && <div className="shrink-0">{icon}</div>}
        </div>

        <div className="text-3xl sm:text-4xl font-medium tracking-tight font-display mt-2.5">
          {value}
        </div>

        {subtext && (
          <p className={`text-[13px] ${styles.subtext} mt-1.5 leading-snug`}>
            {subtext}
          </p>
        )}
      </div>

      {(footer || badge) && (
        <div className={`mt-5 pt-3 border-t ${variant === 'white' ? 'border-[#e5e5e5]' : 'border-white/15'} flex items-center justify-between text-[12px] ${styles.subtext}`}>
          {footer && <span>{footer}</span>}
          {badge && <div>{badge}</div>}
        </div>
      )}
    </div>
  );
};
