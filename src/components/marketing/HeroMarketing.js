import Image from "next/image";
import Link from "next/link";

export default function HeroMarketing() {
    return (
        <section aria-label="Hero" className="relative py-10 sm:py-14">
    			<div className="mx-auto max-w-7xl px-6">
                <div className="rounded-md border border-black/10 bg-white/95 px-6 py-8 shadow-sm sm:px-8 sm:py-10">
                    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                    <div>
                        {/* Intro with black + red combination */}
                        <p className="text-sm font-semibold uppercase tracking-[0.25em]">
                            <span className="text-neutral-900">Find &amp;</span>
                            <span className="ml-2 text-primary">book</span>
                        </p>

                        {/* Slightly smaller headline for better layout */}
                        <h1 className="mt-2 text-2xl font-semibold leading-tight text-neutral-950 md:text-3xl">
                            Book <span className="text-primary">hair &amp; beauty</span> appointments near you — fast, simple, tusted
                        </h1>

                        <p className="mt-4 text-base text-neutral-600">Discover nearby salons, barbers and beauty professionals. Quickly search services, choose a convenient time and book instantly — no rating noise, just clear choices.</p>

                        {/* Server-rendered form for SEO and immediate usability */}
                        <form method="get" action="/search" className="mt-6 flex w-full max-w-2xl gap-2">
                            <input
                                name="service"
                                aria-label="Service"
                                placeholder="Service (e.g. Haircut, Nails)"
                                className="w-1/2 rounded-full border border-black/10 px-4 py-2 text-sm"
                            />

                            <input
                                name="location"
                                aria-label="Location"
                                placeholder="Location or postcode"
                                className="w-1/2 rounded-full border border-black/10 px-4 py-2 text-sm"
                            />

                            <button type="submit" className="ml-2 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">Search</button>
                        </form>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800">Create account</Link>
                            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-black hover:text-black">Sign in</Link>
                        </div>
                    </div>

                    {/* Visual: preserve image aspect ratio. On desktop this appears to the right. */}
                    <div className="hidden lg:flex items-center justify-center">
                        <div className="relative h-auto w-full max-w-xl overflow-hidden rounded-md shadow-xs">
                            <Image src="/images/model.png" alt="Salon professional arranging appointments" fill={false} priority={true} width={880} height={560} className="h-full w-auto object-contain mx-auto" sizes="(min-width: 1024px) 600px, 100vw" />
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
