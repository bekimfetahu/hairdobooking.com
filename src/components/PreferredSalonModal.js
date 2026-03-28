"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import PreferredSalonSearch from "@/components/PreferredSalonSearch";

export default function PreferredSalonModal({ open, onClose, onPrimaryUpdated }) {
    const handlePrimaryUpdated = (updatedUser) => {
        if (typeof onPrimaryUpdated === "function") {
            onPrimaryUpdated(updatedUser);
        }
        if (updatedUser) {
            onClose?.();
        }
    };

    useEffect(() => {
        if (!open) return;

        const body = document.body;
        const previousOverflow = body.style.overflow;
        body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[999] flex items-start justify-center bg-black/50 px-3 py-3 pt-8 backdrop-blur-sm sm:px-4 sm:py-4 sm:pt-10 lg:pt-12"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >
            <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl">
                <div className="border-b border-black/10 px-5 py-5 sm:px-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Preferred salon</p>
                            <h2 className="mt-2 text-2xl font-semibold text-neutral-950 sm:text-3xl">Search and choose your preferred salon</h2>
                            <p className="mt-2 text-sm leading-7 text-neutral-600">
                                You can only have one preferred salon at a time. We&apos;ll always show services from your preferred salon first when you land on your home page.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-neutral-700 transition-colors hover:border-black hover:text-black"
                            aria-label="Close preferred salon selector"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                    <PreferredSalonSearch onPrimaryUpdated={handlePrimaryUpdated} onClose={onClose} />
                </div>
            </div>
        </div>
    );
}
