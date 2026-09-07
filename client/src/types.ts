export interface Portal {
    id: string;
    r: number;
    c: number;
    linkedTo: string;
    color?: string;
}

export interface GameState {
    fen: string;
    turn: 'w' | 'b';
    portals: Portal[];
    history: any[];
    isGameOver: boolean;
    winner: 'white' | 'black' | 'draw' | null;
    lastMove?: any;
}
