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
import { playCheckSound } from '../utils/soundEffects';

interface GameBoardProps {
    fen: string;
    orientation: 'white' | 'black';
    portals: Portal[];
    onMove: (from: string, to: string) => void;
    turn: 'white' | 'black';
    lastMove?: LastMoveDetails;
    onRequestRoyalLink?: (from: string, to: string, targetPortalId: string, placedSquare?: string) => void;
    onDeclineRoyalLink?: () => void;
    royalLinkUsed?: { white: boolean; black: boolean };
    warning?: string | null;
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
    warning,
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

    // Stable refs to prevent stale closures in Chessground event handlers
    const royalLinkUsedRef = useRef(royalLinkUsed);
    useEffect(() => { royalLinkUsedRef.current = royalLinkUsed; }, [royalLinkUsed]);

    const activeMovableColorRef = useRef(activeMovableColor);
    useEffect(() => { activeMovableColorRef.current = activeMovableColor; }, [activeMovableColor]);

    const portalsRef = useRef(portals);
    useEffect(() => { portalsRef.current = portals; }, [portals]);

    const onRequestRoyalLinkRef = useRef(onRequestRoyalLink);
    useEffect(() => { onRequestRoyalLinkRef.current = onRequestRoyalLink; }, [onRequestRoyalLink]);

    const onMoveRef = useRef(onMove);
    useEffect(() => { onMoveRef.current = onMove; }, [onMove]);

    const inCheck = chessRef.current
        ? (typeof chessRef.current.inCheck === 'function' ? chessRef.current.inCheck() : (typeof chessRef.current.isCheck === 'function' ? chessRef.current.isCheck() : false))
        : false;

    const prevInCheckRef = useRef(false);
    useEffect(() => {
        if (inCheck && !prevInCheckRef.current) {
            playCheckSound();
        }
        prevInCheckRef.current = inCheck;
    }, [inCheck]);

    const getCheckedKingCoords = () => {
        if (!inCheck || !chessRef.current) return null;
        const checkedColor = chessRef.current.turn();
        const board = chessRef.current.board();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p && p.type === 'k' && p.color === checkedColor) {
                    return { r, c };
                }
            }
        }
        return null;
    };
    const checkedKingCoord = getCheckedKingCoords();

    useEffect(() => {
        chessRef.current = new Chess(fen);
        if (api && chessRef.current) {
            const currentInCheck = typeof chessRef.current.inCheck === 'function' ? chessRef.current.inCheck() : (typeof chessRef.current.isCheck === 'function' ? chessRef.current.isCheck() : false);
            api.set({
                fen,
                orientation,
                turnColor: turn,
                check: currentInCheck,
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
                            // Royal Link: Strictly castling moves (O-O or O-O-O), NEVER standard king moves!
                            const moves = chessRef.current?.moves({ verbose: true }) || [];
                            const matchingMove = moves.find((m: any) => m.from === orig && m.to === dest);
                            const isCastling = Boolean(
                                matchingMove && (
                                    matchingMove.san?.startsWith('O-O') ||
                                    matchingMove.flags?.includes('k') ||
                                    matchingMove.flags?.includes('q')
                                )
                            );

                            const currentColor = activeMovableColorRef.current;
                            const hasUsedRoyalLink = royalLinkUsedRef.current ? royalLinkUsedRef.current[currentColor] : false;

                            if (isCastling && !hasUsedRoyalLink && onRequestRoyalLinkRef.current && portalsRef.current.length > 0) {
                                setPendingRoyalMove({ from: orig, to: dest });
                            } else {
                                onMoveRef.current(orig, dest);
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
    }, [boardRef, fen, orientation, api]);

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

            {/* King in Check Red Square Highlight */}
            {checkedKingCoord && (
                <div
                    className="king-check-highlight"
                    style={{
                        position: 'absolute',
                        top: `${(orientation === 'white' ? checkedKingCoord.r : 7 - checkedKingCoord.r) * 12.5}%`,
                        left: `${(orientation === 'white' ? checkedKingCoord.c : 7 - checkedKingCoord.c) * 12.5}%`,
                        width: '12.5%',
                        height: '12.5%',
                        pointerEvents: 'none',
                        zIndex: 15,
                        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.75) 0%, rgba(220, 38, 38, 0.4) 60%, rgba(185, 28, 28, 0.1) 100%)',
                        boxShadow: 'inset 0 0 14px rgba(239, 68, 68, 0.9), 0 0 16px rgba(239, 68, 68, 0.8)',
                        borderRadius: '4px',
                    }}
                />
            )}

            {/* Warning Banner (e.g. King cannot teleport into check) */}
            {warning && (
                <div
                    style={{
                        position: 'absolute',
                        top: '14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 50,
                        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.95), rgba(185, 28, 28, 0.95))',
                        border: '1px solid rgba(254, 202, 202, 0.6)',
                        boxShadow: '0 8px 25px rgba(220, 38, 38, 0.6), 0 0 15px rgba(239, 68, 68, 0.5)',
                        color: '#ffffff',
                        padding: '8px 20px',
                        borderRadius: '24px',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        animation: 'fadeIn 0.25s ease-out',
                    }}
                >
                    <span style={{ fontSize: '16px' }}>🛡️</span>
                    <span>{warning}</span>
                </div>
            )}

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
                    fen={fen}
                    orientation={orientation}
                    onConfirm={(targetPortalId, placedSquare) => {
                        onRequestRoyalLink?.(pendingRoyalMove.from, pendingRoyalMove.to, targetPortalId, placedSquare);
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
