import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { logError } from '../../utils/socialDebug';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for Social Components
 * Catches and handles errors in social features with detailed logging
 */
export class SocialErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentName = this.props.componentName || 'SocialComponent';
    
    // Log to our debug system
    logError(error, componentName);
    
    // Log additional context
    console.error('Social Component Error:', {
      component: componentName,
      error,
      errorInfo,
      props: this.props
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const componentName = this.props.componentName || 'This component';
      
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-red-700 mb-4">
                {componentName} encountered an error and couldn't display.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm font-mono text-red-800 hover:text-red-900">
                    Error Details
                  </summary>
                  <div className="mt-2 p-3 bg-red-100 rounded text-sm">
                    <div className="font-mono text-red-900 mb-2">
                      {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div className="text-xs text-red-800 mt-2">
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with error boundary
 */
export function withSocialErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  return function WithErrorBoundary(props: P) {
    return (
      <SocialErrorBoundary componentName={componentName || WrappedComponent.name}>
        <WrappedComponent {...props} />
      </SocialErrorBoundary>
    );
  };
}

/**
 * Hook-based error boundary alternative
 */
export function useSocialErrorHandler(componentName: string) {
  const handleError = (error: Error, context?: string) => {
    logError(error, `${componentName}${context ? `.${context}` : ''}`);
  };

  const handleAsyncError = async (
    operation: string,
    fn: () => Promise<any>
  ): Promise<any> => {
    try {
      return await fn();
    } catch (error) {
      handleError(error as Error, operation);
      throw error;
    }
  };

  return { handleError, handleAsyncError };
}
