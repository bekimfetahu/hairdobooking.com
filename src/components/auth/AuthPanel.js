'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const [mode, setMode] = useState(initialTab === 'signup' ? 'signup' : 'signin');
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Query parameters for token-based password reset
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams?.get('token');
  const emailFromUrl = searchParams?.get('email');
  
  // Initialize mode to 'reset-token' if token is in URL
  useEffect(() => {
    if (tokenFromUrl && emailFromUrl) {
      setMode('reset-token');
    }
  }, [tokenFromUrl, emailFromUrl]);
  
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

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Password reset with token state
  const [resetTokenData, setResetTokenData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
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

  // Password reset handler
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');
    setLoading(true);

    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('; ');
          setError(errorMessages || data.message || 'Reset failed');
        } else {
          setError(data.message || 'Password reset failed');
        }
        return;
      }

      setResetSuccess('Check your email for a password reset link. It should arrive in the next few minutes.');
      setResetEmail('');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Password reset with token handler (from email link)
  const handleResetPasswordWithToken = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!resetTokenData.password || !resetTokenData.confirmPassword) {
      setError('Both password fields are required.');
      setLoading(false);
      return;
    }

    if (resetTokenData.password !== resetTokenData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (resetTokenData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailFromUrl,
          token: tokenFromUrl,
          password: resetTokenData.password,
          password_confirmation: resetTokenData.confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('; ');
          setError(errorMessages || data.message || 'Reset failed');
        } else {
          setError(data.message || 'Password reset failed');
        }
        return;
      }

      setResetSuccess('Password reset successful! Redirecting to sign in...');
      setResetTokenData({ password: '', confirmPassword: '' });
      
      // Redirect to sign in after a short delay
      setTimeout(() => {
        setMode('signin');
        setResetSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred');
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
        body: JSON.stringify({
          first_name: signUpData.firstName,
          last_name: signUpData.lastName,
          email: signUpData.email,
          phone: signUpData.phone,
          password: signUpData.password,
          password_confirmation: signUpData.confirmPassword,
        }),
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
      {/* Tab Navigation - Only show when not in reset mode */}
      {showHeader && mode !== 'reset' && (
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => { setMode('signin'); setError(''); }}
              className={`pb-4 text-sm font-semibold transition-colors ${
                mode === 'signin'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`pb-4 text-sm font-semibold transition-colors ${
                mode === 'signup'
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
      {mode === 'signin' && (
        <div className="transition-all duration-300">
          {showHeader && (
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Sign in</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-950">Access your account</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-600">Sign in with your email or a social account.</p>
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

              <button
                type="button"
                onClick={() => { setMode('reset'); setError(''); }}
                className="text-sm text-neutral-600 underline-offset-4 hover:text-black hover:underline"
              >
                Forgot your password?
              </button>
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
                onClick={() => { setMode('signup'); setError(''); }}
                className="font-semibold text-black hover:underline"
              >
                Create one
              </button>
            </p>
          )}
        </div>
      )}

      {/* Sign Up Tab */}
      {mode === 'signup' && (
        <div className="transition-all duration-300">
          {showHeader && (
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Client signup</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-950">Create your account</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-600">Create your account with your email or a social account.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

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
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="font-semibold hover:underline text-neutral-900"
                  >
                    terms and conditions
                  </button>
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
                onClick={() => { setMode('signin'); setError(''); }}
                className="font-semibold text-black hover:underline"
              >
                Sign in
              </button>
            </p>
          )}

          {/* Social Sign-up Options */}
          <div className="my-6 border-t border-black/10" />
          <div className="space-y-4">
            <SocialSSOButtons returnUrl={socialReturnUrl || returnUrl} />
          </div>
          {/* Terms modal component (lazy client-only) */}
          {typeof window !== 'undefined' && (
            (function() {
              const TermsModal = require('@/components/modals/TermsModal').default;
              return <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />;
            })()
          )}
        </div>
      )}

      {/* Password Reset Tab */}
      {mode === 'reset' && (
        <div className="transition-all duration-300">
          {showHeader && (
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Reset Password</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-950">Get a new password</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-600">Enter your email and we'll send you a link to reset your password.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {resetSuccess && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {resetSuccess}
            </div>
          )}

          {!resetSuccess ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <InputField
                id="reset-email"
                label="Email Address"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <BlackButton type="submit" className="w-full py-3 text-lg" disabled={loading}>
                {loading ? 'Sending link...' : 'Send reset link'}
              </BlackButton>
            </form>
          ) : (
            <div className="space-y-4">
              <BlackButton
                onClick={() => { setMode('signin'); setResetSuccess(''); setResetEmail(''); }}
                className="w-full py-3 text-lg"
              >
                Back to sign in
              </BlackButton>
            </div>
          )}

          {!resetSuccess && (
            <p className="mt-6 text-center text-sm text-neutral-600">
              Remember your password?{' '}
              <button
                onClick={() => { setMode('signin'); setError(''); }}
                className="font-semibold text-black hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      )}

      {/* Password Reset with Token Tab (from email link) */}
      {mode === 'reset-token' && (
        <div className="transition-all duration-300">
          {showHeader && (
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Reset Password</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-950">Create a new password</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-600">Enter your new password below to reset access to your account.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {resetSuccess && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {resetSuccess}
            </div>
          )}

          {!resetSuccess ? (
            <form onSubmit={handleResetPasswordWithToken} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-neutral-900 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <InputField
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={resetTokenData.password}
                    onChange={(e) => setResetTokenData({ ...resetTokenData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <InputField
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={resetTokenData.confirmPassword}
                    onChange={(e) => setResetTokenData({ ...resetTokenData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  >
                    {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                </div>
              </div>

              <BlackButton type="submit" className="w-full py-3 text-lg" disabled={loading}>
                {loading ? 'Resetting password...' : 'Reset password'}
              </BlackButton>
            </form>
          ) : (
            <div className="space-y-4">
              <BlackButton
                onClick={() => { setMode('signin'); setResetSuccess(''); setResetTokenData({ password: '', confirmPassword: '' }); }}
                className="w-full py-3 text-lg"
              >
                Go to sign in
              </BlackButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
