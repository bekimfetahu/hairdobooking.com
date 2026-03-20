'use client';

import {useState} from 'react';
import {useDispatch} from 'react-redux';
import {loginSuccess} from '@/store/slices/authSlice';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AuthPageShell from '@/components/layouts/AuthPageShell';
import BlackButton from "@/components/ui/BlackButton";
import InputField from "@/components/ui/InputField";
import CheckBox from "@/components/ui/CheckBox";
import {EyeSlashIcon, EyeIcon} from "@/components/ui/svg/CustomIcons";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import { fetchCurrentUser } from '@/services/auth/session';
import {CalendarDays, Heart, Sparkles} from 'lucide-react';

const benefits = [
    {
        icon: CalendarDays,
        title: 'Book in minutes',
        text: 'Create your account and start booking appointments quickly.',
    },
    {
        icon: Heart,
        title: 'Save your favorites',
        text: 'Keep the salons you love in one place.',
    },
    {
        icon: Sparkles,
        title: 'Simple client access',
        text: 'A clean sign-up flow made for clients.',
    },
];

export default function UserRegister() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
            return "All fields are required.";
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            return "Invalid email format.";
        }
        if (!formData.termsAccepted) {
            return "You must accept the terms and conditions.";
        }
        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'Registration failed');
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
            eyebrow="Client signup"
            title="Create your account"
            description="Book appointments, save salons, and manage your visits with a simple client account."
            panelBadge="Built for clients"
            panelTitle="A simple way to manage your appointments."
            panelDescription="Join HairdoBooking to save your favorite salons, rebook faster, and keep everything organized."
            benefits={benefits}
        >
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Client signup</p>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Create your account</h2>
                <p className="mt-2 text-sm leading-7 text-neutral-600">Start with Google or fill in your details below.</p>
            </div>

            {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                <GoogleSignInButton />

                <button
                    type="button"
                    onClick={() => window.location.href = '/api/auth/social/facebook'}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-black hover:text-black"
                >
                    <Image src="/images/facebook-logo.png" alt="Facebook" width={20} height={20} className="h-5 w-5" />
                    Continue with Facebook
                </button>
            </div>

            <div className="my-6 border-t border-black/10" />

            <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        id="firstName"
                        label="First Name"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                    <InputField
                        id="lastName"
                        label="Last Name"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                    <InputField
                        id="email"
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="md:col-span-2"
                    />
                    <InputField
                        id="phone"
                        label="Phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="md:col-span-2"
                    />

                    <div className="relative">
                        <InputField
                            id="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-9 text-neutral-500 hover:text-neutral-700"
                            style={{top: '3rem'}}
                        >
                            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>

                    <div className="relative">
                        <InputField
                            id="confirmPassword"
                            label="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 text-neutral-500 hover:text-neutral-700"
                            style={{top: '3rem'}}
                        >
                            {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center">
                    <CheckBox
                        checked={formData.termsAccepted}
                        onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                        label={
                            <>
                                I agree to the{" "}
                                <Link href="/terms" className="text-black hover:underline">
                                    Terms & Conditions
                                </Link>
                            </>
                        }
                        required
                    />
                </div>

                <BlackButton type="submit" className="w-full py-3 text-lg">
                    {loading ? 'Registering...' : 'Create Account'}
                </BlackButton>
            </form>
        </AuthPageShell>
    );
}
