import React, { useMemo } from 'react';

interface CapturedPiecesProps {
    fen: string;
}

const PIECE_VALUES: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
};

const INITIAL_COUNTS = {
    white: { p: 8, n: 2, b: 2, r: 2, q: 1 },
    black: { p: 8, n: 2, b: 2, r: 2, q: 1 },
};

// Unicode symbols or glyph representations for captured pieces
const PIECE_SYMBOLS: Record<string, { white: string; black: string }> = {
    p: { white: '♙', black: '♟' },
    n: { white: '♘', black: '♞' },
    b: { white: '♗', black: '♝' },
    r: { white: '♖', black: '♜' },
    q: { white: '♕', black: '♛' },
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ fen }) => {
    const { capturedByWhite, capturedByBlack, whiteDiff, blackDiff } = useMemo(() => {
        const boardPart = (fen || '').split(' ')[0] || '';
        const currentCounts = {
            white: { p: 0, n: 0, b: 0, r: 0, q: 0 } as Record<string, number>,
            black: { p: 0, n: 0, b: 0, r: 0, q: 0 } as Record<string, number>,
        };

        for (const char of boardPart) {
            const lower = char.toLowerCase();
            if (['p', 'n', 'b', 'r', 'q'].includes(lower)) {
                if (char === char.toUpperCase()) {
                    currentCounts.white[lower]++;
                } else {
                    currentCounts.black[lower]++;
                }
            }
        }

        // Captured by white are black pieces missing from board
        const capturedByWhite: { type: string; count: number; symbol: string }[] = [];
        let whiteMaterial = 0;
        (['q', 'r', 'b', 'n', 'p'] as const).forEach(piece => {
            const diff = Math.max(0, INITIAL_COUNTS.black[piece] - (currentCounts.black[piece] || 0));
            if (diff > 0) {
                capturedByWhite.push({
                    type: piece,
                    count: diff,
                    symbol: PIECE_SYMBOLS[piece].black,
                });
                whiteMaterial += diff * PIECE_VALUES[piece];
            }
        });

        // Captured by black are white pieces missing from board
        const capturedByBlack: { type: string; count: number; symbol: string }[] = [];
        let blackMaterial = 0;
        (['q', 'r', 'b', 'n', 'p'] as const).forEach(piece => {
            const diff = Math.max(0, INITIAL_COUNTS.white[piece] - (currentCounts.white[piece] || 0));
            if (diff > 0) {
                capturedByBlack.push({
                    type: piece,
                    count: diff,
                    symbol: PIECE_SYMBOLS[piece].white,
                });
                blackMaterial += diff * PIECE_VALUES[piece];
            }
        });

        const matDiff = whiteMaterial - blackMaterial;

        return {
            capturedByWhite,
            capturedByBlack,
            whiteDiff: matDiff > 0 ? matDiff : 0,
            blackDiff: matDiff < 0 ? Math.abs(matDiff) : 0,
        };
    }, [fen]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            {/* Captured by Black (White pieces taken) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '22px' }}>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', width: '45px' }}>
                    Black
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
                    {capturedByBlack.map(item => (
                        <span key={item.type} title={`${item.count} ${item.type}`}>
                            {Array.from({ length: item.count }).map((_, i) => (
                                <span key={i} style={{ fontSize: '16px', color: '#e2e8f0', marginRight: '1px' }}>
                                    {item.symbol}
                                </span>
                            ))}
                        </span>
                    ))}
                    {blackDiff > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginLeft: '4px' }}>
                            +{blackDiff}
                        </span>
                    )}
                </div>
            </div>

            {/* Captured by White (Black pieces taken) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '22px' }}>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', width: '45px' }}>
                    White
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
                    {capturedByWhite.map(item => (
                        <span key={item.type} title={`${item.count} ${item.type}`}>
                            {Array.from({ length: item.count }).map((_, i) => (
                                <span key={i} style={{ fontSize: '16px', color: '#94a3b8', marginRight: '1px' }}>
                                    {item.symbol}
                                </span>
                            ))}
                        </span>
                    ))}
                    {whiteDiff > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginLeft: '4px' }}>
                            +{whiteDiff}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CapturedPieces;
