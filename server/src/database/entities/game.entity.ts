import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Move } from './move.entity';
import { Portal } from './portal.entity';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    white_user_id: number;

    @ManyToOne(() => User, (user) => user.games_as_white, { nullable: true })
    @JoinColumn({ name: 'white_user_id' })
    white_user: User;

    @Column({ nullable: true })
    black_user_id: number;

    @ManyToOne(() => User, (user) => user.games_as_black, { nullable: true })
    @JoinColumn({ name: 'black_user_id' })
    black_user: User;

    @Column()
    fen_start: string;

    @Column({ default: 'ongoing' }) // ongoing, completed, aborted
    status: string;

    @Column({ nullable: true }) // 1-0, 0-1, 1/2-1/2
    result: string;

    @Column({ nullable: true })
    time_control: string; // e.g. "10+0"

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'datetime', nullable: true })
    last_move_at: Date;

    @OneToMany(() => Move, (move) => move.game)
    moves: Move[];

    @OneToMany(() => Portal, (portal) => portal.game)
    portals: Portal[];
}
