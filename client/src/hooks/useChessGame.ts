import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState } from '../types';

export const useChessGame = (roomId: string) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'spectator'>('white');
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io('http://localhost:3000');
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join_room', { gameId: roomId });
        });

        socket.on('game_start', (data: { gameId: string; color: 'white' | 'black' | 'spectator'; initialState: GameState }) => {
            setPlayerColor(data.color);
            setGameState(data.initialState);
        });

        socket.on('move_result', (data: { ok: boolean; error?: string; fen?: string; portals?: any[]; san?: string; [key: string]: any }) => {
            if (!data.ok) {
                setError(data.error || 'Move rejected');
            } else {
                setError(null);
                setGameState(prev => prev ? {
                    ...prev,
                    fen: data.fen || prev.fen,
                    portals: data.portals || prev.portals,
                    history: data.san ? [...prev.history, data.san] : prev.history,
                    turn: prev.turn === 'w' ? 'b' : 'w',
                } : null);
            }
        });

        socket.on('opponent_move', (data: { fen?: string; portals?: any[]; san?: string; [key: string]: any }) => {
            setGameState(prev => prev ? {
                ...prev,
                fen: data.fen || prev.fen,
                portals: data.portals || prev.portals,
                history: data.san ? [...prev.history, data.san] : prev.history,
                turn: prev.turn === 'w' ? 'b' : 'w',
            } : null);
        });

        return () => {
            socket.disconnect();
        };
    }, [roomId]);

    const makeMove = useCallback((from: string, to: string) => {
        if (!socketRef.current) return;
        socketRef.current.emit('make_move', { gameId: roomId, from, to });
    }, [roomId]);

    return {
        gameState,
        playerColor,
        makeMove,
        error
    };
};

