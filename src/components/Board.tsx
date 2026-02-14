import { Square } from './Square';
import { useGame } from '../hooks/useGame';

export function Board() {
    const { board, handleClick, winner, winningLine, isDraw, resetGame, currentPlayer } = useGame();

    const status = winner
        ? `Winner: ${winner}!`
        : isDraw
            ? "It's a Draw!"
            : `Next player: ${currentPlayer}`;

    return (
        <div className="flex flex-col items-center gap-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-yellow-400 text-transparent bg-clip-text animate-pulse">
                Goat Game
            </h1>

            <div className="text-2xl font-semibold text-gray-200">
                {status}
            </div>

            <div className="grid grid-cols-3 gap-2 p-4 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
                {board.map((square, i) => (
                    <Square
                        key={i}
                        value={square}
                        onClick={() => handleClick(i)}
                        isWinningSquare={winningLine?.includes(i) ?? false}
                    />
                ))}
            </div>

            <button
                onClick={resetGame}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-white hover:scale-105 transition-transform shadow-lg hover:shadow-purple-500/50"
            >
                Reset Game
            </button>
        </div>
    );
}
