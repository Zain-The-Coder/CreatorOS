const express = require('express')
const authRouter = require('./routes/auth.routes.js')
const cookieParser = require('cookie-parser')

const app = express()

app.use(express.json())
app.use(cookieParser())

app.get("/" , (req , res) => {
    res.json({
        status : 200 ,
        message : "Creator OS API is Working"
    })
})

app.use("/api/auth" , authRouter)

module.exports = app ;