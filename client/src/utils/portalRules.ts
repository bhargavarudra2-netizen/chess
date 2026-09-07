import type { Portal } from '../types';

export const getPortalAt = (portals: Portal[], r: number, c: number): Portal | undefined => {
    return portals.find(p => p.r === r && p.c === c);
};

export const getLinkedPortal = (portals: Portal[], portal: Portal): Portal | undefined => {
    return portals.find(p => p.id === portal.linkedTo);
};

export const canBishopUsePortal = (from: { r: number, c: number }, to: { r: number, c: number }): boolean => {
    const fromColor = (from.r + from.c) % 2;
    const toColor = (to.r + to.c) % 2;
    return fromColor === toColor;
};

export const resolvePortalDestination = (
    portals: Portal[],
    from: { r: number, c: number },
    to: { r: number, c: number },
    pieceType: string,
    pieceColor: 'w' | 'b',
    boardState: any // chess.js instance
): { r: number, c: number } | null => {
    const portal = getPortalAt(portals, to.r, to.c);
    if (!portal) return null;

    const linked = getLinkedPortal(portals, portal);
    if (!linked) return null;

    // 1. Bishop Rule
    if (pieceType === 'b') {
        if (!canBishopUsePortal(from, { r: linked.r, c: linked.c })) return null;
    }

    // 2. Check destination occupancy
    // We need to convert r,c to algebraic for chess.js check
    const toSquare = (r: number, c: number) => {
        const file = String.fromCharCode(c + 97);
        const rank = 8 - r;
        return `${file}${rank}`;
    };

    const destSq = toSquare(linked.r, linked.c);
    const destPiece = boardState.get(destSq);

    if (destPiece && destPiece.color === pieceColor) {
        return null; // Blocked
    }

    return { r: linked.r, c: linked.c };
};
