'use client';

import React from 'react';
export default function MainLayout({ children }) {
  // MainLayout is a client wrapper for interactive pages. Authentication
  // is resolved server-side by `NavbarAuthWrapper` which fetches the current
  // user during SSR and passes `initialUser` into the client navbar.
  // This keeps a single server-side fetch path and avoids duplicate client
  // restore requests scattered across the app.
  return (
    <div>
      <div>{children}</div>
    </div>
  );
}
