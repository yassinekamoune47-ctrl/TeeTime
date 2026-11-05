import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { useLogout } from '@/features/auth/hooks/useLogout.ts';

export default function Header({ transparent = false, dark = false }: { transparent?: boolean; dark?: boolean }) {
  const { t } = useTranslation('landing');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const navItems = [
    { key: 'nav.Reservations', to: '/reservations' },
    { key: 'nav.Memberships', to: '/memberships' },
    { key: 'nav.Tournaments', to: '/tournaments' },
    { key: 'nav.shop', to: '/shop' },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className={`${transparent ? 'absolute' : 'relative'} inset-x-0 top-0 z-50 min-h-16 ${transparent ? (dark ? 'bg-linear-to-b from-[#04120c] via-[#04120c]/70 to-transparent' : 'bg-linear-to-b from-background via-background/65 to-transparent') : 'border-b border-border bg-background'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-25">
        {/* Logo */}
        <Link to="/">
          <img src="/teetime-logo.png" alt="TeeTime Executive" className="h-10 w-auto rounded-lg" />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? "relative text-[13px] font-medium tracking-widest text-primary after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-primary"
                    : `relative text-[13px] font-medium tracking-widest transition-colors hover:text-primary-hover after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary-hover after:transition-all after:duration-300 hover:after:w-full ${dark ? 'text-white/75' : 'text-secondary'}`
                }
              >
                {t(item.key)}
              </NavLink>
            </li>
          ))}
        </ul>


        
        {/* Authenticated user - Dashboard + Logout */}
        {isAuthenticated && (
          <div className="hidden items-center gap-4 md:flex">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-md bg-secondary px-3.25 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-secondary-hover"
            >
              {t('auth.dashboard')}
            </button>
            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="relative text-[13px] font-medium tracking-widest text-primary transition-colors hover:text-primary-hover after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary-hover after:transition-all after:duration-300 hover:after:w-full disabled:opacity-50"
            >
              <LogOut size={16} className="mr-1 inline" />
              {isLoggingOut ? t('auth.loggingOut') : t('auth.logout')}
            </button>
          </div>
        )}

        {/* Unauthenticated user - Login / Register */}
        {!isAuthenticated && (
          <div className="hidden items-center gap-4 md:flex">
            <Link
            to="/login"
            className="relative text-[13px] font-medium tracking-widest text-primary transition-colors hover:text-primary-hover after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary-hover after:transition-all after:duration-300 hover:after:w-full"
          >
  {t('auth.login')}
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-secondary px-3.25 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-secondary-hover"
          >
            {t('auth.register')}
                    </Link>
        </div>
        )}

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden ${dark ? 'text-white' : 'text-secondary'}`}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Mobile slide-in panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex h-screen w-full max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <img src="/teetime-logo.png" alt="TeeTime Executive" className="h-10 w-auto rounded-lg" />
          <button onClick={() => setMenuOpen(false)} className="text-secondary" aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <ul className="flex flex-col gap-6 px-6 py-8">
          {navItems.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "block text-base font-medium tracking-widest text-primary"
                    : "block text-base font-medium tracking-widest text-secondary transition-colors hover:text-primary-hover"
                }
              >
                {t(item.key)}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-3 border-t border-border px-6 py-6">
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="text-center text-base font-medium tracking-widest text-primary"
          >
            {t('auth.login')}
          </Link>
          <Link
            to="/register"
            onClick={() => setMenuOpen(false)}
            className="rounded-md bg-secondary px-4 py-3 text-center text-base font-medium text-primary-foreground"
          >
            {t('auth.register')}
          </Link>
        </div>
      </div>
    </header>
  );
}