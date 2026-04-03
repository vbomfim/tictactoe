/**
 * AIPlayer Test Suite [TDD]
 * Tests easy (random), medium (mixed), and hard (minimax unbeatable).
 */
(function () {
    'use strict';

    var assert = TicTacTest.assert;
    var ai = TicTacToe.AIPlayer;
    var logic = TicTacToe.GameLogic;

    function board(cells) {
        return cells.map(function (c) { return c || null; });
    }

    TicTacTest.describe('AIPlayer — Easy (random)', function (ctx) {

        // AC13: Random available move
        ctx.it('returns a valid available cell index', function () {
            var b = board(['X','O',null, null,'X',null, null,null,null]);
            var move = ai.getMove(b, 'easy', 'O');
            var available = logic.getAvailableMoves(b);
            assert.includes(available, move, 'move should be in available moves');
        });

        ctx.it('returns the only available cell when one left', function () {
            var b = board(['X','O','X', 'O','X','O', 'O','X',null]);
            var move = ai.getMove(b, 'easy', 'O');
            assert.equal(move, 8);
        });
    });

    TicTacTest.describe('AIPlayer — Hard (minimax, unbeatable)', function (ctx) {

        // AC14: AI never loses
        ctx.it('blocks opponent from winning (O blocks X)', function () {
            // X has [0,1], needs 2 to win. AI (O) must block at 2.
            var b = board(['X','X',null, 'O',null,null, null,null,null]);
            var move = ai.getMove(b, 'hard', 'O');
            assert.equal(move, 2, 'AI should block at cell 2');
        });

        ctx.it('takes the winning move when available', function () {
            // O has [3,4], can win at 5
            var b = board(['X','X',null, 'O','O',null, null,null,'X']);
            var move = ai.getMove(b, 'hard', 'O');
            assert.equal(move, 5, 'AI should win at cell 5');
        });

        ctx.it('prefers winning over blocking', function () {
            // O can win at 6 (column 0,3,6) AND X threatens at 2 (row 0,1,2)
            var b = board(['X','X',null, 'O',null,null, null,null,null]);
            // Actually, let's make O able to win:
            var b2 = board(['X','X',null, 'O','O',null, 'X',null,null]);
            var move = ai.getMove(b2, 'hard', 'O');
            assert.equal(move, 5, 'AI should take the win at cell 5');
        });

        ctx.it('never loses when playing a full game as O (simulated)', function () {
            // Simulate many games: X plays random, O plays hard
            // O (hard) should never lose.
            var losses = 0;
            for (var game = 0; game < 50; game++) {
                var b = [null,null,null, null,null,null, null,null,null];
                var turn = 'X';
                while (true) {
                    var available = logic.getAvailableMoves(b);
                    if (available.length === 0) break;

                    var move;
                    if (turn === 'O') {
                        move = ai.getMove(b, 'hard', 'O');
                    } else {
                        // X plays random
                        move = available[Math.floor(Math.random() * available.length)];
                    }
                    b[move] = turn;

                    var result = logic.checkWinner(b);
                    if (result.winner === 'X') { losses++; break; }
                    if (result.winner === 'O') break;
                    turn = (turn === 'X') ? 'O' : 'X';
                }
            }
            assert.equal(losses, 0, 'Hard AI (O) should never lose against random X');
        });

        ctx.it('never loses when playing a full game as X (simulated)', function () {
            var losses = 0;
            for (var game = 0; game < 50; game++) {
                var b = [null,null,null, null,null,null, null,null,null];
                var turn = 'X';
                while (true) {
                    var available = logic.getAvailableMoves(b);
                    if (available.length === 0) break;

                    var move;
                    if (turn === 'X') {
                        move = ai.getMove(b, 'hard', 'X');
                    } else {
                        move = available[Math.floor(Math.random() * available.length)];
                    }
                    b[move] = turn;

                    var result = logic.checkWinner(b);
                    if (result.winner === 'O') { losses++; break; }
                    if (result.winner === 'X') break;
                    turn = (turn === 'X') ? 'O' : 'X';
                }
            }
            assert.equal(losses, 0, 'Hard AI (X) should never lose against random O');
        });
    });

    TicTacTest.describe('AIPlayer — Medium (50/50)', function (ctx) {

        ctx.it('always returns a valid move', function () {
            var b = board(['X',null,null, 'O','X',null, null,null,null]);
            for (var i = 0; i < 20; i++) {
                var move = ai.getMove(b, 'medium', 'O');
                var available = logic.getAvailableMoves(b);
                assert.includes(available, move, 'medium move should be valid');
            }
        });
    });

    TicTacTest.describe('AIPlayer — Edge cases', function (ctx) {

        ctx.it('handles nearly-full board', function () {
            var b = board(['X','O','X', 'O','X','O', 'O','X',null]);
            var move = ai.getMove(b, 'hard', 'O');
            assert.equal(move, 8, 'only move available is 8');
        });

        ctx.it('handles first move on empty board', function () {
            var b = board([null,null,null, null,null,null, null,null,null]);
            var move = ai.getMove(b, 'hard', 'X');
            var available = logic.getAvailableMoves(b);
            assert.includes(available, move, 'first move should be valid');
        });
    });

})();
