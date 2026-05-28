'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BlackButton from '@/components/ui/BlackButton';
import InputField from '@/components/ui/InputField';
import CheckBox from '@/components/ui/CheckBox';
import { EyeSlashIcon, EyeIcon } from '@/components/ui/svg/CustomIcons';
import SocialSSOButtons from '@/components/ui/SocialSSOButtons';
import { fetchCurrentUser } from '@/services/auth/session';

/**
 * AuthPanel - Reusable authentication component with Sign In and Sign Up tabs
 * Can be used in full-page layout or embedded in modals
 * 
 * @param {string} initialTab - 'signin' or 'signup' (default: 'signin')
 * @param {function} onAuthSuccess - Callback fired after successful auth (for modal usage)
 * @param {string} returnUrl - URL to redirect to after auth (default: preferred salon or dashboard)
 * @param {boolean} showHeader - Show tab headers and descriptions (default: true)
 */
export default function AuthPanel({ 
  initialTab = 'signin',
  onAuthSuccess = null,
  returnUrl = null,
  showHeader = true,
  socialReturnUrl = null,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Sign in state
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  
  // Sign up state
  const [signUpData, setSignUpData] = useState({
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

  // Sign in handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signInData),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('; ');
          setError(errorMessages || data.message || 'Login failed');
        } else {
          setError(data.message || 'Login failed');
        }
        return;
      }

      const refreshedUser = await fetchCurrentUser();
      const user = refreshedUser || data.user;
      dispatch(loginSuccess({ 
        user,
        token: data.token 
      }));

      // If onAuthSuccess callback provided (modal mode), use it
      if (onAuthSuccess) {
        onAuthSuccess(user);
        return;
      }

      // Otherwise, redirect (full page mode)
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        const preferredSlug = user?.client?.primary_venue?.slug;
        if (preferredSlug) {
          router.push(`/salon/${preferredSlug}`);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign up handler
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!signUpData.firstName || !signUpData.lastName || !signUpData.email || !signUpData.phone) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(signUpData.email)) {
      setError('Invalid email format.');
      setLoading(false);
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!signUpData.termsAccepted) {
      setError('You must accept the terms and conditions.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('; ');
          setError(errorMessages || data.message || 'Registration failed');
        } else {
          setError(data.message || 'Registration failed');
        }
        return;
      }

      const refreshedUser = await fetchCurrentUser();
      const user = refreshedUser || data.user;
      dispatch(loginSuccess({ 
        user,
        token: data.token 
      }));

      // If onAuthSuccess callback provided (modal mode), use it
      if (onAuthSuccess) {
        onAuthSuccess(user);
        return;
      }

      // Otherwise, redirect (full page mode)
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        const preferredSlug = user?.client?.primary_venue?.slug;
        if (preferredSlug) {
          router.push(`/salon/${preferredSlug}`);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      {showHeader && (
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => { setActiveTab('signin'); setError(''); }}
              className={`pb-4 text-sm font-semibold transition-colors ${
                activeTab === 'signin'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); }}
              className={`pb-4 text-sm font-semibold transition-colors ${
                activeTab === 'signup'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* Sign In Tab */}
      {activeTab === 'signin' && (
        <div>
          {showHeader && (
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Sign in</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-950">Access your account</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-600">Use your email and password, or continue with Google.</p>
            </div>
          )}

          {error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <InputField
              id="signin-email"
              label="Email"
              type="email"
              value={signInData.email}
              onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
              required
              autoComplete="username"
            />

            <InputField
              id="signin-password"
              label="Password"
              type="password"
              value={signInData.password}
              onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
              required
              autoComplete="current-password"
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <CheckBox
                checked={signInData.remember}
                onChange={(e) => setSignInData({ ...signInData, remember: e.target.checked })}
                label="Remember me"
              />

              <Link
                href="/forgot-password"
                className="text-sm text-neutral-600 underline-offset-4 hover:text-black hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <BlackButton type="submit" className="w-full py-3 text-lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </BlackButton>
          </form>

          {/* Social Sign-in Options */}
          <div className="my-6 border-t border-black/10" />
          <div className="space-y-4">
            <SocialSSOButtons returnUrl={socialReturnUrl || returnUrl} />
          </div>

          {showHeader && (
            <p className="mt-6 text-center text-sm text-neutral-600">
              Don't have an account?{' '}
              <button
                onClick={() => { setActiveTab('signup'); setError(''); }}
                className="font-semibold text-black hover:underline"
              >
                Create one
              </button>
            </p>
          )}
        </div>
      )}

      {/* Sign Up Tab */}
      {activeTab === 'signup' && (
        <div>
          {showHeader && (
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Client signup</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-950">Create your account</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-600">Start with Google or fill in your details below.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Social Sign-up Options */}
          <div className="space-y-4 mb-6">
            <SocialSSOButtons returnUrl={socialReturnUrl || returnUrl} />
          </div>
          <div className="my-6 border-t border-black/10" />

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="firstName"
                label="First Name"
                type="text"
                value={signUpData.firstName}
                onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                required
              />
              <InputField
                id="lastName"
                label="Last Name"
                type="text"
                value={signUpData.lastName}
                onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                required
              />
            </div>

            <InputField
              id="signup-email"
              label="Email"
              type="email"
              value={signUpData.email}
              onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
              required
              autoComplete="username"
            />

            <InputField
              id="phone"
              label="Phone"
              type="tel"
              value={signUpData.phone}
              onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
              required
            />

            <div className="relative">
              <InputField
                id="signup-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
              </button>
            </div>

            <div className="relative">
              <InputField
                id="confirm-password"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={signUpData.confirmPassword}
                onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
              </button>
            </div>

            <CheckBox
              checked={signUpData.termsAccepted}
              onChange={(e) => setSignUpData({ ...signUpData, termsAccepted: e.target.checked })}
              label={
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="font-semibold hover:underline">
                    terms and conditions
                  </Link>
                </span>
              }
            />

            <BlackButton type="submit" className="w-full py-3 text-lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </BlackButton>
          </form>

          {showHeader && (
            <p className="mt-6 text-center text-sm text-neutral-600">
              Already have an account?{' '}
              <button
                onClick={() => { setActiveTab('signin'); setError(''); }}
                className="font-semibold text-black hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
