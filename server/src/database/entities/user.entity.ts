import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Game } from './game.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password_hash: string;

    @Column({ default: 1200 })
    rating: number;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => Game, (game) => game.white_user)
    games_as_white: Game[];

    @OneToMany(() => Game, (game) => game.black_user)
    games_as_black: Game[];
}
