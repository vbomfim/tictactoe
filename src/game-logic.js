/**
 * GameLogic — Pure functions for Tic Tac Toe rules.
 * Zero side effects. Stateless. [CLEAN-CODE] [SOLID-SRP]
 *
 * @namespace TicTacToe.GameLogic
 */
var TicTacToe = TicTacToe || {};

TicTacToe.GameLogic = (function () {
    'use strict';

    /** All 8 possible winning lines (indices into the flat board array). */
    var WIN_LINES = [
        [0, 1, 2], // top row
        [3, 4, 5], // middle row
        [6, 7, 8], // bottom row
        [0, 3, 6], // left column
        [1, 4, 7], // center column
        [2, 5, 8], // right column
        [0, 4, 8], // main diagonal
        [2, 4, 6]  // anti-diagonal
    ];

    /**
     * Check if there is a winner on the board.
     * @param {Array<string|null>} board - 9-element array of 'X', 'O', or null
     * @returns {{ winner: string|null, line: number[]|null }}
     */
    function checkWinner(board) {
        for (var i = 0; i < WIN_LINES.length; i++) {
            var line = WIN_LINES[i];
            var a = board[line[0]];
            var b = board[line[1]];
            var c = board[line[2]];
            if (a !== null && a === b && b === c) {
                return { winner: a, line: line };
            }
        }
        return { winner: null, line: null };
    }

    /**
     * Check if the game is a draw (board full, no winner).
     * @param {Array<string|null>} board
     * @returns {boolean}
     */
    function isDraw(board) {
        if (checkWinner(board).winner !== null) return false;
        return board.every(function (cell) { return cell !== null; });
    }

    /**
     * Get indices of all available (empty) cells.
     * @param {Array<string|null>} board
     * @returns {number[]}
     */
    function getAvailableMoves(board) {
        var moves = [];
        for (var i = 0; i < board.length; i++) {
            if (board[i] === null) moves.push(i);
        }
        return moves;
    }

    // Public API (Revealing Module Pattern)
    return {
        WIN_LINES: WIN_LINES,
        checkWinner: checkWinner,
        isDraw: isDraw,
        getAvailableMoves: getAvailableMoves
    };
})();
