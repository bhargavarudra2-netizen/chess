import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Portal Chess ErrorBoundary caught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        padding: '30px',
                        maxWidth: '500px',
                        margin: '60px auto',
                        background: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                        color: '#f8fafc',
                        textAlign: 'center',
                        fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌀💥</div>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#f87171' }}>
                        Quantum Anomaly Detected
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5' }}>
                        An unexpected state error occurred during rendering:
                        <br />
                        <code
                            style={{
                                display: 'inline-block',
                                marginTop: '10px',
                                padding: '6px 12px',
                                background: 'rgba(0, 0, 0, 0.4)',
                                borderRadius: '6px',
                                color: '#fca5a5',
                                fontSize: '12px',
                                wordBreak: 'break-word',
                            }}
                        >
                            {this.state.error?.message || 'Unknown Error'}
                        </code>
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        Restart Game
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
