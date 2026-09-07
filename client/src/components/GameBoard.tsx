import React, { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Config } from 'chessground/config';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import type { Portal, LastMoveDetails } from '../types';
import PortalOverlay from './PortalOverlay';
import RoyalLinkModal from './RoyalLinkModal';

interface GameBoardProps {
    fen: string;
    orientation: 'white' | 'black';
    portals: Portal[];
    onMove: (from: string, to: string) => void;
    turn: 'white' | 'black';
    lastMove?: LastMoveDetails;
    onRequestRoyalLink?: (from: string, to: string, targetPortalId: string) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
    fen,
    orientation,
    portals,
    onMove,
    turn,
    lastMove,
    onRequestRoyalLink,
}) => {
    const boardRef = useRef<HTMLDivElement>(null);
    const [api, setApi] = useState<Api | null>(null);
    const chessRef = useRef<any>(null);
    const [pendingRoyalMove, setPendingRoyalMove] = useState<{ from: string; to: string } | null>(null);

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
                            const piece = chessRef.current?.get(orig);
                            const isKing = piece && piece.type === 'k';
                            const moveCount = chessRef.current?.history().length || 0;
                            const isBeforeMove15 = Math.floor(moveCount / 2) < 15;

                            if (isKing && isBeforeMove15 && onRequestRoyalLink && portals.length > 0) {
                                setPendingRoyalMove({ from: orig, to: dest });
                            } else {
                                onMove(orig, dest);
                            }
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
    }, [boardRef, fen, orientation, onMove, api, onRequestRoyalLink, portals.length]);

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
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
        >
            <div ref={boardRef} style={{ width: '100%', height: '100%' }} />
            <PortalOverlay portals={portals} orientation={orientation} lastMove={lastMove} />

            {/* Royal Link Activation Dialog */}
            {pendingRoyalMove && (
                <RoyalLinkModal
                    fromSquare={pendingRoyalMove.from}
                    toSquare={pendingRoyalMove.to}
                    portals={portals}
                    onConfirm={targetPortalId => {
                        onRequestRoyalLink?.(pendingRoyalMove.from, pendingRoyalMove.to, targetPortalId);
                        setPendingRoyalMove(null);
                    }}
                    onSkip={() => {
                        onMove(pendingRoyalMove.from, pendingRoyalMove.to);
                        setPendingRoyalMove(null);
                    }}
                />
            )}
        </div>
    );
};

export default GameBoard;
