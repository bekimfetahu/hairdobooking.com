"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const slides = [
    { src: '/hero-booking.jpg', label: 'Desktop' },
    { src: '/images/model.png', label: 'Tablet' },
    { src: '/images/model-2.png', label: 'Mobile' },
];

export default function ImageSlider() {
    const [index, setIndex] = useState(0);

    const next = () => setIndex((prev) => (prev + 1) % slides.length);
    const prev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

    const current = slides[index];

    return (
        <div className="relative w-full mx-auto overflow-hidden bg-white rounded-2xl">
            {/* Arrows */}
            <button
                onClick={prev}
                aria-label="Previous"
                className="absolute left-4 top-1/2 z-20 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow"
            >
                <ChevronLeft size={28} />
            </button>

            <button
                onClick={next}
                aria-label="Next"
                className="absolute right-4 top-1/2 z-20 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow"
            >
                <ChevronRight size={28} />
            </button>

            <div className="relative">
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={current.src}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.45 }}
                        className="w-full h-64 sm:h-80 md:h-96 lg:h-[480px] rounded-2xl overflow-hidden"
                    >
                        <Image
                            src={current.src}
                            alt={`${current.label} view`}
                            fill
                            sizes="(min-width: 1024px) 720px, 100vw"
                            style={{ objectFit: 'cover' }}
                            priority
                        />
                        <div className="absolute left-4 bottom-4 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-neutral-900">{current.label}</div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2">
                {slides.map((s, i) => (
                    <button
                        key={s.src}
                        onClick={() => setIndex(i)}
                        aria-label={`Go to ${s.label}`}
                        className={`h-2 w-8 rounded-full transition-all ${i === index ? 'bg-primary' : 'bg-black/10'}`}
                    />
                ))}
            </div>
        </div>
    );
}
