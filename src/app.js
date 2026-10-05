const express = require('express')
const authRouter = require('./routes/auth.routes.js')
const oauthRouter = require('./routes/Oauth.routes.js')
const dashBoardRouter = require('./routes/dashboard.routes.js')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const helmet = require('helmet')
const config = require('./config/config.js')
const redis = require('./services/redis.service.js')
const aiRouter = require('./routes/ai.routes.js')
const cors = require('cors')

const app = express()
app.set('trust proxy', 1)

app.use(express.json())
app.use(cookieParser())

app.use(cors(
    {
        origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
        credentials: true,
    }
));


app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
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
app.use('/api/ai' , aiRouter)


module.exports = app ;