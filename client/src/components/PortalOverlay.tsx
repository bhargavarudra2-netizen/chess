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

    // Get unique pairs for persistent energetic connection beams
    const uniquePairs = React.useMemo(() => {
        const pairs: Array<{ p1: Portal; p2: Portal; theme: typeof PAIR_COLORS[0] }> = [];
        const seen = new Set<string>();

        portals.forEach(p1 => {
            if (p1.linkedTo && !seen.has(p1.id)) {
                const p2 = portals.find(p => p.id === p1.linkedTo);
                if (p2) {
                    seen.add(p1.id);
                    seen.add(p2.id);
                    const theme = portalColorMap.get(p1.id) || PAIR_COLORS[0];
                    pairs.push({ p1, p2, theme });
                }
            }
        });
        return pairs;
    }, [portals, portalColorMap]);

    if (!portals || portals.length === 0) return null;

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
            {/* Ambient Connection Beams Between Linked Portals */}
            <svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 6,
                }}
            >
                <defs>
                    <filter id="beamGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    {uniquePairs.map(({ p1, theme }) => {
                        const from = getSquareCenter(p1.r, p1.c);
                        const p2 = portals.find(p => p.id === p1.linkedTo)!;
                        const to = getSquareCenter(p2.r, p2.c);
                        return (
                            <linearGradient
                                key={`grad_${p1.id}`}
                                id={`grad_${p1.id}`}
                                x1={`${from.x}%`}
                                y1={`${from.y}%`}
                                x2={`${to.x}%`}
                                y2={`${to.y}%`}
                            >
                                <stop offset="0%" stopColor={theme.primary} stopOpacity="0.8" />
                                <stop offset="50%" stopColor={theme.core} stopOpacity="1" />
                                <stop offset="100%" stopColor={theme.primary} stopOpacity="0.8" />
                            </linearGradient>
                        );
                    })}
                </defs>

                {uniquePairs.map(({ p1, p2, theme }) => {
                    const from = getSquareCenter(p1.r, p1.c);
                    const to = getSquareCenter(p2.r, p2.c);
                    return (
                        <g key={`pair_${p1.id}_${p2.id}`}>
                            {/* Subtle Glow Underlay */}
                            <line
                                x1={`${from.x}%`}
                                y1={`${from.y}%`}
                                x2={`${to.x}%`}
                                y2={`${to.y}%`}
                                stroke={theme.primary}
                                strokeWidth="5"
                                strokeOpacity="0.25"
                                filter="url(#beamGlow)"
                            />
                            {/* Animated Dashed Energy Line */}
                            <line
                                x1={`${from.x}%`}
                                y1={`${from.y}%`}
                                x2={`${to.x}%`}
                                y2={`${to.y}%`}
                                stroke={`url(#grad_${p1.id})`}
                                strokeWidth="2"
                                strokeDasharray="6 6"
                                strokeLinecap="round"
                                className="portal-beam-animated"
                                strokeOpacity="0.75"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Portal Vortices (pointer-events: none ensures pieces underneath can be clicked/dragged) */}
            {portals.map(p => {
                const top = isWhite ? p.r * 12.5 : (7 - p.r) * 12.5;
                const left = isWhite ? p.c * 12.5 : (7 - p.c) * 12.5;
                const theme = portalColorMap.get(p.id) || PAIR_COLORS[0];

                return (
                    <div
                        key={p.id}
                        style={{
                            top: `${top}%`,
                            left: `${left}%`,
                            width: '12.5%',
                            height: '12.5%',
                            position: 'absolute',
                            pointerEvents: 'none',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 7,
                        }}
                    >
                        {/* Outer animated vortex */}
                        <div
                            className="portal-vortex"
                            style={{
                                width: '80%',
                                height: '80%',
                                borderRadius: '50%',
                                border: `2.5px solid ${theme.primary}`,
                                boxShadow: `0 0 14px ${theme.glow}, inset 0 0 10px ${theme.glow}`,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                background: 'radial-gradient(circle, rgba(0,0,0,0.15) 20%, transparent 80%)',
                                pointerEvents: 'none',
                            }}
                        >
                            {/* Inner spinning ring */}
                            <div
                                className="portal-inner-spin"
                                style={{
                                    width: '60%',
                                    height: '60%',
                                    borderRadius: '50%',
                                    border: `1.5px dashed ${theme.core}`,
                                    opacity: 0.9,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    pointerEvents: 'none',
                                }}
                            >
                                {/* Core singularity */}
                                <div
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: theme.core,
                                        boxShadow: `0 0 8px ${theme.core}`,
                                        pointerEvents: 'none',
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
