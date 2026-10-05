const express = require('express')
const aiRouter = express.Router()
const verifyJWT = require('../middlewares/auth/auth.middleware.js')
const {getAIData} = require('../controllers/ai/getvideos.aicontroller.js')
const {getTrends} = require('../controllers/ai/getvideos.aicontroller.js')
const {suggestTopic} = require('../controllers/ai/getvideos.aicontroller.js')
const {chatWithAI} = require('../controllers/ai/getvideos.aicontroller.js')

aiRouter.post('/chat' , verifyJWT , chatWithAI)
aiRouter.get("/videos" , verifyJWT , getAIData)
aiRouter.get('/trends', verifyJWT, getTrends);
aiRouter.post('/suggest-topic', verifyJWT, suggestTopic);

module.exports = aiRouter ;