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

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_game', (name) => {
        const result = joinTeam(socket.id, name);
        socket.emit('join_success', result);
        io.emit('state_update', getPublicState());
    });

    socket.on('admin_start_game', () => {
        if (getIsAdmin(socket)) {
            const state = startGame();
            io.emit('state_update', state);
        }
    });

    socket.on('submit_ranking', (ranking) => {
        const state = submitRanking(socket.id, ranking);
        io.emit('state_update', state);

        const allSubmitted = Object.keys(state.submissions[state.round?.id] || {}).length >=
            state.teams.filter(t => t.name !== adminName && t.connected).length;

        if (allSubmitted) {
            setTimeout(() => {
                const newState = calculateRoundResults();
                io.emit('state_update', newState);
            }, 500);
        }
    });

    socket.on('admin_calculate_round', () => {
        if (getIsAdmin(socket)) {
            const state = calculateRoundResults();
            io.emit('state_update', state);
        }
    });

    socket.on('admin_next_round', () => {
        if (getIsAdmin(socket)) {
            const state = nextRound();
            io.emit('state_update', state);
        }
    });

    socket.on('admin_next_one', () => {
        if (getIsAdmin(socket)) {
            const state = nextOne();
            io.emit('state_update', state);
        }
    });

    socket.on('admin_award_point', ({ teamName, points }) => {
        if (getIsAdmin(socket)) {
            const state = adminAwardPoint(teamName, points);
            io.emit('state_update', state);
        }
    });

    socket.on('admin_remove_team', (teamName) => {
        if (getIsAdmin(socket)) {
            const state = removeTeam(teamName);
            io.emit('state_update', state);
        }
    });

    socket.on('admin_reset_game', () => {
        if (getIsAdmin(socket)) {
            const state = resetGame();
            io.emit('state_update', state);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const state = disconnectTeam(socket.id);
        io.emit('state_update', state);
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

export default server;
