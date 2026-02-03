import React from 'react';
import { AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';
import { logError } from '../../utils/errorReporting';

/**
 * Error boundary component state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  meme: string;
  errorId: string | null;
  copied: boolean;
}

/**
 * Error boundary component props
 */
export interface ErrorBoundaryProps {
  /** Optional name for the error boundary */
  name?: string;
  /** Optional context data to include with error logs */
  context?: Record<string, any>;
  /** Optional reset handler */
  onReset?: () => void;
  /** Child components to wrap */
  children: React.ReactNode;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child component tree, displays a fallback UI,
 * and logs error information for debugging.
 *
 * @param props - Error boundary props
 * @returns Error boundary component
 *
 * @example
 * <ErrorBoundary name="UserProfile" context={{ userId: '123' }}>
 *   <UserProfile />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      meme: "Unexpected signal chain failure.",
      errorId: null,
      copied: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error with full context
    const context = {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Default',
      props: this.props.context || {},
    };

    const loggedError = logError(error, errorInfo, context);

    // Store error info for display
    this.setState({
      errorInfo: {
        ...errorInfo,
        errorId: this.state.errorId || loggedError.timestamp,
      } as React.ErrorInfo & { errorId?: string }
    });
  }

  componentDidMount(): void {
    // Pre-load a random error meme
    const phrases = [
      "CoreAudio Overload detected.",
      "The plugin crashed the session.",
      "Buffer underrun exception.",
      "Who deleted the master fader?",
      "Sample rate mismatch: Reality is 44.1k, we are 48k.",
      "The drummer kicked the power cable.",
      "Ilok license not found.",
      "Fatal Error: Not enough headroom.",
      "The mix bus is clipping... hard.",
      "Phantom power failure."
    ];
    this.setState({ meme: phrases[Math.floor(Math.random() * phrases.length)] });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      copied: false
    });
    // Optional: Redirect to home/dashboard if recovery isn't possible
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      // Try to reset to a safe state
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/dashboard') {
        window.location.href = '/?tab=dashboard';
      } else {
        window.location.reload();
      }
    }
  };

  handleCopyError = async (): Promise<void> => {
    const errorText = `
Error ID: ${this.state.errorId}
Message: ${this.state.error?.message || 'Unknown error'}
Stack: ${this.state.error?.stack || 'No stack trace'}
Component Stack: ${this.state.errorInfo?.componentStack || 'No component stack'}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error:', err);
    }
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-[#1f2128] flex flex-col items-center justify-center p-4 text-center text-white font-sans">
          <div className="bg-[#2c2e36] border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden">

            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
                <AlertTriangle size={32} strokeWidth={2} />
              </div>

              <h1 className="text-3xl font-bold mb-2">Session Crashed</h1>

              <p className="text-xl text-[#3D84ED] font-medium mb-6 italic">
                "{this.state.meme}"
              </p>

              <div className="bg-[#1f2128] p-4 rounded-lg w-full mb-6 text-left border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Error Details</p>
                  <button
                    onClick={this.handleCopyError}
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    title="Copy error details"
                  >
                    {this.state.copied ? (
                      <>
                        <Check size={12} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-2">
                  {this.state.errorId && (
                    <div>
                      <span className="text-xs text-gray-500">Error ID: </span>
                      <code className="text-xs text-blue-400 font-mono">{this.state.errorId}</code>
                    </div>
                  )}
                  <code className="text-sm text-red-400 font-mono break-words block">
                    {this.state.error?.message || 'Unknown error occurred'}
                  </code>
                  {this.state.error?.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-gray-400 font-mono mt-2 overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  Go Back
                </button>
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-[#3D84ED] hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Reload App
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

export default ErrorBoundary;
