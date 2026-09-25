const crypto = require('crypto')
const config = require('../../config/config.js')
const googleService = require('../../services/googleAuth.service.js')
const userModel = require('../../models/user.model.js')
const JWT = require('jsonwebtoken')
const {encrypt} = require('../../utils/crypto.utli.js')

const stateSave = (req , res) => {
        const state = crypto.randomBytes(16).toString('hex');
        req.session.oauthstate = state ; // is string ko user ke session mein save kar deta hai. Session server pe yaad rakhta hai ke "is user ko ye state di thi".
          
        req.session.save(() => {
            res.redirect(googleService.getAuthUrl(state));
        }); // google navigate krwadega sub normal honay pr
        
}
 
const redirectCallback = async (req , res) => {
        try {
            const {code , state} = req.query ;
            const stateData = req.session.oauthstate;
            
            if (!code || state !== stateData) {
                return res.status(403).json({
                    status : 403 ,
                    message : req.session ,
                    state
                })
            }
    
            delete req.session.oauthstate;
    
    
            const {profile , channel , refreshToken} = await googleService.handleCallback(code);

              if (req.session.linkUserId) {
                const user = await userModel.findById(req.session.linkUserId);
                user.youtube.channelId = channel?.id;
                user.youtube.channelTitle = channel?.title;
                user.youtube.subscribers = channel?.subscribers;
                user.youtube.refreshToken = encrypt(refreshToken);
                await user.save();
                delete req.session.linkUserId;

            return res.status(200).json({
                status: 200,
                message: 'YouTube connected successfully',
                userDetails: user,
            });
        }


            const googleUserObj = {
                googleId : profile.googleId ,
                email : profile.email ,
                profile_photo : profile.picture ,
                youtube : {
                    channelId : channel?.id  ,
                    channelTitle : channel?.title ,
                    subscribers : channel?.subscribers ,
                    refreshToken : encrypt(refreshToken)
                } ,
            }

        let newGoogleUser ;
        newGoogleUser = await userModel.findOne({
            googleId : profile.googleId
        })

        if(newGoogleUser === null) {
            newGoogleUser = await userModel.create(googleUserObj)
        }


        const token = JWT.sign({
            id : newGoogleUser._id 
        } , config.JWT_SECRET , 
        {expiresIn : "15m"})

        res.cookie("token" , token , {
            httpOnly : true ,
            sameSite : "lax" , 
            maxAge : 60 * 60 * 24 * 1000
        })

            res.status(200).json({
                status : 200 ,
                message : "User login successfully" , 
                userDetails : newGoogleUser
            })

        } catch (e) {
            console.log(e.stack)
            return res.status(500).json({
                status : 500 ,
                message : e.message ,
                
            })
        }
}

module.exports = {stateSave , redirectCallback}

