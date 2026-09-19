import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis | null = null;

    onModuleInit() {
        const redisUrl = process.env.REDIS_URL;
        const redisHost = process.env.REDIS_HOST;

        if (redisUrl || redisHost) {
            try {
                this.client = redisUrl
                    ? new Redis(redisUrl, { lazyConnect: true, retryStrategy: () => null })
                    : new Redis({
                        host: redisHost || 'localhost',
                        port: parseInt(process.env.REDIS_PORT || '6379', 10),
                        lazyConnect: true,
                        retryStrategy: () => null,
                    });

                this.client.connect().catch(err => {
                    console.warn(`Redis connection failed (${err.message}). In-memory matchmaking active.`);
                });
            } catch (err) {
                console.warn('Redis initialization skipped. In-memory matchmaking active.');
            }
        } else {
            // In cloud or dev without Redis, matchmaking runs in-memory
            console.log('RedisService: Running in-memory (no REDIS_URL configured).');
        }
    }

    onModuleDestroy() {
        if (this.client) {
            this.client.quit().catch(() => {});
        }
    }

    getClient(): Redis | null {
        return this.client;
    }
}
