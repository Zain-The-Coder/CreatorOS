const userModel = require('../../models/user.model.js')
const {decrypt} = require('../../utils/crypto.utli.js')
const googleService = require('../../services/googleAuth.service.js');
const { default: chalk } = require('chalk');
const redis = require('../../services/redis.service.js')

const CACHE_TTL_SECONDS = 1200;

const getMyVideos = async (req , res) => {
      const cacheKey = `youtube:videos:${req.user.id}`;
    try {

        let cached;
        try {
            cached = await redis.get(cachekey)
        } catch (redisErr) {
            cached = null
            console.log(chalk.bold.red("Redis Get Failed , skipped cache \n " , redisErr.message))
        }

        if(cached !== null) {
            return res.status(200).json({
                status : 200 ,
                message : "Videos Fetched Successfully !" ,
                data : JSON.parse(cached) ,
                source : 'cache'
            })
        }


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

        const videoIds = videos.map((v) => v.videoId);
        const fullDetails = await googleService.getVideosFullDetails(accessToken , videoIds)

        try {
            await redis.set(cacheKey , JSON.stringify(fullDetails) , 'EX' , CACHE_TTL_SECONDS)
        } catch (redisError) {
            console.log(chalk.bold.red("Redis set Field , cache skip \n " , redisError.message ))
        }



        res.status(200).json({
            status : 200 ,
            message : "videos fetched successfully " ,
            fullDetails
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