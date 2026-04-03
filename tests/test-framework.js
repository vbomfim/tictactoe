/**
 * TicTacTest — Minimal test framework (zero dependencies).
 * Provides describe/it/assert for browser-based unit tests.
 * Results render to #results and #summary divs.
 *
 * Usage:
 *   TicTacTest.describe('Suite', ({ it }) => {
 *       it('should do X', () => { TicTacTest.assert.equal(1, 1); });
 *   });
 *   TicTacTest.run();
 */
var TicTacTest = (function () {
    'use strict';

    var suites = [];
    var totalPass = 0;
    var totalFail = 0;

    /**
     * Register a test suite.
     * @param {string} name - Suite name
     * @param {function} fn - Receives { it } helper
     */
    function describe(name, fn) {
        var tests = [];
        fn({
            it: function (testName, testFn) {
                tests.push({ name: testName, fn: testFn });
            }
        });
        suites.push({ name: name, tests: tests });
    }

    /** Deep equality check for arrays and primitives. */
    function deepEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return a === b;
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (var i = 0; i < a.length; i++) {
                if (!deepEqual(a[i], b[i])) return false;
            }
            return true;
        }
        if (typeof a === 'object' && typeof b === 'object') {
            var keysA = Object.keys(a);
            var keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            for (var j = 0; j < keysA.length; j++) {
                if (!deepEqual(a[keysA[j]], b[keysA[j]])) return false;
            }
            return true;
        }
        return false;
    }

    var assert = {
        /** Assert strict equality. */
        equal: function (actual, expected, msg) {
            if (actual !== expected) {
                throw new Error(
                    (msg || 'equal') + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)
                );
            }
        },
        /** Assert deep equality (arrays, objects). */
        deepEqual: function (actual, expected, msg) {
            if (!deepEqual(actual, expected)) {
                throw new Error(
                    (msg || 'deepEqual') + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)
                );
            }
        },
        /** Assert value is truthy. */
        ok: function (value, msg) {
            if (!value) {
                throw new Error((msg || 'ok') + ': expected truthy, got ' + JSON.stringify(value));
            }
        },
        /** Assert value is null. */
        isNull: function (value, msg) {
            if (value !== null) {
                throw new Error((msg || 'isNull') + ': expected null, got ' + JSON.stringify(value));
            }
        },
        /** Assert value is true. */
        isTrue: function (value, msg) {
            if (value !== true) {
                throw new Error((msg || 'isTrue') + ': expected true, got ' + JSON.stringify(value));
            }
        },
        /** Assert value is false. */
        isFalse: function (value, msg) {
            if (value !== false) {
                throw new Error((msg || 'isFalse') + ': expected false, got ' + JSON.stringify(value));
            }
        },
        /** Assert array includes a value. */
        includes: function (array, value, msg) {
            if (!Array.isArray(array) || array.indexOf(value) === -1) {
                throw new Error(
                    (msg || 'includes') + ': expected ' + JSON.stringify(array) + ' to include ' + JSON.stringify(value)
                );
            }
        },
        /** Assert a function throws. */
        throws: function (fn, msg) {
            var threw = false;
            try { fn(); } catch (e) { threw = true; }
            if (!threw) {
                throw new Error((msg || 'throws') + ': expected function to throw');
            }
        }
    };

    /** Run all registered suites and render results. */
    function run() {
        var container = document.getElementById('results');
        var summaryEl = document.getElementById('summary');

        suites.forEach(function (suite) {
            var suiteDiv = document.createElement('div');
            suiteDiv.className = 'suite';
            var nameEl = document.createElement('div');
            nameEl.className = 'suite-name';
            nameEl.textContent = suite.name;
            suiteDiv.appendChild(nameEl);

            suite.tests.forEach(function (test) {
                var testDiv = document.createElement('div');
                testDiv.className = 'test';
                try {
                    test.fn();
                    testDiv.classList.add('pass');
                    testDiv.textContent = '✅ ' + test.name;
                    totalPass++;
                } catch (err) {
                    testDiv.classList.add('fail');
                    testDiv.innerHTML = '❌ ' + test.name + '<span class="detail">' + err.message + '</span>';
                    totalFail++;
                }
                suiteDiv.appendChild(testDiv);
            });

            container.appendChild(suiteDiv);
        });

        summaryEl.className = 'summary ' + (totalFail === 0 ? 'all-pass' : 'has-fail');
        summaryEl.textContent = totalFail === 0
            ? '🎉 All ' + totalPass + ' tests passed!'
            : '⚠️ ' + totalFail + ' failed, ' + totalPass + ' passed (' + (totalPass + totalFail) + ' total)';

        // Expose for CLI scraping
        window.__TEST_RESULTS__ = { pass: totalPass, fail: totalFail, total: totalPass + totalFail };
    }

    return { describe: describe, assert: assert, run: run };
})();
