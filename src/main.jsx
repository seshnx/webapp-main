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

// CLEANUP: Remove the loading screen once React has mounted
// We use a small timeout to ensure the paint has occurred and to allow the transition to play
const removeLoader = () => {
  const loader = document.getElementById('loading-fallback');
  if (loader) {
    // 1. Start Fade Out
    loader.classList.add('fade-out');
    
    // 2. Remove from DOM after transition (0.5s)
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
      // Restore scrolling to body
      document.body.style.overflow = 'auto';
    }, 500);
  }
};

// Execute cleanup shortly after render
setTimeout(removeLoader, 800);
