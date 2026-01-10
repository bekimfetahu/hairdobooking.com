'use client';
import React from "react";
import Button from "./ui/Button"; // plain React Button component
import { Calendar, Sparkles } from "lucide-react";


export default function Hero() {
    return (
        <section
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
            style={{ background: "var(--gradient-hero)" }}
        >
            {/* Gradient orbs */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left content */}
                    <div className="space-y-8 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-purple-500">
                                Modern Booking Made Simple
                             </span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                            Your Salon's
                            <span className="block bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Smart Scheduler
              </span>
                        </h1>

                        <p className="text-xl text-gray-600 max-w-xl">
                            Streamline appointments, delight clients, and grow your business
                            with our intelligent booking platform designed for beauty
                            professionals.
                        </p>

                        <p className="text-xl text-gray-600 max-w-xl">
                            Streamline appointments, delight clients, and grow your business
                            with our intelligent booking platform designed for beauty
                            professionals.
                        </p>

                        <p className="text-xl text-gray-600 max-w-xl">
                            Streamline appointments, delight clients, and grow your business
                            with our intelligent booking platform designed for beauty
                            professionals.
                        </p>

                        <p className="text-xl text-gray-600 max-w-xl">
                            Streamline appointments, delight clients, and grow your business
                            with our intelligent booking platform designed for beauty
                            professionals.
                        </p>

                        <p className="text-xl text-gray-600 max-w-xl">
                            Streamline appointments, delight clients, and grow your business
                            with our intelligent booking platform designed for beauty
                            professionals.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                className="text-lg px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center"
                            >
                                <Calendar className="w-5 h-5 mr-2" />
                                Start Free Trial
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-6 border-2 hover:bg-purple-500/5 transition-all duration-300"
                            >
                                Watch Demo
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 pt-8 border-t border-gray-200">
                            <div>
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                    10k+
                                </div>
                                <div className="text-sm text-gray-500">Active Salons</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                    500k+
                                </div>
                                <div className="text-sm text-gray-500">Monthly Bookings</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                    98%
                                </div>
                                <div className="text-sm text-gray-500">Client Satisfaction</div>
                            </div>
                        </div>
                    </div>

                    {/* Right image */}
                    <div className="relative animate-fade-in delay-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 animate-pulse" />
                        <img
                            src="/hero-booking.jpg"
                            alt="Hair booking scheduler interface"
                            className="relative rounded-3xl shadow-lg w-full hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
