"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";

export default function DesktopNav({logoutHandler}) {
    const pathname = usePathname();
    return (
        <nav className="hidden md:flex space-x-12 md:px-[60px]">
            {["services", "about", "contact"].map((item) => {
                const isActive = pathname === `/${item}`;
                return (
                    <Link key={item} href={`/${item}`} className="relative group pb-2">
                        <span className="text-gray-700 text-xl transition duration-300 group-hover:text-black">
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </span>
                        <span className={`absolute left-0 bottom-0 w-full h-[2px] transition duration-300 ${
                            isActive ? "bg-black" : "bg-white group-hover:bg-red-500"
                        }`}
                        />
                    </Link>
                );
            })}
        </nav>
    );
}
