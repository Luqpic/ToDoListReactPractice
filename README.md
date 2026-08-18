# To-Do List React

A simple to-do list web app built with React, TypeScript, and Vite. Add, edit, complete, and delete tasks, filter by status (All / Active / Completed), and your tasks are automatically saved to the browser's local storage so they persist between visits.

## Features

- Add new tasks via the input field (press Enter or click ADD)
- Mark tasks as complete/incomplete
- Edit or delete existing tasks
- Filter tasks by All, Active, or Completed
- Tasks persist across page reloads using `localStorage`
- Styled with Bootstrap / React-Bootstrap

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes bundled with Node.js)

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the development server**

   ```bash
   npm run dev
   ```

   Vite will print a local URL (usually `http://localhost:5173`). Open it in your browser to use the app.

3. **Build for production**

   ```bash
   npm run build
   ```

   The optimized static files are output to the `dist/` folder.

4. **Preview the production build locally**

   ```bash
   npm run preview
   ```

## Available Scripts

| Command           | Description                              |
|--------------------|-------------------------------------------|
| `npm run dev`      | Starts the Vite dev server with hot reload |
| `npm run build`    | Type-checks and builds the app for production |
| `npm run preview`  | Serves the production build locally       |
| `npm run lint`     | Runs ESLint over the project              |

## Tech Stack

- React 19 + TypeScript
- Vite (build tool / dev server)
- Bootstrap & React-Bootstrap (styling)
