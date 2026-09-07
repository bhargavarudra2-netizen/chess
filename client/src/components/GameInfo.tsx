import React, { useRef, useEffect, useState } from 'react';
import ChessClock from './ChessClock';
import CapturedPieces from './CapturedPieces';
import { isSoundEnabled, setSoundEnabled } from '../utils/soundEffects';
import type { LastMoveDetails } from '../types';

interface GameInfoProps {
    fen: string;
    turn: 'w' | 'b';
    playerColor: string;
    history: string[];
    isGameOver: boolean;
    winner: string | null;
    clocks: { white: number; black: number };
    lastMove?: LastMoveDetails;
    onResign?: () => void;
    onRequestDraw?: () => void;
}

export const GameInfo: React.FC<GameInfoProps> = ({
    fen,
    turn,
    playerColor,
    history,
    isGameOver,
    winner,
    clocks,
    lastMove,
    onResign,
    onRequestDraw,
}) => {
    const historyEndRef = useRef<HTMLDivElement>(null);
    const [soundOn, setSoundOn] = useState(isSoundEnabled());

    // Auto-scroll move history to the latest move
    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history.length]);

    const toggleSound = () => {
        const next = !soundOn;
        setSoundOn(next);
        setSoundEnabled(next);
    };

    const isCheck = history.length > 0 && history[history.length - 1]?.includes('+');
    const isCheckmate = isGameOver && winner && winner !== 'draw';

    return (
        <div
            style={{
                width: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
            }}
        >
            {/* Top Opponent Clock */}
            <ChessClock
                seconds={playerColor === 'black' ? clocks.white : clocks.black}
                isActive={!isGameOver && (playerColor === 'black' ? turn === 'w' : turn === 'b')}
                playerColor={playerColor === 'black' ? 'white' : 'black'}
                playerName={playerColor === 'black' ? 'Opponent (White)' : 'Opponent (Black)'}
            />

            {/* Main Info Card */}
            <div
                style={{
                    background: 'rgba(24, 24, 27, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
                }}
            >
                {/* Header with Title & Audio Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Portal Chess
                        </h2>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Real-time Teleport Match</span>
                    </div>

                    <button
                        onClick={toggleSound}
                        title={soundOn ? 'Mute Sound' : 'Enable Sound'}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: soundOn ? '#38bdf8' : '#64748b',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                        }}
                    >
                        {soundOn ? '🔊' : '🔇'}
                    </button>
                </div>

                {/* Status Indicator Banner */}
                {isCheck && !isGameOver && (
                    <div
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <span>⚠️ Check!</span>
                    </div>
                )}

                {lastMove?.teleported && (
                    <div
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: 'rgba(6, 182, 212, 0.15)',
                            border: '1px solid rgba(6, 182, 212, 0.35)',
                            color: '#67e8f9',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <span>🌀 Portal Teleportation Triggered!</span>
                    </div>
                )}

                {/* Captured Pieces Tracker */}
                <div
                    style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                >
                    <CapturedPieces fen={fen} />
                </div>

                {/* Move History Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Move History</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{Math.ceil(history.length / 2)} turns</span>
                    </div>

                    <div
                        style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            height: '180px',
                            overflowY: 'auto',
                            padding: '8px 12px',
                            borderRadius: '6px',
                        }}
                    >
                        {history.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', paddingTop: '60px' }}>
                                Awaiting first move...
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '4px 8px', fontSize: '13px' }}>
                                {history.map((move, i) => {
                                    if (i % 2 === 0) {
                                        const moveNum = Math.floor(i / 2) + 1;
                                        const whiteMove = move;
                                        const blackMove = history[i + 1];
                                        return (
                                            <React.Fragment key={i}>
                                                <span style={{ color: '#64748b', fontWeight: 500 }}>{moveNum}.</span>
                                                <span style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>{whiteMove}</span>
                                                <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{blackMove || ''}</span>
                                            </React.Fragment>
                                        );
                                    }
                                    return null;
                                })}
                                <div ref={historyEndRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Game Over Banner */}
                {isGameOver && (
                    <div
                        style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            padding: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fca5a5' }}>
                            {isCheckmate ? 'Checkmate!' : 'Game Over'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '4px' }}>
                            {winner === 'draw' ? 'Drawn Game' : `Winner: ${winner?.toUpperCase()}`}
                        </div>
                    </div>
                )}

                {/* Actions (Resign / Draw) */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                        onClick={onResign}
                        disabled={isGameOver}
                        style={{
                            flex: 1,
                            padding: '9px',
                            background: isGameOver ? 'rgba(255, 255, 255, 0.03)' : 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            color: isGameOver ? '#64748b' : '#f87171',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: isGameOver ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Resign
                    </button>
                    <button
                        onClick={onRequestDraw}
                        disabled={isGameOver}
                        style={{
                            flex: 1,
                            padding: '9px',
                            background: isGameOver ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.07)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '6px',
                            color: isGameOver ? '#64748b' : '#e2e8f0',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: isGameOver ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Offer Draw
                    </button>
                </div>
            </div>

            {/* Bottom Player Clock */}
            <ChessClock
                seconds={playerColor === 'black' ? clocks.black : clocks.white}
                isActive={!isGameOver && (playerColor === 'black' ? turn === 'b' : turn === 'w')}
                playerColor={playerColor === 'black' ? 'black' : 'white'}
                playerName={playerColor === 'black' ? 'You (Black)' : 'You (White)'}
            />
        </div>
    );
};

export default GameInfo;
