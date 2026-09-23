const userModel = require('../../models/user.model.js')
const bcrypt = require('bcrypt')
const config = require('../../config/config.js')
const JWT = require('jsonwebtoken')

const loginUserController = async (req , res) => {
    try {
        const { username, email, password } = req.body;

        const loginIdentifier = username || email;

        if (!loginIdentifier) {
            return res.status(400).json({
                success: false,
                message: "Please provide your username or email.",
            });
        }

        const user = await userModel.findOne({
            $or: [
                { username: loginIdentifier.toLowerCase().trim() },
                { email: loginIdentifier.toLowerCase().trim() },
        ],
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username/email or password.",
            });
        }

        const passwordCheck = await bcrypt.compare(password , user.password)

        if(!passwordCheck) {
            return res.status(403).json({
                status : 403 ,
                message : "Incorrect email or password"
            })
        }

        const token = JWT.sign({
            id : user._id 
        } , config.JWT_SECRET , 
        {expiresIn : "15m"})

        res.cookie("token" , token , {
            httpOnly : true ,
            secure : true ,
            sameSite : "None" , 
            maxAge : 60 * 60 * 24
        })

        res.status(200).json({
            status : 200 ,
            message : "Login Successfully !" ,
            userData : user
        })


    } catch (e) {
        res.status(500).json({
            status : 500 ,
            message : e.message , 
            error_details : e.stack
        })
    }
}

module.exports = {loginUserController}