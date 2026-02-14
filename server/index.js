import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
    joinTeam,
    disconnectTeam,
    removeTeam,
    startGame,
    nextRound,
    submitRanking,
    calculateRoundResults,
    resetGame,
    getPublicState,
    nextOne,
    adminAwardPoint,
    adminName
} from './gameState.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

const getIsAdmin = (socket) => {
    return isTeamAdmin(socket.id);
};

// Global error handler wrapper
const handleSocketEvent = async (socket, handler) => {
    try {
        await handler();
    } catch (err) {
        console.error(`Error in socket event for ${socket.id}:`, err);
        socket.emit('error', { message: 'Server error occurred' });
    }
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Initial state push
    socket.emit('gameStateUpdate', getPublicState());

    socket.on('joinTeam', ({ name }) => {
        handleSocketEvent(socket, () => {
            console.log(`Join request from ${socket.id}: ${name}`);
            const result = joinTeam(socket.id, name);
            if (result.success) {
                socket.emit('joined', result);
                io.emit('gameStateUpdate', getPublicState());
            } else {
                socket.emit('joined', result);
            }
        });
    });

    socket.on('adminAction', ({ action, payload }) => {
        handleSocketEvent(socket, () => {
            if (!getIsAdmin(socket)) {
                console.warn(`Unauthorized admin action ${action} from ${socket.id}`);
                return;
            }

            console.log(`Admin action: ${action}`, payload);
            let state = null;

            switch (action) {
                case 'startGame':
                    state = startGame();
                    break;
                case 'nextRound':
                    state = nextRound();
                    break;
                case 'nextOne':
                    state = nextOne();
                    break;
                case 'awardPoint':
                    state = adminAwardPoint(payload.teamName, payload.points);
                    break;
                case 'removeTeam':
                    state = removeTeam(payload.teamName);
                    break;
                case 'resetGame':
                    state = resetGame();
                    break;
                case 'calculateRound': // explicit calc
                    state = calculateRoundResults();
                    break;
                default:
                    console.warn('Unknown admin action:', action);
            }

            if (state) {
                io.emit('gameStateUpdate', state);
            }
        });
    });

    socket.on('submitRanking', (ranking) => {
        handleSocketEvent(socket, () => {
            console.log(`Submission from ${socket.id}`);
            const state = submitRanking(socket.id, ranking);
            io.emit('gameStateUpdate', state);

            // Auto-calculate if all teams submitted
            const allSubmitted = Object.keys(state.submissions[state.round?.id] || {}).length >=
                state.teams.filter(t => t.name !== adminName && t.connected).length;

            if (allSubmitted && state.phase === 'playing') {
                setTimeout(() => {
                    try {
                        const newState = calculateRoundResults();
                        io.emit('gameStateUpdate', newState);
                    } catch (e) {
                        console.error("Auto calculation error:", e);
                    }
                }, 500);
            }
        });
    });

    socket.on('disconnect', () => {
        try {
            console.log('User disconnected:', socket.id);
            const state = disconnectTeam(socket.id);
            io.emit('gameStateUpdate', state);
        } catch (e) {
            console.error("Disconnect error:", e);
        }
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
