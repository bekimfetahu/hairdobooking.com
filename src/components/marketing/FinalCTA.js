import Link from "next/link";

export default function FinalCTA() {
    return (
        <section className="py-12">
            <div className="container mx-auto px-6">
                <div className="rounded-[1.25rem] border border-black/10 bg-white p-8 text-center shadow-xl">
                    <h3 className="text-2xl font-semibold text-neutral-950">Find your next appointment today</h3>
                    <p className="mt-3 text-sm text-neutral-600">Fast bookings, verified salons, no public rating noise. Start searching now.</p>

                    <div className="mt-6 flex items-center justify-center gap-4">
                        <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white hover:bg-neutral-800">Search salons</Link>
                        <Link href="/register" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3.5 text-sm font-medium text-neutral-700 hover:border-black hover:text-black">Create account</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

