const path = require('path');
const express = require('express');
const cors = require('cors');
const jsonServer = require('json-server');
const auth = require('json-server-auth');

const app = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const PORT = process.env.PORT || 3000;

app.db = router.db;

const rules = auth.rewriter({ tasks: 600 });

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.use(rules);
app.use(auth);


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
