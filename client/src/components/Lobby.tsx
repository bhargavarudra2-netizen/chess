import React, { useState } from 'react';

interface LobbyProps {
    onJoinQueue: () => void;
    onLeaveQueue: () => void;
    isSearching: boolean;
    queueDuration: number;
    onCreateRoom: () => void;
    onJoinRoom: (code: string) => void;
    onStartPractice: () => void;
    onOpenOfflineSetup: (subMode: 'vs_ai' | 'pass_and_play') => void;
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
    onOpenOfflineSetup,
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
                maxWidth: '980px',
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
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        boxShadow: '0 0 28px rgba(6, 182, 212, 0.65)',
                        marginBottom: '14px',
                    }}
                >
                    <img
                        src="/portal-chess.svg"
                        alt="Portal Chess"
                        style={{ width: '100%', height: '100%' }}
                    />
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
                    Standard chess transformed with quantum teleportation wormholes. Play online multiplayer or offline vs our smart portal AI.
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

            {/* Offline Gaming Modes Section */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '16px' }}>📴</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                        Offline Modes (No Server Required)
                    </span>
                    <span
                        style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                    >
                        Works Offline
                    </span>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '18px',
                    }}
                >
                    {/* Offline Option 1: Play vs Computer (AI) */}
                    <div
                        style={{
                            padding: '22px',
                            borderRadius: '14px',
                            background: 'rgba(30, 41, 59, 0.7)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '16px',
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '28px' }}>🤖</span>
                                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, background: 'rgba(6, 182, 212, 0.15)', padding: '3px 8px', borderRadius: '6px' }}>
                                    3 Difficulty Tiers
                                </span>
                            </div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#f8fafc' }}>
                                Play vs Quantum AI
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                                Battle our intelligent chess bot capable of calculating portal jumps, flank attacks, and defense.
                            </p>
                        </div>

                        <button
                            onClick={() => onOpenOfflineSetup('vs_ai')}
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
                                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                                transition: 'all 0.2s',
                            }}
                        >
                            Play vs Computer →
                        </button>
                    </div>

                    {/* Offline Option 2: Local Pass & Play */}
                    <div
                        style={{
                            padding: '22px',
                            borderRadius: '14px',
                            background: 'rgba(30, 41, 59, 0.7)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '16px',
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '28px' }}>👥</span>
                                <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 700, background: 'rgba(168, 85, 247, 0.15)', padding: '3px 8px', borderRadius: '6px' }}>
                                    2 Players Local
                                </span>
                            </div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#f8fafc' }}>
                                Pass & Play
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                                Play face-to-face with a friend on the same screen with digital clocks and optional board auto-flip.
                            </p>
                        </div>

                        <button
                            onClick={() => onOpenOfflineSetup('pass_and_play')}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                background: 'rgba(168, 85, 247, 0.2)',
                                border: '1px solid rgba(168, 85, 247, 0.5)',
                                color: '#e9d5ff',
                                fontWeight: 700,
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            Start Pass & Play →
                        </button>
                    </div>

                    {/* Offline Option 3: Sandbox */}
                    <div
                        style={{
                            padding: '22px',
                            borderRadius: '14px',
                            background: 'rgba(30, 41, 59, 0.7)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '16px',
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '28px' }}>🧪</span>
                                <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '3px 8px', borderRadius: '6px' }}>
                                    Sandbox
                                </span>
                            </div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#f8fafc' }}>
                                Free Sandbox Board
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                                Instant board exploration to test piece teleports, diagonal Bishop rules, and Royal Links.
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
                            Open Sandbox Board →
                        </button>
                    </div>
                </div>
            </div>

            {/* Online Multiplayer Section */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '16px' }}>🌐</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                        Online Multiplayer
                    </span>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '18px',
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
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#f8fafc' }}>Quick Match</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                                Join the global queue and get matched with an online opponent.
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
                                Find Online Opponent
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
                                Generate an invite code to challenge a friend remotely.
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
                                Enter a 6-character room code from your friend to join.
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
