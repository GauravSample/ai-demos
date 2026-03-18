'use client';

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: 480,
          margin: '80px auto',
          padding: '32px',
          background: '#fff',
          border: '1px solid #f0a0a0',
          borderRadius: 12,
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 20px',
              background: '#5856d6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
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
