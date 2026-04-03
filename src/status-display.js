/**
 * StatusDisplay — Renders status messages and scoreboard.
 * Uses aria-live for screen reader announcements. [AC18]
 *
 * @namespace TicTacToe.StatusDisplay
 */
var TicTacToe = TicTacToe || {};

TicTacToe.StatusDisplay = (function () {
    'use strict';

    var _statusEl = null;
    var _scoreXEl = null;
    var _scoreOEl = null;
    var _scoreDrawEl = null;
    var _announceEl = null;

    /**
     * Initialize the status display.
     * @param {Object} elements - DOM element references
     * @param {HTMLElement} elements.status - Status text element
     * @param {HTMLElement} elements.scoreX - X score element
     * @param {HTMLElement} elements.scoreO - O score element
     * @param {HTMLElement} elements.scoreDraw - Draw score element
     * @param {HTMLElement} elements.announce - aria-live announcer element
     */
    function init(elements) {
        _statusEl = elements.status;
        _scoreXEl = elements.scoreX;
        _scoreOEl = elements.scoreO;
        _scoreDrawEl = elements.scoreDraw;
        _announceEl = elements.announce;
    }

    /**
     * Render status and scores from game state.
     * @param {Object} state - GameState snapshot
     */
    function render(state) {
        // Update scores
        _scoreXEl.textContent = state.scores.X;
        _scoreOEl.textContent = state.scores.O;
        _scoreDrawEl.textContent = state.scores.draws;

        // Update status message
        var message = '';
        if (state.gameStatus === 'won') {
            message = '🎉 ' + state.winner + ' Wins!';
        } else if (state.gameStatus === 'draw') {
            message = '🤝 It\'s a Draw!';
        } else {
            message = 'Player ' + state.currentPlayer + '\'s Turn';

            // In PvE, clarify who is the human
            if (state.gameMode === 'pve') {
                var isHumanTurn = state.currentPlayer === state.humanSide;
                message = isHumanTurn
                    ? '🎮 Your Turn (' + state.currentPlayer + ')'
                    : '🤖 AI is thinking...';
            }
        }

        _statusEl.textContent = message;

        // Screen reader announcement [AC18]
        if (_announceEl) {
            _announceEl.textContent = message;
        }
    }

    return {
        init: init,
        render: render
    };
})();
