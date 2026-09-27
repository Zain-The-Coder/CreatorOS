const express = require('express')
const dashBoardRouter = express.Router()
const verifyJWT = require('../middlewares/auth/auth.middleware.js')
const {getMyVideos} = require('../controllers/hero/getMyVideos.controller.js')
const getSingleVideo = require('../controllers/hero/getSingleVide.controller.js')

dashBoardRouter.get("/getmyvideos" , verifyJWT , getMyVideos);
dashBoardRouter.get("/getmyvideos/:videoId" , verifyJWT , getSingleVideo)

module.exports = dashBoardRouter ;