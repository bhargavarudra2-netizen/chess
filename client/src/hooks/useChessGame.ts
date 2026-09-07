import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState, LastMoveDetails } from '../types';
import {
    playMoveSound,
    playCaptureSound,
    playTeleportSound,
    playCheckSound,
    playGameOverSound,
} from '../utils/soundEffects';

interface MoveResponsePayload {
    ok?: boolean;
    error?: string;
    fen?: string;
    portals?: any[];
    san?: string;
    clocks?: { white: number; black: number };
    teleported?: boolean;
    finalDest?: { r: number; c: number };
    move?: { from: string; to: string; promotion?: string };
}

export const useChessGame = (roomId: string) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'spectator'>('white');
    const [clocks, setClocks] = useState<{ white: number; black: number }>({ white: 600, black: 600 });
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // Apply move updates and sound effects
    const handleMoveUpdate = useCallback((data: MoveResponsePayload) => {
        if (!data) return;

        // Play appropriate sound
        if (data.teleported) {
            playTeleportSound();
        } else if (data.san && data.san.includes('x')) {
            playCaptureSound();
        } else {
            playMoveSound();
        }

        if (data.san && (data.san.includes('+') || data.san.includes('#'))) {
            setTimeout(playCheckSound, 120);
        }

        if (data.clocks) {
            setClocks(data.clocks);
        }

        setGameState(prev => {
            if (!prev) return null;
            const newTurn = prev.turn === 'w' ? 'b' : 'w';
            const lastMove: LastMoveDetails = {
                from: data.move?.from || '',
                to: data.move?.to || '',
                san: data.san,
                teleported: data.teleported,
                finalDest: data.finalDest,
            };

            const updatedHistory = data.san ? [...prev.history, data.san] : prev.history;

            return {
                ...prev,
                fen: data.fen || prev.fen,
                turn: newTurn,
                portals: data.portals || prev.portals,
                history: updatedHistory,
                lastMove,
            };
        });
    }, []);

    useEffect(() => {
        const socket = io('http://localhost:3000');
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join_room', { gameId: roomId });
        });

        socket.on('game_start', (data: { gameId: string; color: 'white' | 'black' | 'spectator'; initialState: GameState }) => {
            setPlayerColor(data.color);
            setGameState(data.initialState);
            if (data.initialState.clocks) {
                setClocks(data.initialState.clocks);
            }
        });

        socket.on('move_result', (data: MoveResponsePayload) => {
            if (data.ok === false) {
                setError(data.error || 'Invalid move');
            } else {
                setError(null);
                handleMoveUpdate(data);
            }
        });

        socket.on('opponent_move', (data: MoveResponsePayload) => {
            handleMoveUpdate(data);
        });

        return () => {
            socket.disconnect();
        };
    }, [roomId, handleMoveUpdate]);

    // Active clock ticking countdown
    useEffect(() => {
        if (!gameState || gameState.isGameOver || gameState.history.length === 0) return;

        const interval = setInterval(() => {
            setClocks(prev => {
                const turn = gameState.turn;
                if (turn === 'w') {
                    const nextWhite = Math.max(0, prev.white - 1);
                    if (nextWhite === 0 && !gameState.isGameOver) {
                        playGameOverSound();
                    }
                    return { ...prev, white: nextWhite };
                } else {
                    const nextBlack = Math.max(0, prev.black - 1);
                    if (nextBlack === 0 && !gameState.isGameOver) {
                        playGameOverSound();
                    }
                    return { ...prev, black: nextBlack };
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState?.turn, gameState?.isGameOver, gameState?.history.length]);

    const makeMove = useCallback((from: string, to: string) => {
        if (!socketRef.current) return;
        socketRef.current.emit('make_move', { gameId: roomId, from, to });
    }, [roomId]);

    const resign = useCallback(() => {
        if (!socketRef.current) return;
        socketRef.current.emit('resign', { gameId: roomId });
    }, [roomId]);

    const requestDraw = useCallback(() => {
        if (!socketRef.current) return;
        socketRef.current.emit('offer_draw', { gameId: roomId });
    }, [roomId]);

    return {
        gameState,
        playerColor,
        clocks,
        makeMove,
        resign,
        requestDraw,
        error,
    };
};
