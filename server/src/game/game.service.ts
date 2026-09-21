import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chess, Move } from 'chess.js';
import { PortalService, Portal } from './portal.service';
import { AntiCheatService } from './anti-cheat.service';
import { Game } from '../database/entities/game.entity';
import { Move as MoveEntity } from '../database/entities/move.entity';
import { GameState as GameStateEntity } from '../database/entities/game-state.entity';

export interface GameState {
    fen: string;
    turn: 'w' | 'b';
    portals: Portal[];
    history: any[];
    isGameOver: boolean;
    winner: 'white' | 'black' | 'draw' | null;
    gameOverReason?: 'checkmate' | 'stalemate' | 'timeout' | 'resignation' | 'draw' | 'mutual_agreement' | string;
    lastMove?: any;
    clocks: { white: number; black: number };
    royalLinkUsed?: { white: boolean; black: boolean };
}

@Injectable()
export class GameService {
    private games = new Map<string, {
        chess: Chess;
        portals: Portal[];
        clocks: { white: number; black: number };
        lastMoveTime: number;
        royalLinkUsed: { white: boolean; black: boolean };
        manualResult?: { isGameOver: boolean; winner: 'white' | 'black' | 'draw' };
        dbGameId?: number;
    }>();

    constructor(
        private portalService: PortalService,
        private antiCheatService: AntiCheatService,
        @InjectRepository(Game) private gameRepo: Repository<Game>,
        @InjectRepository(MoveEntity) private moveRepo: Repository<MoveEntity>,
        @InjectRepository(GameStateEntity) private gameStateRepo: Repository<GameStateEntity>,
    ) { }

    async createGame(roomId: string, whiteId?: string, blackId?: string): Promise<GameState> {
        const chess = new Chess();
        const portals = this.portalService.generatePortals();
        // Initialize clocks (e.g., 10 minutes = 600 seconds)
        const clocks = { white: 600, black: 600 };
        const royalLinkUsed = { white: false, black: false };

        let dbGameId: number | undefined = undefined;
        try {
            const game = this.gameRepo.create({
                white_user_id: whiteId ? parseInt(whiteId) : null,
                black_user_id: blackId ? parseInt(blackId) : null,
                fen_start: chess.fen(),
                status: 'ongoing',
                time_control: '10+0'
            } as any);
            const saved = await this.gameRepo.save(game);
            dbGameId = (saved as any)?.id;
        } catch (e) {
            // Gracefully proceed if DB is not actively connected in dev mode
        }

        this.games.set(roomId, { chess, portals, clocks, lastMoveTime: Date.now(), royalLinkUsed, dbGameId });

        return this.getGameState(roomId)!;
    }

    getGameState(roomId: string): GameState | null {
        const game = this.games.get(roomId);
        if (!game) return null;

        // Calculate current time based on elapsed time since last move
        // Only if game is active
        let currentClocks = { ...game.clocks };
        let isTimedOut = false;
        let timeoutWinner: 'white' | 'black' | null = null;

        if (!game.chess.isGameOver() && game.chess.history().length > 0) {
            const elapsed = (Date.now() - game.lastMoveTime) / 1000;
            if (game.chess.turn() === 'w') {
                currentClocks.white = Math.max(0, game.clocks.white - elapsed);
                if (currentClocks.white === 0) {
                    isTimedOut = true;
                    timeoutWinner = 'black';
                }
            } else {
                currentClocks.black = Math.max(0, game.clocks.black - elapsed);
                if (currentClocks.black === 0) {
                    isTimedOut = true;
                    timeoutWinner = 'white';
                }
            }
        }
        if (isTimedOut && !game.manualResult && timeoutWinner) {
            game.manualResult = { isGameOver: true, winner: timeoutWinner };
            game.clocks = currentClocks;
        }

        const isGameOver = game.manualResult
            ? game.manualResult.isGameOver
            : (isTimedOut ? true : game.chess.isGameOver());

        const winner = game.manualResult
            ? game.manualResult.winner
            : (isTimedOut
                ? timeoutWinner
                : (game.chess.isCheckmate()
                    ? (game.chess.turn() === 'w' ? 'black' : 'white')
                    : game.chess.isDraw()
                        ? 'draw'
                        : null));

        let gameOverReason: string | undefined = undefined;
        if (isGameOver) {
            if (isTimedOut || (game.manualResult && (currentClocks.white === 0 || currentClocks.black === 0))) {
                gameOverReason = 'timeout';
            } else if (game.manualResult && game.manualResult.winner && game.manualResult.winner !== 'draw') {
                gameOverReason = 'resignation';
            } else if (game.manualResult && game.manualResult.winner === 'draw') {
                gameOverReason = 'mutual_agreement';
            } else if (game.chess.isCheckmate()) {
                gameOverReason = 'checkmate';
            } else if (typeof game.chess.isStalemate === 'function' ? game.chess.isStalemate() : (game.chess as any).in_stalemate?.()) {
                gameOverReason = 'stalemate';
            } else if (game.chess.isDraw()) {
                gameOverReason = 'draw';
            }
        }

        return {
            fen: game.chess.fen(),
            turn: game.chess.turn(),
            portals: game.portals,
            history: game.chess.history(),
            isGameOver,
            winner,
            gameOverReason,
            clocks: currentClocks,
            royalLinkUsed: game.royalLinkUsed,
        };
    }

    resignGame(roomId: string, resigningColor: 'white' | 'black'): GameState | null {
        const game = this.games.get(roomId);
        if (!game) return null;
        const winner = resigningColor === 'white' ? 'black' : 'white';
        game.manualResult = {
            isGameOver: true,
            winner,
        };
        if (game.dbGameId) {
            this.gameRepo.update(game.dbGameId, {
                status: 'completed',
                winner,
                fen_end: game.chess.fen(),
            } as any).catch(() => {});
        }
        return this.getGameState(roomId);
    }

    endGameWithDraw(roomId: string): GameState | null {
        const game = this.games.get(roomId);
        if (!game) return null;
        game.manualResult = {
            isGameOver: true,
            winner: 'draw',
        };
        if (game.dbGameId) {
            this.gameRepo.update(game.dbGameId, {
                status: 'completed',
                winner: 'draw',
                fen_end: game.chess.fen(),
            } as any).catch(() => {});
        }
        return this.getGameState(roomId);
    }

    async resetGameForRematch(roomId: string): Promise<GameState | null> {
        const game = this.games.get(roomId);
        if (!game) return null;

        const chess = new Chess();
        const portals = this.portalService.generatePortals();
        const clocks = { white: 600, black: 600 };
        const royalLinkUsed = { white: false, black: false };

        this.games.set(roomId, {
            chess,
            portals,
            clocks,
            lastMoveTime: Date.now(),
            royalLinkUsed,
            manualResult: undefined,
        });

        return this.getGameState(roomId);
    }

    async processMove(roomId: string, from: string, to: string, promotion: string = 'q', portalTargetId?: string, placedSquare?: string) {
        const game = this.games.get(roomId);
        if (!game) throw new Error('Game not found');

        const { chess, portals } = game;
        const now = Date.now();
        const elapsed = Math.floor((now - game.lastMoveTime) / 1000);

        // Update clocks
        if (chess.turn() === 'w') {
            game.clocks.white -= elapsed;
            if (game.clocks.white <= 0) {
                game.clocks.white = 0;
                game.manualResult = { isGameOver: true, winner: 'black' };
            }
        } else {
            game.clocks.black -= elapsed;
            if (game.clocks.black <= 0) {
                game.clocks.black = 0;
                game.manualResult = { isGameOver: true, winner: 'white' };
            }
        }
        game.lastMoveTime = now;

        // 1. Clone state for simulation
        const tempChess = new Chess(chess.fen());

        // 2. Try standard move
        let moveResult: Move;
        try {
            moveResult = tempChess.move({ from, to, promotion });
        } catch (e) {
            throw new Error('Illegal move');
        }

        let teleported = false;
        let finalDest = to;
        let promotedViaPortal = false;

        // 3. Check Portal Teleportation
        const fromSq = this.parseSquare(from);
        const toSq = this.parseSquare(to);

        const dest = this.portalService.resolvePortalDestination(
            portals,
            fromSq,
            toSq,
            moveResult.piece,
            moveResult.color,
            tempChess
        );

        if (dest) {
            const destSq = this.toSquare(dest.r, dest.c);
            tempChess.remove(to as any);
            const destPiece = tempChess.get(destSq as any);
            if (destPiece) {
                tempChess.remove(destSq as any);
            }

            let pieceType = moveResult.piece;
            if (pieceType === 'p') {
                if ((moveResult.color === 'w' && dest.r === 0) || (moveResult.color === 'b' && dest.r === 7)) {
                    pieceType = 'q';
                    promotedViaPortal = true;
                }
            }

            tempChess.put({ type: pieceType, color: moveResult.color }, destSq as any);
            teleported = true;
            finalDest = destSq;
        }

        // 4. Validate Legality
        const moverColor = moveResult.color;
        const fenParts = tempChess.fen().split(' ');
        fenParts[1] = moverColor;
        if (teleported) fenParts[3] = '-';

        const checkTestChess = new Chess(fenParts.join(' '));
        if (checkTestChess.isCheck()) {
            throw new Error('Illegal move: King in check after teleport');
        }

        // 5. Apply to real game
        game.chess.load(tempChess.fen());

        // 6. Royal Link: One-time move activated only when castling
        const moverKey = moveResult.color === 'w' ? 'white' : 'black';
        let royalLinkApplied = false;
        const isCastlingMove = moveResult.piece === 'k' && (moveResult.san === 'O-O' || moveResult.san === 'O-O-O');
        if (isCastlingMove && portalTargetId && !game.royalLinkUsed[moverKey]) {
            const newPortalId = `royal_${Date.now()}`;
            const target = portals.find(p => p.id === portalTargetId);
            if (target) {
                const royalColor = '#FFD700';
                const targetSq = placedSquare ? this.parseSquare(placedSquare) : fromSq;
                portals.push({
                    id: newPortalId,
                    r: targetSq.r,
                    c: targetSq.c,
                    linkedTo: target.id,
                    color: royalColor
                });
                target.fallbackLinkedTo = target.linkedTo;
                target.royalLinkedTo = newPortalId;
                target.linkedTo = newPortalId;
                target.color = royalColor;
                game.royalLinkUsed[moverKey] = true;
                royalLinkApplied = true;
            }
        }

        // 7. Persistence
        if (game.dbGameId) {
            try {
                const moveEntity = this.moveRepo.create({
                    game_id: game.dbGameId,
                    san: moveResult.san,
                    from,
                    to,
                    final_to: finalDest,
                    piece: moveResult.piece,
                    captured: moveResult.captured,
                    meta: { teleported, royalLinkUsed: royalLinkApplied }
                } as any);
                await this.moveRepo.save(moveEntity);

                const currentState = this.getGameState(roomId);
                if (currentState?.isGameOver) {
                    await this.gameRepo.update(game.dbGameId, {
                        status: 'completed',
                        winner: currentState.winner,
                        fen_end: tempChess.fen(),
                    } as any);
                }
            } catch (e) {
                // Gracefully log without interrupting realtime gameplay
            }
        }

        // 8. Anti-Cheat Check
        this.antiCheatService.checkMove(chess.fen(), moveResult.san);
        if (game.chess.isGameOver()) {
            this.antiCheatService.analyzeGame(roomId, game.chess.history());
        }

        const state = this.getGameState(roomId)!;
        const finalSan = (promotedViaPortal && !moveResult.san.includes('=')) ? `${moveResult.san}=Q` : moveResult.san;

        return {
            move: { from, to, promotion },
            san: finalSan,
            fen: state.fen,
            portals: state.portals,
            clocks: state.clocks,
            teleported,
            finalDest,
            royalLinkUsed: state.royalLinkUsed,
            isGameOver: state.isGameOver,
            winner: state.winner,
            reason: state.gameOverReason,
        };
    }

    private parseSquare(sq: string) {
        const file = sq.charCodeAt(0) - 97; // a=0
        const rank = 8 - parseInt(sq[1]); // 8=0, 1=7
        return { r: rank, c: file };
    }

    private toSquare(r: number, c: number) {
        const file = String.fromCharCode(c + 97);
        const rank = 8 - r;
        return `${file}${rank}`;
    }
}
