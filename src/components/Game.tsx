import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { TierListBoard } from './TierListBoard';
import { HunminGame } from './HunminGame';
import { PitchGame } from './PitchGame';

// SNU Tips Data
const SNU_TIPS = [
    "셔틀 줄이 길 때는 걸어가는 게 빠를 수도... (아닐 수도 있음)",
    "중앙도서관 관정관 옥상정원은 뷰 맛집!",
    "학식 메뉴는 미리미리 어플로 확인하는 센스!",
    "버들골 풍산마당에서 짜장면 시켜 먹으면 꿀맛!",
    "교내 순환 셔틀은 반시계 방향으로 돕니다.",
    "느티나무 카페의 샌드위치는 가성비 최고!",
    "학생회관 천원의 아침밥은 든든한 하루의 시작!",
    "서울대입구역에서 정문까지 걸어오면 강제 등산행..."
];

// Waiting Screen Component
const WaitingScreen = () => {
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % SNU_TIPS.length);
        }, 5000); // Rotate tips every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center min-h-[60vh] text-center p-8 bg-white rounded-xl shadow-card border border-paper-200 animate-fade-in py-12">
            <div className="w-16 h-16 bg-accent-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 animate-bounce">
                ⏳
            </div>
            <h2 className="text-2xl font-serif font-bold text-paper-900 mb-4">답변 제출 완료!</h2>
            <p className="text-paper-500 mb-8">다른 팀들이 제출할 때까지 잠시만 기다려주세요.</p>

            <div className="bg-paper-50 p-6 rounded-lg border border-paper-200 max-w-md w-full relative overflow-hidden">
                <div className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-2">서울대 꿀팁 #{tipIndex + 1}</div>
                <p className="text-lg font-medium text-paper-800 transition-opacity duration-500">
                    "{SNU_TIPS[tipIndex]}"
                </p>
                <div className="absolute top-0 right-0 p-2 opacity-10 text-4xl">🎓</div>
            </div>
        </div>
    );
};

export const Game: React.FC = () => {
    const { gameState, isAdmin, calculateRound, nextRound, myTeamName, resetGame } = useGame();

    // Loading State
    if (gameState.currentGame === 'tier' && !gameState.round) {
        return <div className="min-h-screen flex items-center justify-center text-paper-500">Loading...</div>;
    }

    // --- GAME ROUTING ---
    // If playing Hunmin or Pitch, render those components directly
    if (gameState.currentGame === 'hunmin') {
        return <div className="min-h-screen bg-paper-100 text-paper-900 p-4 font-sans pb-20"><HunminGame /></div>;
    }
    if (gameState.currentGame === 'pitch') {
        return <div className="min-h-screen bg-paper-100 text-paper-900 p-4 font-sans pb-20"><PitchGame /></div>;
    }

    // --- TIER LIST LOGIC BELOW ---
    // Admin/Submitted Logic for Tier List
    if (!gameState.round) return null; // Safety check

    const currentRoundSubmissions = gameState.submissions[gameState.round.id] || {};
    const submittedTeams = Object.keys(currentRoundSubmissions);
    const hasSubmitted = myTeamName && submittedTeams.includes(myTeamName);

    // Admin View for Tier List
    const allTeams = gameState.teams.filter(t => t.name !== '양승민' && t.connected); // Filter disconnected teams
    const pendingTeams = allTeams.filter(t => !submittedTeams.includes(t.name));
    const allSubmitted = pendingTeams.length === 0 && allTeams.length > 0;

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-paper-100 p-8 font-sans">
                <header className="max-w-4xl mx-auto mb-10 text-center relative">
                    <button
                        onClick={resetGame}
                        className="absolute top-0 right-0 text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded shadow-sm border border-red-200"
                    >
                        🔄 리셋
                    </button>
                    <div className="inline-block px-3 py-1 bg-paper-200 rounded-full text-xs font-bold text-paper-600 mb-2 uppercase tracking-wide">Admin Mode</div>
                    <h1 className="text-3xl font-serif font-bold text-paper-900">{gameState.round.title}</h1>
                </header>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl border border-paper-200 shadow-sm">
                        <h3 className="text-sm font-bold text-paper-400 uppercase tracking-wider mb-4 border-b border-paper-100 pb-2">제출 완료 ({submittedTeams.length})</h3>
                        <ul className="space-y-2">
                            {submittedTeams.map(name => (
                                <li key={name} className="flex items-center text-paper-700 text-sm">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    {name}
                                </li>
                            ))}
                            {submittedTeams.length === 0 && <li className="text-paper-400 italic text-sm">아직 제출한 팀이 없습니다.</li>}
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-paper-200 shadow-sm">
                        <h3 className="text-sm font-bold text-paper-400 uppercase tracking-wider mb-4 border-b border-paper-100 pb-2">대기 중 ({pendingTeams.length})</h3>
                        <ul className="space-y-2">
                            {pendingTeams.map(t => (
                                <li key={t.name} className="flex items-center text-paper-700 text-sm">
                                    <span className="w-2 h-2 bg-paper-300 rounded-full mr-2 animate-pulse"></span>
                                    {t.name}
                                </li>
                            ))}
                            {pendingTeams.length === 0 && <li className="text-paper-400 italic text-sm">모든 팀이 제출했습니다.</li>}
                        </ul>
                    </div>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                    {!gameState.roundResultsCalculated ? (
                        <>
                            <div className="w-full py-4 rounded-lg font-bold text-lg bg-paper-200 text-paper-400 text-center cursor-not-allowed">
                                {allSubmitted
                                    ? '결과 계산 중...'
                                    : '모든 팀의 제출을 기다리는 중...'}
                            </div>

                            {/* Fallback Manual Calculate - Only if stuck */}
                            <button
                                onClick={calculateRound}
                                className="w-full text-xs text-paper-400 hover:text-accent-primary underline mt-2"
                            >
                                (문제가 있나요?) 강제 결과 계산하기
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={nextRound}
                            className="w-full bg-accent-primary hover:bg-[#c55b42] text-white py-4 rounded-lg font-bold text-lg shadow-sm transition-transform active:scale-[0.98]"
                        >
                            다음 라운드 진행 &rarr;
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (hasSubmitted) {
        return (
            <div className="min-h-screen bg-paper-100 text-paper-900 p-4 font-sans">
                <WaitingScreen />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper-100 text-paper-900 p-4 font-sans pb-20">
            <TierListBoard />
        </div>
    );
};
