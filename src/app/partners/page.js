import Title from "@/components/typography/Title";
import Link from "next/link";

export default function PartnerPage() {
    return (
        <main className="w-full py-16 ">
            <div className="mx-auto max-w-6xl px-6">
                {/* Hero Section */}
                <div className="backdrop-blur-md shadow-md rounded-2xl p-10">
                    <Title className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center md:text-left">
                        Crafted Exclusively for Beauty Salons & Barber Shops <br />
                        <span className="text-blue-500">The All-In-One Booking Platform for Growth</span>
                    </Title>

                    <p className="text-gray-600 mt-6 text-lg leading-relaxed max-w-5xl">
                        Whether you’re a solo stylist or managing multiple locations,
                        <strong className="text-gray-900"> Hairdobooking gives you everything you need to grow</strong>.
                        Accept bookings 24/7, manage your team and services, and keep clients coming back —
                        without hidden fees or complicated setups.
                        <span className="block mt-2">Simple. Powerful. Built exclusively for Beauty & Hair Professionals.</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mt-10">
                        {/* Left Column: Features */}
                        <div>
                            <ul className="grid gap-4 text-gray-700 text-lg">
                                <li className="flex items-center gap-2 bg-blue-50 rounded-lg px-4 py-3">📅 24/7 online booking</li>
                                <li className="flex items-center gap-2 bg-purple-50 rounded-lg px-4 py-3">❤️&nbsp;Favorite & rebook functionality</li>
                                <li className="flex items-center gap-2 bg-pink-50 rounded-lg px-4 py-3">💸 No commission fees</li>
                                <li className="flex items-center gap-2 bg-green-50 rounded-lg px-4 py-3">📍 Unlimited salon locations</li>
                                <li className="flex items-center gap-2 bg-yellow-50 rounded-lg px-4 py-3">👥 Scalable subscriptions — unsubscribe anytime</li>
                                <li className="flex items-center gap-2 bg-indigo-50 rounded-lg px-4 py-3">🚀 Free trial, no credit card needed</li>
                            </ul>
                        </div>

                        {/* Right Column: Model Image */}
                        <div className="flex justify-center md:justify-end">
                            <img
                                src="images/model.png"
                                alt="Hair salon model"
                                style={{ width: '100%', height: 'auto' }}
                                className="rounded-md shadow-lg object-cover object-center max-w-sm md:max-w-md"
                            />
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="flex justify-center mt-12">
                    <Link
                        href="/partners/register"
                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold px-10 py-5 rounded-full shadow-lg hover:scale-105 transform transition"
                    >
                        Start Your Free Trial
                    </Link>
                </div>
            </div>
        </main>
    );
}
