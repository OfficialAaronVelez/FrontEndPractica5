LIVE SITE: https://tasksapipractica.netlify.app/


# Task Manager

Full-stack Task Manager with **JWT authentication** (JSON Server Auth): REST API and web frontend to register, log in, and manage tasks. Tasks and users are stored in `db.json` (file-based). The UI is vanilla HTML, CSS, and JavaScript.

---

## What This App Does

- **Backend (API)** — JSON Server + JSON Server Auth at `http://localhost:3000`:
  - **POST /register** or **POST /login** — sign up or sign in with `email` and `password`; response includes JWT `accessToken`.
  - **GET /tasks**, **POST /tasks**, **DELETE /tasks/:id** — require `Authorization: Bearer <token>`.

- **Frontend** — Single-page app with:
  - Login / Register form; on success, token is stored (see [SECURITY.md](SECURITY.md) for localStorage vs cookies).
  - Task list, add task, delete task; all requests send the JWT.
  - Logout clears the token.
  - Clear error messages (network, timeout, 401, etc.).

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
   Task Manager API: http://localhost:3000
     POST /register  - sign up
     POST /login     - sign in
     GET  /tasks     - list tasks (Bearer token required)
     POST /tasks     - create task (Bearer token required)
     DELETE /tasks/:id - delete task (Bearer token required)

4. Open the app in the browser
   - Go to: http://localhost:3000  
   - The same server serves both the API and the static frontend (HTML, CSS, JS).

5. Stop the server  
   In the terminal: `Ctrl+C`.

---

## Project Structure

```
FrontEndPractica5/
├── server.js              # JSON Server + json-server-auth, static public/
├── db.json                # Users and tasks (JSON Server database)
├── public/
│   ├── index.html         # Auth form + task list
│   ├── styles.css         # Layout and styles
│   └── app.js             # Login/register, token storage, authenticated API calls
├── SECURITY.md            # ISIP05/ISIP03: token storage (localStorage vs cookies), XSS, httpOnly
├── package.json
└── README.md
```

- Backend: **json-server** + **json-server-auth** (JWT). Tasks require auth (permission 660).
- Frontend: stores JWT in localStorage and sends `Authorization: Bearer <token>` on every `/tasks` request. See [SECURITY.md](SECURITY.md) for the choice of storage and httpOnly cookies.

---


## Tech Stack

- **Backend:** Node.js, Express, [json-server](https://github.com/typicode/json-server), [json-server-auth](https://github.com/jeremyben/json-server-auth) (JWT, bcrypt). Data in `db.json`.
- **Frontend:** HTML5, CSS3, vanilla JavaScript. Token in localStorage; requests use `Authorization: Bearer <token>`. See [SECURITY.md](SECURITY.md) for ISIP05 (localStorage vs cookies) and ISIP03 (XSS, httpOnly).

---


