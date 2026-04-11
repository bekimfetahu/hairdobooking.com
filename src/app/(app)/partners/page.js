import PageShell from "@/components/layouts/PageShell";
import Image from "next/image";
import Link from "next/link";
import BlackButton from '@/components/ui/BlackButton';
import ImageLightbox from '@/components/ImageLightbox';
import { CalendarDays, Phone, Layers, Users, Globe, CheckSquare } from "lucide-react";

export default function PartnerPage() {
    return (
        <PageShell variant="business">
            <div className="mx-auto max-w-6xl">

                {/* HERO */}
                <section id="hero" className="pt-6 pb-8">
                    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">For businesses</p>
                            <h1 className="max-w-xl text-2xl font-semibold leading-[1.05] tracking-tight text-neutral-950 lg:text-5xl">
                                All Your Salon Bookings.
                                <span className="block text-primary">One Simple System.</span>
                            </h1>
                            <p className="mt-4 text-lg text-neutral-700">Manage appointments from marketplaces, social media, and your own clients — all in one place, without the chaos.</p>

                            <ul className="mt-6 space-y-2 text-neutral-600">
                                <li>• No more switching between platforms</li>
                                <li>• No more double bookings</li>
                                <li>• No more messy schedules</li>
                            </ul>

                            <div className="mt-6 flex flex-wrap gap-4">
                                <Link href="/partners/register">
                                    <BlackButton>Start Free Trial</BlackButton>
                                </Link>
                                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-black hover:text-black">See plans</Link>
                            </div>

                            <p className="mt-3 text-sm text-neutral-500">No credit card required • Setup in minutes</p>
                        </div>
                          <div className="flex items-center justify-center">
                            <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4 w-full">
                                <ImageLightbox src="/images/appointments.png" alt="Scheduler showing professionals and external bookings" imgClass="rounded" />
                            </div>
                        </div>

                      
                    </div>
                </section>

                {/* SCHEDULER SHOWCASE */}
                <section id="scheduler" className="mt-10 rounded-[1rem] border border-black/10 bg-white p-8 shadow-sm">
                    <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Product showcase</p>
                            <h3 className="mt-2 text-2xl font-semibold text-neutral-950">See your full day at a glance</h3>
                            <p className="mt-3 text-neutral-600">A clear timeframe scheduler showing your team, salon appointments and external bookings from partner apps — all colour-coded so your staff never miss a slot.</p>

                            <div className="mt-6">
                                <Link href="/partners/register">
                                    <BlackButton>Start Free Trial</BlackButton>
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="rounded-2xl border border-black/5 bg-neutral-50 p-4 w-full">
                                <ImageLightbox src="/images/appointments.png" alt="Scheduler showing professionals and external bookings" imgClass="rounded" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CLARITY */}
                <section id="clarity" className="mt-12 rounded-[1rem] border border-black/10 bg-white p-8 shadow-sm">
                    <h2 className="text-2xl font-semibold text-neutral-950">Keep using what already works</h2>
                    <p className="mt-3 text-neutral-600">Using marketplaces, Instagram, or taking bookings by phone? HairdoBooking brings everything together into one simple dashboard — so you stay organised without changing how you work.</p>
                </section>

                {/* PROBLEM */}
                <section id="problem" className="mt-12">
                    <div className="rounded-[1rem] border border-black/10 bg-white p-8">
                        <h3 className="text-xl font-semibold text-neutral-950">Your bookings are scattered</h3>
                        <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-neutral-700">
                            <li>• Multiple booking sources (marketplaces, social, phone)</li>
                            <li>• Constant switching between platforms</li>
                            <li>• Double bookings and scheduling conflicts</li>
                            <li>• No clear daily overview</li>
                        </ul>
                    </div>
                </section>

                {/* SOLUTION */}
                <section id="solution" className="mt-12 rounded-[1rem] border border-black/10 bg-neutral-50 p-8">
                    <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                        <div>
                            <h3 className="text-2xl font-semibold text-neutral-950">One central hub for your entire salon</h3>
                            <p className="mt-3 text-neutral-600">HairdoBooking connects all your booking sources into a single system — giving you full visibility and control over your schedule.</p>

                            <div className="mt-6 flex gap-3">
                                <Link href="/partners/register">
                                    <BlackButton>Start Free Trial</BlackButton>
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <Image src="/images/calendar-placeholder.png" alt="Central calendar screenshot" width={680} height={420} className="w-[520px] max-w-full h-auto rounded shadow" />
                        </div>
                    </div>
                </section>

                {/* CORE BENEFITS */}
                <section id="core-benefits" className="mt-12">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Core benefits</p>
                        <h3 className="mt-2 text-2xl font-semibold text-neutral-950">Built to run your salon with confidence</h3>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <article className="rounded-[1rem] border border-black/10 bg-white p-6 text-center shadow-sm">
                            <CalendarDays className="mx-auto h-6 w-6 text-black" />
                            <h5 className="mt-4 font-semibold">Everything in One Calendar</h5>
                            <p className="mt-2 text-sm text-neutral-600">All bookings — from anywhere — in one clear schedule.</p>
                        </article>

                        <article className="rounded-[1rem] border border-black/10 bg-white p-6 text-center shadow-sm">
                            <Globe className="mx-auto h-6 w-6 text-black" />
                            <h5 className="mt-4 font-semibold">Keep Using Marketplaces</h5>
                            <p className="mt-2 text-sm text-neutral-600">No need to change how you attract clients. We organise your bookings, not replace your channels.</p>
                        </article>

                        <article className="rounded-[1rem] border border-black/10 bg-white p-6 text-center shadow-sm">
                            <CheckSquare className="mx-auto h-6 w-6 text-black" />
                            <h5 className="mt-4 font-semibold">Avoid Double Bookings</h5>
                            <p className="mt-2 text-sm text-neutral-600">One reliable calendar keeps your schedule accurate.</p>
                        </article>

                        <article className="rounded-[1rem] border border-black/10 bg-white p-6 text-center shadow-sm">
                            <Users className="mx-auto h-6 w-6 text-black" />
                            <h5 className="mt-4 font-semibold">Client Management</h5>
                            <p className="mt-2 text-sm text-neutral-600">Track clients, history, and appointments independently from third-party platforms.</p>
                        </article>

                        <article className="rounded-[1rem] border border-black/10 bg-white p-6 text-center shadow-sm">
                            <Layers className="mx-auto h-6 w-6 text-black" />
                            <h5 className="mt-4 font-semibold">Less Admin</h5>
                            <p className="mt-2 text-sm text-neutral-600">Spend less time managing bookings and more time with clients.</p>
                        </article>
                    </div>
                </section>

                {/* MARKETPLACE */}
                <section id="marketplace" className="mt-12 rounded-[1rem] border border-black/10 bg-white p-8 shadow-sm">
                    <h3 className="text-2xl font-semibold text-neutral-950">Bring in new clients — without losing your own</h3>
                    <p className="mt-3 text-neutral-600">HairdoBooking includes a marketplace designed to help new clients discover your salon — without pushing your existing clients toward competitors.</p>

                    <ul className="mt-4 space-y-2 text-neutral-700">
                        <li>• Attract new clients actively searching for services</li>
                        <li>• Your existing clients stay focused on your salon</li>
                        <li>• No competitor distraction after selection</li>
                    </ul>
                </section>

                {/* FAIRNESS / RATINGS */}
                <section id="fairness" className="mt-8 rounded-[1rem] border border-black/5 bg-neutral-50 p-6">
                    <h4 className="text-lg font-semibold text-neutral-900">A fairer experience for salon professionals</h4>
                    <p className="mt-2 text-neutral-600">Public rating systems can often be inconsistent. HairdoBooking focuses on helping you build strong client relationships and a reliable business — instead of relying heavily on anonymous scores that don’t always reflect your work.</p>
                </section>

                {/* HOW IT WORKS */}
                <section id="how" className="mt-12">
                    <h3 className="text-2xl font-semibold text-neutral-950">How it works</h3>
                    <ol className="mt-4 space-y-4 text-neutral-700">
                        <li><strong>1. Set Up Your Salon</strong> — Add services, availability, and team.</li>
                        <li><strong>2. Keep Taking Bookings Anywhere</strong> — Marketplaces, social media, phone.</li>
                        <li><strong>3. Manage Everything in One Place</strong> — All bookings in one dashboard.</li>
                        <li><strong>4. Get Discovered by New Clients</strong> — Through our marketplace.</li>
                    </ol>
                </section>

                {/* PRODUCT VISUALS */}
                <section id="visuals" className="mt-12 rounded-[1rem] border border-black/10 bg-white p-8 shadow-sm">
                    <h3 className="text-2xl font-semibold text-neutral-950">Product visuals</h3>
                    <p className="mt-2 text-neutral-600">Screenshots: calendar, dashboard and booking interface.</p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded overflow-hidden bg-neutral-50">
                            <Image src="/images/screenshot-calendar.png" alt="Calendar" width={400} height={260} className="w-full h-auto" />
                        </div>
                        <div className="rounded overflow-hidden bg-neutral-50">
                            <Image src="/images/screenshot-dashboard.png" alt="Dashboard" width={400} height={260} className="w-full h-auto" />
                        </div>
                        <div className="rounded overflow-hidden bg-neutral-50">
                            <Image src="/images/screenshot-booking.png" alt="Booking interface" width={400} height={260} className="w-full h-auto" />
                        </div>
                    </div>
                </section>

                {/* COMPARISON */}
                <section id="comparison" className="mt-12 rounded-[1rem] border border-black/10 bg-white p-8 shadow-sm">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                            <h4 className="font-semibold text-neutral-900">Without HairdoBooking</h4>
                            <ul className="mt-3 space-y-2 text-neutral-700">
                                <li>• Multiple tools</li>
                                <li>• Manual tracking</li>
                                <li>• High risk of mistakes</li>
                                <li>• No central visibility</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-neutral-900">With HairdoBooking</h4>
                            <ul className="mt-3 space-y-2 text-neutral-700">
                                <li>• One system</li>
                                <li>• Clear overview</li>
                                <li>• Fewer errors</li>
                                <li>• Full control</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section id="final-cta" className="mt-12 rounded-[1.25rem] border border-black/10 bg-white p-8 text-center shadow-xl">
                    <h3 className="text-2xl font-semibold text-neutral-950">Take control of your salon bookings</h3>
                    <p className="mt-3 text-sm text-neutral-600">Stop juggling platforms. Start managing everything in one place.</p>

                    <div className="mt-6 flex items-center justify-center gap-4">
                        <Link href="/partners/register">
                            <BlackButton>Start Free Trial</BlackButton>
                        </Link>
                        <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3.5 text-sm font-medium text-neutral-700 hover:border-black hover:text-black">See plans</Link>
                    </div>

                    <p className="mt-3 text-sm text-neutral-500">No credit card required • Setup in minutes • Cancel anytime</p>
                </section>

                {/* FAQ */}
                <section id="faq" className="mt-12 mb-12">
                    <h3 className="text-2xl font-semibold text-neutral-950">Frequently asked questions</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1rem] border border-black/10 bg-white p-6">
                            <p className="font-semibold">Do I need to stop using marketplaces?</p>
                            <p className="mt-2 text-neutral-600">No — you can continue using them as usual. HairdoBooking centralises bookings so you don't have to change how you attract clients.</p>
                        </div>

                        <div className="rounded-[1rem] border border-black/10 bg-white p-6">
                            <p className="font-semibold">Is setup complicated?</p>
                            <p className="mt-2 text-neutral-600">No — setup is quick and simple. Add your services, team and availability and you're ready to go.</p>
                        </div>
                    </div>
                </section>
            </div>
        </PageShell>
    );
}
