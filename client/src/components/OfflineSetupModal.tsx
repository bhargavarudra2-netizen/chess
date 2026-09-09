import React, { useState } from 'react';
import type { AiDifficulty } from '../utils/portalAi';

export interface OfflineMatchConfig {
    subMode: 'vs_ai' | 'pass_and_play';
    difficulty: AiDifficulty;
    playerColor: 'white' | 'black';
    timeControlSeconds: number; // 0 = unlimited
    autoFlip: boolean;
}

interface OfflineSetupModalProps {
    isOpen: boolean;
    initialSubMode: 'vs_ai' | 'pass_and_play';
    onClose: () => void;
    onStartMatch: (config: OfflineMatchConfig) => void;
}

export const OfflineSetupModal: React.FC<OfflineSetupModalProps> = ({
    isOpen,
    initialSubMode,
    onClose,
    onStartMatch,
}) => {
    const [subMode, setSubMode] = useState<'vs_ai' | 'pass_and_play'>(initialSubMode);
    const [difficulty, setDifficulty] = useState<AiDifficulty>('adept');
    const [colorPick, setColorPick] = useState<'white' | 'black' | 'random'>('white');
    const [timerSeconds, setTimerSeconds] = useState<number>(600); // 10 min default
    const [autoFlip, setAutoFlip] = useState<boolean>(false);

    if (!isOpen) return null;

    const handleStart = () => {
        let chosenColor: 'white' | 'black' = 'white';
        if (colorPick === 'random') {
            chosenColor = Math.random() < 0.5 ? 'white' : 'black';
        } else {
            chosenColor = colorPick;
        }

        onStartMatch({
            subMode,
            difficulty,
            playerColor: chosenColor,
            timeControlSeconds: timerSeconds,
            autoFlip,
        });
        onClose();
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
                    maxWidth: '460px',
                    borderRadius: '16px',
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.18) 0%, rgba(15, 23, 42, 0.95) 85%)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.2)',
                    padding: '28px',
                    color: '#f8fafc',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
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

                {/* Title */}
                <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800, color: '#f8fafc' }}>
                        Offline Match Setup
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                        Configure your offline Portal Chess battle. No server or internet connection required!
                    </p>
                </div>

                {/* Submode Switcher */}
                <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', padding: '4px' }}>
                    <button
                        type="button"
                        onClick={() => setSubMode('vs_ai')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '6px',
                            background: subMode === 'vs_ai' ? '#0284c7' : 'transparent',
                            color: subMode === 'vs_ai' ? '#fff' : '#94a3b8',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span>🤖</span>
                        <span>Play vs Computer</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSubMode('pass_and_play')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '6px',
                            background: subMode === 'pass_and_play' ? '#0284c7' : 'transparent',
                            color: subMode === 'pass_and_play' ? '#fff' : '#94a3b8',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span>👥</span>
                        <span>Pass & Play</span>
                    </button>
                </div>

                {/* VS AI Options */}
                {subMode === 'vs_ai' && (
                    <>
                        {/* Difficulty */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>
                                AI Difficulty Tier:
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                {(
                                    [
                                        { id: 'novice', label: 'Novice', elo: '800' },
                                        { id: 'adept', label: 'Adept', elo: '1400' },
                                        { id: 'grandmaster', label: 'Master', elo: '1800+' },
                                    ] as const
                                ).map(tier => (
                                    <button
                                        key={tier.id}
                                        type="button"
                                        onClick={() => setDifficulty(tier.id)}
                                        style={{
                                            padding: '10px 8px',
                                            borderRadius: '8px',
                                            border: difficulty === tier.id ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                                            background: difficulty === tier.id ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                            color: '#f8fafc',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{tier.label}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>~{tier.elo} Elo</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Player Color */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>
                                Your Color:
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                {[
                                    { id: 'white', label: '⚪ White' },
                                    { id: 'random', label: '🎲 Random' },
                                    { id: 'black', label: '⚫ Black' },
                                ].map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setColorPick(c.id as any)}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: colorPick === c.id ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                                            background: colorPick === c.id ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                            color: '#f8fafc',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Pass & Play Options */}
                {subMode === 'pass_and_play' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px' }}>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>Auto-Flip Board</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Rotates board each turn for local opponents</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={autoFlip}
                            onChange={e => setAutoFlip(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                    </div>
                )}

                {/* Time Control */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>
                        Time Control:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {[
                            { secs: 180, label: '3m' },
                            { secs: 300, label: '5m' },
                            { secs: 600, label: '10m' },
                            { secs: 0, label: '∞' },
                        ].map(t => (
                            <button
                                key={t.secs}
                                type="button"
                                onClick={() => setTimerSeconds(t.secs)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: timerSeconds === t.secs ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                                    background: timerSeconds === t.secs ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                    color: '#f8fafc',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Launch Button */}
                <button
                    type="button"
                    onClick={handleStart}
                    style={{
                        width: '100%',
                        padding: '13px',
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
                    {subMode === 'vs_ai' ? 'Start Match vs Computer' : 'Start Pass & Play Match'}
                </button>
            </div>
        </div>
    );
};

export default OfflineSetupModal;
