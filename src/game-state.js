/**
 * GameState — Single source of truth for all mutable game data.
 * Implements observer pattern for UI subscribers. [SOLID-SRP] [CLEAN-ARCH]
 *
 * @constructor TicTacToe.GameState
 */
var TicTacToe = TicTacToe || {};

TicTacToe.GameState = (function () {
    'use strict';

    var logic = TicTacToe.GameLogic;

    /**
     * @constructor
     */
    function GameState() {
        this._subscribers = [];
        this._state = {
            board: [null, null, null, null, null, null, null, null, null],
            currentPlayer: 'X',
            gameStatus: 'playing',  // 'playing' | 'won' | 'draw'
            winner: null,
            winLine: null,
            scores: { X: 0, O: 0, draws: 0 },
            gameMode: 'pvp',        // 'pvp' | 'pve'
            difficulty: 'medium',   // 'easy' | 'medium' | 'hard'
            aiGoesFirst: false,     // true = AI (O) moves first; human is always X, AI is always O
            theme: 'light'          // 'light' | 'dark'
        };
    }

    /**
     * Return a shallow copy of the current state.
     * Board is copied to prevent external mutation. [CLEAN-CODE]
     * @returns {Object}
     */
    GameState.prototype.getState = function () {
        return {
            board: this._state.board.slice(),
            currentPlayer: this._state.currentPlayer,
            gameStatus: this._state.gameStatus,
            winner: this._state.winner,
            winLine: this._state.winLine ? this._state.winLine.slice() : null,
            scores: {
                X: this._state.scores.X,
                O: this._state.scores.O,
                draws: this._state.scores.draws
            },
            gameMode: this._state.gameMode,
            difficulty: this._state.difficulty,
            aiGoesFirst: this._state.aiGoesFirst,
            theme: this._state.theme
        };
    };

    /**
     * Attempt to place the current player's mark at cellIndex.
     * Guards: rejects occupied cells and moves after game over.
     *
     * @param {number} cellIndex - 0-8
     * @returns {boolean} true if move was accepted, false otherwise
     */
    GameState.prototype.makeMove = function (cellIndex) {
        // Guard: game already over [CLEAN-CODE — fail fast]
        if (this._state.gameStatus !== 'playing') return false;

        // Guard: bounds check
        if (cellIndex < 0 || cellIndex > 8) return false;

        // Guard: cell occupied
        if (this._state.board[cellIndex] !== null) return false;

        // Place mark
        this._state.board[cellIndex] = this._state.currentPlayer;

        // Check for winner
        var result = logic.checkWinner(this._state.board);
        if (result.winner) {
            this._state.gameStatus = 'won';
            this._state.winner = result.winner;
            this._state.winLine = result.line;
            this._state.scores[result.winner]++;
            this._notify();
            return true;
        }

        // Check for draw
        if (logic.isDraw(this._state.board)) {
            this._state.gameStatus = 'draw';
            this._state.scores.draws++;
            this._notify();
            return true;
        }

        // Switch turns
        this._state.currentPlayer = this._state.currentPlayer === 'X' ? 'O' : 'X';
        this._notify();
        return true;
    };

    /**
     * Reset the board for a new game. Preserves scores. [AC8]
     */
    GameState.prototype.resetBoard = function () {
        this._state.board = [null, null, null, null, null, null, null, null, null];
        // AI is always O — if AI goes first in PvE, O starts
        this._state.currentPlayer =
            (this._state.gameMode === 'pve' && this._state.aiGoesFirst) ? 'O' : 'X';
        this._state.gameStatus = 'playing';
        this._state.winner = null;
        this._state.winLine = null;
        this._notify();
    };

    /**
     * Zero all scores. [AC10]
     */
    GameState.prototype.resetScores = function () {
        this._state.scores = { X: 0, O: 0, draws: 0 };
        this._notify();
    };

    /** Set game mode ('pvp' | 'pve'). */
    GameState.prototype.setGameMode = function (mode) {
        this._state.gameMode = mode;
        this._notify();
    };

    /** Set AI difficulty ('easy' | 'medium' | 'hard'). */
    GameState.prototype.setDifficulty = function (level) {
        this._state.difficulty = level;
        this._notify();
    };

    /** Set whether the AI goes first in PvE mode. */
    GameState.prototype.setAiGoesFirst = function (value) {
        this._state.aiGoesFirst = !!value;
        this._notify();
    };

    /** Set theme ('light' | 'dark'). */
    GameState.prototype.setTheme = function (theme) {
        this._state.theme = theme;
        this._notify();
    };

    /**
     * Restore scores from external source (e.g. localStorage).
     * Validates input — only accepts finite non-negative integers.
     * @param {Object} scores - { X: number, O: number, draws: number }
     */
    GameState.prototype.restoreScores = function (scores) {
        if (!scores || typeof scores !== 'object') return;
        var validated = { X: 0, O: 0, draws: 0 };
        ['X', 'O', 'draws'].forEach(function (key) {
            var val = parseInt(scores[key], 10);
            if (isFinite(val) && val >= 0) validated[key] = val;
        });
        this._state.scores = validated;
        this._notify();
    };

    /**
     * Subscribe a callback to state changes.
     * @param {function} callback - Called with no args on every state change
     */
    GameState.prototype.subscribe = function (callback) {
        this._subscribers.push(callback);
        var subscribers = this._subscribers;
        return function unsubscribe() {
            var idx = subscribers.indexOf(callback);
            if (idx > -1) subscribers.splice(idx, 1);
        };
    };

    /** Notify all subscribers of a state change. */
    GameState.prototype._notify = function () {
        var state = this.getState();
        for (var i = 0; i < this._subscribers.length; i++) {
            this._subscribers[i](state);
        }
    };

    return GameState;
})();
