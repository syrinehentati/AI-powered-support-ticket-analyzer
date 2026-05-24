import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '2rem',
          margin: '1rem 0',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          backgroundColor: '#fdecea',
          textAlign: 'center',
        }}>
          <h2 style={{
            margin: '0 0 8px',
            fontSize: '18px',
            color: '#c0392b',
          }}>
            Something went wrong
          </h2>
          <p style={{
            margin: '0 0 1rem',
            fontSize: '14px',
            color: '#666',
          }}>
            This section crashed unexpectedly.
          </p>
          <p style={{
            margin: '0 0 1.5rem',
            fontSize: '12px',
            color: '#999',
            fontFamily: 'monospace',
          }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 20px',
              backgroundColor: '#c0392b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;