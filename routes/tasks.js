const express = require('express');
const controller = require('../controllers/tasksController');

const router = express.Router();

router.get('/', controller.getAllTasks);
router.post('/', controller.createTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;
