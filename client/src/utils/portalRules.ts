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

    // Determine destination candidates in priority order:
    // Priority 1: Royal Link (portal.royalLinkedTo)
    // Priority 2: Fallback / other connected square (portal.fallbackLinkedTo or portal.linkedTo)
    const candidateIds: string[] = [];
    if (portal.royalLinkedTo) {
        candidateIds.push(portal.royalLinkedTo);
        const fallback = portal.fallbackLinkedTo || (portal.linkedTo !== portal.royalLinkedTo ? portal.linkedTo : undefined);
        if (fallback && !candidateIds.includes(fallback)) {
            candidateIds.push(fallback);
        }
    } else if (portal.linkedTo) {
        candidateIds.push(portal.linkedTo);
        if (portal.fallbackLinkedTo && !candidateIds.includes(portal.fallbackLinkedTo)) {
            candidateIds.push(portal.fallbackLinkedTo);
        }
    }

    if (candidateIds.length === 0) {
        return { destination: null, blockedByCheck: false, blockedByFriendlyPiece: false, blockedByBishopColor: false };
    }

    const toSquare = (r: number, c: number) => {
        const file = String.fromCharCode(c + 97);
        const rank = 8 - r;
        return `${file}${rank}`;
    };

    let blockedByFriendlyPiece = false;
    let blockedByCheck = false;
    let blockedByBishopColor = false;

    for (const candId of candidateIds) {
        const linked = portals.find(p => p.id === candId);
        if (!linked) continue;

        // 1. Bishop Rule: Bishop cannot change square color
        if (pieceType === 'b') {
            if (!canBishopUsePortal(from, { r: linked.r, c: linked.c })) {
                blockedByBishopColor = true;
                continue; // Cannot use this portal due to square color, try next candidate
            }
        }

        // 2. Check destination occupancy
        const destSq = toSquare(linked.r, linked.c);
        const destPiece = boardState.get(destSq);

        if (destPiece && destPiece.color === pieceColor) {
            blockedByFriendlyPiece = true;
            // "if the royal link square is already occupied by the same color piece then the other portal will be opened and piece will teleport to the other connected square"
            continue; // Try fallback candidate!
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
                    blockedByCheck = true;
                    continue; // King would land in check, try fallback candidate!
                }
            } catch {
                blockedByCheck = true;
                continue;
            }
        }

        // Successfully found valid portal destination!
        return { destination: { r: linked.r, c: linked.c }, blockedByCheck: false, blockedByFriendlyPiece: false, blockedByBishopColor: false };
    }

    return { destination: null, blockedByCheck, blockedByFriendlyPiece, blockedByBishopColor };
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
