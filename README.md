# Visualizer - Interactive Code Execution Platform

Visualizer is a web-based learning environment designed for students in grades 2 to 8. It allows learners to write real Python code on one side and watch its execution step-by-step like a video on the other side. Memory variables appear as visual boxes, array operations render as dynamic bar charts, and code execution is narrated in plain language.

## Overview

Traditional coding environments show only the final output of a script, leaving the intermediate execution state invisible. Visualizer solves this by recording program state at every line of execution, allowing students to play, pause, rewind, and scrub through their code frame-by-frame.

The project features two distinct learning environments:

- Learn Mode: A lightweight, deterministic execution engine tailored for teaching foundational programming concepts including variables, conditional branching, loops, and sorting algorithms.
- Real Python Mode: Full Python 3.11 execution in the browser powered by WebAssembly (Pyodide). Supports standard libraries along with NumPy, Pandas, Matplotlib, and Scikit-Learn for data visualization.

## Key Features

- Frame-by-Frame Execution: Full transport controls including play, pause, step forward, step backward, speed adjustment (0.5x to 4x), and timeline scrubbing.
- Visual Memory Grid: Live inspection of active variables, data types, and scope.
- Array & Pointer Visualization: Number arrays render as reactive bar graphs highlighting read, compare, and write operations during sorting algorithm execution.
- Call Stack Tracking: Real-time visualization of function call stack frames and recursion depth.
- Terminal Output Simulation: Streamed stdout logging aligned with execution line steps.
- Light & Dark Theme Support: Tailored theme system optimized for readability and classroom usage.
- Cross-Device Responsive Layout: Full support for desktop viewports and mobile devices with bottom navigation integration.

## Supported Language Features (Learn Mode)

Learn Mode supports a safe, structured subset of Python syntax:

- Variables and arithmetic operations
- String manipulation and formatted console output
- List data structures with zero-based indexing
- Conditional statements (if, elif, else) and boolean logic
- Iteration constructs (for loops, range iterations, while loops)
- Helper built-ins (len, range, append, min, max, sum, abs)

## Project Structure

```
visualiseGradeNext/
├── public/                 Static assets and web icons
├── src/
│   ├── components/         Reusable UI components (Stage, CodeEditor, Player, TopBar, Sidebar)
│   ├── lang/               Interpreter, tokenizer, parser, and AST frame generator
│   ├── lib/                Firebase integration, audio synthesis, and utility helpers
│   ├── modes/              LearnMode and PythonLab workspace interfaces
│   ├── pages/              Application pages (Home, Dashboard, Exercises, Leaderboard, Workbench)
│   ├── python/             Pyodide WebAssembly runner and example scripts
│   ├── App.tsx             Primary routing and layout shell
│   ├── main.tsx            Application entry point
│   └── styles.css          Design system tokens and responsive stylesheet
├── index.html              HTML template
├── package.json            Project dependencies and build scripts
└── vite.config.ts          Vite build configuration
```

## How the Visualizer Engine Works

1. Lexical Analysis & Parsing: Code is tokenized line-by-line and converted into an Abstract Syntax Tree (AST).
2. Snapshot Interpretation: The interpreter executes the AST up-front and generates an ordered sequence of Frame objects. Each frame captures the active line number, variable environment snapshot, array access markers (read/write/compare), call stack depth, and narration note.
3. Reactive Frame Rendering: The UI consumes the pre-computed frame sequence, providing instantaneous time-travel scrubbing with zero runtime delay.

## Getting Started

### Prerequisites

- Node.js version 18.0 or higher
- npm (Node Package Manager)

### Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Framework7000/Visualizer.git
   cd Visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Build and Deployment

- Typecheck code:
  ```bash
  npm run typecheck
  ```

- Build production bundle:
  ```bash
  npm run build
  ```

- Deploy to GitHub Pages:
  ```bash
  npm run deploy
  ```

The production build will be output to the `dist/` directory and published to the `gh-pages` branch.

## License

Distributed under the MIT License. See LICENSE for more information.
