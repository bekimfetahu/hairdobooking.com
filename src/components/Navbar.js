'use client';
import React from "react";
import Button from "@/components/ui/Button"; // your custom Button
import { Scissors } from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
// import DesktopNav from "@/components/DesktopNav";
// import MobileNav from "@/components/MobileNav";
import { logout } from "@/store/slices/authSlice";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // Include cookies in the request
            });

            if (res.ok) {
                dispatch(logout()); // Clear user data in Redux
                router.push('/login'); // Redirect to login page
            }
        } catch (err) {
            console.error("Failed to restore session:", err.message);
            router.push('/login');
        }
    };

    const dropdownRef = useRef(null);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (user) {
            setIsDropdownOpen(false);
        }
    }, [user]);


    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <Scissors className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">BookSalon</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">How It Works</a>
                        <a href="#testimonials" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Testimonials</a>
                        <a href="#pricing" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pricing</a>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                                Sign In
                            </Button>
                        </Link>

                        <Link href="/partners/register">
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transition-all duration-300">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
