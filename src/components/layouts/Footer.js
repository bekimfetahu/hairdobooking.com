"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const hideFooter = pathname === "/search/service" || pathname === "/salon/search";

    if (hideFooter) {
        return null;
    }

    return (
        <footer className="border-t border-black/10 bg-white text-neutral-900">

            {/* Bottom Section */}
            <div className="mt-3 pt-4 pb-4 text-center text-sm text-neutral-700">
                © {new Date().getFullYear()} Hairdo Booking. All rights reserved.
            </div>
        </footer>
    );
}
