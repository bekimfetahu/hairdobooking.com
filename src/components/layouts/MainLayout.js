'use client';

import React, {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {usePathname} from 'next/navigation';
import {loginSuccess, logout} from "@/store/slices/authSlice";
import Navbar from "@/components/navigation/NavbarClient";

export default function MainLayout({children}) {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    const pathname = usePathname();
    const isPartnerRoute = pathname.startsWith('/partners');

    useEffect(() => {
        if (isPartnerRoute) return;
        const restoreSession = async () => {
            try {
                // Call backend to check if user is authenticated (via HttpOnly cookie)
                const res = await fetch('/api/auth/me', {
                    method: 'GET',
                    credentials: 'include', // Include HttpOnly cookie
                });

                if (res.ok) {
                    // Backend confirmed user is authenticated
                    const data = await res.json();
                    dispatch(loginSuccess({
                        user: data.user,
                        token: data.token
                    }));
                } else if (res.status === 401) {
                    // Backend says not authenticated - logout
                    dispatch(logout());
                }
            } catch (err) {
                console.error("[MainLayout] Failed to restore session:", err.message);
            }
        };

        if (!isAuthenticated) {
            restoreSession();
        }
    }, [isAuthenticated, dispatch, isPartnerRoute]);

    return (
        <div>
            <Navbar />
            <div>{children}</div>
        </div>
    );

}
