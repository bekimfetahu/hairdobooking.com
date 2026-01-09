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
        const formData = {
            method: 'post',
            access_type: 'laravelApp',
            url: '/client/free-trial',
            data: data,
        }

        try {
            const response = await fetch('/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
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
        <main className="w-full flex items-center justify-center py-10 px-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
                {/* Heading */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Take a Free Trial
                    </h1>
                    <p className="mt-2 text-gray-600">✨ No credit card required</p>
                </div>

                {/* Alerts */}
                {errorMsg && (
                    <div className="mb-4 text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-md">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="mb-4 text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-md">
                        {successMsg}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Name full row */}
                        <input
                            type="text"
                            name="company_name"
                            placeholder="Company Name (required)"
                            required
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none md:col-span-2"
                        />

                        {/* First & Last Name */}
                        <input
                            type="text"
                            name="first_name"
                            placeholder="First Name (required)"
                            required
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name (required)"
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />

                        {/* Email & Phone */}
                        <input
                            type="email"
                            name="email"
                            placeholder="Company Email Address (required)"
                            required
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Company Phone Number"
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />

                    </div>

                    {/* Terms */}
                    <div className="flex items-center">
                        <input
                            id="termsAccepted"
                            name="termsAccepted"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-indigo-600 border-gray-400 rounded"
                        />
                        <label htmlFor="termsAccepted" className="ml-2 text-sm text-gray-600">
                            I agree to the{" "}
                            <a href="/terms" className="text-indigo-600 hover:underline">
                                Terms & Conditions
                            </a>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-6 rounded-lg bg-indigo-600 text-white font-semibold text-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? "Registering..." : "Start Free Trial"}
                    </button>
                </form>
            </div>
        </main>
    );
}
