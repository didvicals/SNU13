import React from 'react';
import { useGame } from '../context/GameContext';

export const PitchGame: React.FC = () => {
    const { gameState, isAdmin, nextOne, awardPoint, myTeamName } = useGame();
    const { currentQuiz, currentQuizIndex, totalQuizCount, teams } = gameState;

    if (!currentQuiz) return <div className="min-h-screen flex items-center justify-center text-paper-500">Loading Quiz...</div>;

    // 5. Team Ordering: Fix the order of teams. They should not be reordered based on score.
    const displayTeams = [...teams];

    return (
        <div className="min-h-screen bg-paper-100 p-4 md:p-8 font-sans flex flex-col md:flex-row gap-8">

            {/* Left/Top Area: Quiz Prompt (Larger Area) */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] md:min-h-0">
                {!isAdmin && myTeamName && (
                    <div className="mb-4">
                        <span className="inline-block px-4 py-1 bg-accent-secondary text-white rounded-full text-sm font-bold shadow-sm">
                            팀: {myTeamName}
                        </span>
                    </div>
                )}
                <div className="inline-block px-4 py-1 bg-accent-primary text-white rounded-full text-sm font-bold mb-8 shadow-sm animate-fade-in uppercase tracking-wider">
                    청개구리 절대음감 퀴즈 ({currentQuizIndex + 1} / {totalQuizCount})
                </div>

                {/* 3. Central Prompt: Larger and cleaner */}
                <h1 className="text-6xl md:text-[8rem] font-black text-paper-900 tracking-tighter drop-shadow-sm mb-8 text-center leading-tight select-none">
                    {currentQuiz.question}
                </h1>

                {/* 2. Admin View: Remove answer example */}
                {/* Answer display removed as requested */}
            </div>

            {/* Right/Bottom Area: Team List & Controls (Fixed Position style) */}
            <div className={`
                w-full md:w-[400px] flex-shrink-0 
                flex flex-col gap-4 
                ${isAdmin ? '' : 'justify-end'}
            `}>
                {isAdmin ? (
                    <div className="bg-white p-6 rounded-xl border border-paper-200 shadow-xl h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-paper-800">참가 팀 관리</h3>
                            <button
                                onClick={nextOne}
                                className="bg-paper-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95"
                            >
                                다음 문제 &rarr;
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                            {displayTeams.map(team => (
                                <div key={team.name} className="flex items-center justify-between p-3 bg-paper-50 rounded-lg border border-paper-100">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${team.connected ? 'bg-green-400' : 'bg-gray-300'}`} />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-paper-700 text-sm">{team.name}</span>
                                            {/* 1. Score: 1 decimal place */}
                                            <span className="text-xs text-paper-400 font-mono">{team.score.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {/* 4. -10 Button */}
                                        <button
                                            onClick={() => awardPoint(team.name, -10)}
                                            className="bg-paper-200 hover:bg-paper-300 text-paper-700 text-xs px-2 py-1 rounded shadow-sm active:scale-95 font-bold transition-colors"
                                            title="-10점"
                                        >
                                            -10
                                        </button>
                                        <button
                                            onClick={() => awardPoint(team.name, 10)}
                                            className="bg-accent-primary hover:bg-[#c55b42] text-white text-xs px-2 py-1 rounded shadow-sm active:scale-95 font-bold transition-colors"
                                            title="+10점"
                                        >
                                            +10
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-paper-200 shadow-lg">
                        <h3 className="text-xs font-bold text-paper-400 uppercase tracking-wider mb-4 border-b border-paper-100 pb-2">실시간 점수</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {displayTeams.map((team) => (
                                <div key={team.name} className="flex justify-between items-center p-2 bg-white rounded border border-paper-100">
                                    <span className="font-bold text-paper-800 text-sm truncate max-w-[80px]">{team.name}</span>
                                    <span className="font-mono font-bold text-accent-primary text-sm">{team.score.toFixed(1)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
