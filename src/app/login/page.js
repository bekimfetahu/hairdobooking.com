'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import BlackButton from "@/components/ui/BlackButton";
import InputField from "@/components/ui/InputField";
import CheckBox from "@/components/ui/CheckBox";
import Image from "next/image";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";

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
            if (!response.ok) throw new Error(data.message || 'Login failed');
            console.log(data.user)

            dispatch(loginSuccess({ user: data.user }));
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-grow justify-center items-center">
            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <form onSubmit={handleLogin}>
                    {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

                    {/* Email Input */}
                    <div>
                        <InputField
                            id="email"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mt-4">
                        <InputField
                            id="password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="block mt-4">
                        <CheckBox
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            label="Remember me"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end mt-4">
                        <a
                            href="/forgot-password"
                            className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Forgot your password?
                        </a>
                        <BlackButton type="submit">
                            {loading ? 'Logging in...' : 'Log in'}
                        </BlackButton>
                    </div>
                </form>
            </div>
        {/*    ADD section to login with social login google and facebook */}
            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-full">
                        <GoogleSignInButton />
                    </div>
                    <button
                        type="button"
                        onClick={() => window.location.href = '/api/auth/social/facebook'}
                        className="relative w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                    >
                        {/* Facebook logo centered like Google */}
                        <div className="mr-2">
                            <img src="/images/facebook-logo.png" alt="Facebook" className="w-6 h-6" />
                        </div>

                        {/* Centered label */}
                        <span className="text-gray-700 font-medium">Continue with Facebook</span>
                    </button>


                </div>
            </div>
        </div>
    );
}
