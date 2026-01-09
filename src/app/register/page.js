'use client';

import {useState} from 'react';
import {useDispatch} from 'react-redux';
import {useRouter} from 'next/navigation';
import BlackButton from "@/components/ui/BlackButton";
import InputField from "@/components/ui/InputField";
import CheckBox from "@/components/ui/CheckBox";
import {EyeSlashIcon, EyeIcon} from "@/components/ui/svg/CustomIcons";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";

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
            if (!response.ok) throw new Error(data.message || 'Registration failed');

            dispatch({type: "REGISTER_SUCCESS", payload: data.user});
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="w-full flex items-center justify-center py-10 px-4 bg-gradient-to-b from-blue-50 via-white to-gray-50">
            <div className="w-full max-w-2xl bg-white/60 rounded-2xl shadow-xl p-8">
                {/* Heading */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Create Your Account
                    </h1>
                    <p className="mt-2 text-gray-600">
                        🚀 Join our platform and unlock personalized features, faster access, and exclusive tools.
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div
                        className="mb-4 text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}

                <p>buttons</p>
                {/* Social Login */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <GoogleSignInButton />

                    <button
                        type="button"
                        onClick={() => window.location.href = '/api/auth/social/facebook'}
                        className="relative w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                    >
                        {/* Logo positioned left with spacing */}
                        <div className="absolute left-4 flex items-center">
                            <img src="/images/facebook-logo.png" alt="Facebook" className="w-6 h-6" />
                        </div>

                        {/* Centered label with padding to avoid overlap */}
                        <span className="text-gray-700 font-medium pl-8">Continue with Facebook</span>
                    </button>



                </div>

                {/* Form */}
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

                        {/* Password with eye icon */}
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
                                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                                style={{top: '3rem'}}
                            >
                                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        {/* Confirm Password with eye icon */}
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
                                className="absolute right-3 text-gray-500 hover:text-gray-700"
                                style={{top: '3rem'}}
                            >
                                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-center">
                        <CheckBox
                            checked={formData.termsAccepted}
                            onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                            label={
                                <>
                                    I agree to the{" "}
                                    <a href="/terms" className="text-indigo-600 hover:underline">
                                        Terms & Conditions
                                    </a>
                                </>
                            }
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6">
                        <BlackButton type="submit" className="w-full py-3 text-lg">
                            {loading ? 'Registering...' : 'Create Account'}
                        </BlackButton>
                    </div>
                </form>
            </div>
        </main>
    );
}
