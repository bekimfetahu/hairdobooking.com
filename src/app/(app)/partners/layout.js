"use client";

import ClientProvider from '@/components/providers/ClientProvider';
import MainLayout from '@/components/layouts/MainLayout';

export default function PartnersLayout({ children }) {
  return (
    <ClientProvider>
      <div>
        <MainLayout>{children}</MainLayout>
      </div>
    </ClientProvider>
  );
}

