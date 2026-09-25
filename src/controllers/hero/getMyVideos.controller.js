const userModel = require('../../models/user.model.js')
const {decrypt} = require('../../utils/crypto.utli.js')
const googleService = require('../../services/googleAuth.service.js');
const { default: chalk } = require('chalk');


const getMyVideos = async (req , res) => {
    try {
        const user = await userModel.findById(req.user.id).select("+youtube.refreshToken")

        if(!user || !user.youtube.refreshToken) {
            return res.status(403).json({
                status : 403 ,
                message : "Unauthorized Access" ,
            })
        }

        const refreshToken = decrypt(user.youtube.refreshToken) ;
        const accessToken = await googleService.getAccessTokenFromRefresh(refreshToken)

        const uploadPlayListId = await googleService.getUploadsPlaylistId(accessToken)

        if (!uploadPlayListId) {
            return res.status(404).json({ 
                status: 404, 
                message: "Uploads playlist didn't found" 
            });
        }

        const videos = await googleService.getPlaylistVideos(accessToken , uploadPlayListId)


        res.status(200).json({
            status : 200 ,
            message : "videos fetched successfully " ,
            videos
        });

    } catch (e) {
        console.log(e.stack)
        return res.status(500).json({
            status : 500 ,
            message : e.message
        })
    }
}

module.exports = {getMyVideos}