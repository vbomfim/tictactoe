/**
 * GameState Test Suite [TDD]
 * Tests state management, transitions, guards, observer pattern, and reset.
 */
(function () {
    'use strict';

    var assert = TicTacTest.assert;

    /** Create a fresh GameState for each test to avoid pollution. */
    function freshState() {
        return new TicTacToe.GameState();
    }

    TicTacTest.describe('GameState — Initial state', function (ctx) {

        ctx.it('starts with empty board of 9 nulls', function () {
            var gs = freshState();
            var state = gs.getState();
            assert.equal(state.board.length, 9);
            for (var i = 0; i < 9; i++) {
                assert.isNull(state.board[i], 'cell ' + i + ' should be null');
            }
        });

        ctx.it('starts with X as current player', function () {
            var gs = freshState();
            assert.equal(gs.getState().currentPlayer, 'X');
        });

        ctx.it('starts in playing status', function () {
            var gs = freshState();
            assert.equal(gs.getState().gameStatus, 'playing');
        });

        ctx.it('starts with zero scores', function () {
            var gs = freshState();
            var scores = gs.getState().scores;
            assert.equal(scores.X, 0);
            assert.equal(scores.O, 0);
            assert.equal(scores.draws, 0);
        });
    });

    TicTacTest.describe('GameState — makeMove', function (ctx) {

        // AC2: Player places a mark
        ctx.it('places X in the chosen cell and switches to O', function () {
            var gs = freshState();
            var result = gs.makeMove(4);
            assert.isTrue(result, 'makeMove should return true');
            assert.equal(gs.getState().board[4], 'X');
            assert.equal(gs.getState().currentPlayer, 'O');
        });

        // AC3: Cannot overwrite occupied cell
        ctx.it('rejects move on occupied cell', function () {
            var gs = freshState();
            gs.makeMove(0); // X at 0
            var result = gs.makeMove(0); // try O at 0
            assert.isFalse(result, 'should reject occupied cell');
            assert.equal(gs.getState().board[0], 'X', 'cell should remain X');
            assert.equal(gs.getState().currentPlayer, 'O', 'turn should not change');
        });

        ctx.it('rejects move after game is won', function () {
            var gs = freshState();
            // X wins: 0, _, 1, _, 2
            gs.makeMove(0); // X
            gs.makeMove(3); // O
            gs.makeMove(1); // X
            gs.makeMove(4); // O
            gs.makeMove(2); // X wins
            assert.equal(gs.getState().gameStatus, 'won');
            var result = gs.makeMove(5); // try after game over
            assert.isFalse(result, 'should reject move after game won');
        });

        ctx.it('detects a win and sets winner + winLine', function () {
            var gs = freshState();
            gs.makeMove(0); // X
            gs.makeMove(3); // O
            gs.makeMove(1); // X
            gs.makeMove(4); // O
            gs.makeMove(2); // X wins top row
            var state = gs.getState();
            assert.equal(state.gameStatus, 'won');
            assert.equal(state.winner, 'X');
            assert.deepEqual(state.winLine, [0, 1, 2]);
        });

        // AC7: Draw detection
        ctx.it('detects a draw', function () {
            var gs = freshState();
            // Classic draw: X O X / X O O / O X X
            var moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
            for (var i = 0; i < moves.length; i++) {
                gs.makeMove(moves[i]);
            }
            var state = gs.getState();
            assert.equal(state.gameStatus, 'draw');
            assert.isNull(state.winner);
        });

        ctx.it('increments winner score on win', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1); gs.makeMove(4); gs.makeMove(2); // X wins
            assert.equal(gs.getState().scores.X, 1);
        });

        ctx.it('increments draws score on draw', function () {
            var gs = freshState();
            var moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
            for (var i = 0; i < moves.length; i++) {
                gs.makeMove(moves[i]);
            }
            assert.equal(gs.getState().scores.draws, 1);
        });
    });

    TicTacTest.describe('GameState — resetBoard', function (ctx) {

        // AC8: New Game reset
        ctx.it('clears the board and resets to X turn', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(1);
            gs.resetBoard();
            var state = gs.getState();
            for (var i = 0; i < 9; i++) {
                assert.isNull(state.board[i]);
            }
            assert.equal(state.currentPlayer, 'X');
            assert.equal(state.gameStatus, 'playing');
        });

        // AC9: Preserves scores
        ctx.it('preserves scores across reset', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1); gs.makeMove(4); gs.makeMove(2); // X wins
            gs.resetBoard();
            assert.equal(gs.getState().scores.X, 1, 'scores should persist');
        });
    });

    TicTacTest.describe('GameState — resetScores', function (ctx) {

        // AC10: Reset scores
        ctx.it('zeros all scores', function () {
            var gs = freshState();
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1); gs.makeMove(4); gs.makeMove(2); // X wins
            gs.resetScores();
            var scores = gs.getState().scores;
            assert.equal(scores.X, 0);
            assert.equal(scores.O, 0);
            assert.equal(scores.draws, 0);
        });
    });

    TicTacTest.describe('GameState — subscribe (observer pattern)', function (ctx) {

        ctx.it('notifies subscriber on makeMove', function () {
            var gs = freshState();
            var called = 0;
            gs.subscribe(function () { called++; });
            gs.makeMove(0);
            assert.equal(called, 1, 'subscriber should be called once');
        });

        ctx.it('notifies subscriber on resetBoard', function () {
            var gs = freshState();
            var called = 0;
            gs.subscribe(function () { called++; });
            gs.resetBoard();
            assert.equal(called, 1);
        });

        ctx.it('notifies multiple subscribers', function () {
            var gs = freshState();
            var a = 0, b = 0;
            gs.subscribe(function () { a++; });
            gs.subscribe(function () { b++; });
            gs.makeMove(0);
            assert.equal(a, 1);
            assert.equal(b, 1);
        });
    });

    TicTacTest.describe('GameState — setGameMode / setDifficulty / setHumanSide', function (ctx) {

        ctx.it('changes game mode', function () {
            var gs = freshState();
            gs.setGameMode('pve');
            assert.equal(gs.getState().gameMode, 'pve');
        });

        ctx.it('changes difficulty', function () {
            var gs = freshState();
            gs.setDifficulty('hard');
            assert.equal(gs.getState().difficulty, 'hard');
        });

        ctx.it('changes human side', function () {
            var gs = freshState();
            gs.setHumanSide('O');
            assert.equal(gs.getState().humanSide, 'O');
        });
    });

})();
