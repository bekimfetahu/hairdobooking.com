'use client';
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import DesktopNav from "@/components/DesktopNav";
import MobileNav from "@/components/MobileNav";
import { logout } from "@/store/slices/authSlice";

export default function Header() {
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
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center px-4 py-3">
                {/* Left side: Logo and Desktop Navigation */}
                <div className="flex items-center space-x-6">
                    <Image src="/logo.jpg" alt="Logo" width={270} height={29}/>
                    {/*<DesktopNav />*/}
                </div>

                {/* Right side: User Section */}
                <div className="hidden md:flex items-center space-x-6">
                    {/* For Businesses link */}
                    <Link
                        href="/partners"
                        className="px-4 py-1 mb-1 rounded text-white font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md hover:opacity-90 transition"
                    >
                        For Businesses
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="relative flex items-center gap-1 cursor-pointer text-gray-700 text-lg pb-2 transition duration-300 hover:text-black"
                                    aria-haspopup="true"
                                    aria-expanded={isDropdownOpen}
                                >
                                    <FaUserCircle className="w-5 h-5" color="gray" />
                                    <span>{user?.client?.first_name ?? ''}</span>
                                    <svg
                                        className={`w-4 h-4 transform transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                                {isDropdownOpen && (
                                    <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg overflow-hidden">
                                        <li>
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full cursor-pointer text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {["login", "register"].map((item) => (
                                <Link
                                    key={item}
                                    href={`/${item}`}
                                    className="relative text-gray-700 text-lg pb-2 transition duration-300 hover:text-black"
                                >
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-white hover:bg-black transition duration-300"></span>
                                </Link>
                            ))}
                        </>
                    )}
                </div>

                {/* Mobile Hamburger Menu */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden flex items-center text-black focus:outline-none"
                    aria-label="Toggle mobile menu"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {isMobileMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation */}
            <MobileNav
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                user={user}
                handleLogout={handleLogout}
            />

        </header>
    );
}
