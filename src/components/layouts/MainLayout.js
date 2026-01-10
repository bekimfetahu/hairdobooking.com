'use client';

import React, {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {usePathname, useRouter} from 'next/navigation'; // For redirection
import {loginSuccess, logout} from "@/store/slices/authSlice";
// import Header from "@/components/layouts/Header";
// import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/Navbar";

export default function MainLayout({children}) {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Fetch Redux state
    const dispatch = useDispatch();
    const router = useRouter();
    // console current route path
    const pathname = usePathname();
    console.log("Current route:", pathname);
    // check if current route is /partners*
    const isPartnerRoute = pathname.startsWith('/partners');
    console.log("Is partner route:", isPartnerRoute);

    // Restore session using HttpOnly cookie on component mount
    useEffect(() => {
        if (isPartnerRoute) return; // 🚀 skip for partner routes
        const restoreSession = async () => {
            try {
                const res = await fetch('/api/auth/me', {
                    method: 'GET',
                    credentials: 'include', // Include cookies in the request
                });

                if (res.ok) {
                    const data = await res.json();
                    dispatch(loginSuccess({user: data.user})); // Update Redux state
                } else if (res.status === 401) {
                    // Token is invalid or expired, logout the user
                    dispatch(logout()); // Clear user data in Redux
                    // router.push('/login'); // Redirect to login page
                }
            } catch (err) {
                console.error("Failed to restore session:", err.message);
                // Optionally, you could handle network or server errors here
            }
        };

        if (!isAuthenticated) {
            restoreSession(); // Only restore session if not already authenticated
        }
    }, [isAuthenticated, dispatch, router]);

    return (
        <div>
            <Navbar />
            <div>{children}</div>
            {/*<Footer />*/}
        </div>
    );

}
