import React from 'react';

interface PromotionModalProps {
    color: 'white' | 'black';
    onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
    onCancel: () => void;
}

const PROMOTION_PIECES: Array<{
    type: 'q' | 'r' | 'b' | 'n';
    name: string;
    whiteSymbol: string;
    blackSymbol: string;
    description: string;
}> = [
    { type: 'q', name: 'Queen', whiteSymbol: '♕', blackSymbol: '♛', description: 'Most versatile & powerful' },
    { type: 'n', name: 'Knight', whiteSymbol: '♘', blackSymbol: '♞', description: 'Quantum jumper & fork specialist' },
    { type: 'r', name: 'Rook', whiteSymbol: '♖', blackSymbol: '♜', description: 'Heavy linear attacker' },
    { type: 'b', name: 'Bishop', whiteSymbol: '♗', blackSymbol: '♝', description: 'Diagonal long-range controller' },
];

export const PromotionModal: React.FC<PromotionModalProps> = ({
    color,
    onSelect,
    onCancel,
}) => {
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
                padding: '16px',
                animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    maxHeight: '92vh',
                    overflowY: 'auto',
                    borderRadius: '16px',
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.2) 0%, rgba(15, 23, 42, 0.98) 75%)',
                    border: '1.5px solid rgba(6, 182, 212, 0.5)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.3)',
                    padding: '22px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    color: '#f8fafc',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: 'rgba(6, 182, 212, 0.15)',
                            border: '1px solid rgba(6, 182, 212, 0.4)',
                            fontSize: '24px',
                            marginBottom: '10px',
                        }}
                    >
                        ✨
                    </div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                        Pawn Promotion
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                        Choose the piece to transform your pawn into:
                    </p>
                </div>

                {/* Piece Choice Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {PROMOTION_PIECES.map(item => {
                        const symbol = color === 'white' ? item.whiteSymbol : item.blackSymbol;
                        return (
                            <button
                                key={item.type}
                                onClick={() => onSelect(item.type)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '16px 12px',
                                    borderRadius: '12px',
                                    background: 'rgba(30, 41, 59, 0.7)',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    color: '#f8fafc',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                    e.currentTarget.style.borderColor = '#06b6d4';
                                    e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(6, 182, 212, 0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '44px',
                                        lineHeight: 1,
                                        filter: color === 'white'
                                            ? 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.5))'
                                            : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.9))',
                                    }}
                                >
                                    {symbol}
                                </span>
                                <span style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
                                    {item.name}
                                </span>
                                <span style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                                    {item.description}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Cancel Button */}
                <button
                    onClick={onCancel}
                    style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#94a3b8',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                        e.currentTarget.style.color = '#fca5a5';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.color = '#94a3b8';
                    }}
                >
                    Cancel Move
                </button>
            </div>
        </div>
    );
};

export default PromotionModal;
