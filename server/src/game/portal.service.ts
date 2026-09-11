import { Injectable } from '@nestjs/common';
import { Chess } from 'chess.js';

export interface Portal {
    id: string;
    r: number;
    c: number;
    linkedTo: string;
    royalLinkedTo?: string;
    fallbackLinkedTo?: string;
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
        const targetId = portal.royalLinkedTo || portal.linkedTo;
        return portals.find(p => p.id === targetId);
    }

    canBishopUsePortal(from: { r: number, c: number }, to: { r: number, c: number }): boolean {
        const fromColor = (from.r + from.c) % 2;
        const toColor = (to.r + to.c) % 2;
        return fromColor === toColor;
    }

    /**
     * Determines the final destination of a piece moving to a square.
     * Handles: Royal Link priority, Bishop rule, blocking by same color, fallback portal, King check safety.
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

        // Build candidates with Royal Link prioritized first, then fallback, then normal linkedTo
        const candidateIds: string[] = [];
        if (portal.royalLinkedTo) {
            candidateIds.push(portal.royalLinkedTo);
        }
        if (portal.fallbackLinkedTo && !candidateIds.includes(portal.fallbackLinkedTo)) {
            candidateIds.push(portal.fallbackLinkedTo);
        }
        if (portal.linkedTo && !candidateIds.includes(portal.linkedTo)) {
            candidateIds.push(portal.linkedTo);
        }

        for (const candidateId of candidateIds) {
            const linked = portals.find(p => p.id === candidateId);
            if (!linked) continue;

            // 1. Bishop Rule
            if (pieceType === 'b') {
                if (!this.canBishopUsePortal(from, { r: linked.r, c: linked.c })) continue;
            }

            // 2. Check destination occupancy by same color
            const destSq = this.toSquare(linked.r, linked.c);
            const destPiece = boardState.get(destSq);
            if (destPiece && destPiece.color === pieceColor) {
                // Royal Link square occupied by same color piece -> continue loop to fallback portal!
                continue;
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
                        continue;
                    }
                } catch {
                    continue;
                }
            }

            // Teleportation successful
            return { r: linked.r, c: linked.c };
        }

        return null;
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
