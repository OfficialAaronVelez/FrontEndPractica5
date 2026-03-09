const express = require('express');
const cors = require('cors');
const path = require('path');

const tasksRoutes = require('./routes/tasks');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/tasks', tasksRoutes);

app.listen(PORT, () => {
  console.log(`API ENDPOINT: http://localhost:${PORT}`);
  console.log(`  GET  /tasks     - list tasks`);
  console.log(`  POST /tasks     - create task`);
  console.log(`  DELETE /tasks/:id - delete task`);
});
