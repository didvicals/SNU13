import { useState } from 'react';

export type Player = 'Goat' | 'Oat' | null;



export function useGame() {
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);

    const calculateWinner = (squares: Player[]) => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: lines[i] };
            }
        }
        return null;
    };

    const handleClick = (i: number) => {
        const winnerInfo = calculateWinner(board);
        if (winnerInfo || board[i]) {
            return;
        }
        const nextSquares = board.slice();
        nextSquares[i] = xIsNext ? 'Goat' : 'Oat';
        setBoard(nextSquares);
        setXIsNext(!xIsNext);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
    };

    const winnerInfo = calculateWinner(board);
    const winner = winnerInfo?.winner || null;
    const winningLine = winnerInfo?.line || null;
    const isDraw = !winner && board.every((square) => square !== null);

    return {
        board,
        xIsNext,
        winner,
        winningLine,
        isDraw,
        handleClick,
        resetGame,
        currentPlayer: xIsNext ? 'Goat' : 'Oat',
    };
}
