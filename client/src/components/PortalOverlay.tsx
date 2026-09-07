import React from 'react';
import type { Portal } from '../types';

interface PortalOverlayProps {
    portals: Portal[];
    orientation: 'white' | 'black';
}

const PortalOverlay: React.FC<PortalOverlayProps> = ({ portals, orientation }) => {
    if (!portals) return null;

    const getStyle = (r: number, c: number) => {
        const isWhite = orientation === 'white';
        // Row 0 is rank 8 (top) for white?
        // In my server logic: row 0 = rank 8.
        // Chessground: 'white' orientation means rank 8 is at top.
        // So row 0 is top.
        // top = r * 12.5%

        const top = isWhite ? r * 12.5 : (7 - r) * 12.5;
        const left = isWhite ? c * 12.5 : (7 - c) * 12.5;

        return {
            top: `${top}%`,
            left: `${left}%`,
            width: '12.5%',
            height: '12.5%',
            position: 'absolute' as const,
            pointerEvents: 'none' as const,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        };
    };

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {portals.map((p) => (
                <div key={p.id} style={getStyle(p.r, p.c)}>
                    <div style={{
                        width: '80%',
                        height: '80%',
                        borderRadius: '50%',
                        border: `4px solid ${p.color || '#00f'}`,
                        boxShadow: `0 0 10px ${p.color || '#00f'}`,
                        opacity: 0.7
                    }} />
                </div>
            ))}
        </div>
    );
};

export default PortalOverlay;
