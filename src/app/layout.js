// Server root layout: keep this as a server component to ensure marketing pages are
// rendered server-side for SEO. Client-only behavior (Redux, session, heavy
// interactivity) should live in a nested client layout for authenticated routes.

import "./globals.css";
import Script from 'next/script';
import NavbarStatic from '@/components/navigation/NavbarStatic';
import { getCurrentUserServer } from '@/lib/auth-server';
import StoreProvider from '@/components/providers/StoreProvider';

export const metadata = {
  title: 'HairdoBooking',
  description: 'Book appointments at hair salons',
};

export default async function RootLayout({ children }) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const user = await getCurrentUserServer();

  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="antialiased bg-background text-foreground">
        {googleMapsApiKey ? (
          <Script
            id="google-maps-js-api"
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=maps,places,marker&v=weekly&loading=async`}
            strategy="afterInteractive"
          />
        ) : null}
        <StoreProvider>
          <div className="pt-16">
            {/* Server-side fetch of current user and pass to client navbar */}
            <NavbarStatic initialUser={user} />

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
