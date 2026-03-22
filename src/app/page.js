// src/app/page.js

import Hero from "../components/Hero";
import Button from "@/componentsui/Button.js";
import React from "react";

export default function Home() {
    return (
        <section
            className="relative min-h-[70vh] overflow-hidden flex items-center justify-center"
            style={{ background: "var(--gradient-hero)" }}
        >
            <div className="container mx-auto px-4 py-10 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                        Welcome to HairdoBooking, the premier booking platform for salons and barbershops. Our mission is to help you grow your business by providing a modern, fast, and easy-to-use booking experience that delights your clients and streamlines your operations.
                </div>
            </div>
        </section>
    );
}
