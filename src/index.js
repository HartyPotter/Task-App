require('dotenv').config({path: './config/dev.env'})
const port = process.env.PORT
console.log(port)
const app = require('./app')

app.listen(port, () =>{
    console.log("Server is running on port " + port)
})