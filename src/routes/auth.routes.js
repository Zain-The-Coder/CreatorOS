const express = require('express')
const authRouter = express.Router()
const {registerUserController} = require("../controllers/auth/registerUser.controller.js")
const {loginUserController} = require('../controllers/auth/loginUser.controller.js')
const {getMe} = require('../controllers/auth/getme.controller.js')
const logout = require('../controllers/auth/logout.controller.js')
const verifyJWT = require('../middlewares/auth/auth.middleware.js')

authRouter.post("/register" , registerUserController)
authRouter.post("/login" , loginUserController)
authRouter.get('/logout' , logout)
authRouter.get('/get-me' , verifyJWT ,  getMe)

module.exports = authRouter