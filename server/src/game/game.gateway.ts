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

        // Determine color based on room occupants
        const room = this.server.sockets.adapter.rooms.get(gameId);
        const clients = room ? Array.from(room) : [];
        let color = 'spectator';
        if (clients.length === 1) color = 'white';
        else if (clients.length === 2) color = 'black';

        client.emit('game_start', {
            gameId,
            color,
            initialState: state,
        });

        // If second player joined, notify existing player that game can begin
        if (clients.length === 2) {
            this.server.to(gameId).emit('player_joined', {
                gameId,
                color,
                totalPlayers: 2,
            });
        }
    }

    @SubscribeMessage('make_move')
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
        const room = this.server.sockets.adapter.rooms.get(payload.gameId);
        const clients = room ? Array.from(room) : [];
        const isFirstPlayer = clients[0] === client.id;
        const resigningColor = isFirstPlayer ? 'white' : 'black';
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
    async handleOfferDraw(
        @MessageBody() payload: { gameId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.to(payload.gameId).emit('draw_offered', { fromSocketId: client.id });
    }
}
