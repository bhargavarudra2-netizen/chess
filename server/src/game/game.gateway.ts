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
// import { createAdapter } from '@socket.io/redis-adapter';
import { GameService } from './game.service';
import { RedisService } from './redis.service';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly gameService: GameService,
        // private readonly redisService: RedisService
    ) { }

    afterInit() {
        // In-memory adapter is default
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
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

        // Determine color (simple logic for now)
        const room = this.server.sockets.adapter.rooms.get(gameId);
        const clients = room ? Array.from(room) : [];
        let color = 'spectator';
        if (clients.length === 1) color = 'white';
        else if (clients.length === 2) color = 'black';

        client.emit('game_start', {
            gameId,
            color,
            initialState: state
        });
    }

    @SubscribeMessage('make_move')
    async handleMakeMove(
        @MessageBody() payload: { gameId: string; from: string; to: string; promotion?: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const result = await this.gameService.processMove(payload.gameId, payload.from, payload.to, payload.promotion);

            // Send result to mover
            client.emit('move_result', { ok: true, ...result });

            // Broadcast to opponent (exclude mover? or just broadcast to room and mover ignores?)
            // Protocol says: "broadcast opponent_move to other player(s)"
            client.to(payload.gameId).emit('opponent_move', result);

        } catch (e) {
            client.emit('move_result', { ok: false, error: e.message });
        }
    }

    @SubscribeMessage('request_royal_link')
    async handleRoyalLink(
        @MessageBody() payload: { gameId: string; from: string; to: string; linkPortalId: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const result = await this.gameService.processMove(payload.gameId, payload.from, payload.to, 'q', payload.linkPortalId);
            client.emit('move_result', { ok: true, ...result });
            client.to(payload.gameId).emit('opponent_move', result);
        } catch (e) {
            client.emit('move_result', { ok: false, error: e.message });
        }
    }
}
