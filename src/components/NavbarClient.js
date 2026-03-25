"use client";
import { logout, loginSuccess } from '@/store/slices/authSlice';
import PrimarySalonPickerModal from '@/components/PrimarySalonPickerModal';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Briefcase,
    CalendarDays,
    ChevronDown,
    CreditCard,
    Home,
    LayoutDashboard,
    LogOut,
    MapPin,
    Menu,
    Settings2,
    UserRound,
    X,
} from 'lucide-react';
import { setPrimarySalon } from '@/services/auth/primarySalon';

const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/pricing', label: 'Pricing', icon: CreditCard },
    { href: '/register', label: 'Book now', icon: CalendarDays },
];

const accountLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard?view=bookings', label: 'Bookings', icon: CalendarDays },
    { href: '/dashboard?view=settings', label: 'Settings', icon: Settings2 },
];

const getBasePath = (href) => href.split('?')[0];

export default function NavbarClient() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSalonPickerOpen, setIsSalonPickerOpen] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    const navRef = useRef(null);

    const isForBusinessPage = pathname === '/partners' || pathname.startsWith('/partners/');
    const isPricingPage = pathname === '/pricing' || pathname.startsWith('/pricing/');
    const isLoginPage = pathname === '/login' || pathname.startsWith('/login/');

    const visibleNavLinks = navLinks.filter((link) => {
        if (link.href === '/pricing' && !(isForBusinessPage || isPricingPage)) return false;
        if (link.href === '/register' && (isForBusinessPage || isPricingPage)) return false;
        return true;
    });

    const displayName = useMemo(() => {
        return (
            user?.client?.first_name || user?.first_name || user?.name || user?.email?.split('@')[0] || 'Account'
        );
    }, [user]);

    const primaryVenue = user?.client?.primary_venue ?? null;
    const primaryVenueUuid = primaryVenue?.uuid ?? null;
    const primaryVenueLabel = primaryVenue?.name || 'Set primary salon';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setIsMobileMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsDropdownOpen(false);
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

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
        setIsSalonPickerOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsDropdownOpen(false);
            setIsSalonPickerOpen(false);
        }
    }, [isAuthenticated]);

    const handleLogout = async () => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
        setIsSalonPickerOpen(false);
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            dispatch(logout());
            if (!res.ok) {
                router.push('/login');
                return;
            }
            router.push('/login');
        } catch (err) {
            console.error('Failed to log out:', err?.message || err);
            router.push('/login');
        }
    };

    const handleSelectSalon = async (venue) => {
        const updatedUser = await setPrimarySalon(venue.uuid);
        dispatch(loginSuccess({ user: updatedUser }));
        setIsSalonPickerOpen(false);
        setIsMobileMenuOpen(false);
    };

    const renderNavLink = (link, className = '') => {
        const Icon = link.icon;
        const basePath = getBasePath(link.href);
        const isActive = basePath === '/' ? pathname === '/' : pathname === basePath || pathname.startsWith(`${basePath}/`);

        return (
            <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out hover:shadow-sm ${
                    isActive
                        ? 'bg-neutral-100 text-black border-black/20'
                        : 'border-transparent text-neutral-700 hover:bg-neutral-100 hover:text-black hover:border-black/10'
                } ${className}`}
            >
                <Icon className="h-4 w-4" />
                {link.label}
            </Link>
        );
    };

    return (
        <nav ref={navRef} className="fixed top-0 z-50 w-full border-b border-black/10 bg-white/95 backdrop-blur-xl">
            <div className="container mx-auto">
                <div className="flex h-16 items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Hairdo Booking" width={240} height={25} />
                    </Link>

                    <div className="hidden items-center gap-2 md:flex">
                        {visibleNavLinks.map((link) => renderNavLink(link))}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {isAuthenticated ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsSalonPickerOpen(true);
                                    }}
                                    className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black transition-colors duration-150 ease-out hover:shadow-sm hover:border-black/20 hover:bg-neutral-50 md:inline-flex"
                                    aria-label="Change primary salon"
                                >
                                    <MapPin className="h-4 w-4 text-black" />
                                    <span className="max-w-[180px] truncate">{primaryVenueLabel}</span>
                                </button>

                                <div className="relative hidden md:block">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsSalonPickerOpen(false);
                                            setIsDropdownOpen((open) => !open);
                                        }}
                                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black transition-colors duration-150 ease-out hover:shadow-sm hover:border-black/20 hover:bg-neutral-50"
                                        aria-haspopup="menu"
                                        aria-expanded={isDropdownOpen}
                                    >
                                        <UserRound className="h-4 w-4 text-black" />
                                        <span className="max-w-[140px] truncate">{displayName}</span>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl">
                                            <div className="border-b border-black/5 px-4 py-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-primary">Signed in</p>
                                                <p className="mt-1 text-sm font-semibold text-neutral-900">{displayName}</p>
                                                <p className="text-xs text-neutral-500">Manage your bookings and profile</p>
                                            </div>
                                            <div className="p-2">
                                                {accountLinks.map((link) => {
                                                    const Icon = link.icon;
                                                    const isActive = pathname === getBasePath(link.href) || pathname.startsWith(`${getBasePath(link.href)}/`);
                                                    return (
                                                        <Link
                                                            key={link.href}
                                                            href={link.href}
                                                            className={`mb-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-normal transition-colors ${
                                                                isActive ? 'text-black' : 'text-neutral-700 hover:bg-neutral-50 hover:text-black'
                                                            }`}
                                                        >
                                                            <Icon className="h-4 w-4 shrink-0 text-black" />
                                                            {link.label}
                                                        </Link>
                                                    );
                                                })}
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
                                <Link
                                    href="/login"
                                    className={`hidden rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out sm:inline-flex ${
                                        isLoginPage
                                            ? 'bg-neutral-100 text-black border-black/20'
                                            : 'border-transparent text-neutral-700 hover:bg-neutral-100 hover:text-black hover:border-black/10'
                                    }`}
                                >
                                    Sign in
                                </Link>
                                {/* For businesses CTA: border black, light gray bg when active */}
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
            </div>

            {isMobileMenuOpen && (
                <div className="border-t border-black/10 bg-white md:hidden">
                    <div className="container mx-auto px-4 py-4">
                        <div className="space-y-2">{visibleNavLinks.map((link) => renderNavLink(link, 'w-full justify-start px-4 py-3'))}</div>

                        <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="rounded-3xl bg-neutral-50 px-4 py-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-primary">Account</p>
                                        <p className="mt-1 text-base font-semibold text-neutral-900">{displayName}</p>
                                        <p className="text-sm text-neutral-500">Quick access to your dashboard</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setIsDropdownOpen(false);
                                            setIsSalonPickerOpen(true);
                                        }}
                                          className="flex w-full items-center justify-between rounded-3xl border border-black/10 bg-white px-4 py-4 text-left transition-colors transform transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:border-black hover:bg-neutral-50"
                                    >
                                        <span>
                                            <span className="block text-xs uppercase tracking-[0.2em] text-primary">Primary salon</span>
                                            <span className="mt-1 block text-sm font-semibold text-neutral-950">{primaryVenueLabel}</span>
                                        </span>
                                        <MapPin className="h-5 w-5 text-black" />
                                    </button>

                                    <div className="space-y-2">
                                        {accountLinks.map((link) => {
                                            const Icon = link.icon;
                                            const isActive = pathname === getBasePath(link.href) || pathname.startsWith(`${getBasePath(link.href)}/`);
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-normal transition-colors ${
                                                        isActive ? 'text-black' : 'text-neutral-700 hover:bg-neutral-50 hover:text-black'
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0 text-black" />
                                                    {link.label}
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    <div className="border-t border-black/10 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-normal text-neutral-700 transition-colors transform transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:bg-neutral-50 hover:text-black"
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
                                        className="flex items-center justify-center rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-black hover:text-black"
                                    >
                                        Sign in
                                    </Link>

                                    <Link
                                        href="/register"
                                        className="flex items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                                    >
                                        Get started
                                    </Link>

                                    <Link
                                        href="/partners"
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

            <PrimarySalonPickerModal
                open={isSalonPickerOpen}
                onClose={() => setIsSalonPickerOpen(false)}
                currentVenueUuid={primaryVenueUuid}
                currentVenueLabel={primaryVenueLabel}
                onSelect={handleSelectSalon}
            />
        </nav>
    );
}

