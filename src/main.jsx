import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider } from "convex/react"
import App from './App.jsx'
import { convex } from './config/convex'
import ErrorBoundary from './components/shared/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary name="Root">
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ErrorBoundary>
  </React.StrictMode>,
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
