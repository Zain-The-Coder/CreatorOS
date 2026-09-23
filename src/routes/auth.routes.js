const express = require('express')
const authRouter = express.Router()
const {registerUserController} = require("../controllers/auth/registerUser.controller.js")
const {loginUserController} = require('../controllers/auth/loginUser.controller.js')

authRouter.post("/register_user" , registerUserController)
authRouter.post("/login_user" , loginUserController)

module.exports = authRouter