'use client';
import { cn } from "@/lib/utils";

export default function BlueButton({
    children,
    onClick,
    type = "button",
    disabled = false,
    sizeClass = "text-sm",
    className = "",
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "cursor-pointer inline-flex items-center justify-center px-6 py-2.5 rounded-full font-semibold text-white gap-2 bg-brand-blue border border-brand-blue hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 transition ease-in-out duration-150",
                sizeClass,
                className,
            )}
        >
            {children}
        </button>
    );
}

