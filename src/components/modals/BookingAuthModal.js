'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import AuthPanel from '@/components/auth/AuthPanel';

/**
 * BookingAuthModal - Modal for authentication during booking flow
 * Can be triggered when user clicks "Book Now" without being authenticated
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Called when user closes modal
 * @param {function} onAuthSuccess - Called after successful auth with user object
 * @param {string} salonName - Name of salon for context display
 * @param {string} salonSlug - Slug of salon for redirect after auth
 */
export default function BookingAuthModal({
  isOpen = false,
  onClose = () => {},
  onAuthSuccess = () => {},
  salonName = '',
  salonSlug = '',
}) {
  const [initialTab, setInitialTab] = useState('signin');

  if (!isOpen) return null;

  const handleAuthSuccess = (user) => {
    // Close modal
    onClose();
    // Call the callback with authenticated user
    onAuthSuccess(user);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <div
          className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Content */}
          <div className="pt-6 px-6 pb-6 sm:pt-8 sm:px-8 sm:pb-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-950">
                {initialTab === 'signin' ? 'Sign in to book' : 'Create account to book'}
              </h2>
              {salonName && (
                <p className="mt-2 text-sm text-neutral-600">
                  At <span className="font-medium text-black">{salonName}</span>
                </p>
              )}
            </div>

            {/* AuthPanel without full page decorations */}
            <AuthPanel
              initialTab={initialTab}
              onAuthSuccess={handleAuthSuccess}
              showHeader={false}
              socialReturnUrl={`/salon/${salonSlug}`}
            />

            {/* Tab Switcher */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                {initialTab === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setInitialTab('signup')}
                      className="font-semibold text-black hover:underline"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setInitialTab('signin')}
                      className="font-semibold text-black hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
