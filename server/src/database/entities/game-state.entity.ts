import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class GameState {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    game_id: number;

    @Column()
    fen: string;

    @Column({ type: 'simple-json', nullable: true })
    portals: any; // Snapshot of portals at this state

    @Column()
    move_number: number;

    @Column({ type: 'simple-json', nullable: true })
    clocks: any; // { white: 300, black: 295 }

    @CreateDateColumn()
    created_at: Date;
}
