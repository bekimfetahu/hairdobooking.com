'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthPageShell from '@/components/layouts/AuthPageShell';
import BlackButton from "@/components/ui/BlackButton";
import InputField from "@/components/ui/InputField";
import CheckBox from "@/components/ui/CheckBox";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import { fetchCurrentUser } from '@/services/auth/session';
import { CalendarDays, Heart, Sparkles } from 'lucide-react';

const benefits = [
    {
        icon: CalendarDays,
        title: 'Book appointments',
        text: 'Find salons and manage upcoming visits in one place.',
    },
    {
        icon: Heart,
        title: 'Save favorites',
        text: 'Keep the salons you like most close at hand.',
    },
    {
        icon: Sparkles,
        title: 'Simple and fast',
        text: 'A clean booking experience built for clients.',
    },
];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, remember }),
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'Login failed');
                return;
            }

            const refreshedUser = await fetchCurrentUser();
            dispatch(loginSuccess({ user: refreshedUser || data.user }));
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPageShell
            variant="default"
            eyebrow="Client access"
            title="Welcome back"
            description="Log in to manage bookings, save your favorite salons, and stay on top of your appointments."
            panelBadge="Built for your salon bookings"
            panelTitle="Everything you need to book and manage appointments."
            panelDescription="Keep your appointments organized, find salons faster, and return to your favorites anytime."
            benefits={benefits}
        >
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Sign in</p>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Access your account</h2>
                <p className="mt-2 text-sm leading-7 text-neutral-600">Use your email and password, or continue with Google.</p>
            </div>

            {error && <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <form onSubmit={handleLogin} className="space-y-4">
                <InputField
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                />

                <InputField
                    id="password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                />

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <CheckBox
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        label="Remember me"
                    />

                    <Link
                        href="/forgot-password"
                        className="text-sm text-neutral-600 underline-offset-4 hover:text-black hover:underline"
                    >
                        Forgot your password?
                    </Link>
                </div>

                <BlackButton type="submit" className="w-full py-3 text-lg">
                    {loading ? 'Logging in...' : 'Log in'}
                </BlackButton>
            </form>

            <div className="my-6 border-t border-black/10" />

            <div className="space-y-4">
                <GoogleSignInButton />

                <button
                    type="button"
                    onClick={() => window.location.href = '/api/auth/social/facebook'}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-black hover:text-black"
                >
                    <img src="/images/facebook-logo.png" alt="Facebook" className="h-5 w-5" />
                    Continue with Facebook
                </button>
            </div>
        </AuthPageShell>
    );
}
