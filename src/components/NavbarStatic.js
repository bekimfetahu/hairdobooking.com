import Link from 'next/link';
import { Home, CreditCard, CalendarDays, Briefcase } from 'lucide-react';

export default function NavbarStatic() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-black/10 bg-white/95 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Hairdo Booking" width="240" height="25" />
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-neutral-700 hover:text-black hover:bg-neutral-100">
            <Home className="h-4 w-4 text-black" />
            Home
          </Link>

          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-neutral-700 hover:text-black hover:bg-neutral-100">
            <CreditCard className="h-4 w-4 text-black" />
            Pricing
          </Link>

          <Link href="/register" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-neutral-700 hover:text-black hover:bg-neutral-100">
            <CalendarDays className="h-4 w-4 text-black" />
            Book now
          </Link>

        </nav>

        <div className="flex items-center gap-3">
          <Link href="/search" className="hidden rounded-full bg-black px-4 py-2 text-sm font-medium text-white md:inline-flex">Search</Link>
          <Link href="/login" className="text-sm font-medium text-neutral-700 hover:text-black">Sign in</Link>
          <Link href="/partners" className="hidden items-center gap-2 rounded-full border border-black px-4 py-2 text-sm font-medium text-primary md:inline-flex">
            <Briefcase className="h-4 w-4 text-black" />
            For businesses
          </Link>
        </div>
      </div>
    </header>
  );
}
