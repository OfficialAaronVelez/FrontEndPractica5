const path = require('path');
const express = require('express');
const cors = require('cors');
const jsonServer = require('json-server');
const auth = require('json-server-auth');

const app = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const PORT = process.env.PORT || 3000;

// Required by json-server-auth: bind router.db to app
app.db = router.db;

// Permission 600 = only the owner (userId matches JWT sub) can read/write their tasks
const rules = auth.rewriter({ tasks: 600 });

// CORS so frontend on another origin (e.g. Netlify) can call this API
app.use(cors());

// Static frontend (must be before API routes)
app.use(express.static(path.join(__dirname, 'public')));

// JSON body parsing (for /login, /register and /tasks POST)
app.use(express.json());

// Auth: rewriter then auth middleware then router
app.use(rules);
app.use(auth);

// json-server-auth strips /600 from the URL (flattenUrl) before calling next(),
// so by the time we get here the URL is already /tasks (not /600/tasks).
// Intercept GET /tasks AFTER auth has run (req.claims is already set) and
// return only the tasks that belong to the current user.
app.get('/tasks', (req, res) => {
  if (!req.claims || req.claims.sub == null) return res.status(401).json({ error: 'Unauthorized' });
  const tasks = app.db.get('tasks').value().filter(t => String(t.userId) === String(req.claims.sub));
  res.json(tasks);
});

app.use(router);

app.listen(PORT, () => {
  console.log(`Task Manager API: http://localhost:${PORT}`);
  console.log('  POST /register  - sign up (email, password)');
  console.log('  POST /login     - sign in (email, password)');
  console.log('  GET  /tasks     - list tasks (Bearer token required)');
  console.log('  POST /tasks     - create task (Bearer token required)');
  console.log('  DELETE /tasks/:id - delete task (Bearer token required)');
});
