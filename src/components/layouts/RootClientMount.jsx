"use client";

import { createRoot } from 'react-dom/client';
import RootClientWrapper from './RootClientWrapper';

export default function RootClientMount() {
  // This component mounts once on the client to hydrate the server layout's
  // placeholder and provide Navbar + Redux for pages outside the (app) group.
  if (typeof window === 'undefined') return null;

  const placeholder = document.getElementById('root-client-wrapper');
  if (!placeholder) return null;

  // Prevent double-mount in hot-reload environments
  if (placeholder.dataset.mounted) return null;
  placeholder.dataset.mounted = '1';

  const root = createRoot(placeholder);
  root.render(<RootClientWrapper />);
  return null;
}
