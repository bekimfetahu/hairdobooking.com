"use client";

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';

export default function AuthHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const initial = typeof window !== 'undefined' ? window.__INITIAL_USER__ : null;
      console.debug('AuthHydrator initial user:', initial);
      if (initial) {
        dispatch(loginSuccess({ user: initial, token: initial?.token }));
        try { delete window.__INITIAL_USER__; } catch (e) { window.__INITIAL_USER__ = null; }
      }
    } catch (e) {
      // no-op
    }
  }, [dispatch]);

  return null;
}
