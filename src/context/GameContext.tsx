import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState, ServerResponse, Ranking } from '../types/game';

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
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        newSocket.on('join_success', (data: ServerResponse) => {
            setServerIsAdmin(data.isAdmin);
            setGameState(data.state);
        });

        newSocket.on('state_update', (state: GameState) => {
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
            socket.emit('join_game', name);
        }
    };

    const startGame = () => {
        if (socket && isAdmin) {
            socket.emit('admin_start_game');
        }
    };

    const submitRanking = (ranking: Ranking) => {
        if (socket) {
            socket.emit('submit_ranking', ranking);
        }
    };

    const calculateRound = () => {
        if (socket && isAdmin) {
            socket.emit('admin_calculate_round');
        }
    }

    const nextRound = () => {
        if (socket && isAdmin) {
            socket.emit('admin_next_round');
        }
    };

    const nextOne = () => {
        if (socket && isAdmin) {
            socket.emit('admin_next_one');
        }
    };

    const awardPoint = (teamName: string, points: number) => {
        if (socket && isAdmin) {
            socket.emit('admin_award_point', { teamName, points });
        }
    };

    const removeTeam = (teamName: string) => {
        if (socket && isAdmin) {
            socket.emit('admin_remove_team', teamName);
        }
    }

    const resetGame = () => {
        if (socket && isAdmin) {
            if (confirm('정말로 게임을 리셋하시겠습니까? 모든 진행 상황이 초기화됩니다.')) {
                socket.emit('admin_reset_game');
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
