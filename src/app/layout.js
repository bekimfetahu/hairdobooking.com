// Server root layout: keep this as a server component to ensure marketing pages are
// rendered server-side for SEO. Client-only behavior (Redux, session, heavy
// interactivity) should live in a nested client layout for authenticated routes.

import "./globals.css";
import NavbarAuthWrapper from '@/components/navigation/NavbarAuthWrapper';
import StoreProvider from '@/components/providers/StoreProvider';

export const metadata = {
  title: 'HairdoBooking',
  description: 'Book appointments at hair salons',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Maps API is loaded via @googlemaps/js-api-loader in LocationSearch component */}
      </head>
      <body className="antialiased bg-background text-foreground">
        <StoreProvider>
          <div className="pt-16">
            {/* Server-side auth wrapper that passes user data to navbar */}
            <NavbarAuthWrapper />

            {/* Page content */}
            <main>
              {children}
            </main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
