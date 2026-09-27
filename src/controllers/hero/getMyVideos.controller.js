const { default: chalk } = require('chalk');
const {getFullVideoDetails} = require('../../services/getVideos.service.js')

const getMyVideos = async (req , res) => {
    try {
        const {data , source} = await getFullVideoDetails(req.user.id);

        return res.status(200).json({
            status : 200 ,
            message : "Videos Fetched Successfully !",
            source ,
            videos : data
        })

    } catch (e) {
        console.log(chalk.bold.red(e.stack))
        return res.status(500).json({
            status : 500 ,
            message : e.message
        })
    }   
}

module.exports = {getMyVideos} ;