'use client';
import React from "react";
import Button from "./ui/Button"; // plain React Button component
import { Calendar, Sparkles } from "lucide-react";


export default function Hero() {
    return (
        <section
            className="relative min-h-[70vh] overflow-hidden flex items-center justify-center"
            style={{ background: "var(--gradient-hero)" }}
        >
            <div className="absolute top-12 left-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-8 right-0 h-[20rem] w-[20rem] rounded-full bg-black/5 blur-3xl" aria-hidden="true" />

            <div className="container mx-auto px-4 py-10 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left content */}
                    <div className="space-y-8 animate-fade-in">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Modern booking made simple
                             </span>
                        </div>

                        {/* Reduced heading size: text-4xl (was text-5xl) and lg:text-6xl (was lg:text-7xl) */}
                        <h1 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight text-neutral-950 lg:text-6xl">
                            Grow your salon with a
                            <span className="block text-primary">premium booking experience</span>
                        </h1>

                        <p className="max-w-xl text-lg leading-8 text-neutral-600 lg:text-xl">
                            Streamline appointments, delight clients, and grow your business
                            with a polished experience that feels modern, fast, and easy to book from any device.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                className="px-8 py-6 text-base shadow-lg shadow-black/10 hover:-translate-y-0.5 flex items-center"
                            >
                                <Calendar className="w-5 h-5 mr-2" />
                                Start Free Trial
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="px-8 py-6 text-base border-black/15 hover:bg-neutral-50 transition-all duration-300"
                            >
                                Watch Demo
                            </Button>
                        </div>

                        {/* Stats */}
                        {/*<div className="flex flex-wrap gap-8 pt-8 border-t border-black/10">*/}
                        {/*    <div>*/}
                        {/*        <div className="text-3xl font-semibold text-primary">*/}
                        {/*            10k+*/}
                        {/*        </div>*/}
                        {/*        <div className="text-sm text-neutral-500">Active salons</div>*/}
                        {/*    </div>*/}
                        {/*    <div>*/}
                        {/*        <div className="text-3xl font-semibold text-primary">*/}
                        {/*            500k+*/}
                        {/*        </div>*/}
                        {/*        <div className="text-sm text-neutral-500">Monthly bookings</div>*/}
                        {/*    </div>*/}
                        {/*    <div>*/}
                        {/*        <div className="text-3xl font-semibold text-primary">*/}
                        {/*            98%*/}
                        {/*        </div>*/}
                        {/*        <div className="text-sm text-neutral-500">Client satisfaction</div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>

                    {/* Right image */}
                    <div className="relative animate-fade-in delay-300">
                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-black/5 to-transparent blur-2xl" />
                        <img
                            src="/images/model.png"
                            alt="Hair booking scheduler interface"
                            className="relative w-full rounded-[2rem] border border-black/10 shadow-2xl shadow-black/10 transition-transform duration-500 hover:scale-[1.02]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
