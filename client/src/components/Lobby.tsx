import React, { useState } from 'react';

interface LobbyProps {
    onJoinQueue: () => void;
    onLeaveQueue: () => void;
    isSearching: boolean;
    queueDuration: number;
    onCreateRoom: () => void;
    onJoinRoom: (code: string) => void;
    onStartPractice: () => void;
    pendingRoomCode: string | null;
}

export const Lobby: React.FC<LobbyProps> = ({
    onJoinQueue,
    onLeaveQueue,
    isSearching,
    queueDuration,
    onCreateRoom,
    onJoinRoom,
    onStartPractice,
    pendingRoomCode,
}) => {
    const [inputCode, setInputCode] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!pendingRoomCode) return;
        navigator.clipboard.writeText(pendingRoomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clean = inputCode.trim().toUpperCase();
        if (clean) {
            onJoinRoom(clean);
        }
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div
            style={{
                width: '100%',
                maxWidth: '960px',
                margin: '0 auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '28px',
            }}
        >
            {/* Hero Banner */}
            <div
                style={{
                    textAlign: 'center',
                    padding: '36px 20px',
                    borderRadius: '16px',
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.18) 0%, rgba(15, 23, 42, 0.8) 75%)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4), 0 0 24px rgba(6, 182, 212, 0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '54px',
                        height: '54px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                        boxShadow: '0 0 24px rgba(6, 182, 212, 0.6)',
                        fontSize: '28px',
                        marginBottom: '14px',
                    }}
                >
                    🌀
                </div>
                <h1
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '32px',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg, #f8fafc, #38bdf8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Portal Chess Arena
                </h1>
                <p style={{ margin: '0 auto', maxWidth: '540px', color: '#94a3b8', fontSize: '15px' }}>
                    Standard chess transformed with quantum teleportation wormholes. Step through portals to ambush opponents across the board.
                </p>
            </div>

            {/* Waiting for opponent modal/banner if private room was created */}
            {pendingRoomCode && (
                <div
                    style={{
                        padding: '24px',
                        borderRadius: '12px',
                        background: 'rgba(6, 182, 212, 0.12)',
                        border: '1px solid #06b6d4',
                        boxShadow: '0 0 24px rgba(6, 182, 212, 0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '14px',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: '13px', color: '#67e8f9', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Private Room Created - Waiting for Opponent
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                            style={{
                                fontFamily: 'monospace',
                                fontSize: '28px',
                                fontWeight: 800,
                                letterSpacing: '0.12em',
                                padding: '8px 20px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: '#f8fafc',
                            }}
                        >
                            {pendingRoomCode}
                        </span>

                        <button
                            onClick={handleCopy}
                            style={{
                                padding: '12px 20px',
                                background: copied ? '#10b981' : '#0284c7',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {copied ? '✓ Copied!' : 'Copy Code'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
                        <div
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: '#38bdf8',
                                boxShadow: '0 0 8px #38bdf8',
                                animation: 'portal-inner-spin 1.5s infinite linear',
                            }}
                        />
                        <span>Share this code with your friend. The game will automatically begin once they join!</span>
                    </div>
                </div>
            )}

            {/* Matchmaking Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '20px',
                }}
            >
                {/* 1. Quick Match */}
                <div
                    style={{
                        padding: '24px',
                        borderRadius: '14px',
                        background: isSearching
                            ? 'rgba(6, 182, 212, 0.12)'
                            : 'rgba(30, 41, 59, 0.6)',
                        border: isSearching
                            ? '1px solid #06b6d4'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '18px',
                        transition: 'all 0.25s ease',
                    }}
                >
                    <div>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#f8fafc' }}>Quick Match</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                            Join the global queue and get instantly paired with an online opponent.
                        </p>
                    </div>

                    {isSearching ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 600, fontSize: '14px' }}>
                                <div className="searching-radar-dot" />
                                <span>Searching... {formatTime(queueDuration)}</span>
                            </div>
                            <button
                                onClick={onLeaveQueue}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                    color: '#f87171',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel Search
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onJoinQueue}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                                border: 'none',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '14px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                                transition: 'all 0.2s',
                            }}
                        >
                            Find Opponent
                        </button>
                    )}
                </div>

                {/* 2. Create Private Room */}
                <div
                    style={{
                        padding: '24px',
                        borderRadius: '14px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '18px',
                    }}
                >
                    <div>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔐</div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#f8fafc' }}>Create Private Room</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                            Generate an invite code and play directly against a friend or colleague.
                        </p>
                    </div>

                    <button
                        onClick={onCreateRoom}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'rgba(139, 92, 246, 0.2)',
                            border: '1px solid rgba(139, 92, 246, 0.5)',
                            color: '#c4b5fd',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Create Room Code
                    </button>
                </div>

                {/* 3. Join by Code */}
                <div
                    style={{
                        padding: '24px',
                        borderRadius: '14px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '18px',
                    }}
                >
                    <div>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#f8fafc' }}>Join by Code</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                            Have a room code from a friend? Enter it below to join their game.
                        </p>
                    </div>

                    <form onSubmit={handleJoinSubmit} style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            placeholder="e.g. 7A2X9F"
                            maxLength={8}
                            value={inputCode}
                            onChange={e => setInputCode(e.target.value.toUpperCase())}
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                color: '#f8fafc',
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                outline: 'none',
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!inputCode.trim()}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '8px',
                                background: inputCode.trim() ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                color: inputCode.trim() ? '#fff' : '#64748b',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: inputCode.trim() ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                            }}
                        >
                            Join
                        </button>
                    </form>
                </div>

                {/* 4. Local Sandbox Mode */}
                <div
                    style={{
                        padding: '24px',
                        borderRadius: '14px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '18px',
                    }}
                >
                    <div>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧪</div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#f8fafc' }}>Sandbox / Practice</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                            Play locally to test portal mechanics, warp paths, and diagonal Bishop rules.
                        </p>
                    </div>

                    <button
                        onClick={onStartPractice}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.18)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            color: '#6ee7b7',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Launch Practice Board
                    </button>
                </div>
            </div>

            {/* Portal Quantum Mechanics Guide */}
            <div
                style={{
                    padding: '20px 24px',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}
            >
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📖</span>
                    <span>Portal Chess Special Rules</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '13px', color: '#94a3b8' }}>
                    <div>
                        <b style={{ color: '#38bdf8' }}>1. Wormhole Teleport:</b> Moving onto a portal entrance instantly teleports your piece to its twin portal exit square.
                    </div>
                    <div>
                        <b style={{ color: '#a78bfa' }}>2. Bishop Color Rule:</b> Bishops can only pass through a portal if both portal squares share the bishop's square color.
                    </div>
                    <div>
                        <b style={{ color: '#34d399' }}>3. Friendly Block:</b> If a friendly piece sits at the exit portal, teleportation is blocked and the mover remains at the entrance.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lobby;
