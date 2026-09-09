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

export const generateRandomPortals = (pairCount: number = 2): Portal[] => {
    const PORTAL_COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#10b981'];
    const portals: Portal[] = [];
    const used = new Set<string>();

    const key = (r: number, c: number) => `${r},${c}`;
    // Ranks 2, 3, 4, 5 correspond to ranks 3, 4, 5, 6 on the board (free from initial piece setup)
    const randRank = () => Math.floor(Math.random() * 4) + 2;
    const randFile = () => Math.floor(Math.random() * 8);

    for (let i = 0; i < pairCount; i++) {
        let p1: { r: number; c: number };
        let p2: { r: number; c: number };

        do {
            p1 = { r: randRank(), c: randFile() };
        } while (used.has(key(p1.r, p1.c)));
        used.add(key(p1.r, p1.c));

        do {
            p2 = { r: randRank(), c: randFile() };
        } while (used.has(key(p2.r, p2.c)));
        used.add(key(p2.r, p2.c));

        const id1 = `p${i}_a`;
        const id2 = `p${i}_b`;
        const color = PORTAL_COLORS[i % PORTAL_COLORS.length];

        portals.push({ ...p1, id: id1, linkedTo: id2, color });
        portals.push({ ...p2, id: id2, linkedTo: id1, color });
    }

    return portals;
};
