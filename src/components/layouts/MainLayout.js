'use client';

import React, {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {usePathname} from 'next/navigation';
import {loginSuccess, logout} from "@/store/slices/authSlice";
import Navbar from "@/components/NavbarClient";

export default function MainLayout({children}) {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    const pathname = usePathname();
    const isPartnerRoute = pathname.startsWith('/partners');

    useEffect(() => {
        if (isPartnerRoute) return;
        const restoreSession = async () => {
            try {
                const res = await fetch('/api/auth/me', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (res.ok) {
                    const data = await res.json();
                    dispatch(loginSuccess({user: data.user}));
                } else if (res.status === 401) {
                    dispatch(logout());
                }
            } catch (err) {
                console.error("Failed to restore session:", err.message);
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
