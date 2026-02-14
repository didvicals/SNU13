import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { GAME_ROUNDS } from '../../server/gameState';
import { TIERS } from '../types/game';
import type { Tier, Item, RoundId, Ranking } from '../types/game';

const ROUND_TITLES: Record<RoundId, string> = {
    'ice_cream': '1R: 아이스크림',
    'snacks': '2R: 술안주',
    'ramen': '3R: 라면'
};

const ROUND_IDS: RoundId[] = ['ice_cream', 'snacks', 'ramen'];

export const Results: React.FC = () => {
    const { gameState, isAdmin, nextOne, startGame } = useGame();
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
    const [selectedRoundId, setSelectedRoundId] = useState<RoundId>(ROUND_IDS[0]);

    useEffect(() => {
        if (gameState.currentGame === 'pitch' && gameState.phase === 'results') {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [gameState.currentGame, gameState.phase]);

    const sortedTeams = [...gameState.teams].sort((a, b) => b.score - a.score);

    const toggleExpand = (teamName: string) => {
        setExpandedTeam(prev => prev === teamName ? null : teamName);
    };

    // Calculate score breakdown for Tier List only if needed
    const teamScoresByRound: Record<string, Partial<Record<RoundId, number>>> = {};
    if (gameState.currentGame === 'tier') {
        gameState.teams.forEach(team => {
            teamScoresByRound[team.name] = {};
            ROUND_IDS.forEach(rid => {
                const rRes = gameState.roundResults[rid];
                teamScoresByRound[team.name][rid] = rRes && rRes.teamScores ? (rRes.teamScores[team.name] || 0) : 0;
            });
        });
    }

    // Calculate game-by-game scores for final results
    const calculateGameScores = () => {
        const scores: Record<string, { tier: number; hunmin: number; pitch: number; total: number }> = {};

        gameState.teams.forEach(team => {
            scores[team.name] = { tier: 0, hunmin: 0, pitch: 0, total: team.score };
        });

        // Tier list scores
        ROUND_IDS.forEach(rid => {
            const rRes = gameState.roundResults[rid];
            if (rRes && rRes.teamScores) {
                Object.entries(rRes.teamScores).forEach(([teamName, score]) => {
                    if (scores[teamName]) {
                        scores[teamName].tier += score;
                    }
                });
            }
        });

        // Hunmin and Pitch scores from quiz history
        gameState.quizHistory.forEach(log => {
            if (scores[log.team]) {
                if (log.game === 'hunmin') {
                    scores[log.team].hunmin += log.points;
                } else if (log.game === 'pitch') {
                    scores[log.team].pitch += log.points;
                }
            }
        });

        return scores;
    };

    const gameScores = gameState.currentGame === 'pitch' ? calculateGameScores() : null;

    // Special Final Results View (Pitch Game Complete)
    if (gameState.currentGame === 'pitch' && gameScores) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-accent-secondary/10 text-paper-900 p-8 font-sans">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <header className="text-center mb-12 pt-8">
                        <div className="inline-block px-4 py-2 bg-accent-primary text-white rounded-full text-sm font-bold mb-4 shadow-lg animate-fade-in">
                            🎉 미리배움터 레크리에이션 완료 🎉
                        </div>
                        <h1 className="text-5xl font-serif font-bold text-paper-900 mb-4">
                            최종 결과
                        </h1>
                        <p className="text-xl text-paper-600 mb-2">
                            모든 게임이 종료되었습니다!
                        </p>
                        <p className="text-lg text-paper-500">
                            수고하셨습니다. 앞으로도 함께 즐겁게 배워나가요! 💪
                        </p>
                    </header>

                    {/* Final Ranking */}
                    <div className="bg-white rounded-2xl shadow-2xl border-2 border-accent-primary/20 overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-accent-primary to-accent-secondary p-6 text-white">
                            <h2 className="text-2xl font-bold text-center">🏆 최종 순위 🏆</h2>
                        </div>
                        <div className="p-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-paper-200">
                                        <th className="p-4 text-center font-bold text-paper-600">순위</th>
                                        <th className="p-4 text-left font-bold text-paper-600">팀명</th>
                                        <th className="p-4 text-center font-bold text-paper-600">티어리스트</th>
                                        <th className="p-4 text-center font-bold text-paper-600">훈민정음</th>
                                        <th className="p-4 text-center font-bold text-paper-600">청개구리</th>
                                        <th className="p-4 text-right font-bold text-accent-primary">총점</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedTeams.map((team, index) => {
                                        const teamScore = gameScores[team.name];
                                        const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

                                        return (
                                            <tr
                                                key={team.name}
                                                className={`border-b border-paper-100 hover:bg-paper-50 transition-colors ${index < 3 ? 'bg-yellow-50/30' : ''}`}
                                            >
                                                <td className="p-4 text-center">
                                                    <span className="text-2xl font-bold text-paper-700">
                                                        {rankEmoji || `${index + 1}위`}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-lg font-bold text-paper-900">{team.name}</span>
                                                </td>
                                                <td className="p-4 text-center text-paper-700 font-medium">
                                                    {teamScore.tier.toFixed(1)}
                                                </td>
                                                <td className="p-4 text-center text-paper-700 font-medium">
                                                    {teamScore.hunmin}
                                                </td>
                                                <td className="p-4 text-center text-paper-700 font-medium">
                                                    {teamScore.pitch}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className="text-xl font-bold text-accent-primary">
                                                        {teamScore.total.toFixed(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Closing Message */}
                    <div className="bg-white rounded-xl shadow-lg border border-paper-200 p-8 mb-8 text-center">
                        <p className="text-lg text-paper-700 leading-relaxed mb-4">
                            오늘 미리배움터 레크리에이션에 참여해주셔서 감사합니다! 🎊<br />
                            세 가지 게임을 통해 서로를 더 잘 알아가는 시간이 되었기를 바랍니다.<br />
                            앞으로도 함께 성장하며 즐겁게 배워나가요!
                        </p>
                        <div className="inline-block mt-4 px-6 py-3 bg-paper-100 rounded-lg">
                            <p className="text-sm text-paper-500">
                                Made with ❤️ by <span className="font-bold text-accent-primary">양승민</span>
                            </p>
                        </div>
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
                        <div className="bg-white rounded-xl shadow-lg border border-paper-200 p-6 text-center">
                            <h3 className="text-lg font-bold mb-4 text-paper-900">관리자 메뉴</h3>
                            <button
                                onClick={startGame}
                                className="bg-paper-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-all active:scale-[0.98]"
                            >
                                처음부터 다시 시작 (Reset)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Regular Results View (Tier List or Hunmin)
    return (
        <div className="min-h-screen bg-paper-100 text-paper-900 p-8 font-sans">
            <header className="max-w-6xl mx-auto text-center mb-12 pt-8">
                <h1 className="text-4xl font-serif font-bold text-paper-900 mb-2">
                    {gameState.currentGame === 'tier' ? '티어리스트 게임 결과' :
                        gameState.currentGame === 'hunmin' ? '훈민정음 게임 결과' : '중간 결과'}
                </h1>
                <p className="text-paper-500">
                    현재까지의 누적 점수 순위입니다.
                </p>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ranking Table */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl shadow-card border border-paper-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-paper-50 border-b border-paper-200 text-xs text-paper-500 uppercase tracking-wider">
                                    <th className="p-4 font-medium w-16 text-center">Rank</th>
                                    <th className="p-4 font-medium">Team</th>
                                    {gameState.currentGame === 'tier' && (
                                        <>
                                            <th className="p-4 font-medium text-center">R1</th>
                                            <th className="p-4 font-medium text-center">R2</th>
                                            <th className="p-4 font-medium text-center">R3</th>
                                        </>
                                    )}
                                    <th className="p-4 font-medium text-right bg-paper-100/50">Total Score</th>
                                    {gameState.currentGame === 'tier' && <th className="p-4 w-10"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-paper-100">
                                {sortedTeams.map((team, index) => (
                                    <React.Fragment key={team.name}>
                                        <tr
                                            className={`hover:bg-paper-50 transition-colors ${gameState.currentGame === 'tier' ? 'cursor-pointer' : ''} ${expandedTeam === team.name ? 'bg-paper-50' : ''}`}
                                            onClick={() => gameState.currentGame === 'tier' && toggleExpand(team.name)}
                                        >
                                            <td className="p-4 text-center">
                                                <span className={`
                                                    inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                                    ${index === 0 ? 'bg-accent-secondary text-white' :
                                                        index === 1 ? 'bg-paper-400 text-white' :
                                                            index === 2 ? 'bg-paper-300 text-white' : 'text-paper-400 bg-paper-100'}
                                                `}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-paper-900 flex items-center gap-2">
                                                {team.name}
                                                {index === 0 && gameState.currentGame === 'pitch' && (
                                                    <span className="text-xl">👑</span>
                                                )}
                                            </td>

                                            {gameState.currentGame === 'tier' && (
                                                <>
                                                    <td className="p-4 text-center text-paper-500 text-sm font-mono">{teamScoresByRound[team.name]['ice_cream']?.toFixed(0)}</td>
                                                    <td className="p-4 text-center text-paper-500 text-sm font-mono">{teamScoresByRound[team.name]['snacks']?.toFixed(0)}</td>
                                                    <td className="p-4 text-center text-paper-500 text-sm font-mono">{teamScoresByRound[team.name]['ramen']?.toFixed(0)}</td>
                                                </>
                                            )}

                                            <td className="p-4 text-right font-mono font-bold text-accent-primary bg-paper-100/30 text-lg">{team.score.toFixed(1)}</td>

                                            {gameState.currentGame === 'tier' && (
                                                <td className="p-4 text-center text-paper-300 text-xs">
                                                    {expandedTeam === team.name ? '▲' : '▼'}
                                                </td>
                                            )}
                                        </tr>
                                        {gameState.currentGame === 'tier' && expandedTeam === team.name && (
                                            <tr>
                                                <td colSpan={7} className="p-0">
                                                    <div className="bg-paper-50 p-6 border-b border-paper-200">
                                                        <div className="flex gap-2 mb-4 border-b border-paper-200 pb-2">
                                                            {ROUND_IDS.map(rid => (
                                                                <button
                                                                    key={rid}
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedRoundId(rid); }}
                                                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors
                                                                        ${selectedRoundId === rid
                                                                            ? 'bg-paper-900 text-white shadow-sm'
                                                                            : 'bg-white border border-paper-200 text-paper-500 hover:bg-paper-100'}
                                                                    `}
                                                                >
                                                                    {ROUND_TITLES[rid]}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <TierListDisplay
                                                            teamName={team.name}
                                                            roundId={selectedRoundId}
                                                            submissions={gameState.submissions}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Quiz History Table (For Hunmin & Pitch) */}
                    {(gameState.currentGame === 'hunmin' || gameState.currentGame === 'pitch') && (
                        <div className="bg-white rounded-xl shadow-card border border-paper-200 overflow-hidden">
                            <div className="p-4 bg-paper-50 border-b border-paper-200 font-bold text-paper-700">
                                📜 득점 기록 ({gameState.currentGame === 'hunmin' ? '훈민정음' : '청개구리 절대음감'})
                            </div>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-paper-50 text-paper-400 text-xs uppercase sticky top-0">
                                        <tr>
                                            <th className="p-3">팀</th>
                                            <th className="p-3">제시어</th>
                                            <th className="p-3 text-right">점수</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-paper-100">
                                        {gameState.quizHistory
                                            .filter(h => h.game === gameState.currentGame)
                                            .sort((a, b) => a.quizIndex - b.quizIndex)
                                            .map((log, idx) => (
                                                <tr key={idx} className="hover:bg-paper-50">
                                                    <td className="p-3 font-bold text-paper-700">{log.team}</td>
                                                    <td className="p-3 text-paper-900 font-medium">
                                                        {log.question}
                                                    </td>
                                                    <td className={`p-3 text-right font-bold ${log.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                        {log.points > 0 ? '+' : ''}{log.points}
                                                    </td>
                                                </tr>
                                            ))}
                                        {gameState.quizHistory.filter(h => h.game === gameState.currentGame).length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center text-paper-400 italic">아직 득점 기록이 없습니다.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {isAdmin && (
                        <div className="bg-white p-6 rounded-xl shadow-card border border-paper-200">
                            <h3 className="text-lg font-bold mb-2 text-paper-900">관리자 메뉴</h3>
                            <p className="text-paper-500 text-sm mb-4">
                                {gameState.currentGame === 'tier' ? '다음 게임(훈민정음)으로 진행합니다.' :
                                    gameState.currentGame === 'hunmin' ? '다음 게임(절대음감)으로 진행합니다.' :
                                        '모든 게임이 종료되었습니다.'}
                            </p>

                            {gameState.currentGame !== 'pitch' ? (
                                <button
                                    onClick={nextOne}
                                    className="w-full bg-accent-primary hover:bg-[#c55b42] text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-all active:scale-[0.98] mb-2"
                                >
                                    다음 게임 시작하기 &rarr;
                                </button>
                            ) : (
                                <div className="text-center p-4 bg-paper-100 rounded-lg text-paper-500 font-bold mb-2">
                                    수고하셨습니다!
                                </div>
                            )}

                            <button
                                onClick={startGame}
                                className="w-full bg-paper-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-all active:scale-[0.98]"
                            >
                                처음부터 다시 시작 (Reset)
                            </button>
                        </div>
                    )}

                    <div className="bg-paper-200/50 p-6 rounded-xl border border-paper-200">
                        <h3 className="text-sm font-bold mb-2 text-paper-800 uppercase tracking-wider">Scoring Info</h3>
                        <p className="text-paper-600 text-sm leading-relaxed">
                            {gameState.currentGame === 'tier' ? (
                                "각 라운드의 점수는 전체 참가팀의 평균 티어와 개인 팀의 티어 간 거리 차이를 역산하여 매겨집니다. 평균과 가까울수록 높은 점수를 획득합니다."
                            ) : (
                                "퀴즈의 정답을 맞춘 팀에게 관리자가 점수를 부여합니다."
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tier List Display Component
const TierListDisplay = ({ teamName, roundId, submissions }: { teamName: string, roundId: string, submissions: Record<string, Record<string, Ranking>> }) => {
    const roundSubs = submissions[roundId];
    if (!roundSubs || !roundSubs[teamName]) {
        return <div className="text-paper-400 italic text-sm p-2">기록 없음</div>;
    }

    const tierMap: Record<string, { item: Item, index: number }[]> = { Goat: [], S: [], A: [], B: [], C: [] };
    const itemList = GAME_ROUNDS.find(r => r.id === roundId)?.items || [];
    const idToItem = (id: string) => itemList.find(i => i.id === id);

    Object.entries(roundSubs[teamName]).forEach(([itemId, val]) => {
        const { tier, index } = val; // val is RankingItem
        const item = idToItem(itemId);
        if (tierMap[tier] && item) {
            tierMap[tier].push({ item, index });
        }
    });

    // Sort by index for display
    Object.keys(tierMap).forEach(key => {
        tierMap[key].sort((a, b) => a.index - b.index);
    });

    // Same color classes as Game.tsx
    const tierColors: Record<Tier, string> = {
        'Goat': 'bg-red-100 text-red-800',
        'S': 'bg-orange-100 text-orange-800',
        'A': 'bg-yellow-100 text-yellow-800',
        'B': 'bg-green-100 text-green-800',
        'C': 'bg-cyan-100 text-cyan-800',
    };

    return (
        <div className="space-y-2 select-none">
            {TIERS.map(tier => (
                <div key={tier} className="flex shadow-sm rounded-lg overflow-hidden border border-paper-200">
                    <div className={`w-16 sm:w-24 flex-shrink-0 flex items-center justify-center font-bold text-lg sm:text-xl text-paper-900 ${tierColors[tier]} bg-opacity-20 border-r border-paper-200/50`}>
                        {tier}
                    </div>
                    <div className="flex-grow bg-paper-50 min-h-[4rem] p-1 flex flex-wrap items-center content-center transition-colors">
                        {tierMap[tier].length > 0 ? (
                            tierMap[tier].map(({ item }) => (
                                <div
                                    key={item.id}
                                    className="
                                        relative group
                                        bg-white border border-paper-200 text-paper-700
                                        rounded-md text-[10px] sm:text-xs font-semibold
                                        flex flex-col items-center justify-center text-center
                                        h-20 w-20 sm:h-24 sm:w-24 m-0.5 sm:m-1 overflow-hidden shadow-sm
                                    "
                                >
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-12 sm:h-16 object-cover pointer-events-none mb-1 opacity-90"
                                        />
                                    )}
                                    <span className="px-1 truncate w-full">{item.name}</span>
                                    {/* Rank Badge */}
                                    <div className="absolute top-0 left-0 bg-paper-900 text-white text-[8px] px-1 rounded-br-md opacity-20">
                                        {tier}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <span className="text-paper-300 text-xs w-full text-center italic opacity-50">-</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
