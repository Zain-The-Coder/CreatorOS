const express = require('express')
const aiRouter = express.Router()
const verifyJWT = require('../middlewares/auth/auth.middleware.js')
const {getAIData} = require('../controllers/ai/getvideos.aicontroller.js')

aiRouter.get("/videos" , verifyJWT , getAIData)

module.exports = aiRouter ;