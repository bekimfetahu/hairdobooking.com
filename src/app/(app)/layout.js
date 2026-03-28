"use client";

import ClientProvider from '@/components/ClientProvider';
import MainLayout from '@/components/layouts/MainLayout';

export default function AppClientLayout({ children }) {
  // Client wrapper for interactive/authenticated pages. Place dashboard,
  // partners, login, register and other client-heavy routes inside the
  // route group `(app)` so they inherit this layout and gain Redux, session
  // restore, and other client behavior.
  return (
    <ClientProvider>
      <div className="pt-0">
        <MainLayout>{children}</MainLayout>
      </div>
    </ClientProvider>
  );
}

