const express = require('express')
const OauthRouter = express.Router()
const {stateSave , redirectCallback} = require('../controllers/auth/Oauth.controller.js')
const verifyJWT = require('../middlewares/auth/auth.middleware.js')
const connectYoutube = require('../controllers/hero/completeProfile.controller.js')

OauthRouter.get("/google" , stateSave);
OauthRouter.get('/google/callback' , redirectCallback)
OauthRouter.get("/google/connect-youtube" , verifyJWT , connectYoutube)

module.exports = OauthRouter ;