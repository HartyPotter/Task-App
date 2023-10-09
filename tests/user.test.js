require('dotenv').config({path: './config/test.env'})
const request = require('supertest')
const { userOneId, userOne, setupTestUser } = require('./fixtures/db')
const app = require('../src/app')
const User = require('../src/models/user')

beforeEach(setupTestUser)

test('Sign up a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Ahmed',
        email: 'ahmed@gmail.com',
        age: 21,
        password: 'Mypass@011'
    }).expect(201)

    // Assertion to check that the user is indeed in the database
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertion to check that the resposne body contains the right information
    expect(response.body).toMatchObject({
        user: {
            name: 'Ahmed',
            email: 'ahmed@gmail.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('Mypass@011')
})

test("Doesn't sign up user with invalid name", async () => {
    await request(app).post('/users')
    .send({
        name: "",
        email: "mail@example.com",
        password: "ValidPass@01"
    })
    .expect(400)
})

test("Doesn't sign up user with invalid email", async () => {
    await request(app).post('/users')
    .send({
        name: 'Test name',
        email: "Not an email",
        password: "ValidPass@01"
    })
    .expect(400)
})

test("Doesn't sign up user with invalid password", async () => {
    await request(app).post('/users')
    .send({
        name: 'Test name',
        email: "mail@example.com",
        password: "password" // Passwords must not contain the word password or be less than 6 characters
    })
    .expect(400)
})

test('Logs in an existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test("Doesn't login a non-existing user", async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'NotACorrectPass@01'
    }).expect(400)
})

test('Gets the profile for a user', async () => {
    await request(app).get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test("Dosen't get the profile for an unauthorized user", async () => {
    await request(app).get('/users/me')
    .send()
    .expect(401)
})

test('Deletes the account of an authorized user', async () => {
    const response = await request(app).delete('/users/delete')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test("Doesn't delete the account of an unauthorized user", async () => {
    await request(app).delete('/users/delete')
    .send()
    .expect(401)
})

test("Uploads an avatar image", async () => {
    await request(app).post('/users/me/avatar')
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach('profile', 'tests/fixtures/avi.jpg')
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test("Doesn't update unauthenticated user", async () => {
    await request(app).patch('/users/update')
    .send({
        name: "Joseph",
        age: 20,
        email: "joe@gmail.com"
    })
    .expect(401)
})

test("Updates valid user fields", async () => {
    await request(app).patch('/users/update')
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: "Joseph",
        age: 20,
        email: "joe@gmail.com"
    })
    .expect(200)

    const user = await User.findById(userOneId)
    expect({
        name: user.name,
        age: user.age,
        email: user.email
    }).toEqual({
        name: "Joseph",
        age: 20,
        email: "joe@gmail.com"
})
})

test("Doesn't update invalid user fields", async () => {
    await request(app).patch('/users/update')
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: "Cairo"
    })
    .expect(400)
})

test("Doesn't update user with invalid name", async () => {
    await request(app).patch('/users/update')
    .set('Authentication', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: ""
    })
    .expect(401)
})

test("Doesn't update user with invalid email", async () => {
    await request(app).patch('/users/update')
    .set('Authentication', `Bearer ${userOne.tokens[0].token}`)
    .send({
        email: "Not an email",
    })
    .expect(401)
})

test("Doesn't update user with invalid password", async () => {
    await request(app).patch('/users/update')
    .set('Authentication', `Bearer ${userOne.tokens[0].token}`)
    .send({
        password: "password" // Passwords must not contain the word password or be less than 6 characters
    })
    .expect(401)
})