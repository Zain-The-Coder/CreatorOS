const userModel = require('../../models/user.model.js')
const config = require('../../config/config.js')
const JWT = require('jsonwebtoken')


async function registerUserController (req , res) {
    try {
            await userModel.updateMany(
                { profileCompleted: { $exists: false } },
                { $set: { profileCompleted: true } }
            )
            
        const {username , email , password , role} = req.body ;

        if(!username || !email || !password) {
            return res.status(400).json({
                status : 400 ,
                message : "All Fields Are Required !"
            })
        }

        isUsernameExist = await userModel.findOne({
            username : username
        })

        isEmailExist = await userModel.findOne({
            email : email
        })

        if(isUsernameExist) {
            return res.status(400).json({
                status : 400 ,
                message : "Username already taken by another user"
            })
        }

        if(isEmailExist) {
            return res.status(400).json({
                status : 400 ,
                message : "Email Address is already taken by another user"
            })
        }

        if(password.length < 5) {
            return res.status(400).json({
                status : 400 ,
                message : "Password must be greater than or equals to 6 characters"
            })
        }

        let profileCompleted = false

        const user = await userModel.create({
            username , email , password , role , profileCompleted
        })
        
        const token = JWT.sign({
            id : user._id 
        } , config.JWT_SECRET , 
        {expiresIn : "15m"})

        res.cookie("token" , token , {
            httpOnly : true ,
            secure : true ,
            sameSite : "None" , 
            maxAge : 60 * 60 * 24 * 1000
        })

        res.status(201).json({
            status : 201 ,
            message : "User Created Successfully !" ,
            user_details : user ,
        })

    } catch (e) {
        console.log(e.stack)
        return res.status(500).json({
            status : 500 ,
            error_message : e.message ,
        })
    }
}

module.exports = {registerUserController}