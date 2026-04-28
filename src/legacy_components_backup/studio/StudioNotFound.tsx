import React from 'react';
import { Link } from 'react-router-dom';
import { Home, XCircle } from 'lucide-react';

interface StudioNotFoundProps {
  slug?: string;
}

const StudioNotFound: React.FC<StudioNotFoundProps> = ({ slug }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Studio Not Found
          </h1>
          {slug && (
            <p className="text-gray-600 dark:text-gray-300">
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                {slug}
              </code>
            </p>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The studio you're looking for doesn't exist, has been removed,
          or the URL is incorrect.
        </p>

        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to SeshNx
          </Link>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            or check the URL and try again
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioNotFound;
