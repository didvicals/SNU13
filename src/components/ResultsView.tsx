import { useState } from 'react';
import { TIER_SCORES, ITEMS } from '../types/game';
import type { PlayerSubmission, Tier, Item } from '../types/game';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { GraduationCap, CheckCircle2, Trophy, Play, ArrowRight, Gift } from 'lucide-react';

interface ResultsViewProps {
    submissions: PlayerSubmission[];
    items: Item[];
    roundInfo: { theme: string };
    isLastRound: boolean;
    onNextRound: () => void;
    onRestart: () => void;
}

export function ResultsView({ submissions, items, roundInfo, isLastRound, onNextRound, onRestart }: ResultsViewProps) {
    const [isRevealed, setIsRevealed] = useState(false);

    // 1. Calculate Average Score for each Item
    const itemConsensusScores: Record<string, number> = {};

    ITEMS.forEach(item => {
        let totalScore = 0;
        let validSubmissions = 0;
        submissions.forEach(sub => {
            if (sub.rankings) {
                const tier = sub.rankings[item.id] || 'XOAT';
                totalScore += TIER_SCORES[tier];
                validSubmissions++;
            }
        });
        itemConsensusScores[item.id] = validSubmissions > 0 ? totalScore / validSubmissions : TIER_SCORES['XOAT'];
    });

    // 2. Calculate Distance for each Team
    const teamResults = submissions.map(sub => {
        let totalDistance = 0;
        items.forEach(item => {
            const teamTier = (sub.rankings && sub.rankings[item.id]) || 'XOAT';
            const teamScore = TIER_SCORES[teamTier];
            const consensusScore = itemConsensusScores[item.id];
            totalDistance += Math.abs(teamScore - consensusScore);
        });
        return {
            ...sub,
            totalDistance,
        };
    });

    // 3. Determine Winner (Lowest Distance)
    const sortedTeams = [...teamResults].sort((a, b) => a.totalDistance - b.totalDistance);
    const winner = sortedTeams[0];

    // Helper to get Tier from Score (rounded)
    const getConsensusTier = (score: number): Tier => {
        const rounded = Math.round(score);
        return (Object.keys(TIER_SCORES) as Tier[]).find(t => TIER_SCORES[t] === rounded) || 'XOAT';
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 md:p-8 space-y-10 animate-fade-in pb-20">
            <div className="text-center space-y-3 relative z-10">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <GraduationCap className="w-10 h-10 text-blue-500" />
                    <span className="text-blue-400 font-black tracking-widest text-xs border border-blue-500/30 px-3 py-1 rounded-full bg-blue-500/5">미리배움터 13조</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 py-2 leading-tight">
                    {roundInfo.theme} <br /> 결과 발표
                </h2>
                <p className="text-gray-500 text-lg font-medium">모든 팀의 랭킹이 성공적으로 집계되었습니다.</p>
            </div>

            {!isRevealed ? (
                <div className="bg-gray-900/40 border border-gray-800/80 p-16 rounded-[40px] text-center space-y-8 shadow-3xl backdrop-blur-xl relative overflow-hidden group w-full max-w-2xl">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-30" />
                    <div className="space-y-4 relative z-10">
                        <h3 className="text-3xl font-black text-white italic">RESULTS ARE READY!</h3>
                        <p className="text-gray-400 font-medium">과연 어떤 팀이 이번 라운드의 랭킹 마스터가 되었을까요?</p>
                    </div>
                    <button
                        onClick={() => setIsRevealed(true)}
                        className="group relative px-12 py-5 bg-white text-black font-black text-2xl rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="flex items-center gap-3">
                            순위 확인하기 <CheckCircle2 className="w-7 h-7" />
                        </span>
                        <div className="absolute inset-0 rounded-2xl bg-white blur-2xl opacity-10 group-hover:opacity-30 transition-opacity -z-10" />
                    </button>
                </div>
            ) : (
                <>
                    {/* Winner Display */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border-2 border-yellow-500/40 p-12 rounded-[50px] text-center shadow-3xl relative overflow-hidden w-full backdrop-blur-xl"
                    >
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 blur-3xl rounded-full" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-500/10 blur-3xl rounded-full" />

                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-500 text-xs font-black tracking-tighter mb-6">
                            <Trophy className="w-3.5 h-3.5" /> THE GOAT TEAM
                        </div>
                        <h3 className="text-3xl font-black text-yellow-500/70 mb-4 tracking-tighter">이번 라운드 우승팀!</h3>
                        <p className="text-7xl md:text-9xl font-black text-white mb-8 tracking-tight drop-shadow-2xl">{winner.teamName}</p>

                        <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl inline-block">
                            <p className="text-yellow-100/90 text-lg font-medium leading-relaxed">
                                전체 컨센서스와 평균 오차 단 <span className="text-yellow-400 font-black">{winner.totalDistance.toFixed(2)}pt</span>를 기록했습니다!
                            </p>
                        </div>
                    </motion.div>

                    {/* Detailed Team Standings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {sortedTeams.map((team, index) => (
                            <div key={team.teamName} className={cn(
                                "p-6 rounded-3xl border-2 flex flex-col gap-4 transition-all hover:translate-y-[-4px]",
                                index === 0 ? "bg-yellow-900/10 border-yellow-500/30 ring-4 ring-yellow-500/5" : "bg-gray-800/30 border-gray-800/50"
                            )}>
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 font-black uppercase mb-1">Rank #{index + 1}</span>
                                        <span className="font-black text-2xl text-white truncate max-w-[150px]">{team.teamName}</span>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-xl text-xs font-mono font-bold",
                                        index === 0 ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-800 text-gray-400"
                                    )}>
                                        {team.totalDistance.toFixed(2)} diff
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Consensus List Review */}
                    <div className="w-full bg-gray-900/30 rounded-[40px] border border-gray-800/80 p-10 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-gray-100 tracking-tight">{roundInfo.theme} 컨센서스</h3>
                            <span className="text-[10px] text-gray-600 font-black tracking-widest uppercase bg-white/5 px-3 py-1 rounded-full">Aggregation Data</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {items.map(item => {
                                const avgScore = itemConsensusScores[item.id];
                                const tier = getConsensusTier(avgScore);
                                // Find full item metadata with icon
                                const fullItem = ITEMS.find(i => i.id === item.id);
                                const Icon = fullItem?.icon || Gift;

                                return (
                                    <div key={item.id} className="flex flex-col items-center p-5 bg-gray-800/40 border border-gray-700/30 rounded-3xl transition-all hover:bg-gray-800">
                                        <Icon className="w-7 h-7 text-blue-400 mb-3" />
                                        <span className="text-sm font-black text-center text-gray-200 line-clamp-1">{item.name}</span>
                                        <div className="mt-4 w-full h-0.5 bg-gray-700/50 rounded-full" />
                                        <div className="mt-4 flex flex-col items-center gap-1">
                                            <span className={cn(
                                                "text-lg font-black",
                                                tier === 'GOAT' ? "text-purple-400" : "text-gray-400"
                                            )}>{tier}</span>
                                            <span className="text-[10px] font-mono text-gray-600">{avgScore.toFixed(1)}pt</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                        {!isLastRound && (
                            <button
                                onClick={onNextRound}
                                className="px-12 py-5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                            >
                                다음 게임 시작하기 <ArrowRight className="w-6 h-6" />
                            </button>
                        )}
                        <button
                            onClick={onRestart}
                            className="px-12 py-5 bg-gray-800 hover:bg-gray-700 border border-gray-700/50 text-gray-400 hover:text-white rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 group"
                        >
                            게임 전체 초기화
                            <Play className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </>
            )}

            <button
                onClick={onRestart}
                className="mt-10 px-12 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700/50 text-gray-400 hover:text-white rounded-2xl font-black text-lg shadow-xl transition-all flex items-center gap-2 group"
            >
                새로운 게임 시작하기
                <Play className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>

            <footer className="mt-20 opacity-30 flex flex-col items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                <p className="text-xs font-black tracking-[0.2em]">MIRIBEUMTUR 13 · SNU</p>
            </footer>
        </div>
    );
}
