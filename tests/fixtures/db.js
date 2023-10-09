const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: "Mike",
    age: 21,
    email: 'mike@gmail.com',
    password: "MikeCool@01",
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: "Harvey",
    age: 40,
    email: 'harvey@gmail.com',
    password: "HarveyCool@01",
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: "Test task 1",
    completed: true,
    author: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: "Test task 2",
    completed: false,
    author: userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: "Test task 3",
    completed: true,
    author: userTwoId
}

const setupTestUser = async () => {
    await User.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
}

const setupTestTask = async () => {
    await Task.deleteMany()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupTestUser,
    setupTestTask
}