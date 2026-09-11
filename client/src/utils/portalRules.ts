import { Chess } from 'chess.js';
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

export interface PortalResolutionDetails {
    destination: { r: number; c: number } | null;
    blockedByCheck: boolean;
    blockedByFriendlyPiece: boolean;
    blockedByBishopColor: boolean;
}

export const resolvePortalDestinationWithDetails = (
    portals: Portal[],
    from: { r: number; c: number },
    to: { r: number; c: number },
    pieceType: string,
    pieceColor: 'w' | 'b',
    boardState: any // chess.js instance
): PortalResolutionDetails => {
    const portal = getPortalAt(portals, to.r, to.c);
    if (!portal) {
        return { destination: null, blockedByCheck: false, blockedByFriendlyPiece: false, blockedByBishopColor: false };
    }

    const linked = getLinkedPortal(portals, portal);
    if (!linked) {
        return { destination: null, blockedByCheck: false, blockedByFriendlyPiece: false, blockedByBishopColor: false };
    }

    // 1. Bishop Rule: Bishop cannot change square color
    if (pieceType === 'b') {
        if (!canBishopUsePortal(from, { r: linked.r, c: linked.c })) {
            return { destination: null, blockedByCheck: false, blockedByFriendlyPiece: false, blockedByBishopColor: true };
        }
    }

    // 2. Check destination occupancy
    const toSquare = (r: number, c: number) => {
        const file = String.fromCharCode(c + 97);
        const rank = 8 - r;
        return `${file}${rank}`;
    };

    const destSq = toSquare(linked.r, linked.c);
    const destPiece = boardState.get(destSq);

    if (destPiece && destPiece.color === pieceColor) {
        return { destination: null, blockedByCheck: false, blockedByFriendlyPiece: true, blockedByBishopColor: false }; // Blocked by friendly piece
    }

    // 3. King Check Rule: King must NOT be teleported into check via any portal!
    if (pieceType === 'k') {
        try {
            const toSqName = toSquare(to.r, to.c);
            const simChess = new Chess(boardState.fen());
            simChess.remove(toSqName as any);
            simChess.remove(destSq as any);
            simChess.put({ type: 'k', color: pieceColor }, destSq as any);

            const opponentColor = pieceColor === 'w' ? 'b' : 'w';
            let wouldBeInCheck = simChess.isAttacked(destSq as any, opponentColor);

            if (!wouldBeInCheck) {
                const fenParts = simChess.fen().split(' ');
                fenParts[1] = pieceColor;
                const checkChess = new Chess(fenParts.join(' '));
                wouldBeInCheck = checkChess.isCheck();
            }

            if (wouldBeInCheck) {
                return { destination: null, blockedByCheck: true, blockedByFriendlyPiece: false, blockedByBishopColor: false };
            }
        } catch {
            // If simulation throws, fail safely to prevent moving into unknown check
            return { destination: null, blockedByCheck: true, blockedByFriendlyPiece: false, blockedByBishopColor: false };
        }
    }

    return { destination: { r: linked.r, c: linked.c }, blockedByCheck: false, blockedByFriendlyPiece: false, blockedByBishopColor: false };
};

export const resolvePortalDestination = (
    portals: Portal[],
    from: { r: number, c: number },
    to: { r: number, c: number },
    pieceType: string,
    pieceColor: 'w' | 'b',
    boardState: any // chess.js instance
): { r: number, c: number } | null => {
    return resolvePortalDestinationWithDetails(portals, from, to, pieceType, pieceColor, boardState).destination;
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
