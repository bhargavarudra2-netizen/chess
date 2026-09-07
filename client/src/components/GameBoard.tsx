import React, { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Config } from 'chessground/config';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import type { Portal, LastMoveDetails } from '../types';
import PortalOverlay from './PortalOverlay';

interface GameBoardProps {
    fen: string;
    orientation: 'white' | 'black';
    portals: Portal[];
    onMove: (from: string, to: string) => void;
    turn: 'white' | 'black';
    lastMove?: LastMoveDetails;
}

const GameBoard: React.FC<GameBoardProps> = ({
    fen,
    orientation,
    portals,
    onMove,
    turn,
    lastMove,
}) => {
    const boardRef = useRef<HTMLDivElement>(null);
    const [api, setApi] = useState<Api | null>(null);
    const chessRef = useRef<any>(null);

    useEffect(() => {
        if (window.Chess) {
            chessRef.current = new window.Chess(fen);
        }
        if (api && chessRef.current) {
            api.set({
                fen,
                turnColor: turn,
                movable: {
                    color: orientation,
                    dests: getDests(chessRef.current, orientation),
                },
            });
        }
    }, [fen, turn, orientation, api]);

    useEffect(() => {
        if (boardRef.current && !api && window.Chess) {
            const chess = new window.Chess(fen);
            const config: Config = {
                fen,
                orientation,
                movable: {
                    color: orientation,
                    free: false,
                    dests: getDests(chess, orientation),
                    events: {
                        after: (orig, dest) => {
                            onMove(orig, dest);
                        },
                    },
                },
                draggable: {
                    showGhost: true,
                },
                highlight: {
                    lastMove: true,
                    check: true,
                },
            };
            const newApi = Chessground(boardRef.current, config);
            setApi(newApi);
        }
    }, [boardRef, fen, orientation, onMove, api]);

    // Helper to get valid destinations from chess.js
    const getDests = (chess: any, color: 'white' | 'black') => {
        const dests = new Map();
        if (!chess || chess.turn() !== color[0]) return dests;

        chess.moves({ verbose: true }).forEach((m: any) => {
            if (!dests.has(m.from)) dests.set(m.from, []);
            dests.get(m.from).push(m.to);
        });
        return dests;
    };

    return (
        <div
            className="game-board-container"
            style={{
                position: 'relative',
                width: '600px',
                height: '600px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
            }}
        >
            <div ref={boardRef} style={{ width: '100%', height: '100%' }} />
            <PortalOverlay portals={portals} orientation={orientation} lastMove={lastMove} />
        </div>
    );
};

export default GameBoard;
