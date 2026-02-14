import type { Player } from '../hooks/useGame';

interface SquareProps {
    value: Player;
    onClick: () => void;
    isWinningSquare: boolean;
}

export function Square({ value, onClick, isWinningSquare }: SquareProps) {
    return (
        <button
            className={`w-24 h-24 text-4xl font-bold flex items-center justify-center border-2 rounded-lg 
        transition-all duration-200 hover:bg-gray-700
        ${isWinningSquare ? 'bg-green-600 border-green-400 text-white' : 'bg-gray-800 border-gray-600 text-gray-200'}
        ${value === 'Goat' ? 'text-blue-400' : 'text-yellow-400'}
      `}
            onClick={onClick}
        >
            {value === 'Goat' ? '🐐' : value === 'Oat' ? '🌾' : null}
        </button>
    );
}
