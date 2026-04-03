/**
 * Node.js Test Runner — runs the browser test suites in Node via vm.runInThisContext.
 * Usage: node tests/run-node.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

// Minimal browser stubs
global.document = {
    documentElement: {
        setAttribute: function () {},
        getAttribute: function () { return 'light'; }
    }
};
global.localStorage = {
    _store: {},
    getItem: function (k) { return this._store[k] || null; },
    setItem: function (k, v) { this._store[k] = String(v); },
    removeItem: function (k) { delete this._store[k]; }
};

// Load source files in dependency order
var srcOrder = ['game-logic.js', 'ai-player.js', 'game-state.js'];
srcOrder.forEach(function (f) {
    var code = fs.readFileSync(path.join(ROOT, 'src', f), 'utf-8');
    vm.runInThisContext(code, { filename: 'src/' + f });
});

// Test framework
var totalPass = 0;
var totalFail = 0;

var TicTacTest = {
    describe: function (name, fn) {
        console.log('\n  ' + name);
        fn({
            it: function (testName, testFn) {
                try {
                    testFn();
                    totalPass++;
                    console.log('    \x1b[32m✅ ' + testName + '\x1b[0m');
                } catch (e) {
                    totalFail++;
                    console.log('    \x1b[31m❌ ' + testName + '\x1b[0m');
                    console.log('       \x1b[31m' + e.message + '\x1b[0m');
                }
            }
        });
    },
    assert: {
        equal: function (a, b, msg) {
            if (a !== b) throw new Error((msg || 'equal') + ': expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a));
        },
        deepEqual: function (a, b, msg) {
            if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((msg || 'deepEqual') + ': expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a));
        },
        ok: function (v, msg) {
            if (!v) throw new Error((msg || 'ok') + ': expected truthy, got ' + JSON.stringify(v));
        },
        isNull: function (v, msg) {
            if (v !== null) throw new Error((msg || 'isNull') + ': expected null, got ' + JSON.stringify(v));
        },
        isTrue: function (v, msg) {
            if (v !== true) throw new Error((msg || 'isTrue') + ': expected true, got ' + JSON.stringify(v));
        },
        isFalse: function (v, msg) {
            if (v !== false) throw new Error((msg || 'isFalse') + ': expected false, got ' + JSON.stringify(v));
        },
        includes: function (arr, val, msg) {
            if (!Array.isArray(arr) || arr.indexOf(val) === -1) {
                throw new Error((msg || 'includes') + ': expected ' + JSON.stringify(arr) + ' to include ' + JSON.stringify(val));
            }
        },
        throws: function (fn, msg) {
            var threw = false;
            try { fn(); } catch (e) { threw = true; }
            if (!threw) throw new Error((msg || 'throws') + ': expected function to throw');
        }
    },
    run: function () {}
};

// Make TicTacTest available in vm context
global.TicTacTest = TicTacTest;

// Load test files
var testOrder = ['game-logic.test.js', 'ai-player.test.js', 'game-state.test.js'];
testOrder.forEach(function (f) {
    var code = fs.readFileSync(path.join(ROOT, 'tests', f), 'utf-8');
    vm.runInThisContext(code, { filename: 'tests/' + f });
});

// Summary
console.log('\n' + '='.repeat(50));
if (totalFail === 0) {
    console.log('\x1b[32m🎉 All ' + totalPass + ' tests passed!\x1b[0m');
} else {
    console.log('\x1b[31m⚠️  ' + totalFail + ' failed, ' + totalPass + ' passed (' + (totalPass + totalFail) + ' total)\x1b[0m');
}
process.exit(totalFail > 0 ? 1 : 0);
