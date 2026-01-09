"use client";
import Link from "next/link";

export default function MobileNav({
                                      isMobileMenuOpen,
                                      setIsMobileMenuOpen,
                                      user,
                                      handleLogout,
                                  }) {
    if (!isMobileMenuOpen) {
        return null;
    }
    return (
        <nav className="md:hidden bg-white text-gray-700 shadow-md">
            <ul className="px-2 py-2 space-y-2">
                {/*{["services", "about", "contact"].map((item) => (*/}
                {/*    <li key={item}>*/}
                {/*        <Link*/}
                {/*            href={`/${item}`}*/}
                {/*            className="block px-3 py-2 text-lg transition duration-300 hover:bg-gray-100 hover:text-black"*/}
                {/*            onClick={() => setIsMobileMenuOpen(false)}*/}
                {/*        >*/}
                {/*            {item.charAt(0).toUpperCase() + item.slice(1)}*/}
                {/*        </Link>*/}
                {/*    </li>*/}
                {/*))}*/}
                {user ? (
                    <>
                        <li>
                            <Link
                                href="/partners"
                                className="block px-3 py-2 text-lg transition duration-300 hover:bg-gray-100 hover:text-black"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                For Businesses
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="block w-full text-left px-3 py-2 text-lg transition duration-300 hover:bg-gray-100 hover:text-black"
                            >
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link
                                href="/login"
                                className="block px-3 py-2 text-lg transition duration-300 hover:bg-gray-100 hover:text-black"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/register"
                                className="block px-3 py-2 text-lg transition duration-300 hover:bg-gray-100 hover:text-black"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Register
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}
