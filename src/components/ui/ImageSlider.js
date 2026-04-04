"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageSlider({
                                    slides = [],
                                    autorun = false,
                                    delay = 5000, // ms
                                    className = "",
                                    fullBleed = false,
                                    showLabel = true,
                                    sliderHeight = 320,
                                    sliderHeightMobile = null,
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
    const [isMobile, setIsMobile] = useState(false);
    const pendingSnapIndexRef = useRef(null);

    const resolveHeightValue = (height) => (typeof height === "number" ? `${height}px` : height);
    const sliderHeightValue = isMobile && sliderHeightMobile != null
        ? resolveHeightValue(sliderHeightMobile)
        : resolveHeightValue(sliderHeight);

    // compute offsets of each slide relative to track
    const computeOffsets = () => {
        const track = trackRef.current;
        if (!track) return;
        const offs = slideRefs.current.map((el) => (el ? Math.round(el.offsetLeft) : 0));
        setOffsets(offs);
    };

    useEffect(() => {
        computeOffsets();
        const updateMobileState = () => setIsMobile(window.innerWidth < 768);
        updateMobileState();
        window.addEventListener("resize", computeOffsets);
        window.addEventListener("resize", updateMobileState);
        return () => {
            window.removeEventListener("resize", computeOffsets);
            window.removeEventListener("resize", updateMobileState);
        };
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
        if (!autorun) return;
        if (paused) return;
        autoplayRef.current = setInterval(() => {
            // advance virtual index
            setVirtualIndex((v) => v + 1);
        }, delay);
        return () => clearInterval(autoplayRef.current);
    }, [autorun, paused, delay]);

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

    // transform style based on offsets — use measured slide edges so the next slide fills any remaining space
    const getTransform = () => {
        if (!offsets.length) return 'translateX(0px)';
        const x = Math.round(offsets[virtualIndex] || 0);
        return `translateX(${-x}px)`;
    };

    // sync logical index when virtualIndex changes; handle seamless reset
    useEffect(() => {
        // update logical index for UI (dots/label)
        const newIndex = ((virtualIndex % n) + n) % n;
        setIndex(newIndex);

        // When we move into one of the outer copies, prepare a silent snap back
        // to the matching slide in the middle copy after the animation ends.
        if (virtualIndex < n || virtualIndex >= 2 * n) {
            pendingSnapIndexRef.current = n + (virtualIndex % n);
        } else {
            pendingSnapIndexRef.current = null;
        }
    }, [virtualIndex]);

    const handleTrackTransitionEnd = () => {
        if (pendingSnapIndexRef.current === null) return;
        const snapped = pendingSnapIndexRef.current;
        pendingSnapIndexRef.current = null;
        setTransitionEnabled(false);
        setVirtualIndex(snapped);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setTransitionEnabled(true));
        });
    };

    return (
        <div
            className={
                `relative w-full mx-auto overflow-hidden rounded-lg bg-[#f0f2f5] ${className}`
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

            {/* Track container with a fixed viewport height and natural-width slides */}
            <div className="relative w-full overflow-hidden">
                <div
                    ref={trackRef}
                    className="flex items-stretch will-change-transform"
                    onTransitionEnd={handleTrackTransitionEnd}
                    style={{ transform: getTransform(), transition: transitionEnabled ? 'transform 500ms ease-in-out' : 'none' }}
                >
                    {extended.map((s, i) => (
                        <div
                            key={`${s.src}-${i}`}
                            ref={(el) => (slideRefs.current[i] = el)}
                            className="flex-shrink-0 flex items-stretch justify-start overflow-hidden w-auto"
                            style={{ height: sliderHeightValue }}
                        >
                            <img
                                src={s.src}
                                alt={`${s.label} view`}
                                className="block h-full w-auto max-w-none object-contain"
                            />
                        </div>
                    ))}
                </div>

                {/* Labels overlay */}
                {showLabel && slides[index]?.label && (
                    <div className="absolute left-4 bottom-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-neutral-900 shadow-sm">
                        {slides[index].label}
                    </div>
                )}
            </div>

        </div>
    );
}
