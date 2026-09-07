import React from 'react';
import type { Portal } from '../types';

interface RoyalLinkModalProps {
    fromSquare: string;
    toSquare: string;
    portals: Portal[];
    onConfirm: (targetPortalId: string) => void;
    onSkip: () => void;
}

const squareFromCoords = (r: number, c: number): string => {
    const file = String.fromCharCode(c + 97);
    const rank = 8 - r;
    return `${file}${rank}`;
};

export const RoyalLinkModal: React.FC<RoyalLinkModalProps> = ({
    fromSquare,
    toSquare,
    portals,
    onConfirm,
    onSkip,
}) => {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '20px',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    borderRadius: '16px',
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 215, 0, 0.15) 0%, rgba(15, 23, 42, 0.95) 80%)',
                    border: '1.5px solid rgba(255, 215, 0, 0.5)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.25)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    color: '#f8fafc',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            margin: '0 auto 12px auto',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                            boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                        }}
                    >
                        👑
                    </div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#fef08a' }}>
                        Activate Royal Link
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                        Your King moved from <b style={{ color: '#ffd700' }}>{fromSquare}</b> to{' '}
                        <b style={{ color: '#ffd700' }}>{toSquare}</b>. You can create a permanent golden portal on{' '}
                        <b style={{ color: '#ffd700' }}>{fromSquare}</b> linked to an existing portal!
                    </p>
                </div>

                {/* Portal Target Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>
                        Choose Target Portal to Bind:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                        {portals.map(p => {
                            const sq = squareFromCoords(p.r, p.c);
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => onConfirm(p.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        background: 'rgba(30, 41, 59, 0.7)',
                                        border: `1px solid ${p.color || '#38bdf8'}`,
                                        color: '#f8fafc',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: p.color || '#38bdf8',
                                                boxShadow: `0 0 8px ${p.color || '#38bdf8'}`,
                                            }}
                                        />
                                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Portal at {sq.toUpperCase()}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#ffd700', fontWeight: 700 }}>
                                        Bind Link →
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                        onClick={onSkip}
                        style={{
                            flex: 1,
                            padding: '11px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#94a3b8',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Skip (Normal Move)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoyalLinkModal;
