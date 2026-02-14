import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TIERS } from '../types/game';
import type { Tier } from '../types/game';
import { TierRow } from './TierRow';
import { DraggableItem } from './DraggableItem';
import { ResultsView } from './ResultsView';
import { Loader2, CheckCircle2, GraduationCap, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { socket } from '../lib/socket';

type Phase = 'SETUP' | 'TEAM_NAME_INPUT' | 'LOBBY' | 'TEAM_INPUT' | 'WAITING' | 'RESULTS';

interface ServerState {
    phase: string;
    currentRound: number;
    teams: { id: string, name: string, rankings: any }[];
    results: any;
    roundInfo: {
        theme: string;
        items: any[];
    };
    roomCode: string;
}

export function GameManager() {
    const [phase, setPhase] = useState<Phase>('TEAM_NAME_INPUT');
    const [myTeamName, setMyTeamName] = useState('');
    const [tempTeamName, setTempTeamName] = useState('');
    const [serverState, setServerState] = useState<ServerState | null>(null);

    const [itemsPool, setItemsPool] = useState<string[]>([]);
    const [rankings, setRankings] = useState<Record<Tier, string[]>>({
        GOAT: [], S: [], A: [], B: [], C: [], XOAT: []
    });
    const [activeId, setActiveId] = useState<string | null>(null);

    // Socket Listeners
    useEffect(() => {
        socket.on('gameStateUpdate', (state: ServerState) => {
            setServerState(prev => {
                // If round changed, reset pool and rankings
                if (state.roundInfo?.items && state.currentRound !== (prev?.currentRound || 0)) {
                    setItemsPool(state.roundInfo.items.map((i: any) => i.id));
                    setRankings({
                        GOAT: [], S: [], A: [], B: [], C: [], XOAT: []
                    });
                }
                return state;
            });

            // Phase synchronization
            if (state.phase === 'RESULTS' && myTeamName === '양승민') {
                setPhase('RESULTS');
            } else if (state.phase === 'LOBBY' && (phase === 'WAITING' || phase === 'RESULTS' || phase === 'TEAM_INPUT')) {
                setPhase('LOBBY');
            }
        });

        return () => {
            socket.off('gameStateUpdate');
        };
    }, [phase, myTeamName]);

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;
        const itemId = active.id as string;
        const targetTier = over.id as Tier | 'POOL';

        if (itemsPool.includes(itemId)) {
            setItemsPool(prev => prev.filter(id => id !== itemId));
        }
        const prevTier = (Object.keys(rankings) as Tier[]).find(t => rankings[t].includes(itemId));
        if (prevTier) {
            setRankings(prev => ({
                ...prev,
                [prevTier]: prev[prevTier].filter(id => id !== itemId)
            }));
        }
        if (TIERS.includes(targetTier as Tier)) {
            setRankings(prev => ({
                ...prev,
                [targetTier as Tier]: [...prev[targetTier as Tier], itemId]
            }));
        } else if (targetTier === 'POOL') {
            setItemsPool(prev => [...prev, itemId]);
        }
    };

    const handleJoinGame = () => {
        if (!tempTeamName.trim()) return;
        setMyTeamName(tempTeamName);
        socket.emit('joinGame', { teamName: tempTeamName });
        setPhase('LOBBY');
    };

    const startRanking = () => {
        setPhase('TEAM_INPUT');
    };

    const handleSubmitRankings = () => {
        const currentRankingMap: Record<string, Tier> = {};
        (Object.keys(rankings) as Tier[]).forEach(tier => {
            rankings[tier].forEach(itemId => {
                currentRankingMap[itemId] = tier;
            });
        });
        socket.emit('submitRankings', currentRankingMap);
        setPhase('WAITING');
    };

    const handleRevealResults = () => {
        socket.emit('revealResults');
    };

    const handleNextRound = () => {
        socket.emit('nextRound');
    };

    const handleReset = () => {
        socket.emit('resetGame');
        setPhase('TEAM_NAME_INPUT');
        setMyTeamName('');
        setTempTeamName('');
        setRankings({ GOAT: [], S: [], A: [], B: [], C: [], XOAT: [] });
        setItemsPool([]);
        setServerState(null);
    };

    if (phase === 'TEAM_NAME_INPUT') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-fade-in text-center p-6">
                <div className="relative mb-8">
                    <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
                    <GraduationCap className="w-24 h-24 text-blue-500 mb-6 relative mx-auto" strokeWidth={1.5} />
                    <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text leading-tight">
                        티어리스트 게임
                    </h1>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-900/40 border border-blue-500/30 rounded-full text-blue-400 text-sm font-bold tracking-wider">
                        서울대학교 미리배움터 13조
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-gray-100 italic">TEAM NAME</h2>
                    <p className="text-gray-400 font-medium px-4">참여할 팀의 이름을 입력해 주세요 (예: 13조_승민팀)</p>
                </div>
                <div className="w-full max-w-sm relative px-4">
                    <input
                        type="text"
                        value={tempTeamName}
                        onChange={(e) => setTempTeamName(e.target.value)}
                        placeholder="팀 이름을 입력하세요..."
                        className="w-full px-8 py-5 bg-gray-800/50 border-2 border-gray-700/50 rounded-2xl text-white text-2xl text-center focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-600"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && tempTeamName.trim() && handleJoinGame()}
                    />
                </div>
                <button
                    onClick={handleJoinGame}
                    disabled={!tempTeamName.trim()}
                    className={cn(
                        "px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-xl",
                        tempTeamName.trim() ? "bg-white text-black hover:scale-105 active:scale-95" : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700/50 shadow-none"
                    )}
                >
                    입장하기
                </button>
                <footer className="fixed bottom-8 text-gray-600 font-medium text-sm tracking-widest pb-safe">
                    © SNU MIRIBEUMTUR TEAM 13
                </footer>
            </div>
        );
    }

    if (phase === 'LOBBY' || phase === 'WAITING') {
        const hasSubmitted = phase === 'WAITING';
        const readyTeams = serverState?.teams.filter(t => t.rankings !== null).length || 0;
        const totalTeams = serverState?.teams.length || 0;
        const isHost = myTeamName === '양승민';

        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-8 animate-fade-in text-center p-4">
                <div className="p-8 bg-gray-900/40 border border-gray-800/80 rounded-[40px] w-full max-w-xl space-y-10 shadow-3xl backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <GraduationCap className="w-32 h-32" />
                    </div>

                    <div className="space-y-3 relative z-10">
                        <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-black tracking-tighter mb-2 uppercase">
                            Miribeumtur 13 - Game Lobby
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight">
                            대기 공간
                        </h2>
                        <p className="text-gray-500 font-medium text-sm">팀원들이 접속하고 랭킹을 완료할 때까지 기다려 주세요.</p>
                    </div>

                    <div className="space-y-4 max-h-[40vh] overflow-y-auto px-4 custom-scrollbar">
                        {serverState?.teams.map(t => (
                            <div key={t.name} className="flex justify-between items-center p-5 bg-gray-800/40 border-2 border-gray-800/50 rounded-3xl transition-all hover:bg-gray-800/60 group">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full ring-4",
                                        t.rankings ? "bg-emerald-500 ring-emerald-500/10 animate-pulse" : "bg-gray-600 ring-gray-600/10"
                                    )} />
                                    <span className={cn("font-black text-lg md:text-xl", t.name === myTeamName ? "text-blue-400" : "text-gray-100")}>
                                        {typeof t.name === 'string' ? t.name : JSON.stringify(t.name)} {t.name === myTeamName && <span className="text-xs font-medium ml-1 opacity-50">(나)</span>}
                                        {t.name === '양승민' && <span className="ml-2 text-[10px] text-purple-400 border border-purple-400/30 px-3 py-1 rounded-full bg-purple-400/5">MANAGER</span>}
                                    </span>
                                </div>
                                {t.rankings ? (
                                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full text-xs font-black border border-emerald-500/20">
                                        SUBMITTED <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-500 px-4 py-1.5 rounded-full text-xs font-bold bg-white/5">
                                        RANKING <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {totalTeams === 0 && (
                            <div className="py-12 text-gray-600 font-bold italic opacity-30">현재 접속한 팀이 없습니다.</div>
                        )}
                    </div>

                    <div className="pt-8 border-t border-gray-800/50 space-y-6">
                        <div className="flex justify-between items-center text-xs px-4">
                            <span className="text-gray-500 font-bold tracking-widest uppercase">Participation Status</span>
                            <span className="text-white font-mono font-black bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded-lg">
                                {readyTeams} / {totalTeams} Teams
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {!hasSubmitted ? (
                                <button
                                    onClick={startRanking}
                                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl rounded-3xl hover:shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    랭킹 시작하기
                                </button>
                            ) : (
                                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-emerald-400 text-base font-black flex items-center justify-center gap-3">
                                    <CheckCircle2 className="w-6 h-6" /> 제출이 완료되었습니다!
                                </div>
                            )}

                            {isHost ? (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button
                                        onClick={handleRevealResults}
                                        disabled={readyTeams === 0}
                                        className={cn(
                                            "py-4 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-3",
                                            readyTeams > 0
                                                ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                                : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700/50"
                                        )}
                                    >
                                        <Trophy className="w-5 h-5" /> 결과 공개하기
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="py-4 bg-red-950/20 border-2 border-red-500/20 text-red-400 hover:bg-red-950/40 rounded-3xl font-black text-sm transition-all"
                                    >
                                        게임 초기화
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4 text-gray-500 text-sm font-medium flex flex-col items-center justify-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                                        {serverState?.phase === 'RESULTS'
                                            ? "운영자(양승민)가 결과를 취합하여 확인 중입니다..."
                                            : hasSubmitted
                                                ? "운영자(양승민)가 결과를 열 때까지 잠시만 기다려주세요."
                                                : "모든 아이템을 배치하면 실시간 순위가 반영됩니다."
                                        }
                                    </div>
                                    {serverState?.phase === 'RESULTS' && (
                                        <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-[10px] font-black animate-pulse">
                                            상태: 결과 분석 중
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'RESULTS' && serverState?.results) {
        return (
            <ResultsView
                submissions={serverState.teams
                    .filter(t => t.rankings !== null)
                    .map(t => ({
                        teamName: t.name,
                        rankings: t.rankings
                    }))}
                items={serverState.roundInfo?.items || []}
                roundInfo={serverState.roundInfo || { theme: '...' }}
                isLastRound={serverState.currentRound >= 3}
                onNextRound={handleNextRound}
                onRestart={handleReset}
            />
        );
    }

    const isBoardFull = itemsPool.length === 0;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col h-screen overflow-hidden">
                <header className="flex justify-between items-center mb-8 bg-gray-900/60 p-5 rounded-3xl border border-gray-800/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 ring-4 ring-blue-500/5">
                            <GraduationCap className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-[10px] text-blue-500 font-black tracking-widest uppercase mb-0.5 opacity-70">Team Interface</div>
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{myTeamName} 전용 화면</h2>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmitRankings}
                        disabled={!isBoardFull}
                        className={cn(
                            "px-8 py-3 rounded-2xl font-black transition-all shadow-xl",
                            isBoardFull
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 scale-100 active:scale-95"
                                : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-800 shadow-none"
                        )}
                    >
                        제출하기
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar pb-40">
                    {TIERS.map(tier => (
                        <TierRow key={tier} tier={tier} items={rankings[tier]} />
                    ))}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gray-950/80 border-t border-gray-800/50 backdrop-blur-2xl z-50 rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Unranked Items ({itemsPool.length})</p>
                            <div className="flex gap-1">
                                {serverState?.roundInfo?.items && [...Array(serverState.roundInfo.items.length)].map((_, i) => (
                                    <div key={i} className={cn(
                                        "w-2 h-1 rounded-full transition-all duration-500",
                                        i < (serverState.roundInfo.items.length - itemsPool.length) ? "bg-blue-500 w-4" : "bg-gray-800"
                                    )} />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3 min-h-[90px] p-1">
                            {itemsPool.map(id => (
                                <DraggableItem key={id} id={id} />
                            ))}
                            {itemsPool.length === 0 && (
                                <div className="w-full flex flex-col items-center justify-center text-emerald-500/50 font-black py-4 animate-pulse">
                                    <CheckCircle2 className="w-8 h-8 mb-1" />
                                    전부 배치되었습니다! 이제 제출 버튼을 눌러주세요.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? <DraggableItem id={activeId as string} isOverlay /> : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
