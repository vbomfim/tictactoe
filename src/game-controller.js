/**
 * GameController — Orchestrator that wires all components together.
 * Handles user input → state → logic → AI → render flow. [CLEAN-ARCH]
 *
 * @namespace TicTacToe.GameController
 */
var TicTacToe = TicTacToe || {};

TicTacToe.GameController = (function () {
    'use strict';

    var gameState, boardRenderer, statusDisplay, themeManager, aiPlayer, logic;
    var _aiThinking = false;
    var _aiTimeoutId = null;

    /** localStorage keys */
    var KEYS = {
        SCORES: 'ttt-scores',
        MODE: 'ttt-game-mode',
        DIFFICULTY: 'ttt-difficulty',
        SIDE: 'ttt-ai-first'
    };

    /**
     * Initialize the game controller, wire everything, and start.
     */
    function init() {
        logic = TicTacToe.GameLogic;
        aiPlayer = TicTacToe.AIPlayer;
        gameState = new TicTacToe.GameState();

        // DOM references
        var boardEl = document.getElementById('board');
        var statusEl = document.getElementById('status');
        var scoreXEl = document.getElementById('score-x');
        var scoreOEl = document.getElementById('score-o');
        var scoreDrawEl = document.getElementById('score-draw');
        var announceEl = document.getElementById('announce');
        var newGameBtn = document.getElementById('btn-new-game');
        var resetScoresBtn = document.getElementById('btn-reset-scores');
        var themeToggleBtn = document.getElementById('btn-theme');
        var modeSelect = document.getElementById('select-mode');
        var difficultySelect = document.getElementById('select-difficulty');
        var sideSelect = document.getElementById('select-first');
        var pveOptions = document.getElementById('pve-options');

        // Init renderers
        boardRenderer = TicTacToe.BoardRenderer;
        boardRenderer.init(boardEl);

        statusDisplay = TicTacToe.StatusDisplay;
        statusDisplay.init({
            status: statusEl,
            scoreX: scoreXEl,
            scoreO: scoreOEl,
            scoreDraw: scoreDrawEl,
            announce: announceEl
        });

        // Theme
        themeManager = TicTacToe.ThemeManager;
        var currentTheme = themeManager.init(themeToggleBtn, function (theme) {
            gameState.setTheme(theme);
        });
        gameState.setTheme(currentTheme);

        // Load persisted settings
        loadSettings();

        // Apply settings to UI
        modeSelect.value = gameState.getState().gameMode;
        difficultySelect.value = gameState.getState().difficulty;
        sideSelect.value = gameState.getState().aiGoesFirst ? 'computer' : 'human';
        togglePveOptions(gameState.getState().gameMode);

        // Subscribe renderers to state changes
        gameState.subscribe(function (state) {
            boardRenderer.render(state);
            statusDisplay.render(state);
            if (state.winLine) {
                boardRenderer.drawWinLine(state.winLine);
            } else if (state.gameStatus === 'draw') {
                boardRenderer.drawDrawV();
            }
        });

        // Cell click handler
        boardRenderer.onCellClick(function (index) {
            handleCellClick(index);
        });

        // Button handlers
        newGameBtn.addEventListener('click', function () {
            clearTimeout(_aiTimeoutId);
            _aiThinking = false;
            gameState.resetBoard();
            saveScores();
            triggerAiFirstMove();
        });

        resetScoresBtn.addEventListener('click', function () {
            gameState.resetScores();
            saveScores();
        });

        // Mode select
        modeSelect.addEventListener('change', function () {
            var mode = modeSelect.value;
            gameState.setGameMode(mode);
            togglePveOptions(mode);
            persistSetting(KEYS.MODE, mode);
            clearTimeout(_aiTimeoutId);
            _aiThinking = false;
            gameState.resetBoard();
            saveScores();
            triggerAiFirstMove();
        });

        // Difficulty select
        difficultySelect.addEventListener('change', function () {
            var diff = difficultySelect.value;
            gameState.setDifficulty(diff);
            persistSetting(KEYS.DIFFICULTY, diff);
        });

        // "Who goes first?" select
        sideSelect.addEventListener('change', function () {
            var aiFirst = sideSelect.value === 'computer';
            gameState.setAiGoesFirst(aiFirst);
            persistSetting(KEYS.SIDE, aiFirst ? 'true' : 'false');
            clearTimeout(_aiTimeoutId);
            _aiThinking = false;
            gameState.resetBoard();
            triggerAiFirstMove();
        });

        // Initial render
        gameState.resetBoard();
        var initState = gameState.getState();
        boardRenderer.render(initState);
        statusDisplay.render(initState);

        // If PvE and human is O, AI goes first
        triggerAiFirstMove();
    }

    /**
     * Handle a cell click. Validates context and triggers AI if needed.
     * @param {number} index - Cell index 0-8
     */
    function handleCellClick(index) {
        // Guard: ignore clicks while AI is thinking [Edge case]
        if (_aiThinking) return;

        var state = gameState.getState();

        // In PvE, ignore clicks on AI's turn (AI is always 'O')
        if (state.gameMode === 'pve' && state.currentPlayer === 'O') return;

        var accepted = gameState.makeMove(index);
        if (!accepted) return;

        saveScores();

        // After human moves in PvE, trigger AI
        var newState = gameState.getState();
        if (newState.gameMode === 'pve' && newState.gameStatus === 'playing') {
            scheduleAiMove();
        }
    }

    /**
     * Schedule the AI to make a move after a delay. [AC15]
     * Delay: 400-600ms random for natural feel.
     */
    function scheduleAiMove() {
        _aiThinking = true;
        var delay = 400 + Math.floor(Math.random() * 200);

        _aiTimeoutId = setTimeout(function () {
            var state = gameState.getState();
            if (state.gameStatus !== 'playing') {
                _aiThinking = false;
                return;
            }
            // AI is always 'O' [BUG FIX — human always X, AI always O]
            var move = aiPlayer.getMove(state.board, state.difficulty, 'O');
            gameState.makeMove(move);
            saveScores();
            _aiThinking = false;
        }, delay);
    }

    /**
     * If in PvE and AI goes first, trigger the AI move. [BUG FIX]
     * AI is always O, so when aiGoesFirst is true, AI places O first.
     */
    function triggerAiFirstMove() {
        var state = gameState.getState();
        if (state.gameMode === 'pve' && state.aiGoesFirst && state.gameStatus === 'playing') {
            scheduleAiMove();
        }
    }

    /** Show/hide PvE-specific options (difficulty, side). */
    function togglePveOptions(mode) {
        var pveOptions = document.getElementById('pve-options');
        if (pveOptions) {
            pveOptions.style.display = mode === 'pve' ? 'flex' : 'none';
        }
    }

    /** Load saved settings from localStorage. */
    function loadSettings() {
        try {
            var savedScores = localStorage.getItem(KEYS.SCORES);
            if (savedScores) {
                gameState.restoreScores(JSON.parse(savedScores));
            }
        } catch (e) { /* ignore corrupt data */ }

        try {
            var mode = localStorage.getItem(KEYS.MODE);
            if (mode === 'pvp' || mode === 'pve') gameState.setGameMode(mode);
        } catch (e) { /* ignore */ }

        try {
            var diff = localStorage.getItem(KEYS.DIFFICULTY);
            if (['easy', 'medium', 'hard'].indexOf(diff) !== -1) gameState.setDifficulty(diff);
        } catch (e) { /* ignore */ }

        try {
            var aiFirst = localStorage.getItem(KEYS.SIDE);
            if (aiFirst === 'true') gameState.setAiGoesFirst(true);
        } catch (e) { /* ignore */ }
    }

    /** Save scores to localStorage. */
    function saveScores() {
        try {
            var state = gameState.getState();
            localStorage.setItem(KEYS.SCORES, JSON.stringify(state.scores));
        } catch (e) { /* ignore */ }
    }

    /** Persist a single setting to localStorage. */
    function persistSetting(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }

    return {
        init: init
    };
})();
