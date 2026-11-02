import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderGold?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  borderGold = false,
  onClick,
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }[padding];

  const borderClass = borderGold
    ? 'border border-[#d4af37]/35'
    : 'border border-white/[0.08]';

  const hoverClass = hoverable
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d4af37]/45 hover:shadow-lg hover:shadow-black/50 cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`bg-[#101014] rounded-xl text-neutral-100 ${borderClass} ${paddingClasses} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};
