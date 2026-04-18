// Server root layout: keep this as a server component to ensure marketing pages are
// rendered server-side for SEO. Client-only behavior (Redux, session, heavy
// interactivity) should live in a nested client layout for authenticated routes.

import "./globals.css";
import NavbarStatic from '@/components/navigation/NavbarStatic';
import StoreProvider from '@/components/providers/StoreProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <StoreProvider>
          <div className="pt-16">
            {/* Server-only static navbar for SEO and initial load */}
            <NavbarStatic />

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
