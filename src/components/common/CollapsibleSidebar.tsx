import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  X,
} from 'lucide-react';
import { AppRole } from '../../types';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

interface CollapsibleSidebarProps {
  title: string;
  subtitle?: string;
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentRole: AppRole;
  onSwitchRole: (role: AppRole) => void;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  title,
  subtitle,
  items,
  activeId,
  onSelect,
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
  currentRole,
  onSwitchRole,
}) => {
  const sidebarWidthClass = isCollapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-30 bg-[#0e0e12] border-r border-white/[0.08] flex flex-col transition-all duration-300 ease-in-out ${sidebarWidthClass} ${
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="h-18 px-4 flex items-center justify-between border-b border-white/[0.08]">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#8d7122] flex items-center justify-center text-black font-bold shrink-0 shadow-md shadow-[#d4af37]/20">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold tracking-wider text-white truncate font-serif">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[11px] text-[#d4af37] truncate font-medium">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-9 h-9 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#8d7122] flex items-center justify-center text-black font-bold shadow-md shadow-[#d4af37]/20">
              <Sparkles size={18} />
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>

          {/* Desktop collapse toggle button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-neutral-400 hover:text-[#f3e5ab] hover:bg-white/5 rounded-lg transition-colors ml-auto"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {items.map(item => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 relative group ${
                  isActive
                    ? 'bg-[#181822] text-[#f3e5ab] border border-[#d4af37]/35 shadow-sm shadow-[#d4af37]/10'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.04]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#d4af37] rounded-r" />
                )}
                <span
                  className={`shrink-0 ${
                    isActive ? 'text-[#d4af37]' : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                >
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/30">
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Tooltip on hover */}
                {isCollapsed && (
                  <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-3 py-1.5 bg-[#181822] border border-[#d4af37]/30 text-[#f3e5ab] text-xs font-medium rounded-md whitespace-nowrap shadow-xl z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Role Switcher / Exit */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0b0b0e]">
          <button
            onClick={() => onSwitchRole('visitor')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors`}
            title="Sair para Loja Pública"
          >
            <LogOut size={16} className="shrink-0 text-neutral-400" />
            {!isCollapsed && <span>Sair / Vitrine Pública</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
