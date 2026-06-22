"use client";

import ClientProvider from '@/components/providers/ClientProvider';
import MainLayout from '@/components/layouts/MainLayout';
import StoreProvider from '@/components/providers/StoreProvider';
import AuthHydrator from '@/components/auth/AuthHydrator';
import NavbarStatic from '@/components/navigation/NavbarStatic';
import RootClientMount from '@/components/layouts/RootClientMount';

export default function AppClientLayout({ children }) {
  // Client wrapper for interactive/authenticated pages. Place dashboard,
  // partners, login, register and other client-heavy routes inside the
  // route group `(app)` so they inherit this layout and gain Redux, session
  // restore, and other client behavior.
  return (
    <StoreProvider>
      <ClientProvider>
        <div className="pt-0">
          <AuthHydrator />
          <NavbarStatic />
          <RootClientMount />
          <MainLayout>{children}</MainLayout>
        </div>
      </ClientProvider>
    </StoreProvider>
  );
}

