import { CheckCircle, Clock, Users } from "lucide-react";

const steps = [
    { icon: Clock, title: "Find a time", text: "Search and find the right slot in seconds." },
    { icon: Users, title: "Choose your salon", text: "Pick a verified salon or barber you trust." },
    { icon: CheckCircle, title: "Book instantly", text: "Confirm in one tap — no fuss, no surprise fees." },
];

export default function HowItWorks() {
    return (
        <section className="py-12">
            <div className="container mx-auto px-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">How it works</p>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Booking in 3 simple steps</h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {steps.map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.title} className="rounded-md border border-black/10 bg-white p-6 text-center shadow-sm">
                                <Icon className="mx-auto h-6 w-6 text-black" />
                                <h3 className="mt-4 font-semibold">{s.title}</h3>
                                <p className="mt-2 text-sm text-neutral-600">{s.text}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

