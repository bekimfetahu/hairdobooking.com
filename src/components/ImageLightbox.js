"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function ImageLightbox({ src, alt, className = "", imgClass = "rounded" }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`cursor-pointer overflow-hidden rounded ${className}`}
                aria-label={`Open image: ${alt}`}
            >
                <img src={src} alt={alt} className={`w-full h-auto transition-transform duration-300 hover:scale-[1.01] hover:brightness-95 ${imgClass}`} />
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4 py-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setOpen(false);
                    }}
                >
                    <div className="relative max-h-[95vh] w-full max-w-6xl">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
                            aria-label="Close image preview"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <img src={src} alt={alt} className="w-full h-auto max-h-[95vh] object-contain rounded" />
                    </div>
                </div>
            )}
        </>
    );
}
