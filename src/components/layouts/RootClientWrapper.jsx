"use client";

import StoreProvider from '@/components/providers/StoreProvider';
import AuthHydrator from '@/components/auth/AuthHydrator';
import NavbarStatic from '@/components/navigation/NavbarStatic';

export default function RootClientWrapper({ children }) {
  return (
    <StoreProvider>
      <AuthHydrator />
      <NavbarStatic />
      {children}
    </StoreProvider>
  );
}
