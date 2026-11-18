const express = require('express')
const router = express.Router()
const taskController = require('../../controller/taskController')
const {protect, isAdmin} = require('../../middleware/authMiddleware')

router.use(protect)

router.post('/createTask',isAdmin, taskController.createTask)
router.get('/getAllTask', taskController.getAllTasks)
router.get('/getSingleTask/:id', taskController.getSingleTask)
router.patch('/updateTask/:id',isAdmin, taskController.updateTask)
router.delete('/deleteTask/:id',isAdmin, taskController.deleteTask)

module.exports = router