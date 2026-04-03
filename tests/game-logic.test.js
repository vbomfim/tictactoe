/**
 * GameLogic Test Suite [TDD]
 * Tests all pure functions: win detection (8 lines), draw, available moves.
 */
(function () {
    'use strict';

    var assert = TicTacTest.assert;
    var logic = TicTacToe.GameLogic;

    // Helper: create a board from shorthand ('X', 'O', or null)
    function board(cells) {
        return cells.map(function (c) { return c || null; });
    }

    TicTacTest.describe('GameLogic — checkWinner', function (ctx) {

        // AC4: Horizontal wins
        ctx.it('detects X winning on top row [0,1,2]', function () {
            var result = logic.checkWinner(board(['X','X','X', null,null,null, null,null,null]));
            assert.equal(result.winner, 'X');
            assert.deepEqual(result.line, [0, 1, 2]);
        });

        ctx.it('detects O winning on middle row [3,4,5]', function () {
            var result = logic.checkWinner(board([null,null,null, 'O','O','O', null,null,null]));
            assert.equal(result.winner, 'O');
            assert.deepEqual(result.line, [3, 4, 5]);
        });

        ctx.it('detects X winning on bottom row [6,7,8]', function () {
            var result = logic.checkWinner(board([null,null,null, null,null,null, 'X','X','X']));
            assert.equal(result.winner, 'X');
            assert.deepEqual(result.line, [6, 7, 8]);
        });

        // AC5: Vertical wins
        ctx.it('detects O winning on left column [0,3,6]', function () {
            var result = logic.checkWinner(board(['O',null,null, 'O',null,null, 'O',null,null]));
            assert.equal(result.winner, 'O');
            assert.deepEqual(result.line, [0, 3, 6]);
        });

        ctx.it('detects X winning on center column [1,4,7]', function () {
            var result = logic.checkWinner(board([null,'X',null, null,'X',null, null,'X',null]));
            assert.equal(result.winner, 'X');
            assert.deepEqual(result.line, [1, 4, 7]);
        });

        ctx.it('detects O winning on right column [2,5,8]', function () {
            var result = logic.checkWinner(board([null,null,'O', null,null,'O', null,null,'O']));
            assert.equal(result.winner, 'O');
            assert.deepEqual(result.line, [2, 5, 8]);
        });

        // AC6: Diagonal wins
        ctx.it('detects X winning on main diagonal [0,4,8]', function () {
            var result = logic.checkWinner(board(['X',null,null, null,'X',null, null,null,'X']));
            assert.equal(result.winner, 'X');
            assert.deepEqual(result.line, [0, 4, 8]);
        });

        ctx.it('detects O winning on anti-diagonal [2,4,6]', function () {
            var result = logic.checkWinner(board([null,null,'O', null,'O',null, 'O',null,null]));
            assert.equal(result.winner, 'O');
            assert.deepEqual(result.line, [2, 4, 6]);
        });

        // No winner
        ctx.it('returns null winner for empty board', function () {
            var result = logic.checkWinner(board([null,null,null, null,null,null, null,null,null]));
            assert.isNull(result.winner);
            assert.isNull(result.line);
        });

        ctx.it('returns null winner for partial board with no 3-in-a-row', function () {
            var result = logic.checkWinner(board(['X','O','X', null,null,null, null,null,null]));
            assert.isNull(result.winner);
        });
    });

    TicTacTest.describe('GameLogic — isDraw', function (ctx) {

        // AC7: Draw detection
        ctx.it('returns true when board is full with no winner', function () {
            var b = board(['X','O','X', 'X','O','O', 'O','X','X']);
            assert.isTrue(logic.isDraw(b));
        });

        ctx.it('returns false when board is not full', function () {
            var b = board(['X','O',null, null,null,null, null,null,null]);
            assert.isFalse(logic.isDraw(b));
        });

        ctx.it('returns false when board is full but has a winner', function () {
            // X wins top row, board is full
            var b = board(['X','X','X', 'O','O','X', 'X','O','O']);
            assert.isFalse(logic.isDraw(b));
        });
    });

    TicTacTest.describe('GameLogic — getAvailableMoves', function (ctx) {

        ctx.it('returns all 9 indices for empty board', function () {
            var moves = logic.getAvailableMoves(board([null,null,null, null,null,null, null,null,null]));
            assert.deepEqual(moves, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
        });

        ctx.it('returns empty array for full board', function () {
            var moves = logic.getAvailableMoves(board(['X','O','X', 'O','X','O', 'O','X','O']));
            assert.deepEqual(moves, []);
        });

        ctx.it('returns only null positions', function () {
            var moves = logic.getAvailableMoves(board(['X',null,'O', null,'X',null, null,null,null]));
            assert.deepEqual(moves, [1, 3, 5, 6, 7, 8]);
        });
    });

})();
