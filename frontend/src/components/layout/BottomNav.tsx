import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { MoreHorizontal, LogOut } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useAuthStore } from '@/features/auth/store';
import type { NavItem } from './Sidebar';

interface BottomNavProps {
  items: NavItem[];
}

export default function BottomNav({ items }: BottomNavProps) {
  const { t } = useTranslation('app');
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [moreOpen, setMoreOpen] = useState(false);

  // First 3 items show in the bar, rest go in the "More" sheet
  const mainItems = items.slice(0, 3);
  const moreItems = items.slice(3);

  const handleLogout = () => {
    setMoreOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Bottom bar — fixed at bottom, mobile only */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-secondary md:hidden">
        {mainItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-secondary-foreground/70'
              }`
            }
          >
            <item.icon size={20} />
            <span className="max-w-15 truncate">{t(item.key)}</span>
          </NavLink>
        ))}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium text-secondary-foreground/70 transition-colors hover:text-primary"
        >
          <MoreHorizontal size={20} />
          <span>{t('nav.more')}</span>
        </button>
      </nav>

      {/* More sheet — bottom drawer with remaining items */}
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="bg-secondary">
          <div className="p-5 pb-8">
            <h3 className="mb-4 text-xs font-medium tracking-widest text-primary">{t('nav.more')}</h3>
            <div className="grid grid-cols-3 gap-4">
              {moreItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-2 rounded-lg p-3 text-xs font-medium transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-secondary-foreground/70 hover:bg-muted'
                    }`
                  }
                >
                  <item.icon size={22} />
                  <span className="text-center">{t(item.key)}</span>
                </NavLink>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border p-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <LogOut size={18} />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}