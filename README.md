# 🎮 Tic Tac Toe

A fun, colorful Tic Tac Toe browser game — zero dependencies, works offline via `file://`.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## ✨ Features

- **Two game modes:** Player vs Player (PvP) and Player vs AI (PvE)
- **Three AI difficulty levels:**
  - 😊 Easy — random moves
  - 🤔 Medium — 50/50 smart + random
  - 😈 Hard — unbeatable minimax AI
- **Side selection** — play as X or O (AI goes first if you pick O)
- **Score tracking** — persists across page refreshes via localStorage
- **Dark/Light mode** — toggle with saved preference
- **Winning line animation** — SVG line drawn through winning cells
- **Fully accessible** — keyboard navigation, screen reader announcements
- **Responsive** — works on mobile (≤ 480px) and desktop
- **Zero dependencies** — pure HTML, CSS, and JavaScript

## 🚀 How to Play

1. **Double-click `index.html`** — that's it! No server, no install, no build step.
2. Choose your game mode (PvP or PvE)
3. In PvE, select difficulty and which side you want to play
4. Click cells to place your mark
5. First to get 3 in a row wins! 🎉

## 📁 Project Structure

```
tictactoe/
├── index.html              # Entry point — open this to play
├── styles.css              # All styles (light + dark themes)
├── src/
│   ├── game-logic.js       # Pure functions: win/draw detection
│   ├── ai-player.js        # Minimax AI with 3 difficulty levels
│   ├── game-state.js       # State management + observer pattern
│   ├── board-renderer.js   # DOM rendering for the 3×3 grid
│   ├── status-display.js   # Status messages and scoreboard
│   ├── theme-manager.js    # Dark/light mode toggle
│   └── game-controller.js  # Orchestrator: wires everything together
├── tests/
│   ├── test-runner.html    # Open this to run the test suite
│   ├── test-framework.js   # Minimal zero-dep test framework
│   ├── game-logic.test.js  # Tests for win/draw/available moves
│   ├── ai-player.test.js   # Tests for AI at all difficulty levels
│   └── game-state.test.js  # Tests for state management
├── .gitignore
└── README.md
```

## 🧪 Running Tests

Open `tests/test-runner.html` in your browser. All tests run automatically and display results.

## 🏗️ Architecture

```
GameController (orchestrator)
  ├── GameState (state management + observer pattern)
  ├── GameLogic (pure functions — win/draw detection)
  ├── AIPlayer (minimax + difficulty levels)
  ├── BoardRenderer (DOM — 3×3 grid + winning line SVG)
  ├── StatusDisplay (DOM — turn, results, scores)
  └── ThemeManager (dark/light + localStorage)
```

Components communicate via the observer pattern: `GameState` notifies `BoardRenderer` and `StatusDisplay` on every state change. `GameController` orchestrates user input → state → AI → render.

## ♿ Accessibility

- Full keyboard navigation (Tab + Enter/Space)
- ARIA roles (`grid`, `gridcell`) and labels on all interactive elements
- `aria-live` regions for status announcements
- High contrast in both themes

## 📦 localStorage Keys

| Key | Purpose |
|-----|---------|
| `ttt-scores` | Score persistence |
| `ttt-theme` | Theme preference |
| `ttt-game-mode` | Last selected game mode |
| `ttt-difficulty` | Last selected difficulty |
| `ttt-ai-first` | Who goes first (AI or human) |
