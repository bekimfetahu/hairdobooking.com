'use client';

import { useEffect, useState } from 'react';

export default function useGoogleMapsReady() {
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.google?.maps) {
      setMapsReady(true);
      return;
    }

    const intervalId = window.setInterval(() => {
      if (window.google?.maps) {
        setMapsReady(true);
        window.clearInterval(intervalId);
      }
    }, 100);

    return () => window.clearInterval(intervalId);
  }, []);

  return mapsReady;
}
