import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Game } from './game.entity';

@Entity()
export class Portal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    game_id: number;

    @ManyToOne(() => Game, (game) => game.portals)
    @JoinColumn({ name: 'game_id' })
    game: Game;

    @Column()
    from_square: string; // e.g. "d4"

    @Column("text", { array: true })
    to_squares: string[]; // e.g. ["h8"]

    @Column({ default: false })
    directional: boolean; // true = one-way, false = two-way

    @CreateDateColumn()
    created_at: Date;
}
