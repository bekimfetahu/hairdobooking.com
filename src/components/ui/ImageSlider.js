"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageSlider({
  slides = [],
  autorun = false,
  delay = 5000,
  className = "",
  showLabel = true,
  sliderHeight = 320,
  sliderHeightMobile = null,
}) {
  const [queue, setQueue] = useState(slides);
  const [isMobile, setIsMobile] = useState(false);
  const [paused, setPaused] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [labelSlide, setLabelSlide] = useState(slides[0] ?? null);
  const slideRefs = useRef([]);
  const autoplayRef = useRef(null);
  const pendingActionRef = useRef(null);

  const resolveHeightValue = (height) => (typeof height === "number" ? `${height}px` : height);
  const sliderHeightValue = isMobile && sliderHeightMobile != null
    ? resolveHeightValue(sliderHeightMobile)
    : resolveHeightValue(sliderHeight);

  useEffect(() => {
    setQueue(slides);
    setLabelSlide(slides[0] ?? null);
    setTranslateX(0);
    setTransitionEnabled(true);
    setIsAnimating(false);
    pendingActionRef.current = null;
  }, [slides]);

  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth < 768);
    updateMobileState();
    window.addEventListener("resize", updateMobileState);
    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  const getSlideWidth = (index = 0) => {
    const element = slideRefs.current[index];
    if (!element) return 0;
    return Math.round(element.getBoundingClientRect().width);
  };

  const next = () => {
    if (isAnimating || queue.length <= 1) return;

    const shift = getSlideWidth(0);
    if (!shift) return;

    pendingActionRef.current = "next";
    setIsAnimating(true);
    setTransitionEnabled(true);
    setTranslateX(-shift);
  };

  const prev = () => {
    if (isAnimating || queue.length <= 1) return;

    const lastIndex = queue.length - 1;
    const shift = getSlideWidth(lastIndex);
    if (!shift) return;

    const lastSlide = queue[lastIndex];
    const rotated = [lastSlide, ...queue.slice(0, lastIndex)];

    pendingActionRef.current = "prev";
    setIsAnimating(true);
    setTransitionEnabled(false);
    setQueue(rotated);
    setLabelSlide(lastSlide);
    setTranslateX(-shift);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
        setTranslateX(0);
      });
    });
  };

  useEffect(() => {
    if (!autorun || paused || isAnimating) return;

    autoplayRef.current = setInterval(() => {
      next();
    }, delay);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autorun, paused, delay, isAnimating, queue.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queue.length, isAnimating]);

  const handleTrackTransitionEnd = (event) => {
    if (event.target !== event.currentTarget) return;

    if (pendingActionRef.current === "next") {
      setQueue((currentQueue) => {
        if (currentQueue.length <= 1) return currentQueue;
        const [first, ...rest] = currentQueue;
        const rotated = [...rest, first];
        setLabelSlide(rotated[0] ?? null);
        return rotated;
      });
      setTransitionEnabled(false);
      setTranslateX(0);
      setIsAnimating(false);
      pendingActionRef.current = null;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitionEnabled(true));
      });
      return;
    }

    if (pendingActionRef.current === "prev") {
      setIsAnimating(false);
      pendingActionRef.current = null;
    }
  };

  return (
    <div
      className={`relative w-full mx-auto overflow-hidden rounded-lg bg-[#f0f2f5] ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
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

      <div className="relative w-full overflow-hidden">
        <div
          className="flex items-stretch will-change-transform"
          onTransitionEnd={handleTrackTransitionEnd}
          style={{
            transform: `translateX(${translateX}px)`,
            transition: transitionEnabled ? "transform 500ms ease-in-out" : "none",
          }}
        >
          {queue.map((slide, index) => (
            <div
              key={`${slide.src}-${index}`}
              ref={(el) => (slideRefs.current[index] = el)}
              className="flex-shrink-0 flex items-stretch justify-start overflow-hidden w-auto"
              style={{ height: sliderHeightValue }}
            >
              <img
                src={slide.src}
                alt={`${slide.label} view`}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="block h-full w-auto max-w-none object-contain"
              />
            </div>
          ))}
        </div>

        {showLabel && labelSlide?.label && (
          <div className="absolute left-4 bottom-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-neutral-900 shadow-sm">
            {labelSlide.label}
          </div>
        )}
      </div>
    </div>
  );
}
