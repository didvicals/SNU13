const GAME_ROUNDS = [
    {
        id: 'ice_cream',
        title: '1라운드: 아이스크림',
        items: [
            { id: 'ic1', name: '수박바', image: '/assets/items/soobak.png' },
            { id: 'ic2', name: '누가바', image: '/assets/items/nougat.jpg' },
            { id: 'ic3', name: '월드콘', image: '/assets/items/worldcone.jpg' },
            { id: 'ic4', name: '슈퍼콘', image: '/assets/items/supercone.jpg' },
            { id: 'ic5', name: '죠스바', image: '/assets/items/jaws.avif' },
            { id: 'ic6', name: '스크류바', image: '/assets/items/screw.jpg' },
            { id: 'ic7', name: '빠삐코', image: '/assets/items/papico.jpg' },
            { id: 'ic8', name: '뽕따', image: '/assets/items/bbongtta.jpg' },
            { id: 'ic9', name: '메로나', image: '/assets/items/melona.jpg' },
            { id: 'ic10', name: '보석바', image: '/assets/items/jewel.jpg' },
        ],
    },
    {
        id: 'snacks',
        title: '2라운드: 술자리 술안주',
        items: [
            { id: 'sn1', name: '삼겹살', image: '/assets/items/삼겹살.jpeg' },
            { id: 'sn2', name: '곱창/막창', image: '/assets/items/곱창.webp' },
            { id: 'sn3', name: '오뎅탕', image: '/assets/items/오뎅탕.jpg' },
            { id: 'sn4', name: '마른안주', image: '/assets/items/마른안주.png' },
            { id: 'sn5', name: '홍합/조개탕', image: '/assets/items/홍합탕.jpeg' },
            { id: 'sn6', name: '황도/화채', image: '/assets/items/황도.jpg' },
            { id: 'sn7', name: '떡볶이', image: '/assets/items/떡볶이.webp' },
            { id: 'sn8', name: '국밥', image: '/assets/items/국밥.jpg' },
            { id: 'sn9', name: '두부김치', image: '/assets/items/두부김치.webp' },
            { id: 'sn10', name: '치킨', image: '/assets/items/치킨.jpg' },
        ],
    },
    {
        id: 'ramen',
        title: '3라운드: 라면 티어리스트',
        items: [
            { id: 'rm1', name: '너구리', image: '/assets/items/너구리.webp' },
            { id: 'rm2', name: '신라면', image: '/assets/items/신라면.webp' },
            { id: 'rm3', name: '참깨라면', image: '/assets/items/참깨라면.jpg' },
            { id: 'rm4', name: '짜파게티', image: '/assets/items/짜파게티.webp' },
            { id: 'rm5', name: '육개장', image: '/assets/items/육개장.jpeg' },
            { id: 'rm6', name: '팔도비빔면', image: '/assets/items/팔도비빔면.png' },
            { id: 'rm7', name: '불닭볶음면', image: '/assets/items/불닭볶음면.webp' },
            { id: 'rm8', name: '까르보불닭', image: '/assets/items/까르보불닭.webp' },
            { id: 'rm9', name: '튀김우동', image: '/assets/items/튀김우동.webp' },
            { id: 'rm10', name: '오징어짬뽕', image: '/assets/items/오징어짬뽕.webp' },
        ],
    },
];

const HUNMIN_QUIZ = [
    { id: 'h1', question: 'ㄱㅇ', answer: '가을, 거울, ...' },
    { id: 'h2', question: 'ㅅㄱ', answer: '사과, 수건, ...' },
    { id: 'h3', question: 'ㅁㅈ', answer: '모자, 맥주, ...' },
    { id: 'h4', question: 'ㄷㅂ', answer: '두부, 담배, ...' },
    { id: 'h5', question: 'ㅎㄱ', answer: '한국, 한강, ...' },
    { id: 'h6', question: 'ㅇㅅ', answer: '우산, 의사, ...' },
    { id: 'h7', question: 'ㅂㄴ', answer: '비누, 바늘, ...' },
    { id: 'h8', question: 'ㅊㄱ', answer: '친구, 축구, ...' },
    { id: 'h9', question: 'ㅈㅈ', answer: '자주, 전쟁, ...' },
    { id: 'h10', question: 'ㅋㄹ', answer: '콜라, 카레, ...' },
];

const PITCH_QUIZ = [
    { id: 'p1', question: '김삿갓삿갓', answer: '갓삿갓삿김' },
    { id: 'p2', question: '퍼스널컬러', answer: '러컬널스퍼' },
    { id: 'p3', question: '출제위원장', answer: '장원위제출' },
    { id: 'p4', question: '춘천닭갈비', answer: '비갈닭천춘' },
    { id: 'p5', question: '영동용봉탕', answer: '탕봉용동영' },
    { id: 'p6', question: '지리산산삼', answer: '삼산산리지' },
    { id: 'p7', question: '돌솥비빔밥', answer: '밥빔비솥돌' },
    { id: 'p8', question: '라벤더퍼퓸', answer: '퓸퍼더벤라' },
    { id: 'p9', question: '오드리햅번', answer: '번햅리드오' },
    { id: 'p10', question: '음양오행설', answer: '설행오양음' },
];

const TIER_POINTS = {
    'Goat': 6,
    'S': 5,
    'A': 4,
    'B': 3,
    'C': 2,
};

// Global State
let teams = {}; // { socketId: { name, score, connected: true } }
let gameState = {
    phase: 'lobby', // lobby, playing, results
    currentGame: 'tier', // tier, hunmin, pitch
    currentRoundIndex: -1, // For Tier List
    currentQuizIndex: 0,   // For Hunmin/Pitch
    submissions: {}, // { roundId: { teamName: { itemId: tier } } }
    roundResults: {}, // { roundId: { itemAverages: {}, teamScores: {} } }
    roundResultsCalculated: false, // New flag to control "Next Round" button
    quizHistory: [] // [{ game: 'hunmin', quizIndex: 0, team: 'TeamA', points: 10 }]
};

const adminName = '양승민';
let adminSocketId = null;

function joinTeam(socketId, name) {
    if (name === adminName) {
        adminSocketId = socketId;
        return { success: true, isAdmin: true, state: getPublicState() };
    }

    // Reconnection logic or new team
    const existingTeamId = Object.keys(teams).find(id => teams[id].name === name);
    let previousScore = 0;

    if (existingTeamId) {
        previousScore = teams[existingTeamId].score || 0;
        delete teams[existingTeamId];
    }

    teams[socketId] = { name, score: previousScore, connected: true };
    return { success: true, isAdmin: false, state: getPublicState() };
}

function disconnectTeam(socketId) {
    if (socketId === adminSocketId) {
        adminSocketId = null;
    }
    if (teams[socketId]) {
        teams[socketId].connected = false;
    }
}

function removeTeam(teamName) {
    const socketId = Object.keys(teams).find(id => teams[id].name === teamName);
    if (socketId) {
        delete teams[socketId];
        return getPublicState();
    }
    return getPublicState();
}

function startGame() {
    gameState.phase = 'playing';
    gameState.currentGame = 'tier';
    gameState.currentRoundIndex = 0;
    gameState.currentQuizIndex = 0;
    gameState.submissions = {};
    gameState.roundResults = {};
    gameState.roundResultsCalculated = false;
    gameState.quizHistory = [];

    Object.values(teams).forEach(t => t.score = 0);
    return getPublicState();
}

function nextRound() {
    // 1. Tier List Game Logic
    if (gameState.currentGame === 'tier') {
        if (gameState.currentRoundIndex < GAME_ROUNDS.length - 1) {
            gameState.currentRoundIndex++;
            gameState.roundResultsCalculated = false;
        } else {
            // Tier List Ended -> Go to Intermediate Results -> Then Hunmin
            gameState.phase = 'results';
            // We stay in 'results' phase until admin clicks 'Next Game' (which will be a new function or reused nextRound logic?)
            // Let's make nextRound advance to next game if in results?
            // Actually, let's keep it simple:
            // If we are at the end of tier list, show results.
            // FROM results, 'nextRound' will start Hunmin.
        }
    }
    return getPublicState();
}

// Function for Admin to purely advanced to the next "State" whatever that is
function nextOne() {
    if (gameState.phase === 'lobby') return startGame();

    // If showing properties/results for Tier List
    if (gameState.currentGame === 'tier') {
        // If playing, check if we need to calculate results or just move on?
        // Actually, 'nextRound' covers moving within Tier List. 
        // But transitioning OUT of Tier List needs logic.

        if (gameState.phase === 'results') {
            // Move to Hunmin
            gameState.currentGame = 'hunmin';
            gameState.phase = 'playing';
            gameState.currentQuizIndex = 0;
            return getPublicState();
        }
    }

    // Hunmin Game Logic
    if (gameState.currentGame === 'hunmin') {
        if (gameState.currentQuizIndex < HUNMIN_QUIZ.length - 1) {
            gameState.currentQuizIndex++;
        } else {
            // End of Hunmin -> Results -> Pitch
            if (gameState.phase === 'playing') {
                gameState.phase = 'results';
            } else if (gameState.phase === 'results') {
                gameState.currentGame = 'pitch';
                gameState.phase = 'playing';
                gameState.currentQuizIndex = 0;
            }
        }
        return getPublicState();
    }

    // Pitch Game Logic
    if (gameState.currentGame === 'pitch') {
        if (gameState.currentQuizIndex < PITCH_QUIZ.length - 1) {
            gameState.currentQuizIndex++;
        } else {
            // End of Pitch -> Final Results
            gameState.phase = 'results';
        }
        return getPublicState();
    }

    return getPublicState();
}

// Admin awards points manually
function adminAwardPoint(teamName, points) {
    const socketId = Object.keys(teams).find(id => teams[id].name === teamName);
    if (socketId && teams[socketId]) {
        teams[socketId].score += points;

        // Record History
        if (gameState.currentGame === 'hunmin' || gameState.currentGame === 'pitch') {
            const currentQuiz = gameState.currentGame === 'hunmin'
                ? HUNMIN_QUIZ[gameState.currentQuizIndex]
                : PITCH_QUIZ[gameState.currentQuizIndex];

            gameState.quizHistory.push({
                game: gameState.currentGame,
                quizIndex: gameState.currentQuizIndex,
                question: currentQuiz ? currentQuiz.question : `Q${gameState.currentQuizIndex + 1}`,
                team: teamName,
                points: points,
                timestamp: Date.now()
            });
        }
    }
    return getPublicState();
}

function submitRanking(socketId, ranking) {
    const team = teams[socketId];
    if (!team) return false;

    const currentRound = GAME_ROUNDS[gameState.currentRoundIndex];
    if (!gameState.submissions[currentRound.id]) {
        gameState.submissions[currentRound.id] = {};
    }
    gameState.submissions[currentRound.id][team.name] = ranking;

    // Check if all teams submitted
    const submittedTeamNames = Object.keys(gameState.submissions[currentRound.id]);
    const allTeams = Object.values(teams).filter(t => t.name !== adminName && t.connected);

    console.log(`[Submit] Round: ${currentRound.id}, Submitted: ${submittedTeamNames.length}, Active Teams: ${allTeams.length}`);
    console.log(`[Submit] Submitted Names: ${submittedTeamNames.join(', ')}`);
    console.log(`[Submit] Active Team Names: ${allTeams.map(t => t.name).join(', ')}`);

    if (submittedTeamNames.length >= allTeams.length && allTeams.length > 0) {
        console.log('[Submit] All teams submitted. Calculating results...');
        calculateRoundResults();
    }

    return true;
}

function calculateRoundResults() {
    const currentRound = GAME_ROUNDS[gameState.currentRoundIndex];
    const roundSubmissions = gameState.submissions[currentRound.id] || {};

    // 1. Calculate Average Score per Item
    const itemAverages = calculateItemAverages(roundSubmissions);

    // 2. Calculate Team Scores for this Round
    const teamScores = calculateTeamScores(roundSubmissions, itemAverages);

    if (!gameState.roundResults[currentRound.id]) {
        gameState.roundResults[currentRound.id] = {};
    }
    gameState.roundResults[currentRound.id] = {
        itemAverages,
        teamScores
    };

    gameState.roundResultsCalculated = true;

    return getPublicState();
}

function calculateItemAverages(roundSubmissions) {
    const itemScores = {}; // { itemId: [scores...] }

    Object.values(roundSubmissions).forEach(ranking => {
        // 1a. Pre-calculate counts per tier for this ranking (to determine max index)
        const tierCounts = {};
        Object.values(ranking).forEach(({ tier }) => {
            tierCounts[tier] = (tierCounts[tier] || 0) + 1;
        });

        // 1b. Calculate Score with Position Bonus
        Object.entries(ranking).forEach(([itemId, { tier, index }]) => {
            if (!itemScores[itemId]) itemScores[itemId] = [];

            const baseScore = TIER_POINTS[tier] || 0;
            // Bonus: 0.1 point for each position ahead of the last one
            const count = tierCounts[tier] || 0;
            const bonus = (count > 0) ? (count - 1 - index) * 0.1 : 0;

            itemScores[itemId].push(baseScore + bonus);
        });
    });

    const itemAverages = {};
    Object.keys(itemScores).forEach(itemId => {
        const scores = itemScores[itemId];
        const sum = scores.reduce((a, b) => a + b, 0);
        itemAverages[itemId] = sum / scores.length;
    });

    return itemAverages;
}

function calculateTeamScores(roundSubmissions, itemAverages) {
    const teamRoundScores = {};

    Object.keys(teams).forEach(socketId => {
        const team = teams[socketId];
        if (!team.connected) return;

        const teamRanking = roundSubmissions[team.name];
        if (!teamRanking) {
            teamRoundScores[team.name] = 0;
            return;
        }

        let roundScore = 0;
        Object.entries(teamRanking).forEach(([itemId, { tier, index }]) => {
            const tierCounts = {};
            Object.values(teamRanking).forEach(({ tier: t }) => { tierCounts[t] = (tierCounts[t] || 0) + 1; });

            const baseScore = TIER_POINTS[tier] || 0;
            const count = tierCounts[tier] || 0;
            const bonus = (count > 0) ? (count - 1 - index) * 0.1 : 0;
            const teamPoints = baseScore + bonus;

            const avgPoints = itemAverages[itemId] || 0;

            // Score Calculation Update:
            // Base Score: 5 (lowered for smaller total scores)
            // Penalty: distance * 5 (increased for higher discrimination)
            // Goal: Lower average scores with higher team discrimination
            const distance = Math.abs(teamPoints - avgPoints);
            // Formula: Max(0, 5.0 - (Distance * 5.0))
            roundScore += Math.max(0, 5.0 - (distance * 5.0));
        });

        teamRoundScores[team.name] = roundScore;
        team.score += roundScore; // Accumulate total score
    });

    return teamRoundScores;
}

function calculateFinalResults() {
    // Just ensures final state is ready
    return getPublicState();
}

function getPublicState() {
    return {
        phase: gameState.phase,
        currentGame: gameState.currentGame,
        round: gameState.currentGame === 'tier' ? GAME_ROUNDS[gameState.currentRoundIndex] : null,

        // Quiz Data for current game
        currentQuiz: gameState.currentGame === 'hunmin' ? HUNMIN_QUIZ[gameState.currentQuizIndex]
            : gameState.currentGame === 'pitch' ? PITCH_QUIZ[gameState.currentQuizIndex] : null,

        currentQuizIndex: gameState.currentQuizIndex,
        totalQuizCount: gameState.currentGame === 'hunmin' ? HUNMIN_QUIZ.length
            : gameState.currentGame === 'pitch' ? PITCH_QUIZ.length : 0,

        teams: Object.values(teams).map(t => ({ name: t.name, score: t.score, connected: t.connected })),
        submissions: gameState.submissions, // Admin might want to see who submitted?
        roundResults: gameState.roundResults,
        roundResultsCalculated: gameState.roundResultsCalculated,
        quizHistory: gameState.quizHistory || [] // New field
    };
}


function resetGame() {
    gameState.phase = 'lobby';
    gameState.currentGame = 'tier';
    gameState.currentRoundIndex = -1;
    gameState.currentQuizIndex = 0;
    gameState.submissions = {};
    gameState.roundResults = {};
    gameState.roundResultsCalculated = false;
    gameState.quizHistory = [];

    // Reset team scores but keep connections
    Object.values(teams).forEach(t => t.score = 0);

    return getPublicState();
}

function isTeamAdmin(socketId) {
    return adminSocketId === socketId || (teams[socketId] && teams[socketId].name === adminName);
}

export {
    joinTeam,
    disconnectTeam,
    removeTeam,
    startGame,
    nextRound,
    nextOne,
    adminAwardPoint,
    submitRanking,
    calculateRoundResults,
    resetGame,
    getPublicState,
    isTeamAdmin,
    GAME_ROUNDS,
    HUNMIN_QUIZ,
    PITCH_QUIZ,
    adminName
};
