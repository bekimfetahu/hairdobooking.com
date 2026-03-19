"use client"
import Header from "@/components/layouts/Header";

export default function GuestLayout({children}) {
    return (
        <>
           <Header />
            <main className="container mx-auto py-8">
                {children}
            </main>
        </>

    );
}
