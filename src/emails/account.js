const nodemailer = require('nodemailer')
require('dotenv').config({path: './config/dev.env'})

// initialize nodemailer
var NodeMailer = nodemailer.createTransport(
    {
        service: 'gmail',
        auth:{
            user: 'y.ashraf0101@gmail.com',
            pass: process.env.NODEMAILER_KEY
        }
    }
);

// use a template file with nodemailer
const sendWelcomeEmail = (email, name) => {
    NodeMailer.sendMail({
        from: '"Task App" <y.ashraf0101@gmail.com>', // sender address
        to: email,
        subject: "Welcome Email",
        text: `Welcome to my task app, ${name}. Let me know if you have any inquiries.`
    })
    // console.log(`Welcome Email sent to ${name}`)
}

const sendCancelationEmail = (email, name) => {
    NodeMailer.sendMail({
        from: '"Task App" <y.ashraf0101@gmail.com>', // sender address
        to: email,
        subject: "Cancelation Email",
        text: `We are sad to see you go ${name}. If you have the time, share with us the resaon for your account deletion.\nWe hope to see you again.`
    })
    // console.log(`Cancelation Email sent to ${name}`)
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}