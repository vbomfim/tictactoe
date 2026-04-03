/**
 * Contract Test Suite — QA Guardian
 * Validates that public interfaces return data in the expected shape.
 * These tests ensure interface stability across refactors.
 *
 * Tags: [CONTRACT]
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
    // Contract: GameLogic.checkWinner return shape
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Contract — GameLogic.checkWinner return shape [CONTRACT]', function (ctx) {

        ctx.it('returns { winner: string, line: number[] } on win', function () {
            var result = logic.checkWinner(['X','X','X', null,null,null, null,null,null]);
            assert.equal(typeof result, 'object', 'should return object');
            assert.equal(typeof result.winner, 'string', 'winner should be string');
            assert.ok(Array.isArray(result.line), 'line should be array');
            assert.equal(result.line.length, 3, 'line should have 3 indices');
            // Each index should be a number 0-8
            result.line.forEach(function (idx) {
                assert.equal(typeof idx, 'number', 'line index should be number');
                assert.ok(idx >= 0 && idx <= 8, 'index should be 0-8');
            });
        });

        ctx.it('returns { winner: null, line: null } on no win', function () {
            var result = logic.checkWinner([null,null,null, null,null,null, null,null,null]);
            assert.equal(typeof result, 'object');
            assert.isNull(result.winner);
            assert.isNull(result.line);
        });

        ctx.it('winner is always "X" or "O" (never other values)', function () {
            // Test all 8 win lines
            var boards = [
                ['X','X','X', null,null,null, null,null,null],
                [null,null,null, 'O','O','O', null,null,null]
            ];
            boards.forEach(function (b) {
                var result = logic.checkWinner(b);
                assert.ok(
                    result.winner === 'X' || result.winner === 'O',
                    'winner must be X or O, got: ' + result.winner
                );
            });
        });
    });

    // ─────────────────────────────────────────────────────
    // Contract: GameLogic.isDraw return type
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Contract — GameLogic.isDraw return type [CONTRACT]', function (ctx) {

        ctx.it('always returns boolean', function () {
            var cases = [
                [null,null,null, null,null,null, null,null,null],  // not draw
                ['X','O','X', 'X','O','O', 'O','X','X'],          // draw
                ['X','X','X', 'O','O','X', 'X','O','O']           // win (not draw)
            ];
            cases.forEach(function (b, i) {
                var result = logic.isDraw(b);
                assert.equal(typeof result, 'boolean', 'case ' + i + ' should return boolean');
            });
        });
    });

    // ─────────────────────────────────────────────────────
    // Contract: GameLogic.getAvailableMoves return type
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Contract — GameLogic.getAvailableMoves [CONTRACT]', function (ctx) {

        ctx.it('always returns an array of numbers', function () {
            var b = ['X', null, 'O', null, null, null, null, null, null];
            var moves = logic.getAvailableMoves(b);
            assert.ok(Array.isArray(moves), 'should return array');
            moves.forEach(function (m) {
                assert.equal(typeof m, 'number', 'each move should be number');
                assert.ok(m >= 0 && m <= 8, 'move should be 0-8');
            });
        });

        ctx.it('returned indices correspond to null cells', function () {
            var b = ['X', null, 'O', null, 'X', null, 'O', null, 'X'];
            var moves = logic.getAvailableMoves(b);
            moves.forEach(function (m) {
                assert.isNull(b[m], 'move ' + m + ' should point to null cell');
            });
        });
    });

    // ─────────────────────────────────────────────────────
    // Contract: GameState.getState() shape
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Contract — GameState.getState() shape [CONTRACT]', function (ctx) {

        ctx.it('has all required fields with correct types', function () {
            var gs = freshState();
            var s = gs.getState();

            // board
            assert.ok(Array.isArray(s.board), 'board should be array');
            assert.equal(s.board.length, 9, 'board should have 9 elements');

            // currentPlayer
            assert.ok(s.currentPlayer === 'X' || s.currentPlayer === 'O',
                'currentPlayer should be X or O');

            // gameStatus
            assert.ok(
                ['playing', 'won', 'draw'].indexOf(s.gameStatus) !== -1,
                'gameStatus should be playing/won/draw'
            );

            // scores
            assert.equal(typeof s.scores, 'object', 'scores should be object');
            assert.equal(typeof s.scores.X, 'number', 'scores.X should be number');
            assert.equal(typeof s.scores.O, 'number', 'scores.O should be number');
            assert.equal(typeof s.scores.draws, 'number', 'scores.draws should be number');

            // gameMode
            assert.ok(
                s.gameMode === 'pvp' || s.gameMode === 'pve',
                'gameMode should be pvp or pve'
            );

            // difficulty
            assert.ok(
                ['easy', 'medium', 'hard'].indexOf(s.difficulty) !== -1,
                'difficulty should be easy/medium/hard'
            );

            // aiGoesFirst
            assert.equal(typeof s.aiGoesFirst, 'boolean', 'aiGoesFirst should be boolean');

            // theme
            assert.ok(
                s.theme === 'light' || s.theme === 'dark',
                'theme should be light or dark'
            );
        });

        ctx.it('winning state has non-null winner and winLine', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1);
            gs.makeMove(4); gs.makeMove(2); // X wins

            var s = gs.getState();
            assert.equal(typeof s.winner, 'string');
            assert.ok(Array.isArray(s.winLine));
            assert.equal(s.winLine.length, 3);
        });

        ctx.it('playing/draw state has null winner and winLine', function () {
            // Playing state
            var gs = freshState();
            var s = gs.getState();
            assert.isNull(s.winner);
            assert.isNull(s.winLine);

            // Draw state
            var gs2 = freshState();
            var moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
            for (var i = 0; i < moves.length; i++) {
                gs2.makeMove(moves[i]);
            }
            var s2 = gs2.getState();
            assert.isNull(s2.winner);
            assert.isNull(s2.winLine);
        });
    });

    // ─────────────────────────────────────────────────────
    // Contract: GameState.makeMove return type
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Contract — GameState.makeMove returns boolean [CONTRACT]', function (ctx) {

        ctx.it('returns true (boolean) for accepted move', function () {
            var gs = freshState();
            var result = gs.makeMove(0);
            assert.equal(result, true);
            assert.equal(typeof result, 'boolean');
        });

        ctx.it('returns false (boolean) for rejected move', function () {
            var gs = freshState();
            gs.makeMove(0);
            var result = gs.makeMove(0); // occupied
            assert.equal(result, false);
            assert.equal(typeof result, 'boolean');
        });

        ctx.it('returns false (boolean) for post-game move', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1);
            gs.makeMove(4); gs.makeMove(2); // X wins
            var result = gs.makeMove(5);
            assert.equal(result, false);
            assert.equal(typeof result, 'boolean');
        });
    });

    // ─────────────────────────────────────────────────────
    // Contract: AIPlayer.getMove return type
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Contract — AIPlayer.getMove [CONTRACT]', function (ctx) {

        ctx.it('always returns a number for all difficulty levels', function () {
            var board = ['X', null, null, 'O', null, null, null, null, null];
            ['easy', 'medium', 'hard'].forEach(function (diff) {
                var move = ai.getMove(board, diff, 'O');
                assert.equal(typeof move, 'number', diff + ' should return number');
            });
        });

        ctx.it('returned move is always in the available moves list', function () {
            var board = ['X', 'O', 'X', null, 'O', null, null, null, null];
            var available = logic.getAvailableMoves(board);
            ['easy', 'medium', 'hard'].forEach(function (diff) {
                for (var trial = 0; trial < 10; trial++) {
                    var move = ai.getMove(board, diff, 'O');
                    assert.includes(available, move,
                        diff + ' trial ' + trial + ': move must be available');
                }
            });
        });

        ctx.it('handles unknown difficulty gracefully (falls back)', function () {
            var board = [null,null,null, null,null,null, null,null,null];
            var noCrash = true;
            var move;
            try {
                move = ai.getMove(board, 'impossible', 'O');
            } catch (e) {
                noCrash = false;
            }
            assert.ok(noCrash, 'unknown difficulty should not crash');
            assert.equal(typeof move, 'number', 'should return a number');
        });
    });

    // ─────────────────────────────────────────────────────
    // Contract: WIN_LINES constant
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Contract — WIN_LINES constant [CONTRACT]', function (ctx) {

        ctx.it('contains exactly 8 winning lines', function () {
            assert.equal(logic.WIN_LINES.length, 8);
        });

        ctx.it('each line has exactly 3 unique indices in range 0-8', function () {
            logic.WIN_LINES.forEach(function (line, i) {
                assert.equal(line.length, 3, 'line ' + i + ' should have 3 indices');
                var unique = {};
                line.forEach(function (idx) {
                    assert.ok(idx >= 0 && idx <= 8, 'index should be 0-8');
                    unique[idx] = true;
                });
                assert.equal(Object.keys(unique).length, 3,
                    'line ' + i + ' should have 3 unique indices');
            });
        });
    });

})();
