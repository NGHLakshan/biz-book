import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Error Boundary to catch crashes and show a helpful message instead of blank screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#0f172a', color: '#fff', minHeight: '100dvh',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif'
        }}>
          <h2 style={{ color: '#f87171', marginBottom: '12px' }}>Something went wrong</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', maxWidth: '320px' }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px', background: '#10b981', color: '#fff',
              border: 'none', borderRadius: '12px', padding: '10px 24px',
              fontSize: '14px', cursor: 'pointer'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
