import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { LogOut, type LucideIcon } from 'lucide-react';
import {useLogout} from "@/features/auth/hooks/useLogout.ts";

export interface NavItem {
  key: string;
  to: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: NavItem[];
}

export default function Sidebar({ items }: SidebarProps) {
  const { t } = useTranslation('app');

  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="group fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r border-border bg-secondary transition-all duration-300 hover:w-64 md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center overflow-hidden border-b border-secondary-hover">
        <img src="/teetime-logo.png" alt="TeeTime Executive" className="h-8 w-auto rounded-sm transition-all duration-300 group-hover:h-10" />
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 ">
        {items.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            title={t(item.key)}
            className={({ isActive }) =>
              `flex items-center justify-center gap-0 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 group-hover:justify-start group-hover:gap-3 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-secondary-foreground/70 hover:bg-secondary-hover hover:text-primary'
              }`
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-50 group-hover:opacity-100">
              {t(item.key)}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-secondary-hover p-2 group-hover:p-4">
        <button
          onClick={handleLogout}
          title={t('nav.logout')}
          className="flex w-full items-center justify-center gap-0 rounded-md px-3 py-2.5 text-sm font-medium text-secondary-foreground/70 transition-all duration-300 hover:bg-secondary-hover hover:text-primary group-hover:justify-start group-hover:gap-3"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-50 group-hover:opacity-100">
            {t('nav.logout')}
          </span>
        </button>
      </div>
    </aside>
  );
}