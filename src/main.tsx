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

// Initialize Sentry if DSN is provided (lightweight first, heavy replays deferred)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn) {
  const integrations: any[] = [
    Sentry.browserTracingIntegration(),
    Sentry.extraErrorDataIntegration(),
    Sentry.captureConsoleIntegration({
      levels: ['error'],
    }),
  ];

  // Defer session replay to idle callback to prevent blocking the initial paint
  if (typeof window !== 'undefined') {
    const initReplay = () => {
      try {
        const client = Sentry.getClient();
        if (client) {
          client.addIntegration(
            Sentry.replayIntegration({
              maskAllText: false,
              blockAllMedia: false,
            })
          );
        }
      } catch (e) {
        // Silently fail if replay is not supported
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(initReplay, { timeout: 2500 });
    } else {
      setTimeout(initReplay, 1000);
    }
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE || 'development',
    release: import.meta.env.VERCEL_GIT_COMMIT_SHA || 'local-dev',
    tracePropagationTargets: [
      'localhost',
      'https://seshnx.com',
      'https://app.seshnx.com',
      /^https:\/\/(?!clerk\.)[a-z0-9-]+\.seshnx\.com/,
      /^https:\/\/webapp-main-.*\.vercel\.app/,
    ],
    integrations,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      if (event.exception?.values?.[0]?.value?.includes('localStorage') ||
          event.exception?.values?.[0]?.value?.includes('QuotaExceededError')) {
        return null;
      }
      event.contexts = {
        ...event.contexts,
        app: {
          name: 'SeshNx Webapp',
          environment: import.meta.env.MODE,
        },
      };
      return event;
    },
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
 * AppWrapper - Normal wrapper without Sentry for debugging
 */
const AppWrapper = ({ children }: AppWrapperProps): JSX.Element => {
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
 * Removes the loading fallback element immediately after initial paint
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
    }, 300);
  }
};

// Fade out fallback loader as soon as the DOM paint cycle completes
if (typeof window !== 'undefined') {
  requestAnimationFrame(() => {
    requestAnimationFrame(removeLoader);
  });
}

