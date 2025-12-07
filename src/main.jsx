import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexProvider } from "convex/react"
import App from './App.jsx'
import { convex } from './config/convex'
import ErrorBoundary from './components/shared/ErrorBoundary'
import './index.css'

// Development: Add hook validation
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('Rendered more hooks') || args[0]?.includes?.('301')) {
      console.group('🔴 React Hook Error #301 Detected');
      console.error('This error means a component rendered with a different number of hooks than the previous render.');
      console.error('Check the component stack above to identify the problematic component.');
      console.error('Common causes:');
      console.error('1. Conditional hook calls (hooks inside if statements)');
      console.error('2. Hooks after early returns');
      console.error('3. Different components rendered in the same position with different hook counts');
      console.error('4. Lazy-loaded components with inconsistent hook structures');
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
