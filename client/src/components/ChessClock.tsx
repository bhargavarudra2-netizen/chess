import React from 'react';

interface ChessClockProps {
    seconds: number;
    isActive: boolean;
    playerColor: 'white' | 'black';
    playerName?: string;
}

export const ChessClock: React.FC<ChessClockProps> = ({
    seconds,
    isActive,
    playerColor,
    playerName,
}) => {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const isLowTime = totalSeconds <= 30 && totalSeconds > 0;
    const isExpired = totalSeconds === 0;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                borderRadius: '8px',
                background: isActive
                    ? 'rgba(30, 41, 59, 0.85)'
                    : 'rgba(15, 23, 42, 0.6)',
                border: isActive
                    ? isLowTime
                        ? '1px solid #ef4444'
                        : '1px solid #38bdf8'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isActive
                    ? isLowTime
                        ? '0 0 16px rgba(239, 68, 68, 0.35)'
                        : '0 0 16px rgba(56, 189, 248, 0.25)'
                    : 'none',
                transition: 'all 0.2s ease',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                    style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: playerColor === 'white' ? '#f8fafc' : '#334155',
                        border: '1.5px solid rgba(255, 255, 255, 0.3)',
                        display: 'inline-block',
                    }}
                />
                <span
                    style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: playerColor === 'white' ? '#f1f5f9' : '#94a3b8',
                        letterSpacing: '0.02em',
                        textTransform: 'capitalize',
                    }}
                >
                    {playerName || (playerColor === 'white' ? 'White' : 'Black')}
                </span>
                {isActive && (
                    <span
                        style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#0284c7',
                            color: '#e0f2fe',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Turn
                    </span>
                )}
            </div>

            <div
                style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: isExpired
                        ? '#ef4444'
                        : isLowTime
                        ? '#f87171'
                        : isActive
                        ? '#38bdf8'
                        : '#cbd5e1',
                }}
            >
                {formatted}
            </div>
        </div>
    );
};

export default ChessClock;
