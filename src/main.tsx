import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConvexProvider } from "convex/react";
import { ClerkProvider } from '@clerk/react';
import * as Sentry from '@sentry/react';
import App from './App';
import { convex } from './config/convex';
import { clerkConfig, clerkPubKey } from './config/clerk';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import './index.css';

// =====================================================
// TYPES
// =====================================================

interface AppWrapperProps {
  children: React.ReactNode;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

// =====================================================
// SENTRY INITIALIZATION
// =====================================================

// Initialize Sentry if DSN is provided
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE || 'development',
    // Release tracking for better error grouping
    release: import.meta.env.VERCEL_GIT_COMMIT_SHA || 'local-dev',
    integrations: [
      Sentry.browserTracingIntegration({
        // Track navigation performance
        tracePropagationTargets: ['localhost', /^https:\/\/(app\.seshnx\.com|webapp-main-.*\.vercel\.app)/],
      }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      Sentry.extraErrorDataIntegration(),
      Sentry.captureConsoleIntegration({
        levels: ['error'],
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    // Filter out common non-critical errors
    beforeSend(event) {
      // Filter out localStorage errors (tracking prevention)
      if (event.exception?.values?.[0]?.value?.includes('localStorage') ||
          event.exception?.values?.[0]?.value?.includes('QuotaExceededError')) {
        return null; // Don't send these errors
      }
      // Add custom context for all errors
      event.contexts = {
        ...event.contexts,
        app: {
          name: 'SeshNx Webapp',
          environment: import.meta.env.MODE,
        },
      };
      return event;
    },
    // Set user ID when available
    initialScope: {
      tags: {
        framework: 'react',
        runtime: 'vite',
      },
    },
  });

  if (import.meta.env.DEV) {
    console.log('✓ Sentry initialized for error monitoring');
  }
}

// =====================================================
// DEVELOPMENT ERROR LOGGING
// =====================================================

// Development: Enhanced error logging
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const errorMessage = args[0]?.toString() || '';
    if (errorMessage.includes('Rendered more hooks') || errorMessage.includes('301')) {
      console.group('🔴 React Hook Error #301');
      console.error('Component rendered with different hook count than previous render.');
      console.error('Check component stack above for the problematic component.');
      console.groupEnd();
    }
    originalError.apply(console, args);
  };
}

// =====================================================
// COMPONENTS
// =====================================================

/**
 * AppWrapper - Wraps the app with Sentry ErrorBoundary if configured
 */
const AppWrapper = ({ children }: AppWrapperProps): JSX.Element => {
  if (sentryDsn) {
    return (
      <Sentry.ErrorBoundary
        fallback={({ error, resetError }: ErrorFallbackProps) => (
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error?.message || 'An unexpected error occurred'}</p>
              <button
                onClick={resetError}
                className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      >
        {children}
      </Sentry.ErrorBoundary>
    );
  }
  return <>{children}</>;
};

// =====================================================
// VALIDATION
// =====================================================

// Check if Clerk is configured before rendering
if (!clerkPubKey) {
  console.error(
    '❌ Clerk: VITE_CLERK_PUBLISHABLE_KEY is not set. ' +
    'Get your key from https://dashboard.clerk.com/ ' +
    'and add it to your .env.local file.'
  );
}

// =====================================================
// RENDER
// =====================================================

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppWrapper>
    <ErrorBoundary name="Root">
      <ClerkProvider {...clerkConfig}>
        <ConvexProvider client={convex}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ConvexProvider>
      </ClerkProvider>
    </ErrorBoundary>
  </AppWrapper>
);

// =====================================================
// LOADER REMOVAL
// =====================================================

/**
 * Removes the loading fallback element after the app has mounted
 */
const removeLoader = (): void => {
  const loader = document.getElementById('loading-fallback');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
      document.body.style.overflow = 'auto';
    }, 400);
  }
};

// Remove loader after 600ms
setTimeout(removeLoader, 600);
