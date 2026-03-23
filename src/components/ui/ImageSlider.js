"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
    { src: "/images/appointments.png", label: "Desktop" },
    { src: "/images/model.png", label: "Tablet" },
    { src: "/images/model-2.png", label: "Mobile" },
];

export default function ImageSlider({
                                        autoplay = true,
                                        delay = 5000, // ms
                                        className = "",
                                        fullBleed = false,
                                    }) {
    const n = slides.length;
    // extended slides (triple) for seamless looping
    const extended = [...slides, ...slides, ...slides];

    // virtual index runs across extended array; start at middle copy
    const [virtualIndex, setVirtualIndex] = useState(n);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const trackRef = useRef(null);
    const slideRefs = useRef([]);
    const [offsets, setOffsets] = useState([]);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const autoplayRef = useRef(null);

    // compute offsets of each slide relative to track
    const computeOffsets = () => {
        const track = trackRef.current;
        if (!track) return;
        const offs = slideRefs.current.map((el) => (el ? el.offsetLeft : 0));
        setOffsets(offs);
    };

    useEffect(() => {
        computeOffsets();
        const onResize = () => computeOffsets();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Recompute when images load
    useEffect(() => {
        const imgs = slideRefs.current.map((el) => (el ? el.querySelector('img') : null));
        let loaded = 0;
        if (!imgs.length) {
            computeOffsets();
            return;
        }
        imgs.forEach((img) => {
            if (!img) return;
            if (img.complete) {
                loaded += 1;
                if (loaded === imgs.length) computeOffsets();
            } else {
                img.addEventListener('load', () => {
                    loaded += 1;
                    if (loaded === imgs.length) computeOffsets();
                }, { once: true });
            }
        });
    }, []);

    // autoplay
    useEffect(() => {
        if (!autoplay) return;
        if (paused) return;
        autoplayRef.current = setInterval(() => {
            // advance virtual index
            setVirtualIndex((v) => v + 1);
        }, delay);
        return () => clearInterval(autoplayRef.current);
    }, [autoplay, paused, delay]);

    // keyboard navigation
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight") setVirtualIndex((v) => v + 1);
            if (e.key === "ArrowLeft") setVirtualIndex((v) => v - 1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const next = () => setVirtualIndex((v) => v + 1);
    const prev = () => setVirtualIndex((v) => v - 1);

    // transform style based on offsets
    const getTransform = () => {
        if (!offsets.length) return 'translateX(0px)';
        const x = offsets[virtualIndex] || 0;
        return `translateX(${-x}px)`;
    };

    // sync logical index when virtualIndex changes; handle seamless reset
    useEffect(() => {
        // update logical index for UI (dots/label)
        const newIndex = ((virtualIndex % n) + n) % n;
        setIndex(newIndex);

        // if virtualIndex goes beyond the second copy, reset to middle copy silently
        const min = 0;
        const max = extended.length - 1;

        // after transition duration, if we're in an edge copy, snap back to middle
        if (virtualIndex <= n - 1) {
            // left edge reached (before middle)
            // schedule snapping to middle equivalent
            const timer = setTimeout(() => {
                setTransitionEnabled(false);
                const snapped = n + (virtualIndex % n);
                setVirtualIndex(snapped);
                // re-enable transition next tick
                setTimeout(() => setTransitionEnabled(true), 40);
            }, 510);
            return () => clearTimeout(timer);
        }

        if (virtualIndex >= 2 * n) {
            const timer = setTimeout(() => {
                setTransitionEnabled(false);
                const snapped = n + (virtualIndex % n);
                setVirtualIndex(snapped);
                setTimeout(() => setTransitionEnabled(true), 40);
            }, 510);
            return () => clearTimeout(timer);
        }
    }, [virtualIndex]);

    return (
        <div
            className={
                `relative w-full mx-auto overflow-hidden ${fullBleed ? '' : 'bg-white rounded-2xl'} ${className}`
            }
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            {/* Arrows */}
            <button
                onClick={prev}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 z-20 transform -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-800 rounded-full p-2 shadow transition"
            >
                <ChevronLeft size={22} />
            </button>

            <button
                onClick={next}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 z-20 transform -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-800 rounded-full p-2 shadow transition"
            >
                <ChevronRight size={22} />
            </button>

            {/* Track container with explicit heights to control image sizing */}
            <div className="relative w-full">
                <div
                    ref={trackRef}
                    className="flex will-change-transform"
                    style={{ transform: getTransform(), transition: transitionEnabled ? 'transform 500ms ease-in-out' : 'none' }}
                >
                    {extended.map((s, i) => (
                        <div
                            key={`${s.src}-${i}`}
                            ref={(el) => (slideRefs.current[i] = el)}
                            className="flex-shrink-0 flex items-center justify-start h-[260px] sm:h-[360px] md:h-[420px] lg:h-[560px]"
                        >
                            <img src={s.src} alt={`${s.label} view`} style={{ height: '100%', width: 'auto', display: 'block' }} />
                        </div>
                    ))}
                </div>

                {/* Labels overlay */}
                <div className="absolute left-4 bottom-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-neutral-900 shadow-sm">
                    {slides[index].label}
                </div>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2">
                {slides.map((s, i) => (
                    <button
                        key={s.src}
                        onClick={() => setVirtualIndex(n + i)}
                        aria-label={`Go to ${s.label}`}
                        className={`h-2 w-8 rounded-full transition-all ${i === index ? "bg-primary" : "bg-black/10"}`}
                    />
                ))}
            </div>
        </div>
    );
}
