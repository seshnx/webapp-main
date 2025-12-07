import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexProvider } from "convex/react"
import App from './App.jsx'
import { convex } from './config/convex'
import ErrorBoundary from './components/shared/ErrorBoundary'
import './index.css'

// Development: Enhanced error logging for React hook errors
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0]?.toString() || '';
    if (errorMessage.includes('Rendered more hooks') || errorMessage.includes('301')) {
      console.group('🔴 React Hook Error #301');
      console.error('Component rendered with different hook count than previous render.');
      console.error('Check component stack above for the problematic component.');
      console.error('Common causes: conditional hooks, hooks after early returns, or lazy-loading issues.');
      console.groupEnd();
    }
    originalError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary name="Root">
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProvider>
  </ErrorBoundary>
)

// Remove the loading screen once React has mounted
// Uses fade-out animation for smooth transition
const removeLoader = () => {
  const loader = document.getElementById('loading-fallback');
  if (loader) {
    // Start fade-out animation
    loader.classList.add('fade-out');
    
    // Remove from DOM after animation completes (400ms)
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
      // Restore scrolling to body
      document.body.style.overflow = 'auto';
    }, 400);
  }
};

// Execute cleanup after React has mounted and initial render completes
// Small delay ensures smooth transition
setTimeout(removeLoader, 600);
