const {getFullVideoDetails} = require('../../services/getVideos.service.js')
const {default : chalk} = require('chalk')

const getSingleVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { data } = await getFullVideoDetails(req.user.id);
        const { videoDetails } = data;

        const videoDetail = videoDetails.find((v) => v.videoId === videoId);

        if (!videoDetail) {
            return res.status(404).json({ status: 404, message: "Video Didn't found" });
        }


        return res.status(200).json({ status: 200, data: videoDetail});


    } catch (e) {
        console.log(chalk.bold.red(e.stack))
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

module.exports = getSingleVideo;