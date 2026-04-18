'use client';
import React from "react";
import { cn } from "@/lib/utils";

export default function Button({ children, variant = "default", size = "default", className = "", ...props }) {
    const base =
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
        default: "bg-black text-white hover:bg-neutral-800 focus:ring-black",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 focus:ring-neutral-900",
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-900",
        ghost: "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-neutral-900",
        link: "text-primary underline-offset-4 hover:underline",
    };

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
    };

    return (
        <button
            className={cn(base, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
}
