import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ADMIN_NAME } from '../types/game';

export const Lobby: React.FC = () => {
    const { joinGame, isAdmin, startGame, gameState, myTeamName, removeTeam } = useGame();
    const [name, setName] = useState('');

    const handleJoin = () => {
        if (name.trim()) {
            joinGame(name.trim());
        }
    };

    const isJoined = !!myTeamName;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 font-sans">
            <img src="/assets/items/서울대학교.png" alt="Seoul National University Logo" className="w-24 h-24 mb-4 object-contain" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2 text-paper-900 tracking-tight text-center">미리배움터 레크리에이션</h1>
            <p className="text-paper-500 mb-8 text-lg font-medium">서울대학교 미리배움터 13조</p>

            {/* Game Overview Timeline */}
            <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-paper-200 mb-8 animate-fade-in">
                <h3 className="text-sm font-bold text-paper-400 uppercase tracking-wider mb-4 border-b border-paper-100 pb-2 text-center">오늘의 게임 순서</h3>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">

                    <div className="flex-1 flex flex-col items-center p-3 hover:bg-paper-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl font-bold mb-2">1</div>
                        <h4 className="font-bold text-paper-800">밸런스 티어 게임</h4>
                        <p className="text-xs text-paper-500 mt-1">팀원 간의 취향 합의점 찾기<br />(총 3라운드)</p>
                    </div>

                    <div className="hidden md:block text-paper-300">➜</div>

                    <div className="flex-1 flex flex-col items-center p-3 hover:bg-paper-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-2">2</div>
                        <h4 className="font-bold text-paper-800">훈민정음 퀴즈</h4>
                        <p className="text-xs text-paper-500 mt-1">순발력과 어휘력 대결<br />(선착순 10문제)</p>
                    </div>

                    <div className="hidden md:block text-paper-300">➜</div>

                    <div className="flex-1 flex flex-col items-center p-3 hover:bg-paper-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl font-bold mb-2">3</div>
                        <h4 className="font-bold text-paper-800">청개구리 절대음감</h4>
                        <p className="text-xs text-paper-500 mt-1">집중력과 순발력 테스트<br />(거꾸로 말하기 10문제)</p>
                    </div>

                </div>
            </div>

            {!isJoined ? (
                <div className="bg-white p-8 rounded-xl shadow-card w-full max-w-md border border-paper-200">
                    <h2 className="text-xl font-semibold mb-6 text-paper-800">팀 참가</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-paper-500 mb-1 uppercase tracking-wider">Team Name</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-paper-50 border border-paper-300 rounded-lg focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all text-paper-900 placeholder-paper-400"
                                placeholder="팀 이름을 입력하세요"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            />
                        </div>
                        <button
                            onClick={handleJoin}
                            className="w-full bg-paper-900 hover:bg-black text-white font-medium py-3 rounded-lg shadow-sm transition-all transform active:scale-[0.98]"
                        >
                            참가하기
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-2xl text-center">
                    <div className="bg-white p-8 rounded-xl shadow-card border border-paper-200 mb-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-serif font-bold text-paper-900 mb-2">대기실</h2>
                            <p className="text-paper-500 text-sm">다른 팀들이 참가하기를 기다리는 중입니다.</p>
                        </div>

                        <div className="border-t border-paper-200 pt-6">
                            <div className="flex justify-between items-end mb-4 px-2">
                                <h3 className="text-xs font-bold text-paper-400 uppercase tracking-wider">참가한 팀 ({gameState.teams.length})</h3>
                                <div className="text-xs text-paper-400">
                                    내 팀: <span className="text-accent-primary font-bold">{myTeamName}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {gameState.teams.map((team, idx) => (
                                    <div
                                        key={idx}
                                        className={`
                                            p-3 rounded-md text-sm font-medium border transition-colors relative group
                                            ${team.name === myTeamName
                                                ? 'bg-paper-100 border-accent-secondary text-paper-900'
                                                : 'bg-paper-50 border-paper-200 text-paper-600'}
                                        `}
                                    >
                                        {team.name} {team.name === ADMIN_NAME && <span className="text-xs text-accent-primary ml-1">(Admin)</span>}

                                        {isAdmin && team.name !== ADMIN_NAME && (
                                            <button
                                                onClick={() => {
                                                    if (confirm(`'${team.name}' 팀을 정말로 추방하시겠습니까?`)) {
                                                        removeTeam(team.name);
                                                    }
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                                title="팀 추방"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="bg-paper-100 p-6 rounded-xl border border-paper-300 text-left relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-accent-primary"></div>
                            <h3 className="text-lg font-bold text-paper-900 mb-1">관리자 제어 패널</h3>
                            <p className="text-paper-500 text-sm mb-4">모든 팀이 준비되면 게임을 시작하세요.</p>
                            <button
                                onClick={startGame}
                                className="bg-accent-primary hover:bg-[#c55b42] text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-transform active:scale-[0.98]"
                            >
                                게임 시작
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
