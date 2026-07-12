import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <div className="max-w-md p-8 rounded-2xl glass-panel shadow-xl flex flex-col items-center gap-4.5 border border-red-500/20">
            <div className="p-3.5 bg-red-50 text-red-500 dark:bg-red-950/20 rounded-full">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                An unexpected error occurred in this section of the system. Our team has been notified.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="w-full text-left p-3 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono max-h-[150px] overflow-auto select-text leading-normal">
                {this.state.error.toString()}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReload}
              icon={RefreshCw}
              className="mt-1"
            >
              Reload Platform
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
