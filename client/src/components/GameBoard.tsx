import React, { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
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
    onDeclineRoyalLink?: () => void;
    royalLinkUsed?: { white: boolean; black: boolean };
    isPractice?: boolean;
    isAiThinking?: boolean;
    mode?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({
    fen,
    orientation,
    portals,
    onMove,
    turn,
    lastMove,
    onRequestRoyalLink,
    onDeclineRoyalLink,
    royalLinkUsed,
    isPractice,
    isAiThinking,
    mode,
}) => {
    const boardRef = useRef<HTMLDivElement>(null);
    const [api, setApi] = useState<Api | null>(null);
    const chessRef = useRef<any>(null);
    const [pendingRoyalMove, setPendingRoyalMove] = useState<{ from: string; to: string } | null>(null);

    const isMultiMovable = isPractice || mode === 'pass_and_play';
    const activeMovableColor = isMultiMovable ? turn : orientation;

    useEffect(() => {
        chessRef.current = new Chess(fen);
        if (api && chessRef.current) {
            api.set({
                fen,
                orientation,
                turnColor: turn,
                movable: {
                    color: isAiThinking ? undefined : activeMovableColor,
                    dests: isAiThinking ? new Map() : getDests(chessRef.current, activeMovableColor),
                },
            });
        }
    }, [fen, turn, orientation, api, activeMovableColor, isAiThinking]);

    useEffect(() => {
        if (boardRef.current && !api) {
            const chess = new Chess(fen);
            const config: Config = {
                fen,
                orientation,
                movable: {
                    color: activeMovableColor,
                    free: false,
                    dests: getDests(chess, activeMovableColor),
                    events: {
                        after: (orig, dest) => {
                            const piece = chessRef.current?.get(orig);
                            const isKing = piece && piece.type === 'k';
                            const moveCount = chessRef.current?.history().length || 0;
                            const isBeforeMove15 = Math.floor(moveCount / 2) < 15;

                            // Castling moves (King moving 2 squares) must not trigger Royal Link
                            const isCastling = isKing && (
                                (orig === 'e1' && (dest === 'g1' || dest === 'c1')) ||
                                (orig === 'e8' && (dest === 'g8' || dest === 'c8'))
                            );

                            const currentColor = activeMovableColor;
                            const hasUsedRoyalLink = royalLinkUsed ? royalLinkUsed[currentColor] : false;

                            if (isKing && !isCastling && isBeforeMove15 && onRequestRoyalLink && portals.length > 0 && !hasUsedRoyalLink) {
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

            {/* AI Thinking Indicator */}
            {isAiThinking && (
                <div
                    style={{
                        position: 'absolute',
                        top: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 40,
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(6, 182, 212, 0.6)',
                        boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
                        color: '#38bdf8',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        pointerEvents: 'none',
                    }}
                >
                    <span style={{ display: 'inline-block', animation: 'spin 2s linear infinite' }}>⚙️</span>
                    <span>Quantum AI calculating...</span>
                </div>
            )}

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
                    onSkip={(dontAskAgain) => {
                        if (dontAskAgain) {
                            onDeclineRoyalLink?.();
                        }
                        onMove(pendingRoyalMove.from, pendingRoyalMove.to);
                        setPendingRoyalMove(null);
                    }}
                />
            )}
        </div>
    );
};

export default GameBoard;
