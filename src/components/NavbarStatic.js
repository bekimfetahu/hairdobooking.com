"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Home, CreditCard, CalendarDays, Briefcase, LayoutDashboard, LogOut, UserRound, MapPin, ChevronDown } from 'lucide-react';
import PreferredSalonModal from '@/components/PreferredSalonModal';

export default function NavbarStatic() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPreferredModalOpen, setIsPreferredModalOpen] = useState(false);
  const navRef = useRef(null);
  const isForBusinessPage = pathname === '/partners' || pathname.startsWith('/partners/');
  const isPricingPage = pathname === '/pricing' || pathname.startsWith('/pricing/');

  const getBasePath = (href) => href.split('?')[0];

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsAuthenticated(true);
        } else if (res.status === 401) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to restore session in navbar:', err?.message || err);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    const handlePreferredSalonUpdated = (event) => {
      const updatedUser = event?.detail?.user ?? event?.detail ?? null;
      if (updatedUser) {
        setUser(updatedUser);
        setIsAuthenticated(true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('preferred-salon-updated', handlePreferredSalonUpdated);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('preferred-salon-updated', handlePreferredSalonUpdated);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const displayName = useMemo(() => {
    if (!user) return 'Account';
    return (
      user?.client?.first_name ||
      user?.first_name ||
      user?.name ||
      (user?.email ? user.email.split('@')[0] : 'Account')
    );
  }, [user]);

  const preferredVenueLabel = useMemo(() => {
    const venue = user?.client?.primary_venue ?? null;
    return venue?.name || 'Choose preferred salon';
  }, [user]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      setIsAuthenticated(false);

      if (!res.ok) {
        router.push('/login');
        return;
      }

      router.push('/login');
    } catch (err) {
      console.error('Failed to log out from navbar:', err?.message || err);
      router.push('/login');
    }
  };

  const navLinkClasses = (href) => {
    const basePath = getBasePath(href);
    const isActive = basePath === '/' ? pathname === '/' : pathname === basePath || pathname.startsWith(`${basePath}/`);

    return `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out hover:shadow-sm ${
      isActive
        ? 'bg-neutral-100 text-black border-black/20'
        : 'border-transparent text-neutral-700 hover:bg-neutral-100 hover:text-black hover:border-black/10'
    }`;
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-black/10 bg-white/95 backdrop-blur-xl" ref={navRef}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Hairdo Booking" width="240" height="25" />
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          <Link href="/" className={navLinkClasses('/')}>
            <Home className="h-4 w-4 text-black" />
            Home
          </Link>

          {(isForBusinessPage || isPricingPage) && (
            <Link href="/pricing" className={navLinkClasses('/pricing')}>
              <CreditCard className="h-4 w-4 text-black" />
              Pricing
            </Link>
          )}

          {!(isForBusinessPage || isPricingPage) && (
            <Link href="/register" className={navLinkClasses('/register')}>
              <CalendarDays className="h-4 w-4 text-black" />
              Book now
            </Link>
          )}

        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => setIsPreferredModalOpen(true)}
                className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black transition-colors duration-150 ease-out hover:shadow-sm hover:border-black/20 hover:bg-neutral-50 md:inline-flex"
                aria-label="View and change your preferred salon"
              >
                <MapPin className="h-4 w-4 text-black" />
                <span className="max-w-[180px] truncate text-xs text-primary">
                  {preferredVenueLabel}
                </span>
              </button>

              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black transition-colors duration-150 ease-out hover:shadow-sm hover:border-black/20 hover:bg-neutral-50"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <UserRound className="h-4 w-4 text-black" />
                  <span className="max-w-[140px] truncate">{displayName}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl">
                    <div className="border-b border-black/5 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-primary">Signed in</p>
                      <p className="mt-1 text-sm font-semibold text-neutral-900">{displayName}</p>
                      <p className="text-xs text-neutral-500">Manage your bookings and profile</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/dashboard"
                        className="mb-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-normal text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 shrink-0 text-black" />
                        Dashboard
                      </Link>
                      <div className="mt-1 border-t border-black/10 pt-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-neutral-700 transition-colors duration-150 ease-out hover:shadow-sm hover:bg-neutral-50 hover:text-black"
                        >
                          <LogOut className="h-4 w-4 shrink-0 text-black" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClasses('/login')}>
                Sign in
              </Link>
              <Link
                href="/partners"
                className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium md:inline-flex ${
                  isForBusinessPage
                    ? 'bg-neutral-100 border-black/20 text-primary'
                    : 'border-transparent text-primary hover:bg-neutral-50 hover:border-black/10'
                }`}
              >
                <Briefcase className="h-4 w-4 text-black" />
                For businesses
              </Link>
            </>
          )}
        </div>
      </div>

      <PreferredSalonModal
        open={isPreferredModalOpen}
        onClose={() => setIsPreferredModalOpen(false)}
        onPrimaryUpdated={(updatedUser) => {
          if (updatedUser) {
            setUser(updatedUser);
          }
        }}
      />
    </header>
  );
}
