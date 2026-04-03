/**
 * BoardRenderer — Renders the 3×3 game grid and winning line SVG overlay.
 * Manages DOM for the board only. [SOLID-SRP]
 *
 * @namespace TicTacToe.BoardRenderer
 */
var TicTacToe = TicTacToe || {};

TicTacToe.BoardRenderer = (function () {
    'use strict';

    var _boardEl = null;
    var _svgOverlay = null;
    var _cells = [];
    var _clickCallback = null;

    /**
     * Initialize the board renderer.
     * Creates 9 button cells inside the board container and an SVG overlay.
     * @param {HTMLElement} boardContainer - The DOM element to render into
     */
    function init(boardContainer) {
        _boardEl = boardContainer;
        _boardEl.setAttribute('role', 'grid');
        _boardEl.setAttribute('aria-label', 'Tic Tac Toe board');
        _boardEl.innerHTML = '';
        _cells = [];

        // Create 9 cells
        for (var i = 0; i < 9; i++) {
            var cell = document.createElement('button');
            cell.className = 'cell';
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('aria-label', 'Cell ' + (i + 1) + ', empty');
            cell.setAttribute('data-index', i);
            cell.tabIndex = 0;
            (function (index) {
                cell.addEventListener('click', function () {
                    if (_clickCallback) _clickCallback(index);
                });
            })(i);
            _cells.push(cell);
            _boardEl.appendChild(cell);
        }

        // SVG overlay for winning line
        _svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        _svgOverlay.setAttribute('class', 'win-line-svg');
        _svgOverlay.setAttribute('viewBox', '0 0 312 312');
        _svgOverlay.setAttribute('aria-hidden', 'true');
        _boardEl.appendChild(_svgOverlay);
    }

    /**
     * Register a callback for cell clicks.
     * @param {function} callback - Receives cell index (0-8)
     */
    function onCellClick(callback) {
        _clickCallback = callback;
    }

    /**
     * Render the board from the given state.
     * Updates cell text, classes, and aria-labels.
     * @param {Object} state - GameState snapshot
     */
    function render(state) {
        var isGameOver = state.gameStatus !== 'playing';

        for (var i = 0; i < 9; i++) {
            var cell = _cells[i];
            var value = state.board[i];
            cell.textContent = value || '';
            cell.className = 'cell' + (value ? ' cell-' + value.toLowerCase() : '') +
                (isGameOver ? ' disabled' : '');
            cell.disabled = isGameOver || value !== null;

            // Accessibility
            var label = 'Cell ' + (i + 1) + ', ';
            if (value) {
                label += value;
            } else if (isGameOver) {
                label += 'empty';
            } else {
                label += 'empty, click to place ' + state.currentPlayer;
            }
            cell.setAttribute('aria-label', label);
        }

        // Clear winning line if no winLine
        if (!state.winLine) {
            _svgOverlay.innerHTML = '';
        }
    }

    /**
     * Draw a line through the 3 winning cells. [AC4-6]
     * Calculates center positions of each cell in the grid.
     * @param {number[]} line - Array of 3 cell indices
     */
    function drawWinLine(line) {
        if (!line || line.length !== 3) return;

        _svgOverlay.innerHTML = '';

        // Calculate cell centers (assuming 100px cells + 6px gap in a 312px grid)
        var cellSize = 100;
        var gap = 6;

        function getCellCenter(index) {
            var row = Math.floor(index / 3);
            var col = index % 3;
            return {
                x: col * (cellSize + gap) + cellSize / 2,
                y: row * (cellSize + gap) + cellSize / 2
            };
        }

        var start = getCellCenter(line[0]);
        var end = getCellCenter(line[2]);

        var lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lineEl.setAttribute('x1', start.x);
        lineEl.setAttribute('y1', start.y);
        lineEl.setAttribute('x2', end.x);
        lineEl.setAttribute('y2', end.y);
        lineEl.setAttribute('class', 'win-line');
        _svgOverlay.appendChild(lineEl);
    }

    return {
        init: init,
        onCellClick: onCellClick,
        render: render,
        drawWinLine: drawWinLine
    };
})();
