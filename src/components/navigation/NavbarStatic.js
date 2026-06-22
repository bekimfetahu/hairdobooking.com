"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CreditCard, Briefcase, LayoutDashboard, LogOut, UserRound, MapPin, ChevronDown, Menu, X, CalendarDays } from 'lucide-react';
import { loginSuccess, logout } from '@/store/slices/authSlice';

export default function NavbarStatic({ initialUser = null }) {

  const pathname = usePathname();
  console.log("PATHNAME static:", pathname);

  const router = useRouter();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);
  const [user, setUser] = useState(initialUser || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
      dispatch(loginSuccess({
        user: initialUser,
        token: initialUser?.token
      }));
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
    // Mark component as hydrated. AuthHydrator will sync Redux from the
    // server-provided initial user (window.__INITIAL_USER__). Navbar should
    // not perform its own session fetch to avoid double requests.
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    const handlePreferredSalonUpdated = (event) => {
      const updatedUser = event?.detail?.user ?? event?.detail ?? null;
      if (updatedUser) {
        setUser(updatedUser);
        setIsAuthenticated(true);
        dispatch(loginSuccess({
          user: updatedUser,
          token: updatedUser?.token
        }));
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
    console.log('handleGoPreferredSalon clicked!');
    console.log('preferredVenueSlug:', preferredVenueSlug);
    console.log('isAuthenticated:', isAuthenticated);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (preferredVenueSlug) {
      console.log('Navigating to salon:', `/salon/${preferredVenueSlug}`);
      router.push(`/salon/${preferredVenueSlug}`);
    } else {
      console.log('Navigating to salon search');
      router.push('/salon/search');
    }
  };

  const handleNavigatePreferredSalon = () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);

    if (preferredVenueSlug) {
      router.push(`/salon/${preferredVenueSlug}`);
    }
  };

  const navLinkClasses = (href) => {
    const basePath = getBasePath(href);
    const isActive = basePath === '/' ? pathname === '/' : pathname === basePath || pathname.startsWith(`${basePath}/`);

    return `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out hover:shadow-sm ${isActive
      ? 'bg-neutral-100 text-black border-black/20'
      : 'border-transparent text-neutral-700 hover:bg-neutral-100 hover:text-black hover:border-black/10'
      }`;
  };

  const clean = (p) => p.replace(/\/+$/, ""); // remove trailing slash
  const isActivePath = (href, pathname) => {
    const current = clean(pathname);
    const target = clean(href);
    return current === target || current.startsWith(`${target}/`);
  };


  return (
    <header className="fixed top-0 z-50 w-full border-b border-black/10 bg-white/95 backdrop-blur-xl" ref={navRef}>
      <div className="mx-auto max-w-[1200px] flex items-center justify-between h-16 px-4">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Hairdo Booking" width="240" height="25" />
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          {isAuthenticated && (
            <Link
              href={preferredVenueSlug ? `/salon/${preferredVenueSlug}` : '/salon/search'}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black transition-colors duration-150 ease-out hover:shadow-sm hover:border-black/20 hover:bg-neutral-50"
            >
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="max-w-[180px] truncate text-xs text-black">
                {preferredVenueLabel}
              </span>
            </Link>
          )}

          {(isForBusinessPage || isPricingPage) && (
            <Link href="/pricing" className={navLinkClasses('/pricing')}>
              <CreditCard className="h-4 w-4 text-black" />
              Pricing
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
                    </div>
                    <div className="p-2">
                      <Link
                        href="/dashboard"
                        className={`mb-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${isActivePath("/dashboard", pathname)
                            ? "bg-neutral-100 text-black font-medium"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-black"
                          }`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 shrink-0 text-black" />
                        Dashboard
                      </Link>

                      <Link
                        href="/profile"
                        className={`mb-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${isActivePath("/profile", pathname)
                            ? "bg-neutral-100 text-black font-medium"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-black"
                          }`}
                      >
                        <UserRound className="h-4 w-4 shrink-0 text-black" />
                        Profile
                      </Link>

                      <Link
                        href="/my-appointments"
                        className={`mb-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${isActivePath("/my-appointments", pathname)
                            ? "bg-neutral-100 text-black font-medium"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-black"
                          }`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <CalendarDays className="h-4 w-4 shrink-0 text-black" />
                        My Appointments
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
                className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium md:inline-flex ${isForBusinessPage
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

            </div>

            <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
              {isAuthenticated ? (
                <>
                  <div className="rounded-md bg-neutral-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary">Account</p>
                    <p className="mt-1 text-base font-semibold text-neutral-900">{displayName}</p>
                    <p className="text-sm text-neutral-500">Quick access to your dashboard</p>
                  </div>

                  <Link
                    href={preferredVenueSlug ? `/salon/${preferredVenueSlug}` : '/salon/search'}
                    className="flex w-full items-center justify-start rounded-md border border-black/10 bg-white px-4 py-4 text-left text-sm font-semibold text-black transition-colors duration-150 ease-out hover:shadow-sm hover:border-black hover:bg-neutral-50"
                  >
                    <MapPin className="h-5 w-5 text-black mr-3" />
                    <span className="block max-w-[200px] truncate">{preferredVenueLabel}</span>

                  </Link>

                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-normal text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                    >
                      <LayoutDashboard className="h-4 w-4 shrink-0 text-black" />
                      Dashboard
                    </Link>
                    <Link
                      href="/my-appointments"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-normal text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                    >
                      <CalendarDays className="h-4 w-4 shrink-0 text-black" />
                      My Appointments
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

    </header>
  );
}
