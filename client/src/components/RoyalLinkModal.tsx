import React, { useState } from 'react';
import type { Portal } from '../types';

interface RoyalLinkModalProps {
    fromSquare: string;
    toSquare: string;
    portals: Portal[];
    fen?: string;
    orientation?: 'white' | 'black';
    onConfirm: (targetPortalId: string, placedSquare: string) => void;
    onSkip: (dontAskAgain?: boolean) => void;
}

const squareFromCoords = (r: number, c: number): string => {
    const file = String.fromCharCode(c + 97);
    const rank = 8 - r;
    return `${file}${rank}`;
};

const PIECE_SYMBOLS: Record<string, string> = {
    p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
    P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
};

const parseFenToBoard = (fen?: string): (string | null)[][] => {
    const board: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    if (!fen) return board;
    const piecePlacement = fen.split(' ')[0];
    const rows = piecePlacement.split('/');
    for (let r = 0; r < 8 && r < rows.length; r++) {
        let c = 0;
        for (const char of rows[r]) {
            if (/\d/.test(char)) {
                c += parseInt(char, 10);
            } else if (c < 8) {
                board[r][c] = char;
                c++;
            }
        }
    }
    return board;
};

export const RoyalLinkModal: React.FC<RoyalLinkModalProps> = ({
    fromSquare,
    toSquare,
    portals,
    fen,
    orientation = 'white',
    onConfirm,
    onSkip,
}) => {
    const [selectedSquare, setSelectedSquare] = useState<string>(fromSquare);
    const [targetPortalId, setTargetPortalId] = useState<string>(portals[0]?.id || '');
    const pieceBoard = parseFenToBoard(fen);

    const files = orientation === 'black' ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = orientation === 'black' ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

    const handleConfirm = () => {
        if (!targetPortalId || !selectedSquare) return;
        onConfirm(targetPortalId, selectedSquare);
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '16px',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '480px',
                    borderRadius: '16px',
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 215, 0, 0.18) 0%, rgba(15, 23, 42, 0.98) 75%)',
                    border: '1.5px solid rgba(255, 215, 0, 0.6)',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(255, 215, 0, 0.3)',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    color: '#f8fafc',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: '44px',
                            height: '44px',
                            margin: '0 auto 8px auto',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                            boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                        }}
                    >
                        👑
                    </div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '19px', fontWeight: 800, color: '#fef08a' }}>
                        👑 Place Royal Portal (Castling)
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                        Castled from <b style={{ color: '#ffd700' }}>{fromSquare}</b> to <b style={{ color: '#ffd700' }}>{toSquare}</b>!
                        Click any empty board square below to place your new golden Royal Portal, then pick a portal to bind.
                    </p>
                </div>

                {/* 8x8 Mini Chessboard Placement Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '288px', fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                        <span>Board Placement:</span>
                        <span style={{ color: '#ffd700', fontWeight: 700 }}>Square: {selectedSquare.toUpperCase()}</span>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(8, 36px)',
                            gridTemplateRows: 'repeat(8, 36px)',
                            border: '2px solid rgba(255, 215, 0, 0.4)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                            background: '#0f172a',
                        }}
                    >
                        {ranks.map(rank =>
                            files.map(file => {
                                const sq = `${file}${rank}`;
                                const r = 8 - rank;
                                const c = file.charCodeAt(0) - 97;
                                const isDark = (r + c) % 2 === 1;
                                const isSelected = sq === selectedSquare;
                                const isDeparture = sq === fromSquare;
                                const existingPortal = portals.find(p => p.r === r && p.c === c);
                                const rawPiece = pieceBoard[r]?.[c];
                                // King vacated fromSquare when castling, so it's always unoccupied
                                const hasPiece = rawPiece && sq !== fromSquare;
                                const isPlaceable = !existingPortal && !hasPiece;

                                return (
                                    <button
                                        key={sq}
                                        type="button"
                                        title={`${sq.toUpperCase()}${existingPortal ? ' (Portal)' : hasPiece ? ' (Piece)' : ' (Empty - Click to Place)'}`}
                                        onClick={() => {
                                            if (isPlaceable) {
                                                setSelectedSquare(sq);
                                            }
                                        }}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            padding: 0,
                                            border: isSelected
                                                ? '2px solid #ffd700'
                                                : isDeparture
                                                ? '1px dashed rgba(255, 215, 0, 0.7)'
                                                : 'none',
                                            background: isSelected
                                                ? 'rgba(255, 215, 0, 0.4)'
                                                : isDark
                                                ? '#1e293b'
                                                : '#334155',
                                            cursor: isPlaceable ? 'pointer' : 'not-allowed',
                                            boxShadow: isSelected ? 'inset 0 0 10px rgba(255, 215, 0, 0.8)' : undefined,
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {/* Existing Portal Dot */}
                                        {existingPortal && (
                                            <span
                                                style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    borderRadius: '50%',
                                                    background: existingPortal.color || '#38bdf8',
                                                    boxShadow: `0 0 8px ${existingPortal.color || '#38bdf8'}`,
                                                    border: '1.5px solid #fff',
                                                }}
                                            />
                                        )}

                                        {/* Piece symbol if occupied */}
                                        {!existingPortal && hasPiece && (
                                            <span style={{ fontSize: '18px', opacity: 0.75, userSelect: 'none' }}>
                                                {PIECE_SYMBOLS[rawPiece] || rawPiece}
                                            </span>
                                        )}

                                        {/* Golden Crown Marker on Selected Placement Square */}
                                        {isSelected && (
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    fontSize: '16px',
                                                    filter: 'drop-shadow(0 0 4px #ffd700)',
                                                    animation: 'pulse 1.5s infinite',
                                                }}
                                            >
                                                👑
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Target Portal Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>
                        Bind to Target Portal:
                    </span>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {portals.map(p => {
                            const sq = squareFromCoords(p.r, p.c);
                            const isChosen = p.id === targetPortalId;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setTargetPortalId(p.id)}
                                    style={{
                                        flex: 1,
                                        minWidth: '120px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        background: isChosen ? 'rgba(255, 215, 0, 0.18)' : 'rgba(30, 41, 59, 0.7)',
                                        border: isChosen ? '2px solid #ffd700' : `1px solid ${p.color || '#38bdf8'}`,
                                        color: isChosen ? '#fef08a' : '#f8fafc',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: p.color || '#38bdf8',
                                            boxShadow: `0 0 8px ${p.color || '#38bdf8'}`,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{sq.toUpperCase()}</div>
                                        <div style={{ fontSize: '10px', color: isChosen ? '#fef08a' : '#94a3b8' }}>
                                            {isChosen ? 'Selected Target' : 'Click to Link'}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
                    <button
                        onClick={handleConfirm}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
                            border: 'none',
                            color: '#0f172a',
                            fontSize: '14px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <span>👑</span>
                        <span>Place & Bind Royal Portal on {selectedSquare.toUpperCase()}</span>
                    </button>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => onSkip(false)}
                            style={{
                                flex: 1,
                                padding: '9px',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#94a3b8',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Skip This Turn
                        </button>
                        <button
                            onClick={() => onSkip(true)}
                            style={{
                                flex: 1,
                                padding: '9px',
                                borderRadius: '8px',
                                background: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#fca5a5',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Decline (Don't Ask Again)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoyalLinkModal;
