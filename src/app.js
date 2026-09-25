const express = require('express')
const authRouter = require('./routes/auth.routes.js')
const oauthRouter = require('./routes/Oauth.routes.js')
const dashBoardRouter = require('./routes/dashboard.routes.js')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const helmet = require('helmet')
const config = require('./config/config.js')

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(helmet())

app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
    httpOnly: true,
    sameSite: 'lax',
  },
}));


app.get("/" , (req , res) => {
    res.json({
        status : 200 ,
        message : "Creator OS API is Working"
    })
})

app.use("/api/auth" , authRouter)
app.use("/auth" , oauthRouter)
app.use('/api/dashboard' , dashBoardRouter)

module.exports = app ;