import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3 gap-1.5',
    md: 'text-sm py-2.5 px-5 gap-2',
    lg: 'text-base py-3 px-6 gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8422] text-[#0a0a0c] font-semibold shadow-md shadow-[#d4af37]/15 hover:brightness-105 active:scale-[0.98]',
    secondary:
      'bg-[#16161c] text-[#f3e5ab] border border-[#d4af37]/30 hover:border-[#d4af37]/60 hover:bg-[#1f1f28] active:scale-[0.98]',
    outline:
      'bg-transparent text-neutral-200 border border-neutral-700/80 hover:bg-white/5 hover:border-neutral-500 active:scale-[0.98]',
    ghost:
      'bg-transparent text-neutral-300 hover:text-white hover:bg-white/8 active:scale-[0.98]',
    danger:
      'bg-red-950/40 text-red-300 border border-red-800/50 hover:bg-red-900/40 active:scale-[0.98]',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
