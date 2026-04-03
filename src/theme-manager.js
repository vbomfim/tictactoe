/**
 * ThemeManager — Toggles dark/light mode, persists to localStorage.
 * [SOLID-SRP]
 *
 * @namespace TicTacToe.ThemeManager
 */
var TicTacToe = TicTacToe || {};

TicTacToe.ThemeManager = (function () {
    'use strict';

    var STORAGE_KEY = 'ttt-theme';
    var _toggleBtn = null;
    var _callback = null;

    /**
     * Initialize theme manager.
     * Reads saved preference from localStorage and applies it.
     * @param {HTMLElement} toggleButton - The theme toggle button
     * @param {function} [onChange] - Called with 'light' or 'dark' on change
     * @returns {string} The current theme
     */
    function init(toggleButton, onChange) {
        _toggleBtn = toggleButton;
        _callback = onChange;

        var saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
        var theme;
        if (saved === 'dark' || saved === 'light') {
            theme = saved;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = 'dark';
        } else {
            theme = 'light';
        }
        applyTheme(theme);

        _toggleBtn.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme');
            var next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            if (_callback) _callback(next);
        });

        return theme;
    }

    /**
     * Apply theme to the document and persist.
     * @param {string} theme - 'light' or 'dark'
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* ignore */ }
        if (_toggleBtn) {
            _toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
            _toggleBtn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
        }
    }

    /**
     * Get the current theme.
     * @returns {string} 'light' or 'dark'
     */
    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    return {
        init: init,
        applyTheme: applyTheme,
        getTheme: getTheme
    };
})();
