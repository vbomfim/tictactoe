/**
 * Integration Test Suite — QA Guardian
 * Tests full game flows through GameState + GameLogic + AIPlayer working together.
 * Scope: service-to-service integration, NOT unit tests.
 *
 * Tags: [AC-N] = acceptance criterion, [EDGE] = edge case,
 *        [COVERAGE] = fills gap, [BOUNDARY] = component boundary
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
    // Integration: Full PvP Game Flows
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Integration — PvP full game: X wins [AC1-AC6]', function (ctx) {

        ctx.it('[AC-4] X wins via top row in a complete game flow', function () {
            var gs = freshState();
            // X=0, O=3, X=1, O=4, X=2 → X wins [0,1,2]
            assert.isTrue(gs.makeMove(0));  // X
            assert.isTrue(gs.makeMove(3));  // O
            assert.isTrue(gs.makeMove(1));  // X
            assert.isTrue(gs.makeMove(4));  // O
            assert.isTrue(gs.makeMove(2));  // X wins

            var s = gs.getState();
            assert.equal(s.gameStatus, 'won');
            assert.equal(s.winner, 'X');
            assert.deepEqual(s.winLine, [0, 1, 2]);
            assert.equal(s.scores.X, 1);
            assert.equal(s.scores.O, 0);
            assert.equal(s.scores.draws, 0);
        });

        ctx.it('[AC-5] O wins via left column in a complete game flow', function () {
            var gs = freshState();
            // X=1, O=0, X=4, O=3, X=8, O=6 → O wins [0,3,6]
            gs.makeMove(1); // X
            gs.makeMove(0); // O
            gs.makeMove(4); // X
            gs.makeMove(3); // O
            gs.makeMove(8); // X
            gs.makeMove(6); // O wins

            var s = gs.getState();
            assert.equal(s.gameStatus, 'won');
            assert.equal(s.winner, 'O');
            assert.deepEqual(s.winLine, [0, 3, 6]);
            assert.equal(s.scores.O, 1);
        });

        ctx.it('[AC-6] X wins via main diagonal', function () {
            var gs = freshState();
            // X=0, O=1, X=4, O=2, X=8 → X wins [0,4,8]
            gs.makeMove(0); gs.makeMove(1); gs.makeMove(4);
            gs.makeMove(2); gs.makeMove(8);

            var s = gs.getState();
            assert.equal(s.gameStatus, 'won');
            assert.equal(s.winner, 'X');
            assert.deepEqual(s.winLine, [0, 4, 8]);
        });

        ctx.it('[AC-7] draw game completes with correct state', function () {
            var gs = freshState();
            // X O X / X O O / O X X → draw
            var moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
            for (var i = 0; i < moves.length; i++) {
                gs.makeMove(moves[i]);
            }
            var s = gs.getState();
            assert.equal(s.gameStatus, 'draw');
            assert.isNull(s.winner);
            assert.isNull(s.winLine);
            assert.equal(s.scores.draws, 1);
        });
    });

    // ─────────────────────────────────────────────────────
    // Integration: Score Accumulation Across Multiple Games
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Integration — Multi-game score tracking [AC8-AC10]', function (ctx) {

        ctx.it('[AC-9] scores accumulate correctly across 3 games', function () {
            var gs = freshState();

            // Game 1: X wins
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1);
            gs.makeMove(4); gs.makeMove(2);
            assert.equal(gs.getState().scores.X, 1);

            // Reset board for game 2
            gs.resetBoard();
            assert.equal(gs.getState().scores.X, 1, 'score preserved after reset');

            // Game 2: O wins
            gs.makeMove(1); gs.makeMove(0); gs.makeMove(4);
            gs.makeMove(3); gs.makeMove(8); gs.makeMove(6);
            assert.equal(gs.getState().scores.O, 1);
            assert.equal(gs.getState().scores.X, 1);

            // Reset board for game 3
            gs.resetBoard();

            // Game 3: Draw
            var drawMoves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
            for (var i = 0; i < drawMoves.length; i++) {
                gs.makeMove(drawMoves[i]);
            }
            var s = gs.getState();
            assert.equal(s.scores.X, 1);
            assert.equal(s.scores.O, 1);
            assert.equal(s.scores.draws, 1);
        });

        ctx.it('[AC-10] resetScores zeros all scores after multiple games', function () {
            var gs = freshState();

            // Play a game X wins
            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1);
            gs.makeMove(4); gs.makeMove(2);
            gs.resetBoard();

            // Play another — O wins
            gs.makeMove(1); gs.makeMove(0); gs.makeMove(4);
            gs.makeMove(3); gs.makeMove(8); gs.makeMove(6);

            gs.resetScores();
            var s = gs.getState();
            assert.equal(s.scores.X, 0);
            assert.equal(s.scores.O, 0);
            assert.equal(s.scores.draws, 0);
        });
    });

    // ─────────────────────────────────────────────────────
    // Integration: PvE — GameState + AIPlayer working together
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Integration — PvE game flow [AC11-AC14]', function (ctx) {

        ctx.it('[AC-12] complete PvE game: human (X) vs hard AI (O)', function () {
            var gs = freshState();
            gs.setGameMode('pve');
            gs.setDifficulty('hard');

            var maxMoves = 9;
            var moveCount = 0;

            while (gs.getState().gameStatus === 'playing' && moveCount < maxMoves) {
                var state = gs.getState();
                if (state.currentPlayer === 'X') {
                    // Human plays first available move
                    var available = logic.getAvailableMoves(state.board);
                    gs.makeMove(available[0]);
                } else {
                    // AI plays
                    var aiMove = ai.getMove(state.board, 'hard', 'O');
                    gs.makeMove(aiMove);
                }
                moveCount++;
            }

            var final_state = gs.getState();
            assert.ok(
                final_state.gameStatus === 'won' || final_state.gameStatus === 'draw',
                'game should end in win or draw'
            );
            // Hard AI should never lose
            if (final_state.gameStatus === 'won') {
                assert.equal(final_state.winner, 'O', 'hard AI should not lose');
            }
        });

        ctx.it('[AC-13] PvE easy AI always returns valid moves through full game', function () {
            var gs = freshState();
            gs.setGameMode('pve');
            gs.setDifficulty('easy');

            var moveCount = 0;
            while (gs.getState().gameStatus === 'playing' && moveCount < 9) {
                var state = gs.getState();
                if (state.currentPlayer === 'X') {
                    var available = logic.getAvailableMoves(state.board);
                    gs.makeMove(available[0]);
                } else {
                    var aiMove = ai.getMove(state.board, 'easy', 'O');
                    assert.ok(
                        logic.getAvailableMoves(state.board).indexOf(aiMove) !== -1,
                        'easy AI move must be valid (move ' + moveCount + ')'
                    );
                    gs.makeMove(aiMove);
                }
                moveCount++;
            }
            assert.ok(
                gs.getState().gameStatus !== 'playing',
                'game should complete'
            );
        });

        ctx.it('[AC-14] hard AI (O) never loses over 100 full PvE simulations', function () {
            var aiLosses = 0;
            for (var game = 0; game < 100; game++) {
                var gs = freshState();
                gs.setGameMode('pve');
                gs.setDifficulty('hard');

                var moveCount = 0;
                while (gs.getState().gameStatus === 'playing' && moveCount < 9) {
                    var state = gs.getState();
                    if (state.currentPlayer === 'X') {
                        // Human plays random
                        var available = logic.getAvailableMoves(state.board);
                        var randomIdx = Math.floor(Math.random() * available.length);
                        gs.makeMove(available[randomIdx]);
                    } else {
                        var aiMove = ai.getMove(state.board, 'hard', 'O');
                        gs.makeMove(aiMove);
                    }
                    moveCount++;
                }
                if (gs.getState().winner === 'X') aiLosses++;
            }
            assert.equal(aiLosses, 0, 'hard AI must not lose any of 100 games');
        });

        ctx.it('[AC-14] two hard AIs playing each other always draw [COVERAGE]', function () {
            var nonDraws = 0;
            for (var game = 0; game < 50; game++) {
                var gs = freshState();
                var moveCount = 0;
                while (gs.getState().gameStatus === 'playing' && moveCount < 9) {
                    var state = gs.getState();
                    var side = state.currentPlayer;
                    var move = ai.getMove(state.board, 'hard', side);
                    gs.makeMove(move);
                    moveCount++;
                }
                if (gs.getState().gameStatus !== 'draw') nonDraws++;
            }
            assert.equal(nonDraws, 0, 'two perfect AIs must always draw');
        });
    });

    // ─────────────────────────────────────────────────────
    // Integration: AI-first move (side selection)
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Integration — AI goes first (side selection) [ADDITIONAL]', function (ctx) {

        ctx.it('resetBoard with aiGoesFirst=true and pve sets currentPlayer to O', function () {
            var gs = freshState();
            gs.setGameMode('pve');
            gs.setAiGoesFirst(true);
            gs.resetBoard();
            assert.equal(gs.getState().currentPlayer, 'O',
                'AI (O) should move first when aiGoesFirst is true');
        });

        ctx.it('resetBoard with aiGoesFirst=false in pve sets currentPlayer to X', function () {
            var gs = freshState();
            gs.setGameMode('pve');
            gs.setAiGoesFirst(false);
            gs.resetBoard();
            assert.equal(gs.getState().currentPlayer, 'X');
        });

        ctx.it('resetBoard in PvP ignores aiGoesFirst', function () {
            var gs = freshState();
            gs.setGameMode('pvp');
            gs.setAiGoesFirst(true);
            gs.resetBoard();
            assert.equal(gs.getState().currentPlayer, 'X',
                'PvP should always start with X');
        });

        ctx.it('[AC-14] complete game with AI going first — AI never loses', function () {
            var losses = 0;
            for (var game = 0; game < 50; game++) {
                var gs = freshState();
                gs.setGameMode('pve');
                gs.setDifficulty('hard');
                gs.setAiGoesFirst(true);
                gs.resetBoard(); // now currentPlayer is 'O'

                var moveCount = 0;
                while (gs.getState().gameStatus === 'playing' && moveCount < 9) {
                    var state = gs.getState();
                    if (state.currentPlayer === 'O') {
                        var aiMove = ai.getMove(state.board, 'hard', 'O');
                        gs.makeMove(aiMove);
                    } else {
                        var avail = logic.getAvailableMoves(state.board);
                        gs.makeMove(avail[Math.floor(Math.random() * avail.length)]);
                    }
                    moveCount++;
                }
                if (gs.getState().winner === 'X') losses++;
            }
            assert.equal(losses, 0, 'AI going first should never lose');
        });
    });

    // ─────────────────────────────────────────────────────
    // Integration: Observer receives correct state snapshots
    // ─────────────────────────────────────────────────────
    TicTacTest.describe('Integration — Observer receives correct snapshots [BOUNDARY]', function (ctx) {

        ctx.it('subscriber receives winning state with correct fields', function () {
            var gs = freshState();
            var capturedStates = [];
            gs.subscribe(function (state) {
                capturedStates.push(state);
            });

            gs.makeMove(0); gs.makeMove(3); gs.makeMove(1);
            gs.makeMove(4); gs.makeMove(2); // X wins

            // Last notification should be the win
            var last = capturedStates[capturedStates.length - 1];
            assert.equal(last.gameStatus, 'won');
            assert.equal(last.winner, 'X');
            assert.deepEqual(last.winLine, [0, 1, 2]);
            assert.equal(last.scores.X, 1);
        });

        ctx.it('subscriber receives draw state with null winner', function () {
            var gs = freshState();
            var lastState = null;
            gs.subscribe(function (state) {
                lastState = state;
            });

            var moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
            for (var i = 0; i < moves.length; i++) {
                gs.makeMove(moves[i]);
            }

            assert.equal(lastState.gameStatus, 'draw');
            assert.isNull(lastState.winner);
            assert.isNull(lastState.winLine);
        });

        ctx.it('subscriber is notified on every accepted move [COVERAGE]', function () {
            var gs = freshState();
            var callCount = 0;
            gs.subscribe(function () { callCount++; });

            gs.makeMove(0); // accepted → notify
            gs.makeMove(0); // rejected → NO notify
            gs.makeMove(1); // accepted → notify

            assert.equal(callCount, 2, 'should only notify on accepted moves');
        });

        ctx.it('subscriber receives turn alternation X→O→X [COVERAGE]', function () {
            var gs = freshState();
            var players = [];
            gs.subscribe(function (state) {
                players.push(state.currentPlayer);
            });

            gs.makeMove(0); // X plays → switches to O
            gs.makeMove(1); // O plays → switches to X
            gs.makeMove(2); // X plays → switches to O

            assert.equal(players[0], 'O');
            assert.equal(players[1], 'X');
            assert.equal(players[2], 'O');
        });
    });

})();
