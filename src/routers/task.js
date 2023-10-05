const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

"----- Tasks -----"
// Adds a new task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        author: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send({Error: "Server Error"})
    }
})


// Fetches all tasks
// GET /tasks?completed
// GET /tasks?limit & skip
// GET /tasks?sortBy=createdAt:1
router.get('/tasks', auth, async (req, res) => {
    const filter = {
        author: req.user._id
    }
    const sortQ = {}

    if (req.query.sortBy) {
        const sort = req.query.sortBy.split(':')
        sortQ[sort[0]] = sort[1] === 'asc' ? 1 : -1
    }

    if (req.query.completed) {
        filter.completed = (req.query.completed === 'true')
    }
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)
    
    try {
        const tasks = await Task.find(filter).limit(limit).skip(skip).sort(sortQ)
        if (!tasks) {
            return res.status(404).send('No tasks found')
        }
        res.send(tasks)
    } catch (e) {
        res.status(500).send({Error: "Server Error"})
    }
})


// Fetches a task by its id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, author: req.user._id})

        if (!task) {
            return res.status(404).send("Task not found")
        }
        res.send(task)
    } catch (e) {
        res.status(500).send({Error: "Server Error"})
    }
})


// Updates a task by its id
router.patch('/tasks/:id', auth, async (req, res) => {
    const updateKeys = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const validUpdate = updateKeys.every((update) => allowedUpdates.includes(update))

    if (!validUpdate) {
        return res.status(400).send({Error: "Invalid update"})
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, author: req.user._id})

        if(!task) {
            return res.status(404).send({ Error: "Task not found" })
        }

        updateKeys.forEach((key) => task[key] = req.body[key])
        await task.save()

        res.send(task)
    } catch (error) {
        res.status(400).send({Error: "Server Error"})
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, author: req.user._id})

        if(!task) {
            return res.status(404).send({Error: "No task with this id is found!"})
        }

        res.send({deletedTask: task, return: "Success!"})
    } catch (e) {
        res.status(500).send({Error: "Server Error"})
    }
})

// Alternative approach using Dynamic Field Validation based on the Document Schema

// router.patch('/tasks/:id', async (req, res) => {
//     try {
//         const template = await Task.findById(req.params.id).lean()
//         const allowedUpdates = Object.keys(template)
//         const updateKeys = Object.keys(req.body)
        
//         if(!template) {
//             return res.status(404).send({Error: "Task not found"})
//         }
//         const validUpdate = updateKeys.every((update) => {
//             return allowedUpdates.includes(update)
//         })

//         if (!validUpdate) {
//             return res.status(400).send({Error: "Invalid update"})
//         }

//         try {
//             const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
//             return res.send(task)
//         } catch (e) {
//             res.status(400).send(e)
//         }

//     } catch (e) {
//         res.status(400).send(e)
//     }
    
// })

module.exports = router