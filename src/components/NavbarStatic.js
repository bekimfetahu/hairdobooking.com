"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, CalendarDays, Briefcase } from 'lucide-react';

export default function NavbarStatic() {
  const pathname = usePathname();
  const isForBusinessPage = pathname === '/partners' || pathname.startsWith('/partners/');
  const isPricingPage = pathname === '/pricing' || pathname.startsWith('/pricing/');

  const getBasePath = (href) => href.split('?')[0];

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
    <header className="fixed top-0 z-50 w-full border-b border-black/10 bg-white/95 backdrop-blur-xl">
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
        </div>
      </div>
    </header>
  );
}
