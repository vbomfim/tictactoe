/**
 * Edge Case Test Suite — QA Guardian
 * Tests boundary conditions, error paths, and scenarios
 * the acceptance criteria don't explicitly cover.
 *
 * Tags: [EDGE], [BOUNDARY], [REGRESSION], [COVERAGE]
 */
(function () {
    'use strict';

    var assert = TicTacTest.assert;
    var logic = TicTacToe.GameLogic;
    var ai = TicTacToe.AIPlayer;

    function freshState() {
        return new TicTacToe.GameState();
    }

    // ─────────────────────────────────────────────────────
    // Edge: Moves after game over
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Edge — Moves after game over [EDGE]', function (ctx) {

        ctx.it('rejects move after draw (not just after win)', function () {
            var gs = freshState();
            var moves = [0, 1, 2, 4, 3, 5, 7, 6, 8]; // draw
            for (var i = 0; i < moves.length; i++) {
                gs.makeMove(moves[i]);
            }
            assert.equal(gs.getState().gameStatus, 'draw');

            var result = gs.makeMove(0); // try to move after draw
            assert.isFalse(result, 'should reject move after draw');
        });

        ctx.it('state does not change after rejected post-game move', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1);
            gs.makeMove(4); gs.makeMove(2); // X wins

            var stateBefore = gs.getState();
            gs.makeMove(5); // rejected
            var stateAfter = gs.getState();

            assert.deepEqual(stateBefore.board, stateAfter.board);
            assert.equal(stateBefore.gameStatus, stateAfter.gameStatus);
            assert.equal(stateBefore.winner, stateAfter.winner);
        });

        ctx.it('scores do not change on rejected moves [REGRESSION]', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1);
            gs.makeMove(4); gs.makeMove(2); // X wins, score X=1
            assert.equal(gs.getState().scores.X, 1);

            // Multiple rejected moves should not double-count
            gs.makeMove(5);
            gs.makeMove(6);
            gs.makeMove(7);
            assert.equal(gs.getState().scores.X, 1, 'score should not change');
        });
    });

    // ─────────────────────────────────────────────────────
    // Edge: Rapid / duplicate moves
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Edge — Rapid duplicate moves [EDGE]', function (ctx) {

        ctx.it('double-clicking same cell: second click rejected', function () {
            var gs = freshState();
            assert.isTrue(gs.makeMove(4));  // first click
            assert.isFalse(gs.makeMove(4)); // double-click

            assert.equal(gs.getState().board[4], 'X');
            assert.equal(gs.getState().currentPlayer, 'O', 'turn stays with O');
        });

        ctx.it('clicking all cells in rapid sequence: only valid moves accepted', function () {
            var gs = freshState();
            var accepted = 0;
            for (var i = 0; i < 9; i++) {
                if (gs.makeMove(i)) accepted++;
            }
            // Game should end before all 9 cells (via win or all 9 draw)
            var s = gs.getState();
            assert.ok(
                s.gameStatus === 'won' || s.gameStatus === 'draw',
                'game should end after sequential moves'
            );
            // At most 9 moves in a game
            assert.ok(accepted <= 9, 'should not accept more than 9 moves');
        });
    });

    // ─────────────────────────────────────────────────────
    // Edge: Invalid input handling
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Edge — Invalid cell indices [EDGE]', function (ctx) {

        ctx.it('negative index does not crash and returns false-ish or places no mark', function () {
            var gs = freshState();
            // The function should not crash — this tests robustness
            var noCrash = true;
            try {
                gs.makeMove(-1);
            } catch (e) {
                noCrash = false;
            }
            assert.ok(noCrash, 'negative index should not crash');
            // Board should still be empty
            var board = gs.getState().board;
            var allNull = board.every(function (c) { return c === null; });
            // Technically board[-1] sets a property on the array, not a board cell
            // So getAvailableMoves still sees all 9 cells as null
            assert.equal(logic.getAvailableMoves(board).length, 9,
                'board should still have 9 available moves');
        });

        ctx.it('index 9 (out of bounds) does not corrupt board', function () {
            var gs = freshState();
            try {
                gs.makeMove(9);
            } catch (e) {
                // allowed to throw — we just care it doesn't corrupt state
            }
            var board = gs.getState().board;
            assert.equal(board.length, 9, 'board should remain length 9');
        });
    });

    // ─────────────────────────────────────────────────────
    // Edge: Multiple resets
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Edge — Multiple resets [EDGE]', function (ctx) {

        ctx.it('double resetBoard produces clean state', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(1);
            gs.resetBoard();
            gs.resetBoard(); // double reset
            var s = gs.getState();
            assert.equal(s.currentPlayer, 'X');
            assert.equal(s.gameStatus, 'playing');
            for (var i = 0; i < 9; i++) {
                assert.isNull(s.board[i], 'cell ' + i + ' should be null');
            }
        });

        ctx.it('resetScores multiple times stays at zero', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1);
            gs.makeMove(4); gs.makeMove(2); // X wins
            gs.resetScores();
            gs.resetScores();
            gs.resetScores();
            var scores = gs.getState().scores;
            assert.equal(scores.X, 0);
            assert.equal(scores.O, 0);
            assert.equal(scores.draws, 0);
        });

        ctx.it('play → reset → play works correctly (no stale state)', function () {
            var gs = freshState();

            // Game 1: X wins
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1);
            gs.makeMove(4); gs.makeMove(2);
            assert.equal(gs.getState().gameStatus, 'won');

            // Reset and play game 2
            gs.resetBoard();
            assert.equal(gs.getState().gameStatus, 'playing');
            assert.equal(gs.getState().currentPlayer, 'X');

            // Play normally in game 2
            assert.isTrue(gs.makeMove(4), 'should accept moves in new game');
            assert.equal(gs.getState().board[4], 'X');
            assert.equal(gs.getState().currentPlayer, 'O');
        });
    });

    // ─────────────────────────────────────────────────────
    // Edge: State immutability (getState returns copies)
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Edge — State immutability [BOUNDARY]', function (ctx) {

        ctx.it('mutating getState().board does not affect internal state', function () {
            var gs = freshState();
            gs.makeMove(0); // X at 0

            var snap = gs.getState();
            snap.board[0] = 'MUTATED'; // external mutation

            var internal = gs.getState();
            assert.equal(internal.board[0], 'X',
                'internal board must not be affected by external mutation');
        });

        ctx.it('mutating getState().scores does not affect internal state', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1);
            gs.makeMove(4); gs.makeMove(2); // X wins

            var snap = gs.getState();
            snap.scores.X = 999;

            assert.equal(gs.getState().scores.X, 1,
                'internal scores must not be affected');
        });

        ctx.it('mutating getState().winLine does not affect internal state', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1);
            gs.makeMove(4); gs.makeMove(2); // X wins [0,1,2]

            var snap = gs.getState();
            if (snap.winLine) {
                snap.winLine[0] = 99;
            }

            assert.deepEqual(gs.getState().winLine, [0, 1, 2],
                'internal winLine must not be affected');
        });
    });

    // ─────────────────────────────────────────────────────
    // Edge: AI does not mutate input board
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Edge — AI board immutability [BOUNDARY]', function (ctx) {

        ctx.it('AI.getMove does not mutate the passed board', function () {
            var board = ['X', null, null, 'O', null, null, null, null, null];
            var boardCopy = board.slice();

            ai.getMove(board, 'hard', 'O');

            assert.deepEqual(board, boardCopy,
                'AI.getMove must not mutate the input board');
        });

        ctx.it('AI.getMove returns same result on repeated calls with same state', function () {
            // Hard AI is deterministic — same board, same result
            var board = ['X', null, null, 'O', 'X', null, null, null, null];
            var move1 = ai.getMove(board, 'hard', 'O');
            var move2 = ai.getMove(board, 'hard', 'O');
            assert.equal(move1, move2, 'hard AI should be deterministic');
        });
    });

    // ─────────────────────────────────────────────────────
    // Edge: All 8 winning lines work end-to-end through GameState
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Edge — All 8 win lines via GameState [COVERAGE]', function (ctx) {

        // Test all 8 winning combinations through the full makeMove flow
        var winScenarios = [
            { name: 'top row [0,1,2]',          xMoves: [0, 1, 2], oMoves: [3, 4],    line: [0, 1, 2] },
            { name: 'middle row [3,4,5]',        xMoves: [3, 4, 5], oMoves: [0, 1],    line: [3, 4, 5] },
            { name: 'bottom row [6,7,8]',        xMoves: [6, 7, 8], oMoves: [0, 1],    line: [6, 7, 8] },
            { name: 'left column [0,3,6]',       xMoves: [0, 3, 6], oMoves: [1, 4],    line: [0, 3, 6] },
            { name: 'center column [1,4,7]',     xMoves: [1, 4, 7], oMoves: [0, 3],    line: [1, 4, 7] },
            { name: 'right column [2,5,8]',      xMoves: [2, 5, 8], oMoves: [0, 3],    line: [2, 5, 8] },
            { name: 'main diagonal [0,4,8]',     xMoves: [0, 4, 8], oMoves: [1, 3],    line: [0, 4, 8] },
            { name: 'anti-diagonal [2,4,6]',     xMoves: [2, 4, 6], oMoves: [0, 1],    line: [2, 4, 6] }
        ];

        winScenarios.forEach(function (scenario) {
            ctx.it('X wins via ' + scenario.name + ' through full game flow', function () {
                var gs = freshState();
                // Interleave X and O moves
                for (var i = 0; i < scenario.xMoves.length; i++) {
                    gs.makeMove(scenario.xMoves[i]); // X
                    if (i < scenario.oMoves.length) {
                        gs.makeMove(scenario.oMoves[i]); // O
                    }
                }
                var s = gs.getState();
                assert.equal(s.gameStatus, 'won');
                assert.equal(s.winner, 'X');
                assert.deepEqual(s.winLine, scenario.line);
            });
        });
    });

    // ─────────────────────────────────────────────────────
    // Edge: Mode/difficulty switching
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Edge — Mode and difficulty switching [EDGE]', function (ctx) {

        ctx.it('switching mode during game does not corrupt state', function () {
            var gs = freshState();
            gs.makeMove(0); // X plays
            gs.setGameMode('pve'); // switch mid-game
            assert.equal(gs.getState().gameMode, 'pve');
            // Board still has the move
            assert.equal(gs.getState().board[0], 'X');
            // Can continue playing
            assert.isTrue(gs.makeMove(1), 'should still accept moves after mode switch');
        });

        ctx.it('switching difficulty during game preserves board', function () {
            var gs = freshState();
            gs.setDifficulty('easy');
            gs.makeMove(0); gs.makeMove(1);
            gs.setDifficulty('hard');
            assert.equal(gs.getState().difficulty, 'hard');
            assert.equal(gs.getState().board[0], 'X');
            assert.equal(gs.getState().board[1], 'O');
        });

        ctx.it('setGameMode notifies subscriber', function () {
            var gs = freshState();
            var called = false;
            gs.subscribe(function () { called = true; });
            gs.setGameMode('pve');
            assert.isTrue(called, 'setGameMode should notify');
        });

        ctx.it('setDifficulty notifies subscriber', function () {
            var gs = freshState();
            var called = false;
            gs.subscribe(function () { called = true; });
            gs.setDifficulty('hard');
            assert.isTrue(called, 'setDifficulty should notify');
        });

        ctx.it('setTheme notifies subscriber', function () {
            var gs = freshState();
            var called = false;
            gs.subscribe(function () { called = true; });
            gs.setTheme('dark');
            assert.isTrue(called, 'setTheme should notify');
            assert.equal(gs.getState().theme, 'dark');
        });

        ctx.it('setAiGoesFirst notifies subscriber', function () {
            var gs = freshState();
            var called = false;
            gs.subscribe(function () { called = true; });
            gs.setAiGoesFirst(true);
            assert.isTrue(called, 'setAiGoesFirst should notify');
        });
    });

})();
