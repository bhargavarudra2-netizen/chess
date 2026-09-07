import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
    id: number;
    username: string;
    email?: string;
    rating: number;
}

export interface GameHistoryItem {
    id: number;
    white_user_id: number;
    black_user_id: number;
    fen_start: string;
    status: string;
    result: string;
    time_control: string;
    created_at: string;
}

const API_BASE = 'http://localhost:3000';

export const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    // Load token and profile on startup
    useEffect(() => {
        const savedToken = localStorage.getItem('portal_chess_token');
        const savedUser = localStorage.getItem('portal_chess_user');
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('portal_chess_token');
                localStorage.removeItem('portal_chess_user');
            }
        }
    }, []);

    const login = useCallback(async (username: string, pass: string) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: pass }),
            });

            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.message || data.error || 'Login failed');
            }

            setToken(data.access_token);
            setUser(data.user);
            localStorage.setItem('portal_chess_token', data.access_token);
            localStorage.setItem('portal_chess_user', JSON.stringify(data.user));
            return true;
        } catch (err: any) {
            setAuthError(err.message || 'Login failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (username: string, pass: string, email: string) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: pass, email }),
            });

            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.message || data.error || 'Registration failed');
            }

            setToken(data.access_token);
            setUser(data.user);
            localStorage.setItem('portal_chess_token', data.access_token);
            localStorage.setItem('portal_chess_user', JSON.stringify(data.user));
            return true;
        } catch (err: any) {
            setAuthError(err.message || 'Registration failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('portal_chess_token');
        localStorage.removeItem('portal_chess_user');
    }, []);

    const fetchHistory = useCallback(async (): Promise<GameHistoryItem[]> => {
        if (!token) return [];
        try {
            const res = await fetch(`${API_BASE}/auth/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return [];
            return await res.json();
        } catch {
            return [];
        }
    }, [token]);

    return {
        user,
        token,
        isLoading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        fetchHistory,
    };
};
