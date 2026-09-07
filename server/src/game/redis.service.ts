import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    onModuleInit() {
        this.client = new Redis({
            host: 'localhost',
            port: 6379,
        });
    }

    onModuleDestroy() {
        this.client.quit();
    }

    getClient(): Redis {
        return this.client;
    }
}
