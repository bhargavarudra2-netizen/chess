import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { GameService } from './game.service';
import { Socket } from 'socket.io';

@Injectable()
export class MatchmakingService {
    private queue: { playerId: string; socketId: string; rating: number }[] = [];

    constructor(
        private readonly gameService: GameService,
    ) { }

    async addToQueue(client: Socket, playerId: string, rating: number) {
        // Check if anyone is waiting
        if (this.queue.length > 0) {
            const opponent = this.queue.shift();
            if (opponent) {
                // Match found!
                const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                // Create game
                await this.gameService.createGame(gameId, playerId, opponent.playerId);

                return {
                    gameId,
                    white: opponent.playerId,
                    black: playerId,
                    opponentSocketId: opponent.socketId
                };
            }
        }

        // No one waiting, add to queue
        this.queue.push({ playerId, socketId: client.id, rating });
        return null;
    }

    async removeFromQueue(socketId: string) {
        this.queue = this.queue.filter(p => p.socketId !== socketId);
    }
}
