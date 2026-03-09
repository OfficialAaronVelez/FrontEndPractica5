# Task Manager

A simple full-stack Task Manager: a REST API (Node.js + Express) and a web frontend to create, list, and delete tasks. Tasks are stored in memory on the server (no database). The UI is vanilla HTML, CSS, and JavaScript with clear error messages for network and server failures.

---

## What This App Does

- Backend (API)  
  Serves a REST API at `http://localhost:3000`. You can:
  - GET all tasks
  - POST a new task (title and optional `completed` flag)
  - DELETE a task by id  

  Data is kept in memory, so it resets when you restart the server.

- Frontend  
  A single-page app in the browser where you can:
  - See all tasks when the page loads (calls the API)
  - Add a new task with an input and an “Agregar” button (Enter also works)
  - Delete a task with an “Eliminar” button per task  
  The app shows clear error messages for things like no internet, timeout, or server errors.

Prerequisites

- Node.js (v14 or newer recommended)  
  Check: `node --version`
- npm (comes with Node)  
  Check: `npm --version`

---

How to Run (After Cloning)

1. Clone the repo (if you haven’t already)
   git clone <repository-url>
   cd FrontEndPractica5

2. Install dependencies
   npm install
   This installs `express` and `cors` (see `package.json`).

3. Start the server
   npm start

   You should see something like:
   API ENDPOINT: http://localhost:3000
     GET  /tasks     - list tasks
     POST /tasks     - create task
     DELETE /tasks/:id - delete task

4. Open the app in the browser
   - Go to: http://localhost:3000  
   - The same server serves both the API and the static frontend (HTML, CSS, JS).

5. Stop the server  
   In the terminal: `Ctrl+C`.

---

Project Structure:
FrontEndPractica5/
├── server.js              # Express app: CORS, JSON, static files, mounts /tasks
├── routes/
│   └── tasks.js           # Routes: GET /, POST /, DELETE /:id → controller
├── controllers/
│   └── tasksController.js # In-memory task list; getAllTasks, createTask, deleteTask
├── public/                # Served at http://localhost:3000
│   ├── index.html         # Single page: form + task list + empty state
│   ├── styles.css         # Layout and dark-theme styles
│   └── app.js             # API calls, DOM updates, error messages
├── package.json
└── README.md

- API lives in `server.js` → `routes/tasks.js` → `controllers/tasksController.js`.
- Frontend is static: `public/index.html` loads `styles.css` and `app.js`. The script talks to `http://localhost:3000/tasks`.

---


## Tech Stack

- Backend: Node.js, Express, CORS. No database (in-memory array).
- Frontend: HTML5, CSS3, vanilla JavaScript. No frameworks. Uses `fetch` with a 10-second timeout and user-facing error messages for network/timeout/server errors.

---


