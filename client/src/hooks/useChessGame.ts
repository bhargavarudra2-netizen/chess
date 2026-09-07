import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState, LastMoveDetails, Portal } from '../types';
import {
    playMoveSound,
    playCaptureSound,
    playTeleportSound,
    playCheckSound,
    playGameOverSound,
} from '../utils/soundEffects';
import { resolvePortalDestination } from '../utils/portalRules';

interface MoveResponsePayload {
    ok?: boolean;
    error?: string;
    fen?: string;
    portals?: Portal[];
    san?: string;
    clocks?: { white: number; black: number };
    teleported?: boolean;
    finalDest?: { r: number; c: number };
    move?: { from: string; to: string; promotion?: string };
}

// Generate default initial portals for local practice mode
const generatePracticePortals = (): Portal[] => {
    return [
        { id: 'p0_a', r: 3, c: 3, linkedTo: 'p0_b', color: '#06b6d4' }, // d5
        { id: 'p0_b', r: 4, c: 4, linkedTo: 'p0_a', color: '#06b6d4' }, // e4
        { id: 'p1_a', r: 2, c: 2, linkedTo: 'p1_b', color: '#a855f7' }, // c6
        { id: 'p1_b', r: 5, c: 5, linkedTo: 'p1_a', color: '#a855f7' }, // f3
    ];
};

export const useChessGame = () => {
    const [mode, setMode] = useState<'lobby' | 'game' | 'practice'>('lobby');
    const [roomId, setRoomId] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'spectator'>('white');
    const [clocks, setClocks] = useState<{ white: number; black: number }>({ white: 600, black: 600 });
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [queueDuration, setQueueDuration] = useState(0);
    const [pendingRoomCode, setPendingRoomCode] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const practiceChessRef = useRef<any>(null);

    // Sound effect helper
    const triggerMoveAudio = useCallback((teleported?: boolean, san?: string) => {
        if (teleported) {
            playTeleportSound();
        } else if (san && san.includes('x')) {
            playCaptureSound();
        } else {
            playMoveSound();
        }

        if (san && (san.includes('+') || san.includes('#'))) {
            setTimeout(playCheckSound, 120);
        }
    }, []);

    // Apply move updates from server
    const handleMoveUpdate = useCallback((data: MoveResponsePayload) => {
        if (!data) return;

        triggerMoveAudio(data.teleported, data.san);

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
    }, [triggerMoveAudio]);

    // Initialize Socket.io connection once
    useEffect(() => {
        const socket = io('http://localhost:3000');
        socketRef.current = socket;

        socket.on('queue_joined', () => {
            setIsSearching(true);
        });

        socket.on('queue_left', () => {
            setIsSearching(false);
        });

        socket.on('match_found', (data: { gameId: string; color: 'white' | 'black'; opponent: string; initialState: GameState }) => {
            setIsSearching(false);
            setPendingRoomCode(null);
            setRoomId(data.gameId);
            setPlayerColor(data.color);
            setGameState(data.initialState);
            setMode('game');
            if (data.initialState.clocks) {
                setClocks(data.initialState.clocks);
            }
        });

        socket.on('room_created', (data: { gameId: string; color: 'white'; initialState: GameState }) => {
            setPendingRoomCode(data.gameId);
            setRoomId(data.gameId);
            setPlayerColor('white');
            setGameState(data.initialState);
            if (data.initialState.clocks) {
                setClocks(data.initialState.clocks);
            }
        });

        socket.on('player_joined', (data: { gameId: string; color: string; totalPlayers: number }) => {
            if (data.totalPlayers >= 2) {
                setPendingRoomCode(null);
                setMode('game');
            }
        });

        socket.on('game_start', (data: { gameId: string; color: 'white' | 'black' | 'spectator'; initialState: GameState }) => {
            setPendingRoomCode(null);
            setRoomId(data.gameId);
            setPlayerColor(data.color);
            setGameState(data.initialState);
            setMode('game');
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

        socket.on('game_over', (data: { reason: string; winner: 'white' | 'black' | 'draw'; newState?: GameState }) => {
            playGameOverSound();
            setGameState(prev => prev ? {
                ...prev,
                isGameOver: true,
                winner: data.winner,
                ...(data.newState || {}),
            } : null);
        });

        return () => {
            socket.disconnect();
        };
    }, [handleMoveUpdate]);

    // Stopwatch ticker while searching for an opponent
    useEffect(() => {
        if (!isSearching) {
            setQueueDuration(0);
            return;
        }

        const interval = setInterval(() => {
            setQueueDuration(d => d + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isSearching]);

    // Active in-game clocks ticking
    useEffect(() => {
        if (!gameState || gameState.isGameOver || gameState.history.length === 0) return;

        const interval = setInterval(() => {
            setClocks(prev => {
                const turn = gameState.turn;
                if (turn === 'w') {
                    const nextWhite = Math.max(0, prev.white - 1);
                    if (nextWhite === 0 && !gameState.isGameOver) playGameOverSound();
                    return { ...prev, white: nextWhite };
                } else {
                    const nextBlack = Math.max(0, prev.black - 1);
                    if (nextBlack === 0 && !gameState.isGameOver) playGameOverSound();
                    return { ...prev, black: nextBlack };
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState?.turn, gameState?.isGameOver, gameState?.history.length]);

    // --- Actions ---

    const joinQueue = useCallback(() => {
        if (!socketRef.current) return;
        setError(null);
        socketRef.current.emit('join_queue', {});
    }, []);

    const leaveQueue = useCallback(() => {
        if (!socketRef.current) return;
        socketRef.current.emit('leave_queue');
        setIsSearching(false);
    }, []);

    const createPrivateRoom = useCallback(() => {
        if (!socketRef.current) return;
        setError(null);
        socketRef.current.emit('create_private_room');
    }, []);

    const joinRoom = useCallback((code: string) => {
        if (!socketRef.current) return;
        setError(null);
        socketRef.current.emit('join_room', { gameId: code });
    }, []);

    const startPractice = useCallback(() => {
        setError(null);
        const portals = generatePracticePortals();
        if (window.Chess) {
            practiceChessRef.current = new window.Chess();
        }
        setRoomId('local-sandbox');
        setPlayerColor('white');
        setClocks({ white: 600, black: 600 });
        setGameState({
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            turn: 'w',
            portals,
            history: [],
            isGameOver: false,
            winner: null,
        });
        setMode('practice');
    }, []);

    const leaveToLobby = useCallback(() => {
        if (isSearching) leaveQueue();
        setMode('lobby');
        setGameState(null);
        setRoomId(null);
        setPendingRoomCode(null);
        setError(null);
    }, [isSearching, leaveQueue]);

    const makeMove = useCallback((from: string, to: string) => {
        if (mode === 'practice') {
            // Handle local move in sandbox mode
            const chess = practiceChessRef.current || (window.Chess ? new window.Chess(gameState?.fen) : null);
            if (!chess) return;

            const moveRes = chess.move({ from, to, promotion: 'q' });
            if (!moveRes) {
                setError('Illegal move');
                return;
            }

            // Check portal teleport
            const file = to.charCodeAt(0) - 97;
            const rank = 8 - parseInt(to[1], 10);
            const teleportDest = resolvePortalDestination(
                gameState?.portals || [],
                { r: 8 - parseInt(from[1], 10), c: from.charCodeAt(0) - 97 },
                { r: rank, c: file },
                moveRes.piece,
                moveRes.color,
                chess
            );

            let teleported = false;
            let finalFen = chess.fen();
            if (teleportDest) {
                teleported = true;
                const destSq = `${String.fromCharCode(teleportDest.c + 97)}${8 - teleportDest.r}`;
                // Move piece on internal board
                const piece = chess.remove(to);
                chess.put(piece, destSq);
                finalFen = chess.fen();
            }

            triggerMoveAudio(teleported, moveRes.san);
            setError(null);

            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    fen: finalFen,
                    turn: chess.turn(),
                    history: [...prev.history, moveRes.san],
                    isGameOver: chess.isGameOver(),
                    winner: chess.isCheckmate() ? (chess.turn() === 'w' ? 'black' : 'white') : (chess.isDraw() ? 'draw' : null),
                    lastMove: {
                        from,
                        to,
                        san: moveRes.san,
                        teleported,
                        finalDest: teleportDest || undefined,
                    },
                };
            });
            return;
        }

        // Online mode: send to server
        if (!socketRef.current || !roomId) return;
        socketRef.current.emit('make_move', { gameId: roomId, from, to });
    }, [mode, roomId, gameState?.fen, gameState?.portals, triggerMoveAudio]);

    const resign = useCallback(() => {
        if (mode === 'practice') {
            setGameState(prev => prev ? { ...prev, isGameOver: true, winner: 'black' } : null);
            playGameOverSound();
            return;
        }
        if (!socketRef.current || !roomId) return;
        socketRef.current.emit('resign', { gameId: roomId });
    }, [mode, roomId]);

    const requestDraw = useCallback(() => {
        if (mode === 'practice') {
            setGameState(prev => prev ? { ...prev, isGameOver: true, winner: 'draw' } : null);
            playGameOverSound();
            return;
        }
        if (!socketRef.current || !roomId) return;
        socketRef.current.emit('offer_draw', { gameId: roomId });
    }, [mode, roomId]);

    return {
        mode,
        roomId,
        gameState,
        playerColor,
        clocks,
        isSearching,
        queueDuration,
        pendingRoomCode,
        joinQueue,
        leaveQueue,
        createPrivateRoom,
        joinRoom,
        startPractice,
        leaveToLobby,
        makeMove,
        resign,
        requestDraw,
        error,
    };
};
