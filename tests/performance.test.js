/**
 * Performance Test Suite — QA Guardian
 * Tests that critical operations complete within acceptable time bounds.
 *
 * Tags: [PERF]
 */
(function () {
    'use strict';

    var assert = TicTacTest.assert;
    var logic = TicTacToe.GameLogic;
    var ai = TicTacToe.AIPlayer;

    function freshState() {
        return new TicTacToe.GameState();
    }

    // Use Date.now() for timing (works in Node + browser)
    function timeMs(fn) {
        var start = Date.now();
        fn();
        return Date.now() - start;
    }

    TicTacTest.describe('Performance — Minimax execution time [PERF]', function (ctx) {

        ctx.it('hard AI on empty board completes within 200ms', function () {
            var board = [null,null,null, null,null,null, null,null,null];
            var elapsed = timeMs(function () {
                ai.getMove(board, 'hard', 'X');
            });
            assert.ok(elapsed < 200,
                'empty board minimax took ' + elapsed + 'ms (max 200ms)');
        });

        ctx.it('hard AI with 1 move made completes within 100ms', function () {
            var board = ['X', null,null, null,null,null, null,null,null];
            var elapsed = timeMs(function () {
                ai.getMove(board, 'hard', 'O');
            });
            assert.ok(elapsed < 100,
                'one-move board minimax took ' + elapsed + 'ms (max 100ms)');
        });

        ctx.it('hard AI mid-game (4 moves) completes within 20ms', function () {
            var board = ['X', 'O', null, null, 'X', null, null, null, 'O'];
            var elapsed = timeMs(function () {
                ai.getMove(board, 'hard', 'X');
            });
            assert.ok(elapsed < 20,
                'mid-game minimax took ' + elapsed + 'ms (max 20ms)');
        });
    });

    TicTacTest.describe('Performance — GameState throughput [PERF]', function (ctx) {

        ctx.it('1000 full games complete within 500ms', function () {
            var elapsed = timeMs(function () {
                for (var g = 0; g < 1000; g++) {
                    var gs = freshState();
                    var moves = [0, 1, 2, 4, 3, 5, 7, 6, 8]; // draw sequence
                    for (var i = 0; i < moves.length; i++) {
                        gs.makeMove(moves[i]);
                    }
                }
            });
            assert.ok(elapsed < 500,
                '1000 games took ' + elapsed + 'ms (max 500ms)');
        });

        ctx.it('subscribe + notify overhead: 1000 moves with 5 subscribers within 200ms', function () {
            var gs = freshState();
            for (var s = 0; s < 5; s++) {
                gs.subscribe(function () { /* no-op */ });
            }

            var elapsed = timeMs(function () {
                for (var g = 0; g < 100; g++) {
                    gs.resetBoard();
                    for (var i = 0; i < 9; i++) {
                        gs.makeMove(i);
                    }
                }
            });
            assert.ok(elapsed < 200,
                'observer notification took ' + elapsed + 'ms (max 200ms)');
        });
    });

    TicTacTest.describe('Performance — checkWinner throughput [PERF]', function (ctx) {

        ctx.it('100,000 checkWinner calls within 200ms', function () {
            var board = ['X','X','X', 'O','O',null, null,null,null];
            var elapsed = timeMs(function () {
                for (var i = 0; i < 100000; i++) {
                    logic.checkWinner(board);
                }
            });
            assert.ok(elapsed < 200,
                '100k checkWinner calls took ' + elapsed + 'ms (max 200ms)');
        });
    });

})();
