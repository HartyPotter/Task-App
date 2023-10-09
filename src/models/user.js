const mongoose = require('mongoose')
const validator = require("validator")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')
require('dotenv').config({ path: './config/dev.env'})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0){
                throw new Error('Age must be a positve number')
            }
        }
    },
    email: {
        type: String,
        require: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')){
                throw new Error("Password must not contain password")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})


// Virtual property setup
// Virtual property is not an actual data that is stored in the database, its a relationship between two entities.
// ForeignFiled is the name of the field on the other enitity that represents the model instance
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'author'
})


// This function is ran every time res.send() is called and a user is sent through it
// It's like a middleware, res.send() method calls JSON.Stringify() every time it's ran, and JSON.Stringify() by default calls toJSON() 
// method that is defined on the instance of the model like the one below. So, the toJSON() can be customized to do anything we want
// before sending the model isntance through res.send(). In my case, I use it to filter the data sent through the endpoint to
// not include the user's password or auth tokens 
userSchema.methods.toJSON = function () {
    const userData = this.toObject()
    delete userData.password
    delete userData.tokens
    delete userData.avatar

    return userData
}

// Generated a token using the id of the user as the payload and saves it into the db
userSchema.methods.genAuthToken = async function () {
    const id = this._id.toString()
    const token = jwt.sign({ _id: id }, process.env.JWT_SECRET)
    this.tokens.push({ token })

    await this.save()
    return token
}


// Static method that finds a user using email and verifies the entered password matches the one in the db
userSchema.statics.findByEmail = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error("Unable to login...No user found!")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error("Unable to login...Wrong Password!")
    }

    return user
}


// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const user = this
    await Task.deleteMany({ author: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User