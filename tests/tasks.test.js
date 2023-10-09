require('dotenv').config({path: './config/test.env'})
const request = require('supertest')
const Task = require('../src/models/task')
const {  userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupTestUser,
    setupTestTask } = require('./fixtures/db')
const app = require('../src/app')

beforeEach(setupTestUser)
beforeEach(setupTestTask)

test("Creates a task", async () => {
    const response = await request(app).post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: "Task 1",
        completed: true
    })
    .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(true)
})

test("Doesn't create a task with invalid description", async () => {
    const response = await request(app).post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: "",
        completed: true
    })
    .expect(400)

    const task = await Task.findById(response.body._id)
    expect(response.body).toEqual({"Error": "Server Error"})
})

test("Doesn't create a task with invalid completed field", async () => {
    const response = await request(app).post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: "Test task",
        completed: "This field takes a boolean"
    })
    .expect(400)

    const task = await Task.findById(response.body._id)
    expect(response.body).toEqual({"Error": "Server Error"})
})

test("Fetches all user tasks", async () => {
    const response = await request(app).get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(2)
})

test("Fetches user's task by id", async () => {
    await request(app).get(`/tasks/${taskTwo._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test("Doesn't fetch unauthorized user's task by id", async () => {
    await request(app).get(`/tasks/${taskTwo._id}`)
    .send()
    .expect(401)
})

test("Doesn't fetch other users task by id", async () => {
    await request(app).get(`/tasks/${taskTwo._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(401)
})

test("Fetches only completed tasks", async () => {
    const response = await request(app).get('/tasks?completed=true')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const tasks = response.body
    const allTrue = tasks.every((task) => task.completed === true)
    expect(allTrue).toBe(true)
})

test("Fetches only incompleted tasks", async () => {
    const response = await request(app).get('/tasks?completed=false')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const tasks = response.body
    const allFalse = tasks.every((task) => task.completed === false)
    expect(allFalse).toBe(true)
})

test("Deletes user's task", async () => {
    await request(app).delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
})

test("Deletes tasks securely", async () => {
    const response = await request(app).delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test("Doesn't update other user's tasks", async () => {
    await request(app).patch(`/tasks/${taskThree._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: "Update Task",
        completed: true
    })
    .expect(401)
})

test("Doesn't update a non existing task", async () => {
    await request(app).patch(`/tasks/652114097ce5fdad09e5c9a2`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: "Update Task",
        completed: true
    })
    .expect(404)
})