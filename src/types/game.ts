export type Tier = 'Goat' | 'S' | 'A' | 'B' | 'C';

export const TIERS: Tier[] = ['Goat', 'S', 'A', 'B', 'C'];

export interface Item {
    id: string;
    name: string;
    image?: string;
}

export interface Round {
    id: string;
    title: string;
    items: Item[];
}

export interface Team {
    name: string;
    score: number;
    connected: boolean;
}


export type RoundId = 'ice_cream' | 'snacks' | 'ramen';

export interface RankingItem {
    tier: Tier;
    index: number;
}

export type Ranking = Record<string, RankingItem>; // itemId -> { tier, index }

export interface QuizItem {
    id: string;
    question: string;
    answer: string;
}

export type GameType = 'tier' | 'hunmin' | 'pitch';

export interface GameState {
    phase: 'lobby' | 'playing' | 'results';
    currentGame: GameType;
    round: Round | null;

    // New Game Data
    currentQuiz: QuizItem | null;
    currentQuizIndex: number;
    totalQuizCount: number;

    teams: Team[];
    submissions: Record<string, Record<string, Ranking>>; // roundId -> teamName -> Ranking
    roundResults: Record<string, {
        itemAverages: Record<string, number>;
        teamScores: Record<string, number>;
    }>;
    roundResultsCalculated: boolean;
    quizHistory: { game: 'hunmin' | 'pitch'; quizIndex: number; question: string; team: string; points: number; timestamp: number }[];
}

export interface ServerResponse {
    isAdmin: boolean;
    state: GameState;
}

export const ADMIN_NAME = '양승민';
