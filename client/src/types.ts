export interface Portal {
    id: string;
    r: number;
    c: number;
    linkedTo: string;
    color?: string;
}

export interface LastMoveDetails {
    from: string;
    to: string;
    san?: string;
    teleported?: boolean;
    finalDest?: { r: number; c: number };
}

export interface GameState {
    fen: string;
    turn: 'w' | 'b';
    portals: Portal[];
    history: string[];
    isGameOver: boolean;
    winner: 'white' | 'black' | 'draw' | null;
    lastMove?: LastMoveDetails;
    clocks?: { white: number; black: number };
    royalLinkUsed?: { white: boolean; black: boolean };
}
