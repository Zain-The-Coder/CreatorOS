const express = require('express')
const dashBoardRouter = express.Router()
const verifyJWT = require('../middlewares/auth/auth.middleware.js')
const {getMyVideos} = require('../controllers/hero/getMyVideos.controller.js')

dashBoardRouter.get("/getmyvideos" , verifyJWT , getMyVideos)

module.exports = dashBoardRouter ;