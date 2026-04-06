'use client'

import { useState } from "react";


export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleRegister = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        const data = {
            company_name: event.target.company_name.value,
            first_name: event.target.first_name.value,
            last_name: event.target.last_name.value,
            email: event.target.email.value,
            phone: event.target.phone.value,
            termsAccepted: event.target.termsAccepted.checked,
        };


    /* await fetch('/laravelApi/dynamic', {
            *   method: 'POST',
            *   headers: { 'Content-Type': 'application/json' },
            *   body: JSON.stringify({
                *     method: 'post',
                *     access_type: 'laravelApi',
                *     url: '/login',
                *     data: {
                        *       email: 'user@example.com',
                        *       password: 'secret'
                        *     }
                    *   }),
            * });
            *
     */
        const body = { data };

        try {
            const response = await fetch('/api/partners/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw { status: response.status, data: errorData };
            }

            const result = await response.json();
            setSuccessMsg("🎉 Registration successful! Please check your email.");
        } catch (error) {
            const data = error?.data;

            if (error.status === 422 && data?.errors) {
                const firstError = Object.values(data.errors)[0];
                if (firstError) {
                    setErrorMsg(`⚠️ ${firstError}`);
                    return;
                }
            }

            console.error("Registration failed:", error);
            setErrorMsg("⚠️ Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }

    };

    return (
        <section
            className="relative min-h-[70vh] overflow-hidden flex items-center justify-center px-4 py-10"
            style={{ background: "var(--gradient-hero)" }}
        >
            <div className="absolute top-12 left-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-8 right-0 h-[20rem] w-[20rem] rounded-full bg-black/5 blur-3xl" aria-hidden="true" />

            <div className="relative z-10 container mx-auto">
                <div className="grid gap-10 lg:grid-cols-2 items-stretch">
                    {/* Left: form card */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-black/10 shadow-xl p-8 md:p-10 h-full flex flex-col">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
                            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                                Free trial for salons owners
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-950">
                            Start your free salon trial
                        </h1>
                        <p className="mt-3 text-sm md:text-base text-neutral-600">
                            Share a few details about your salon and we&apos;ll set up your account.
                            No credit card required.
                        </p>
                        <p className="mt-2 text-sm md:text-base text-neutral-600">
                            Once you sign up, you&apos;ll receive an email with clear next steps on how to set up
                            your salon, invite your team and get your booking calendar ready.
                        </p>

                        {/* Alerts */}
                        {errorMsg && (
                            <div className="mt-4 mb-2 text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-md text-sm">
                                {errorMsg}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mt-4 mb-2 text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-md text-sm">
                                {successMsg}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleRegister} className="mt-6 space-y-6 flex-1 flex flex-col justify-between">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Company Name full row */}
                                <input
                                    type="text"
                                    name="company_name"
                                    placeholder="Company name *"
                                    required
                                    className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-black focus:outline-none md:col-span-2 text-sm"
                                />

                                {/* First & Last Name */}
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="First name *"
                                    required
                                    className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-black focus:outline-none text-sm"
                                />
                                <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Last name"
                                    className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-black focus:outline-none text-sm"
                                />

                                {/* Email & Phone */}
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Work email *"
                                    required
                                    className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-black focus:outline-none text-sm"
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone (optional)"
                                    className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-black focus:outline-none text-sm"
                                />
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-2 text-sm text-neutral-600">
                                <input
                                    id="termsAccepted"
                                    name="termsAccepted"
                                    type="checkbox"
                                    required
                                    className="mt-1 h-4 w-4 text-black border-black/30 rounded"
                                />
                                <label htmlFor="termsAccepted">
                                    I agree to the
                                    {" "}
                                    <a href="/terms" className="font-medium text-primary hover:underline">
                                        Terms & Conditions
                                    </a>
                                    .
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-6 rounded-lg bg-black text-white font-medium text-sm md:text-base shadow-lg shadow-black/10 hover:bg-neutral-800 transition disabled:opacity-60 mt-4"
                            >
                                {loading ? "Registering..." : "Start free trial"}
                            </button>
                        </form>
                    </div>

                    {/* Right: hero-style image */}
                    <div className="relative hidden lg:flex h-full items-stretch">
                        <div className="absolute inset-0 rounded-[1.25rem] bg-gradient-to-br from-primary/20 via-black/5 to-transparent blur-2xl" aria-hidden="true" />
                        <div className="relative rounded-[1.25rem] border border-white/70 bg-white/70 shadow-2xl shadow-black/20 overflow-hidden flex-1">
                            <img
                                src="/images/reservations.png"
                                alt="Hairdresser using tablet to book an appointment"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
