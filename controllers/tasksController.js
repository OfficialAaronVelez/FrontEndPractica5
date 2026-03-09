// In Memory Storage
let tasks = [
  { id: 1, title: 'Estudiar Web APIs', completed: false }
];
let nextId = 2;

function getAllTasks(req, res) {
  res.json(tasks);
}

function createTask(req, res) {
  const { title, completed = false } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required' });
  }
  const task = { id: nextId++, title: title.trim(), completed: !!completed };
  tasks.push(task);
  res.status(201).json(task);
}

function deleteTask(req, res) {
  const id = parseInt(req.params.id, 10);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.status(204).send();
}

module.exports = {
  getAllTasks,
  createTask,
  deleteTask
};
