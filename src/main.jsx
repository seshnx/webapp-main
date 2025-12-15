import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexProvider } from "convex/react"
import App from './App.jsx'
import { convex } from './config/convex'
import ErrorBoundary from './components/shared/ErrorBoundary'
import './index.css'

// Development: Enhanced error logging
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary name="Root">
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProvider>
  </ErrorBoundary>
)

const removeLoader = () => {
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

setTimeout(removeLoader, 600);
