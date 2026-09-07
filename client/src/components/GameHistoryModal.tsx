import React, { useEffect, useState } from 'react';
import type { GameHistoryItem, AuthUser } from '../hooks/useAuth';

interface GameHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    fetchHistory: () => Promise<GameHistoryItem[]>;
    currentUser: AuthUser | null;
}

export const GameHistoryModal: React.FC<GameHistoryModalProps> = ({
    isOpen,
    onClose,
    fetchHistory,
    currentUser,
}) => {
    const [history, setHistory] = useState<GameHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetchHistory().then(data => {
                setHistory(data || []);
                setLoading(false);
            });
        }
    }, [isOpen, fetchHistory]);

    if (!isOpen) return null;

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
                    maxWidth: '560px',
                    borderRadius: '16px',
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.15) 0%, rgba(15, 23, 42, 0.95) 85%)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 24px rgba(6, 182, 212, 0.2)',
                    padding: '24px',
                    color: '#f8fafc',
                    position: 'relative',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
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

                {/* Header */}
                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                        Match History
                    </h3>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                        Player: <b style={{ color: '#38bdf8' }}>{currentUser?.username}</b> ({currentUser?.rating || 1200} Elo)
                    </span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            Loading past matches...
                        </div>
                    ) : history.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                            No recorded matches yet. Play your first match in the arena!
                        </div>
                    ) : (
                        history.map(game => {
                            const isWhite = game.white_user_id === currentUser?.id;
                            const role = isWhite ? 'White' : 'Black';
                            const date = new Date(game.created_at).toLocaleDateString();

                            return (
                                <div
                                    key={game.id}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        background: 'rgba(30, 41, 59, 0.6)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: isWhite ? '#f8fafc' : '#334155',
                                                    color: isWhite ? '#0f172a' : '#f8fafc',
                                                }}
                                            >
                                                {role}
                                            </span>
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                                                Match #{game.id}
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                {game.time_control || '10+0'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{date}</div>
                                    </div>

                                    <div>
                                        <span
                                            style={{
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                background:
                                                    game.status === 'completed'
                                                        ? 'rgba(16, 185, 129, 0.2)'
                                                        : 'rgba(6, 182, 212, 0.2)',
                                                color: game.status === 'completed' ? '#34d399' : '#38bdf8',
                                            }}
                                        >
                                            {game.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameHistoryModal;
