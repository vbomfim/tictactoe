/**
 * AIPlayer — AI opponent with 3 difficulty levels.
 * Depends on TicTacToe.GameLogic (pure functions). [SOLID-DIP]
 *
 * - Easy: random available move
 * - Medium: 50% minimax, 50% random
 * - Hard: full minimax (unbeatable)
 *
 * @namespace TicTacToe.AIPlayer
 */
var TicTacToe = TicTacToe || {};

TicTacToe.AIPlayer = (function () {
    'use strict';

    var logic = TicTacToe.GameLogic;

    /**
     * Get the opponent marker.
     * @param {string} player - 'X' or 'O'
     * @returns {string}
     */
    function opponent(player) {
        return player === 'X' ? 'O' : 'X';
    }

    /**
     * Minimax algorithm with alpha-beta pruning.
     * Returns the best score for the maximizing player.
     *
     * @param {Array<string|null>} board - Current board state
     * @param {boolean} isMaximizing - True if current turn is the AI
     * @param {string} aiSide - Which side the AI plays ('X' or 'O')
     * @param {number} depth - Current recursion depth (for tie-breaking)
     * @param {number} alpha - Alpha bound
     * @param {number} beta - Beta bound
     * @returns {number} Score: +10 if AI wins, -10 if opponent wins, 0 for draw
     */
    function minimax(board, isMaximizing, aiSide, depth, alpha, beta) {
        var result = logic.checkWinner(board);
        if (result.winner === aiSide) return 10 - depth;
        if (result.winner === opponent(aiSide)) return depth - 10;
        if (logic.getAvailableMoves(board).length === 0) return 0;

        var moves = logic.getAvailableMoves(board);
        var bestScore;

        if (isMaximizing) {
            bestScore = -Infinity;
            for (var i = 0; i < moves.length; i++) {
                board[moves[i]] = aiSide;
                var score = minimax(board, false, aiSide, depth + 1, alpha, beta);
                board[moves[i]] = null;
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        } else {
            bestScore = Infinity;
            for (var j = 0; j < moves.length; j++) {
                board[moves[j]] = opponent(aiSide);
                var s = minimax(board, true, aiSide, depth + 1, alpha, beta);
                board[moves[j]] = null;
                bestScore = Math.min(bestScore, s);
                beta = Math.min(beta, s);
                if (beta <= alpha) break;
            }
        }

        return bestScore;
    }

    /**
     * Get the best move using minimax.
     * @param {Array<string|null>} board
     * @param {string} aiSide
     * @returns {number} Cell index (0-8)
     */
    function getBestMove(board, aiSide) {
        var moves = logic.getAvailableMoves(board);
        var bestScore = -Infinity;
        var bestMove = moves[0];

        for (var i = 0; i < moves.length; i++) {
            board[moves[i]] = aiSide;
            var score = minimax(board, false, aiSide, 0, -Infinity, Infinity);
            board[moves[i]] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = moves[i];
            }
        }

        return bestMove;
    }

    /**
     * Get a random available move.
     * @param {Array<string|null>} board
     * @returns {number} Cell index (0-8)
     */
    function getRandomMove(board) {
        var moves = logic.getAvailableMoves(board);
        return moves[Math.floor(Math.random() * moves.length)];
    }

    /**
     * Get AI's chosen move based on difficulty.
     * @param {Array<string|null>} board - Current board (will NOT be mutated)
     * @param {string} difficulty - 'easy' | 'medium' | 'hard'
     * @param {string} aiSide - 'X' | 'O'
     * @returns {number} Cell index (0-8), guaranteed to be an available cell
     */
    function getMove(board, difficulty, aiSide) {
        // Work on a copy to avoid side effects [CLEAN-CODE]
        var boardCopy = board.slice();

        switch (difficulty) {
            case 'easy':
                return getRandomMove(boardCopy);
            case 'medium':
                return Math.random() < 0.5
                    ? getBestMove(boardCopy, aiSide)
                    : getRandomMove(boardCopy);
            case 'hard':
                return getBestMove(boardCopy, aiSide);
            default:
                return getRandomMove(boardCopy);
        }
    }

    return {
        getMove: getMove
    };
})();
