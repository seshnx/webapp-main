/**
 * Public Legal Page
 * 
 * This is a standalone legal page that can be accessed without authentication.
 * It displays the same legal content as the in-app legal center but with a
 * minimal, public-friendly layout.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import LegalDocs from './LegalDocs';

export default function PublicLegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">SeshNx</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Music Collaboration Platform</p>
              </div>
            </Link>

            {/* Back to Home */}
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Legal Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access our terms, policies, and copyright information. These documents govern your use of SeshNx services.
          </p>
        </div>

        {/* Legal Docs Component - Embedded */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <LegalDocs isEmbedded={true} />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 SeshNx. All rights reserved.
            </p>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
            <a href="mailto:legal@seshnx.com" className="text-sm text-brand-blue hover:text-brand-blue/80 font-medium">
              legal@seshnx.com
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
