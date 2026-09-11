import { Chess } from 'chess.js';
import type { Portal } from '../types';
import { resolvePortalDestination } from './portalRules';

export type AiDifficulty = 'novice' | 'adept' | 'grandmaster';

const PIECE_VALUES: Record<string, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
};

// Positional bonuses encouraging pieces toward center and pawns advancing
const PAWN_PST = [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_PST = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
];

// Evaluate the board position from the perspective of the given color ('w' or 'b')
const evaluatePosition = (chess: Chess, portals: Portal[]): number => {
    if (chess.isCheckmate()) {
        return -99999;
    }
    if (chess.isDraw()) {
        return 0;
    }

    let score = 0;
    const board = chess.board();

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;

            const val = PIECE_VALUES[piece.type] || 0;
            let positional = 0;
            const index = r * 8 + c;

            if (piece.type === 'p') {
                positional = piece.color === 'w' ? PAWN_PST[index] : PAWN_PST[63 - index];
            } else if (piece.type === 'n') {
                positional = piece.color === 'w' ? KNIGHT_PST[index] : KNIGHT_PST[63 - index];
            }

            const total = val + positional;
            if (piece.color === 'w') {
                score += total;
            } else {
                score -= total;
            }
        }
    }

    // Portal proximity bonus: having pieces near portal entrances creates dynamic options
    portals.forEach(p => {
        const portalSq = `${String.fromCharCode(p.c + 97)}${8 - p.r}`;
        const pieceOnPortal = chess.get(portalSq as any);
        if (pieceOnPortal) {
            const bonus = 25;
            if (pieceOnPortal.color === 'w') score += bonus;
            else score -= bonus;
        }
    });

    return score;
};

// Simulate a move and any resulting portal teleportation on a cloned board
const simulateMoveWithPortals = (
    fen: string,
    move: { from: string; to: string; promotion?: string },
    portals: Portal[]
): { fen: string; teleported: boolean; destSq?: string } | null => {
    try {
        const testChess = new Chess(fen);
        const res = testChess.move(move);
        if (!res) return null;

        const toFile = move.to.charCodeAt(0) - 97;
        const toRank = 8 - parseInt(move.to[1], 10);
        const fromFile = move.from.charCodeAt(0) - 97;
        const fromRank = 8 - parseInt(move.from[1], 10);

        const teleportDest = resolvePortalDestination(
            portals,
            { r: fromRank, c: fromFile },
            { r: toRank, c: toFile },
            res.piece,
            res.color,
            testChess
        );

        if (teleportDest) {
            const destSq = `${String.fromCharCode(teleportDest.c + 97)}${8 - teleportDest.r}`;
            const piece = testChess.remove(move.to as any);
            if (piece) {
                let pieceType = piece.type;
                if (piece.type === 'p') {
                    if ((piece.color === 'w' && teleportDest.r === 0) || (piece.color === 'b' && teleportDest.r === 7)) {
                        pieceType = 'q';
                    }
                }
                const targetPiece = testChess.get(destSq as any);
                if (targetPiece) {
                    testChess.remove(destSq as any);
                }
                testChess.put({ type: pieceType, color: piece.color }, destSq as any);
            }
            return { fen: testChess.fen(), teleported: true, destSq };
        }

        return { fen: testChess.fen(), teleported: false };
    } catch {
        return null;
    }
};

// Minimax with Alpha-Beta Pruning
const minimax = (
    fen: string,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    portals: Portal[]
): number => {
    const chess = new Chess(fen);
    if (depth === 0 || chess.isGameOver()) {
        const evalScore = evaluatePosition(chess, portals);
        return evalScore;
    }

    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) {
        return evaluatePosition(chess, portals);
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const m of moves) {
            const sim = simulateMoveWithPortals(fen, { from: m.from, to: m.to, promotion: 'q' }, portals);
            if (!sim) continue;
            const evalVal = minimax(sim.fen, depth - 1, alpha, beta, false, portals);
            maxEval = Math.max(maxEval, evalVal);
            alpha = Math.max(alpha, evalVal);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const m of moves) {
            const sim = simulateMoveWithPortals(fen, { from: m.from, to: m.to, promotion: 'q' }, portals);
            if (!sim) continue;
            const evalVal = minimax(sim.fen, depth - 1, alpha, beta, true, portals);
            minEval = Math.min(minEval, evalVal);
            beta = Math.min(beta, evalVal);
            if (beta <= alpha) break;
        }
        return minEval;
    }
};

export const findBestMove = async (
    chess: Chess,
    portals: Portal[],
    difficulty: AiDifficulty
): Promise<{ from: string; to: string; promotion?: string } | null> => {
    // Artificial thinking delay for authentic feel
    const delay = difficulty === 'novice' ? 400 : difficulty === 'adept' ? 600 : 800;
    await new Promise(res => setTimeout(res, delay));

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    const isWhite = chess.turn() === 'w';

    // 1. Novice (~800 Elo): Plays semi-randomly with strong affinity for captures and portal fun
    if (difficulty === 'novice') {
        // Find moves that capture or step into portals
        const funMoves = legalMoves.filter(m => {
            if (m.captured) return true;
            const toFile = m.to.charCodeAt(0) - 97;
            const toRank = 8 - parseInt(m.to[1], 10);
            return portals.some(p => p.r === toRank && p.c === toFile);
        });

        if (funMoves.length > 0 && Math.random() < 0.7) {
            const pick = funMoves[Math.floor(Math.random() * funMoves.length)];
            return { from: pick.from, to: pick.to, promotion: 'q' };
        }
        const pick = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        return { from: pick.from, to: pick.to, promotion: 'q' };
    }

    // 2. Adept (~1400 Elo): 1 to 2 ply search with portal foresight
    // 3. Grandmaster (1800+ Elo): 2 to 3 ply search with alpha-beta pruning
    const searchDepth = difficulty === 'grandmaster' ? 2 : 1;

    let bestMove = legalMoves[0];
    let bestScore = isWhite ? -Infinity : Infinity;

    for (const move of legalMoves) {
        const sim = simulateMoveWithPortals(chess.fen(), { from: move.from, to: move.to, promotion: 'q' }, portals);
        if (!sim) continue;

        let score = minimax(sim.fen, searchDepth, -Infinity, Infinity, !isWhite, portals);

        // Add a slight bonus if portal teleportation successfully flanks the opponent
        if (sim.teleported) {
            score += isWhite ? 35 : -35;
        }

        if (isWhite) {
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        } else {
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }

    return { from: bestMove.from, to: bestMove.to, promotion: 'q' };
};
