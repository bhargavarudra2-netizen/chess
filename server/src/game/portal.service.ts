import { Injectable } from '@nestjs/common';
import { Chess } from 'chess.js';

export interface Portal {
    id: string;
    r: number;
    c: number;
    linkedTo: string;
    color?: string; // For UI visualization
}

@Injectable()
export class PortalService {
    generatePortals(): Portal[] {
        const portals: Portal[] = [];
        const numPairs = Math.floor(Math.random() * 3) + 2; // 2 to 4 pairs
        const used = new Set<string>();

        const key = (r: number, c: number) => `${r},${c}`;
        const randSq = () => ({ r: Math.floor(Math.random() * 8), c: Math.floor(Math.random() * 8) });

        for (let i = 0; i < numPairs; i++) {
            let p1, p2;
            // Avoid ranks 0,1,6,7 to not spawn on pieces initially
            do {
                p1 = randSq();
            } while (used.has(key(p1.r, p1.c)) || p1.r < 2 || p1.r > 5);
            used.add(key(p1.r, p1.c));

            do {
                p2 = randSq();
            } while (used.has(key(p2.r, p2.c)) || p2.r < 2 || p2.r > 5);
            used.add(key(p2.r, p2.c));

            const id1 = `p${i}_a`;
            const id2 = `p${i}_b`;
            const color = this.getRandomColor();

            portals.push({ ...p1, id: id1, linkedTo: id2, color });
            portals.push({ ...p2, id: id2, linkedTo: id1, color });
        }

        return portals;
    }

    getPortalAt(portals: Portal[], r: number, c: number): Portal | undefined {
        return portals.find(p => p.r === r && p.c === c);
    }

    getLinkedPortal(portals: Portal[], portal: Portal): Portal | undefined {
        return portals.find(p => p.id === portal.linkedTo);
    }

    canBishopUsePortal(from: { r: number, c: number }, to: { r: number, c: number }): boolean {
        const fromColor = (from.r + from.c) % 2;
        const toColor = (to.r + to.c) % 2;
        return fromColor === toColor;
    }

    /**
     * Determines the final destination of a piece moving to a square.
     * Handles: Bishop rule, blocking by same color.
     * Returns the portal target square if teleport happens, or null if no teleport (stays at 'to').
     */
    resolvePortalDestination(
        portals: Portal[],
        from: { r: number, c: number },
        to: { r: number, c: number },
        pieceType: string,
        pieceColor: 'w' | 'b',
        boardState: any // Chess instance or board array to check occupancy
    ): { r: number, c: number } | null {

        const portal = this.getPortalAt(portals, to.r, to.c);
        if (!portal) return null;

        const linked = this.getLinkedPortal(portals, portal);
        if (!linked) return null; // One-way or broken link?

        // 1. Bishop Rule
        if (pieceType === 'b') {
            if (!this.canBishopUsePortal(from, { r: linked.r, c: linked.c })) return null; // Cannot enter
        }

        // 2. Check destination occupancy
        // We need to know if the destination is occupied by a friend.
        // boardState is expected to be the Chess instance *after* the move to 'to' has effectively happened?
        // No, usually we check occupancy *before* we put the piece there?
        // But in this flow, the piece is at 'to' (the portal entrance).
        // We need to check 'linked' square.

        // Helper to get piece at r,c from chess.js instance
        const destSq = this.toSquare(linked.r, linked.c);
        const destPiece = boardState.get(destSq);

        if (destPiece && destPiece.color === pieceColor) {
            return null; // Blocked by friend, stay at entrance
        }

        // 3. King Check Rule: King must NOT be teleported into check via any portal!
        if (pieceType === 'k') {
            try {
                const toSqName = this.toSquare(to.r, to.c);
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
                    return null; // Teleport blocked: King safely remains at portal entrance square
                }
            } catch {
                return null;
            }
        }

        // Allowed (Empty or Enemy)
        return { r: linked.r, c: linked.c };
    }

    private getRandomColor(): string {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#FFA500'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    private toSquare(r: number, c: number) {
        const file = String.fromCharCode(c + 97);
        const rank = 8 - r;
        return `${file}${rank}`;
    }
}
