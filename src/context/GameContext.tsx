import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState, Ranking } from '../types/game';

interface GameContextType {
    socket: Socket | null;
    gameState: GameState;
    isAdmin: boolean;
    isConnected: boolean;
    myTeamName: string | null;
    joinGame: (name: string) => void;
    startGame: () => void;
    submitRanking: (ranking: Ranking) => void;
    nextRound: () => void;
    nextOne: () => void;
    awardPoint: (teamName: string, points: number) => void;
    calculateRound: () => void;
    removeTeam: (teamName: string) => void;
    resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within a GameProvider');
    return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameState>({
        phase: 'lobby',
        currentGame: 'tier',
        round: null,
        currentQuiz: null,
        currentQuizIndex: 0,
        totalQuizCount: 0,
        teams: [],
        submissions: {},
        roundResults: {},
        roundResultsCalculated: false,
        quizHistory: []
    });
    const [serverIsAdmin, setServerIsAdmin] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [myTeamName, setMyTeamName] = useState<string | null>(null);

    // Client-side admin check for persistence on serverless environments
    const isAdmin = serverIsAdmin || myTeamName === '양승민';

    useEffect(() => {
        // Use environment variable for production, localhost for development
        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: Infinity, // Keep trying to reconnect
            reconnectionDelay: 1000,
            timeout: 20000 // Increase timeout for mobile stability
        });

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);

            // Auto-rejoin if we have a saved name in session storage
            const savedName = sessionStorage.getItem('goatGameTeamName');
            if (savedName) {
                console.log('Found saved session, attempting auto-rejoin for:', savedName);
                newSocket.emit('joinTeam', { name: savedName });
                setMyTeamName(savedName);
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        newSocket.on('disconnect', (reason) => {
            console.warn('Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('joined', (data: any) => {
            if (data.success) {
                setServerIsAdmin(data.isAdmin);
                setGameState(data.state);
                if (myTeamName) {
                    sessionStorage.setItem('goatGameTeamName', myTeamName);
                }
            } else {
                alert(data.message || 'Join failed');
                setMyTeamName(null);
                sessionStorage.removeItem('goatGameTeamName');
            }
        });

        newSocket.on('gameStateUpdate', (state: GameState) => {
            console.log('Received Game State Update:', state);
            setGameState(state);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const joinGame = (name: string) => {
        if (socket) {
            setMyTeamName(name);
            // Save immediately to session storage to handle quick refreshes
            sessionStorage.setItem('goatGameTeamName', name);
            socket.emit('joinTeam', { name });
        }
    };

    const startGame = () => {
        if (socket && isAdmin) {
            socket.emit('adminAction', { action: 'startGame' });
        }
    };

    const submitRanking = (ranking: Ranking) => {
        if (socket) {
            socket.emit('submitRanking', ranking);
        }
    };

    const calculateRound = () => {
        // Legacy/Unused
    }

    const nextRound = () => {
        if (socket && isAdmin) {
            socket.emit('adminAction', { action: 'nextRound' });
        }
    };

    const nextOne = () => {
        if (socket && isAdmin) {
            socket.emit('adminAction', { action: 'nextOne' });
        }
    };

    const awardPoint = (teamName: string, points: number) => {
        if (socket && isAdmin) {
            socket.emit('adminAction', { action: 'awardPoint', payload: { teamName, points } });
        }
    };

    const removeTeam = (teamName: string) => {
        if (socket && isAdmin) {
            socket.emit('adminAction', { action: 'removeTeam', payload: { teamName } });
        }
    }

    const resetGame = () => {
        if (socket && isAdmin) {
            if (confirm('정말로 게임을 리셋하시겠습니까? 모든 진행 상황이 초기화됩니다.')) {
                socket.emit('adminAction', { action: 'resetGame' });
            }
        }
    }

    return (
        <GameContext.Provider value={{
            socket,
            gameState,
            isAdmin,
            isConnected,
            myTeamName,
            joinGame,
            startGame,
            submitRanking,
            calculateRound,
            nextRound,
            nextOne,
            awardPoint,
            removeTeam,
            resetGame
        }}>
            {children}
        </GameContext.Provider>
    );
};
