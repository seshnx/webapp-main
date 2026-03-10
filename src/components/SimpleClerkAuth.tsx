/**
 * Simple Clerk Auth Wrapper
 * Uses Clerk's default SignIn and SignUp components
 */

import React from 'react';
import { SignIn, SignUp, useUser, useClerk } from '@clerk/react';
import { dark } from '@clerk/react/theme';

export default function SimpleClerkAuth() {
  const { isSignedIn } = useUser();
  const clerk = useClerk();

  // Redirect to home if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      window.location.href = '/';
    }
  }, [isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Sign In Component */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <SignIn
            signUpUrl="/sign-up"
            appearance={{
              baseTheme: dark,
              elements: {
                card: 'bg-transparent dark:bg-gray-800',
                headerTitle: 'text-3xl font-bold text-gray-900 dark:text-white',
                headerSubtitle: 'text-gray-600 dark:text-gray-400',
                socialButtonsBlockButton: 'border border-gray-300 dark:border-gray-600',
                formFieldInput: 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
                footerActionLink: 'text-blue-600 dark:text-blue-400 hover:text-blue-700',
              }
            }}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <a
                href="/sign-up"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SimpleClerkSignUp() {
  const { isSignedIn } = useUser();

  // Redirect to home if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      window.location.href = '/';
    }
  }, [isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Sign Up Component */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <SignUp
            signInUrl="/sign-in"
            appearance={{
              baseTheme: dark,
              elements: {
                card: 'bg-transparent dark:bg-gray-800',
                headerTitle: 'text-3xl font-bold text-gray-900 dark:text-white',
                headerSubtitle: 'text-gray-600 dark:text-gray-400',
                socialButtonsBlockButton: 'border border-gray-300 dark:border-gray-600',
                formFieldInput: 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
                footerActionLink: 'text-blue-600 dark:text-blue-400 hover:text-blue-700',
              }
            }}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <a
                href="/sign-in"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
