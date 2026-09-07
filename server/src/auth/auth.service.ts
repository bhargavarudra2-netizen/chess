import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Game } from '../database/entities/game.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Game) private gameRepo: Repository<Game>,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userRepo.findOne({ where: { username } });
        if (user && await bcrypt.compare(pass, user.password_hash)) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                rating: user.rating || 1200,
            }
        };
    }

    async register(username: string, pass: string, email: string) {
        const existing = await this.userRepo.findOne({
            where: [{ username }, { email }]
        });
        if (existing) {
            throw new BadRequestException('Username or email already exists');
        }

        const hash = await bcrypt.hash(pass, 10);
        const user = this.userRepo.create({
            username,
            password_hash: hash,
            email,
            rating: 1200,
        });
        await this.userRepo.save(user);
        return this.login(user);
    }

    async findUserById(id: number) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) return null;
        const { password_hash, ...rest } = user;
        return rest;
    }

    async getUserHistory(userId: number) {
        return this.gameRepo.find({
            where: [{ white_user_id: userId }, { black_user_id: userId }],
            order: { created_at: 'DESC' },
            take: 20,
        });
    }
}
