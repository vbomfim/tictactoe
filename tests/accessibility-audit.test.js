/**
 * Accessibility Audit Test Suite — QA Guardian
 * Static validation of accessibility patterns in source code.
 * Since we run in Node without a full DOM, we verify the SOURCE CODE
 * contains correct accessibility attributes and patterns.
 *
 * Tags: [AC-17], [AC-18], [COVERAGE]
 */
(function () {
    'use strict';

    var assert = TicTacTest.assert;
    var fs, path;

    // Only run in Node.js
    if (typeof require === 'undefined') return;

    fs = require('fs');
    path = require('path');

    var ROOT = path.resolve(__dirname, '..');
    var indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
    var boardRendererSrc = fs.readFileSync(path.join(ROOT, 'src', 'board-renderer.js'), 'utf-8');
    var statusDisplaySrc = fs.readFileSync(path.join(ROOT, 'src', 'status-display.js'), 'utf-8');
    var themeManagerSrc = fs.readFileSync(path.join(ROOT, 'src', 'theme-manager.js'), 'utf-8');
    var stylesCss = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf-8');

    TicTacTest.describe('Accessibility — HTML structure [AC-17]', function (ctx) {

        ctx.it('html element has lang attribute', function () {
            assert.ok(indexHtml.indexOf('lang="en"') !== -1,
                'html should have lang="en"');
        });

        ctx.it('board has role="grid"', function () {
            assert.ok(indexHtml.indexOf('role="grid"') !== -1,
                'board should have role="grid"');
        });

        ctx.it('board has aria-label', function () {
            assert.ok(indexHtml.indexOf('aria-label="Tic Tac Toe board"') !== -1,
                'board should have descriptive aria-label');
        });

        ctx.it('status element has aria-live="polite"', function () {
            assert.ok(indexHtml.indexOf('aria-live="polite"') !== -1,
                'status should use aria-live="polite"');
        });

        ctx.it('screen reader announcer has aria-live="assertive"', function () {
            assert.ok(indexHtml.indexOf('aria-live="assertive"') !== -1,
                'announcer should use aria-live="assertive"');
        });

        ctx.it('screen reader announcer has aria-atomic="true"', function () {
            assert.ok(indexHtml.indexOf('aria-atomic="true"') !== -1,
                'announcer should have aria-atomic="true"');
        });

        ctx.it('all interactive elements have labels or aria-labels', function () {
            // Check that selects have aria-labels
            assert.ok(indexHtml.indexOf('aria-label="Game Mode"') !== -1,
                'mode select should have aria-label');
            assert.ok(indexHtml.indexOf('aria-label="AI Difficulty"') !== -1,
                'difficulty select should have aria-label');
            assert.ok(indexHtml.indexOf('aria-label="Who goes first"') !== -1,
                'first-move select should have aria-label');
        });

        ctx.it('theme button has aria-label', function () {
            assert.ok(indexHtml.indexOf('aria-label="Switch to dark mode"') !== -1,
                'theme button should have aria-label');
        });

        ctx.it('viewport meta tag present for responsive [AC-19]', function () {
            assert.ok(indexHtml.indexOf('viewport') !== -1,
                'should have viewport meta tag');
            assert.ok(indexHtml.indexOf('width=device-width') !== -1,
                'viewport should set width=device-width');
        });
    });

    TicTacTest.describe('Accessibility — BoardRenderer patterns [AC-17]', function (ctx) {

        ctx.it('cells are created as <button> elements (keyboard accessible)', function () {
            assert.ok(boardRendererSrc.indexOf("createElement('button')") !== -1,
                'cells should be button elements for native keyboard support');
        });

        ctx.it('cells get role="gridcell"', function () {
            assert.ok(boardRendererSrc.indexOf("'role', 'gridcell'") !== -1,
                'cells should have role="gridcell"');
        });

        ctx.it('cells have dynamic aria-label on render', function () {
            assert.ok(boardRendererSrc.indexOf("'aria-label'") !== -1,
                'cells should set aria-label dynamically');
        });

        ctx.it('cells have tabIndex set for keyboard navigation', function () {
            assert.ok(boardRendererSrc.indexOf('tabIndex') !== -1,
                'cells should be focusable');
        });

        ctx.it('SVG overlay has aria-hidden="true"', function () {
            assert.ok(boardRendererSrc.indexOf("'aria-hidden', 'true'") !== -1,
                'SVG overlay should be hidden from screen readers');
        });

        ctx.it('cells are disabled when game is over', function () {
            assert.ok(boardRendererSrc.indexOf('cell.disabled') !== -1,
                'cells should be disabled when game over');
        });
    });

    TicTacTest.describe('Accessibility — StatusDisplay screen reader [AC-18]', function (ctx) {

        ctx.it('updates aria-live announcer element', function () {
            assert.ok(statusDisplaySrc.indexOf('_announceEl.textContent') !== -1,
                'should update announcer text for screen readers');
        });

        ctx.it('provides distinct messages for win, draw, and playing', function () {
            assert.ok(statusDisplaySrc.indexOf('Wins') !== -1, 'should have win message');
            assert.ok(statusDisplaySrc.indexOf('Draw') !== -1, 'should have draw message');
            assert.ok(statusDisplaySrc.indexOf('Turn') !== -1, 'should have turn message');
        });
    });

    TicTacTest.describe('Accessibility — ThemeManager [AC-16]', function (ctx) {

        ctx.it('updates aria-label on theme toggle button', function () {
            assert.ok(themeManagerSrc.indexOf("'aria-label'") !== -1,
                'theme toggle should update aria-label');
        });

        ctx.it('persists theme to localStorage', function () {
            assert.ok(themeManagerSrc.indexOf('localStorage.setItem') !== -1,
                'should persist theme');
            assert.ok(themeManagerSrc.indexOf('localStorage.getItem') !== -1,
                'should read persisted theme');
        });
    });

    TicTacTest.describe('Accessibility — CSS patterns [AC-17] [AC-19]', function (ctx) {

        ctx.it('has .sr-only class for screen reader text', function () {
            assert.ok(stylesCss.indexOf('.sr-only') !== -1,
                'should have sr-only utility class');
        });

        ctx.it('has :focus-visible styles for keyboard navigation', function () {
            assert.ok(stylesCss.indexOf(':focus-visible') !== -1,
                'should have focus-visible styles');
        });

        ctx.it('has mobile breakpoint at 480px [AC-19]', function () {
            assert.ok(stylesCss.indexOf('480px') !== -1,
                'should have 480px mobile breakpoint');
        });

        ctx.it('has dark theme CSS variables [AC-16]', function () {
            assert.ok(stylesCss.indexOf('[data-theme="dark"]') !== -1,
                'should have dark theme variables');
        });
    });

})();
