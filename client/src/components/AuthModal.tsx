import React, { useState } from 'react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (username: string, pass: string) => Promise<boolean>;
    onRegister: (username: string, pass: string, email: string) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    onLogin,
    onRegister,
    isLoading,
    error,
    clearError,
}) => {
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (tab === 'login') {
            const ok = await onLogin(username.trim(), password);
            if (ok) onClose();
        } else {
            const ok = await onRegister(username.trim(), password, email.trim());
            if (ok) onClose();
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 110,
                padding: '20px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    borderRadius: '16px',
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.15) 0%, rgba(15, 23, 42, 0.95) 85%)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 24px rgba(6, 182, 212, 0.2)',
                    padding: '28px',
                    color: '#f8fafc',
                    position: 'relative',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '18px',
                        cursor: 'pointer',
                    }}
                >
                    ✕
                </button>

                {/* Tabs */}
                <div
                    style={{
                        display: 'flex',
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '8px',
                        padding: '4px',
                        marginBottom: '20px',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => {
                            setTab('login');
                            clearError();
                        }}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: 'none',
                            borderRadius: '6px',
                            background: tab === 'login' ? '#0284c7' : 'transparent',
                            color: tab === 'login' ? '#fff' : '#94a3b8',
                            fontWeight: 600,
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setTab('register');
                            clearError();
                        }}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: 'none',
                            borderRadius: '6px',
                            background: tab === 'register' ? '#0284c7' : 'transparent',
                            color: tab === 'register' ? '#fff' : '#94a3b8',
                            fontWeight: 600,
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Create Account
                    </button>
                </div>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                        {tab === 'login' ? 'Welcome Back, Player' : 'Join the Portal Arena'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                        {tab === 'login'
                            ? 'Sign in to track your rating and match history.'
                            : 'Create a player profile to earn ratings and battle friends.'}
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div
                        style={{
                            padding: '10px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#fca5a5',
                            fontSize: '12px',
                            marginBottom: '14px',
                            textAlign: 'center',
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="e.g. Grandmaster_Q"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                color: '#f8fafc',
                                fontSize: '14px',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {tab === 'register' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="player@example.com"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '8px',
                                    color: '#f8fafc',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                color: '#f8fafc',
                                fontSize: '14px',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            marginTop: '8px',
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                            transition: 'all 0.2s',
                        }}
                    >
                        {isLoading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Register Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
