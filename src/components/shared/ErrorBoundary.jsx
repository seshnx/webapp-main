import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      meme: "Unexpected signal chain failure." 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("SeshNx Error Boundary Caught:", error, errorInfo);
  }

  componentDidMount() {
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

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Optional: Redirect to home/dashboard if recovery isn't possible
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = '/';
    }
  };

  render() {
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

              <div className="bg-[#1f2128] p-4 rounded-lg w-full mb-8 text-left border border-gray-700">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Error Log</p>
                <code className="text-sm text-red-400 font-mono break-words line-clamp-3">
                  {this.state.error && this.state.error.toString()}
                </code>
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
