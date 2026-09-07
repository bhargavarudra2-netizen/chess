import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Game } from './game.entity';

@Entity()
export class Move {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    game_id: number;

    @ManyToOne(() => Game, (game) => game.moves)
    @JoinColumn({ name: 'game_id' })
    game: Game;

    @Column()
    san: string; // Standard Algebraic Notation

    @Column()
    from: string; // e.g. "e2"

    @Column()
    to: string; // e.g. "e4"

    @Column({ nullable: true })
    final_to: string; // if teleported, the actual landing square

    @Column()
    piece: string; // p, n, b, r, q, k

    @Column({ nullable: true })
    captured: string; // p, n, b, r, q

    @CreateDateColumn()
    timestamp: Date;

    @Column({ type: 'jsonb', nullable: true })
    meta: any; // { portalUsed: boolean, portalId: string, royalLinkUsed: boolean }
}
