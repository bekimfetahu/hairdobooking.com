"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const images = [
    '/images/1.jpg',
    '/images/2.jpg',
    '/images/3.jpg',
    '/images/4.jpg',
];

export default function ImageSlider() {
    const [index, setIndex] = useState(0);

    const next = () => {
        if (index < images.length - 2) setIndex(index + 1);
    };

    const prev = () => {
        if (index > 0) setIndex(index - 1);
    };

    return (
        <div className="relative w-full mx-auto overflow-hidden p-4 bg-white shadow-lg rounded-2xl">
            <div className="flex items-center justify-between">
                <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-700 rounded-full p-2 shadow"
                >
                    <ChevronLeft size={32} />
                </button>

                <div className="flex w-full overflow-hidden">
                    <AnimatePresence initial={false}>
                        {[0, 1].map((offset) => {
                            const imageIndex = index + offset;
                            if (imageIndex >= images.length) return null;
                            return (
                                <motion.div
                                    key={images[imageIndex]}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.5 }}
                                    className={`relative rounded-xl overflow-hidden h-96 ${offset === 0 ? 'w-3/4' : 'w-1/4 ml-4 opacity-80'}`}
                                >
                                    <Image
                                        src={images[imageIndex]}
                                        alt="Slide"
                                        width={800}
                                        height={500}
                                        style={{ objectFit: 'cover' }}
                                        priority
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                <button
                    onClick={next}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-700 rounded-full p-2 shadow"
                >
                    <ChevronRight size={32} />
                </button>
            </div>
        </div>
    );
}
