"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CreditCard, CalendarDays, Briefcase, LayoutDashboard, LogOut, UserRound, MapPin, ChevronDown, Menu, X } from 'lucide-react';
import PreferredSalonModal from '@/components/modals/PreferredSalonModal';
import { loginSuccess, logout } from '@/store/slices/authSlice';

export default function NavbarStatic({ initialUser = null }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);
  const [user, setUser] = useState(initialUser || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPreferredModalOpen, setIsPreferredModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const navRef = useRef(null);
  const isForBusinessPage = pathname === '/partners' || pathname.startsWith('/partners/');
  const isPricingPage = pathname === '/pricing' || pathname.startsWith('/pricing/');

  const getBasePath = (href) => href.split('?')[0];

  // Sync initialUser from server to Redux and local state
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setIsAuthenticated(true);
      dispatch(loginSuccess({ user: initialUser }));
    }
  }, [initialUser, dispatch]);

  // Sync with Redux auth state (for social auth redirect flow)
  useEffect(() => {
    if (reduxUser) {
      setUser(reduxUser);
      setIsAuthenticated(true);
    }
  }, [reduxUser]);

  // Hydration: Only fetch if initialUser wasn't provided from server
  useEffect(() => {
    // Mark component as hydrated to enable rendering
    setHasHydrated(true);

    // If we already have user data from server, skip the fetch
    if (initialUser) {
      return;
    }

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
          dispatch(loginSuccess({ user: data.user }));
        } else if (res.status === 401) {
          setUser(null);
          setIsAuthenticated(false);
          dispatch(logout());
        }
      } catch (err) {
        console.error('Failed to restore session in navbar:', err?.message || err);
      }
    };

    restoreSession();
  }, [initialUser, dispatch]);

  useEffect(() => {
    const handlePreferredSalonUpdated = (event) => {
      const updatedUser = event?.detail?.user ?? event?.detail ?? null;
      if (updatedUser) {
        setUser(updatedUser);
        setIsAuthenticated(true);
        dispatch(loginSuccess({ user: updatedUser }));
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
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
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

  const preferredVenueSlug = useMemo(() => {
    return user?.client?.primary_venue?.slug ?? null;
  }, [user]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      setIsAuthenticated(false);
      dispatch(logout());

      if (!res.ok) {
        router.push('/auth?tab=signin');
        return;
      }

      router.push('/auth?tab=signin');
    } catch (err) {
      console.error('Failed to log out from navbar:', err?.message || err);
      dispatch(logout());
      router.push('/auth?tab=signin');
    }
  };

  const handleGoPreferredSalon = () => {
    // Main nav pill: open the preferred-salon picker modal to change salon.
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsPreferredModalOpen(true);
  };

  const handleNavigatePreferredSalon = () => {
    // Dropdown entry: go directly to the preferred salon page
    // (or open the picker if none is set yet).
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);

    if (preferredVenueSlug) {
      router.push(`/salon/${preferredVenueSlug}`);
    } else {
      setIsPreferredModalOpen(true);
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
      <div className="mx-auto max-w-[1200px] flex items-center justify-between h-16 px-4">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Hairdo Booking" width="240" height="25" />
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleGoPreferredSalon}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black transition-colors duration-150 ease-out hover:shadow-sm hover:border-black/20 hover:bg-neutral-50"
              aria-label="Go to your preferred salon"
            >
              <MapPin className="h-4 w-4 text-black" />
              <span className="max-w-[180px] truncate text-xs text-primary">
                {preferredVenueLabel}
              </span>
            </button>
          )}

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
                  <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-md border border-black/10 bg-white shadow-xl">
                    <div className="border-b border-black/5 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-primary">Signed in</p>
                      <p className="mt-1 text-sm font-semibold text-neutral-900">{displayName}</p>
                      <p className="text-xs text-neutral-500">Manage your bookings and profile</p>
                    </div>
                    <div className="p-2">
                      {preferredVenueSlug && (
                        <Link
                          href={`/salon/${preferredVenueSlug}`}
                          className={`mb-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-normal transition-colors ${
                            pathname === `/salon/${preferredVenueSlug}` || pathname.startsWith(`/salon/${preferredVenueSlug}/`)
                              ? 'text-black'
                              : 'text-neutral-700 hover:bg-neutral-50 hover:text-black'
                          }`}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <MapPin className="h-4 w-4 shrink-0 text-black" />
                          <span className="truncate">Preferred salon</span>
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className="mb-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-normal text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 shrink-0 text-black" />
                        Dashboard
                      </Link>
                      <div className="mt-1 border-t border-black/10 pt-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-neutral-700 transition-colors duration-150 ease-out hover:shadow-sm hover:bg-neutral-50 hover:text-black"
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

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-neutral-800 transition-colors duration-150 ease-out hover:shadow-sm hover:bg-neutral-100 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-black/10 bg-white md:hidden">
          <div className="container mx-auto px-4 py-4">
            {/* Primary nav links */}
            <div className="space-y-2">
              {(isForBusinessPage || isPricingPage) && (
                <Link
                  href="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-normal text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                >
                  <CreditCard className="h-4 w-4 text-black" />
                  Pricing
                </Link>
              )}

              {!(isForBusinessPage || isPricingPage) && (
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-normal text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                >
                  <CalendarDays className="h-4 w-4 text-black" />
                  Book now
                </Link>
              )}
            </div>

            <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
              {isAuthenticated ? (
                <>
                  <div className="rounded-md bg-neutral-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary">Account</p>
                    <p className="mt-1 text-base font-semibold text-neutral-900">{displayName}</p>
                    <p className="text-sm text-neutral-500">Quick access to your dashboard</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoPreferredSalon}
                    className="flex w-full items-center justify-between rounded-md border border-black/10 bg-white px-4 py-4 text-left text-sm font-semibold text-primary transition-colors transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:border-black hover:bg-neutral-50"
                  >
                    <span className="block max-w-[200px] truncate">{preferredVenueLabel}</span>
                    <MapPin className="h-5 w-5 text-black" />
                  </button>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleNavigatePreferredSalon}
                      className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-normal text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-black" />
                      <span className="truncate">My preferred salon</span>
                    </button>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-normal text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                    >
                      <LayoutDashboard className="h-4 w-4 shrink-0 text-black" />
                      Dashboard
                    </Link>
                  </div>

                  <div className="border-t border-black/10 pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-normal text-neutral-700 transition-colors transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:bg-neutral-50 hover:text-black"
                    >
                      <LogOut className="h-4 w-4 shrink-0 text-black" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-black hover:text-black"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                  >
                    Get started
                  </Link>

                  <Link
                    href="/partners"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-black bg-neutral-100 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-neutral-200"
                  >
                    <Briefcase className="h-4 w-4 text-black" />
                    For businesses
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
