import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { MatchmakingService } from './matchmaking.service';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private roomPlayers = new Map<string, { white?: string; black?: string }>();

    constructor(
        private readonly gameService: GameService,
        private readonly matchmakingService: MatchmakingService,
    ) { }

    afterInit() {
        // Gateway initialized
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.matchmakingService.removeFromQueue(client.id);

        for (const [roomId, players] of this.roomPlayers.entries()) {
            if (players.white === client.id || players.black === client.id) {
                const state = this.gameService.getGameState(roomId);
                if (state && !state.isGameOver) {
                    const disconnectedColor = players.white === client.id ? 'white' : 'black';
                    client.to(roomId).emit('opponent_disconnected', {
                        socketId: client.id,
                        color: disconnectedColor,
                    });
                }
            }
        }
    }

    @SubscribeMessage('join_queue')
    async handleJoinQueue(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { playerId?: string; rating?: number } = {},
    ) {
        const playerId = payload.playerId || `guest_${client.id.slice(0, 5)}`;
        const match = await this.matchmakingService.addToQueue(client, playerId, payload.rating || 1200);

        if (match) {
            const opponentSocket = this.server.sockets.sockets.get(match.opponentSocketId);
            const state = this.gameService.getGameState(match.gameId);

            this.roomPlayers.set(match.gameId, { white: match.opponentSocketId, black: client.id });

            client.join(match.gameId);
            if (opponentSocket) {
                opponentSocket.join(match.gameId);
                opponentSocket.emit('match_found', {
                    gameId: match.gameId,
                    color: 'white',
                    opponent: playerId,
                    initialState: state,
                });
            }

            client.emit('match_found', {
                gameId: match.gameId,
                color: 'black',
                opponent: match.white,
                initialState: state,
            });
        } else {
            client.emit('queue_joined', { ok: true, message: 'Searching for opponent...' });
        }
    }

    @SubscribeMessage('leave_queue')
    async handleLeaveQueue(@ConnectedSocket() client: Socket) {
        await this.matchmakingService.removeFromQueue(client.id);
        client.emit('queue_left', { ok: true });
    }

    @SubscribeMessage('create_private_room')
    async handleCreatePrivateRoom(@ConnectedSocket() client: Socket) {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const state = await this.gameService.createGame(roomId);
        this.roomPlayers.set(roomId, { white: client.id });
        client.join(roomId);
        client.emit('room_created', {
            gameId: roomId,
            color: 'white',
            initialState: state,
        });
    }

    @SubscribeMessage('join_room')
    async handleJoinRoom(
        @MessageBody() payload: { gameId: string; token?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { gameId } = payload;
        client.join(gameId);

        // Load or create game
        let state = await this.gameService.getGameState(gameId);
        if (!state) {
            state = await this.gameService.createGame(gameId);
        }

        let players = this.roomPlayers.get(gameId);
        if (!players) {
            players = { white: client.id };
            this.roomPlayers.set(gameId, players);
        } else if (!players.black && players.white !== client.id) {
            players.black = client.id;
        }

        const color = players.white === client.id ? 'white' : (players.black === client.id ? 'black' : 'spectator');

        client.emit('game_start', {
            gameId,
            color,
            initialState: state,
        });

        // Notify existing players in room
        const room = this.server.sockets.adapter.rooms.get(gameId);
        const clients = room ? Array.from(room) : [];
        if (clients.length >= 2) {
            this.server.to(gameId).emit('player_joined', {
                gameId,
                color,
                totalPlayers: clients.length,
            });
        }
    }

    @SubscribeMessage('make_move')
    @SubscribeMessage('move')
    async handleMakeMove(
        @MessageBody() payload: { gameId: string; from: string; to: string; promotion?: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const result = await this.gameService.processMove(payload.gameId, payload.from, payload.to, payload.promotion);
            client.emit('move_result', { ok: true, ...result });
            client.to(payload.gameId).emit('opponent_move', result);
        } catch (e) {
            client.emit('move_result', { ok: false, error: e.message });
        }
    }

    @SubscribeMessage('request_royal_link')
    async handleRoyalLink(
        @MessageBody() payload: { gameId: string; from: string; to: string; linkPortalId: string; placedSquare?: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const result = await this.gameService.processMove(
                payload.gameId,
                payload.from,
                payload.to,
                'q',
                payload.linkPortalId,
                payload.placedSquare,
            );
            client.emit('move_result', { ok: true, ...result });
            client.to(payload.gameId).emit('opponent_move', result);
        } catch (e) {
            client.emit('move_result', { ok: false, error: e.message });
        }
    }

    @SubscribeMessage('resign')
    async handleResign(
        @MessageBody() payload: { gameId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const players = this.roomPlayers.get(payload.gameId);
        const resigningColor = (players?.black === client.id) ? 'black' : 'white';
        const winner = resigningColor === 'white' ? 'black' : 'white';
        const newState = this.gameService.resignGame(payload.gameId, resigningColor);

        this.server.to(payload.gameId).emit('game_over', {
            reason: 'resignation',
            resignedColor: resigningColor,
            winner,
            newState,
        });
    }

    @SubscribeMessage('offer_draw')
    @SubscribeMessage('request_draw')
    async handleOfferDraw(
        @MessageBody() payload: { gameId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.to(payload.gameId).emit('draw_offered', { fromSocketId: client.id });
    }

    @SubscribeMessage('respond_draw')
    async handleRespondDraw(
        @MessageBody() payload: { gameId: string; accepted: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        if (payload.accepted) {
            const newState = this.gameService.endGameWithDraw(payload.gameId);
            this.server.to(payload.gameId).emit('game_over', {
                reason: 'mutual_agreement',
                winner: 'draw',
                newState,
            });
        } else {
            client.to(payload.gameId).emit('draw_declined');
        }
    }

    @SubscribeMessage('request_rematch')
    async handleRequestRematch(
        @MessageBody() payload: { gameId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.to(payload.gameId).emit('rematch_offered', { fromSocketId: client.id });
    }

    @SubscribeMessage('respond_rematch')
    async handleRespondRematch(
        @MessageBody() payload: { gameId: string; accepted: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        if (payload.accepted) {
            const players = this.roomPlayers.get(payload.gameId);
            if (players) {
                // Swap colors for rematch
                const prevWhite = players.white;
                players.white = players.black;
                players.black = prevWhite;
            }
            const newState = await this.gameService.resetGameForRematch(payload.gameId);
            const p = this.roomPlayers.get(payload.gameId);
            if (p?.white) {
                this.server.to(p.white).emit('game_start', { gameId: payload.gameId, color: 'white', initialState: newState });
            }
            if (p?.black) {
                this.server.to(p.black).emit('game_start', { gameId: payload.gameId, color: 'black', initialState: newState });
            }
        } else {
            client.to(payload.gameId).emit('rematch_declined');
        }
    }
}
