import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { PortalService } from './portal.service';
import { GameGateway } from './game.gateway';
import { RedisService } from './redis.service';
import { MatchmakingService } from './matchmaking.service';
import { AntiCheatService } from './anti-cheat.service';
import { Game } from '../database/entities/game.entity';
import { Move } from '../database/entities/move.entity';
import { GameState } from '../database/entities/game-state.entity';
import { Portal } from '../database/entities/portal.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Game, Move, GameState, Portal]),
    ],
    providers: [
        GameService,
        PortalService,
        GameGateway,
        // RedisService,
        MatchmakingService,
        AntiCheatService
    ],
    exports: [GameService],
})
export class GameModule { }
