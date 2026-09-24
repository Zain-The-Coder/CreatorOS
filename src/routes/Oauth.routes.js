const express = require('express')
const crypto = require('crypto')
const googleService = require('../services/googleAuth.service.js')
const OauthRouter = express.Router()
const chalk = require('chalk')

OauthRouter.get("/google" , (req , res) => {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthstate = state ; // is string ko user ke session mein save kar deta hai. Session server pe yaad rakhta hai ke "is user ko ye state di thi".
      
    req.session.save(() => {
        res.redirect(googleService.getAuthUrl(state));
    }); // google navigate krwadega sub normal honay pr
    
});

OauthRouter.get('/google/callback' , async (req , res) => {
    try {
        const {code , state} = req.query ;
        const stateData = req.session.oauthstate;

        console.log(stateData)
        console.log(state)
        
        if (!code || state !== stateData) {
            return res.status(400).json({
                status : 403 ,
                message : req.session ,
                state
            })
        }

        delete req.session.oauthState;


        const data = await googleService.handleCallback(code);
        console.log(chalk.chalkStderr.bold.yellow(JSON.stringify(data))); // abhi sirf test ke liye

        res.status(200).json({
            status : 200 ,
            message : "User login successfully" , 
            backend_details : "login from google"
        })
    } catch (e) {
        res.status(500).json({
            status : 500 ,
            message : e.message ,
            error_details : e.stack
        })
    }
})

module.exports = OauthRouter ;