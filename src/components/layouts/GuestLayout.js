"use client"
import Link from "next/link"; // Use Link from next/link
import {useSelector} from "react-redux";
import Header from "@/components/layouts/Header";

export default function GuestLayout({children}) {
    const user = useSelector((state) => state.auth.user);
    return (
        <>
           <Header />
            <main className="container mx-auto py-8">
                {children}
            </main>
        </>

    );
}
