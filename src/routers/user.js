const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const account = require('../emails/account')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Only JPG, JPEG, and PNG file formats are allowed"))
        }

        cb(undefined, true)
    }
})

"----- Users -----"
// adds a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        const token = await user.genAuthToken()
        account.sendWelcomeEmail(user.email, user.name)
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send({error: "User creation failed"})
    }
})


// Logs in user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByEmail(req.body.email, req.body.password)
        if (!user) {
            return res.status(404).send({Error: "No user found"})
        }
        const token = await user.genAuthToken()    
        res.send({ user, token: token })
    } catch (e) {
        res.status(400).send({Error: "User login failed"})
    }
})


// Logs out a user
router.post('/users/logout', auth, async (req, res) => {
    try {
        const user = req.user
        user.tokens = user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await user.save()
        res.send("Logged Out")
    } catch (e) {
        res.status(500).send({Error: "User logout failed"})
    }
})


// Logs the user out of all sessions/devices (removes all tokens)
router.post('/users/logout/all', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send("Logged Out of all devices")
    } catch (e) {
        res.status(500).send({error: "Logout of all devices failed"})
    }
})


// Fetches all users using a filter
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


// Updates a user using its id
router.patch('/users/update', auth, async (req, res) => {
    const updateKeys = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const validUpdate = updateKeys.every((update) => allowedUpdates.includes(update))

    if (!validUpdate) {
        return res.status(400).send({Error: "Invalid update"})
    }

    try {
        updateKeys.forEach((key) => req.user[key] = req.body[key])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send({error: "Updating user failed"})
    }
})


// Lets the user delete his data
router.delete('/users/delete', auth, async (req, res) => {
    try {
        account.sendCancelationEmail(req.user.email, req.user.name)
        await req.user.deleteOne()
        res.send(req.user)
    } catch (e) {
        res.status(500).send("User deletion failed")
    }
})

// Lets the user set his avatar
router.post('/users/me/avatar', auth, upload.single('profile'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()  
    req.user.avatar = buffer
    await req.user.save()
    res.send("avatar set")
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})


// Lets the user delete his avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send("Avatar deleted")
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})


// Retrievs the user avatar by his id
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error('No user/Avatar found')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(error) {
        res.status(404).send({error: error.message})
    }
    
})

module.exports = router