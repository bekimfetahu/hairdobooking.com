import Link from "next/link";

const categories = [
    { label: "Hair", href: "/search?service=Hair" },
    { label: "Barber", href: "/search?service=Barber" },
    { label: "Nails", href: "/search?service=Nails" },
    { label: "Skin Care", href: "/search?service=Skin+Care" },
    { label: "Massage", href: "/search?service=Massage" },
    { label: "Makeup", href: "/search?service=Makeup" },
    { label: "Body", href: "/search?service=Body" },
];

export default function Categories() {
    return (
        <section className="py-12">
            <div className="container mx-auto px-6">
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Quick search</p>
                    <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Popular categories</h2>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {categories.map((c) => (
                        <Link key={c.label} href={c.href} className="flex items-center justify-center rounded-md border border-black/10 px-3 py-4 text-sm font-medium hover:border-black">
                            {c.label}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

