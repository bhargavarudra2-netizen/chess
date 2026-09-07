import React, { useState, useEffect } from 'react';
import type { Portal, LastMoveDetails } from '../types';

interface PortalOverlayProps {
    portals: Portal[];
    orientation: 'white' | 'black';
    lastMove?: LastMoveDetails;
}

// Portal color themes by pair index
const PAIR_COLORS = [
    { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.7)', core: '#67e8f9', name: 'Cyan' },
    { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.7)', core: '#e9d5ff', name: 'Violet' },
    { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)', core: '#fde68a', name: 'Amber' },
    { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.7)', core: '#a7f3d0', name: 'Emerald' },
    { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.7)', core: '#fca5a5', name: 'Crimson' },
];

export const PortalOverlay: React.FC<PortalOverlayProps> = ({ portals, orientation, lastMove }) => {
    const [hoveredPortalId, setHoveredPortalId] = useState<string | null>(null);
    const [activeWarp, setActiveWarp] = useState<{
        entrance: { x: number; y: number };
        exit: { x: number; y: number };
    } | null>(null);

    const isWhite = orientation === 'white';

    // Map each portal to its pair index for consistent pair coloring
    const portalColorMap = React.useMemo(() => {
        const map = new Map<string, typeof PAIR_COLORS[0]>();
        let pairIndex = 0;
        const processed = new Set<string>();

        portals.forEach(p => {
            if (!processed.has(p.id)) {
                const color = PAIR_COLORS[pairIndex % PAIR_COLORS.length];
                map.set(p.id, color);
                processed.add(p.id);

                if (p.linkedTo) {
                    map.set(p.linkedTo, color);
                    processed.add(p.linkedTo);
                }
                pairIndex++;
            }
        });
        return map;
    }, [portals]);

    // Calculate percent center coordinate for a square (r, c)
    const getSquareCenter = (r: number, c: number) => {
        const top = isWhite ? r * 12.5 + 6.25 : (7 - r) * 12.5 + 6.25;
        const left = isWhite ? c * 12.5 + 6.25 : (7 - c) * 12.5 + 6.25;
        return { x: left, y: top };
    };

    // Trigger teleport burst when lastMove had teleportation
    useEffect(() => {
        if (lastMove?.teleported && lastMove.finalDest) {
            // Find entrance square coordinates from move.to
            const file = lastMove.to.charCodeAt(0) - 97;
            const rank = 8 - parseInt(lastMove.to[1], 10);
            const entranceCoord = getSquareCenter(rank, file);
            const exitCoord = getSquareCenter(lastMove.finalDest.r, lastMove.finalDest.c);

            setActiveWarp({ entrance: entranceCoord, exit: exitCoord });
            const timer = setTimeout(() => {
                setActiveWarp(null);
            }, 1200);

            return () => clearTimeout(timer);
        }
    }, [lastMove]);

    if (!portals || portals.length === 0) return null;

    const hoveredPortal = portals.find(p => p.id === hoveredPortalId);
    const linkedPortal = hoveredPortal ? portals.find(p => p.id === hoveredPortal.linkedTo) : null;

    let beamLine = null;
    if (hoveredPortal && linkedPortal) {
        const from = getSquareCenter(hoveredPortal.r, hoveredPortal.c);
        const to = getSquareCenter(linkedPortal.r, linkedPortal.c);
        const portalTheme = portalColorMap.get(hoveredPortal.id) || PAIR_COLORS[0];

        beamLine = (
            <svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 15,
                }}
            >
                <defs>
                    <linearGradient id="portalBeamGrad" x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`}>
                        <stop offset="0%" stopColor={portalTheme.primary} stopOpacity="0.9" />
                        <stop offset="50%" stopColor={portalTheme.core} stopOpacity="1" />
                        <stop offset="100%" stopColor={portalTheme.primary} stopOpacity="0.9" />
                    </linearGradient>
                    <filter id="beamGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Glow underlay */}
                <line
                    x1={`${from.x}%`}
                    y1={`${from.y}%`}
                    x2={`${to.x}%`}
                    y2={`${to.y}%`}
                    stroke={portalTheme.primary}
                    strokeWidth="8"
                    strokeOpacity="0.4"
                    filter="url(#beamGlow)"
                />
                {/* Dashed energetic line */}
                <line
                    x1={`${from.x}%`}
                    y1={`${from.y}%`}
                    x2={`${to.x}%`}
                    y2={`${to.y}%`}
                    stroke="url(#portalBeamGrad)"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    className="portal-beam-animated"
                />
            </svg>
        );
    }

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {beamLine}

            {portals.map(p => {
                const top = isWhite ? p.r * 12.5 : (7 - p.r) * 12.5;
                const left = isWhite ? p.c * 12.5 : (7 - p.c) * 12.5;
                const theme = portalColorMap.get(p.id) || PAIR_COLORS[0];
                const isHovered = hoveredPortalId === p.id || linkedPortal?.id === p.id;

                return (
                    <div
                        key={p.id}
                        onMouseEnter={() => setHoveredPortalId(p.id)}
                        onMouseLeave={() => setHoveredPortalId(null)}
                        style={{
                            top: `${top}%`,
                            left: `${left}%`,
                            width: '12.5%',
                            height: '12.5%',
                            position: 'absolute',
                            pointerEvents: 'auto',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            zIndex: 10,
                        }}
                    >
                        {/* Outer animated vortex */}
                        <div
                            className="portal-vortex"
                            style={{
                                width: isHovered ? '86%' : '78%',
                                height: isHovered ? '86%' : '78%',
                                borderRadius: '50%',
                                border: `2.5px solid ${theme.primary}`,
                                boxShadow: isHovered
                                    ? `0 0 20px ${theme.primary}, inset 0 0 15px ${theme.primary}`
                                    : `0 0 10px ${theme.glow}, inset 0 0 8px ${theme.glow}`,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'all 0.25s ease',
                                background: 'radial-gradient(circle, rgba(0,0,0,0.2) 20%, transparent 80%)',
                            }}
                        >
                            {/* Inner spinning energetic ring */}
                            <div
                                className="portal-inner-spin"
                                style={{
                                    width: '60%',
                                    height: '60%',
                                    borderRadius: '50%',
                                    border: `1.5px dashed ${theme.core}`,
                                    opacity: isHovered ? 1 : 0.8,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                {/* Core singularity node */}
                                <div
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: theme.core,
                                        boxShadow: `0 0 8px ${theme.core}`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Active teleportation warp pulse */}
            {activeWarp && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
                    {/* Entrance collapse burst */}
                    <div
                        className="teleport-warp-burst entrance"
                        style={{
                            top: `${activeWarp.entrance.y}%`,
                            left: `${activeWarp.entrance.x}%`,
                        }}
                    />
                    {/* Exit expansion burst */}
                    <div
                        className="teleport-warp-burst exit"
                        style={{
                            top: `${activeWarp.exit.y}%`,
                            left: `${activeWarp.exit.x}%`,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default PortalOverlay;
