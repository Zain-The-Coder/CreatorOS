const youtubeDataService = require('../../services/getVideos.service.js');

const getMyVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const { data, source } = await youtubeDataService.getFullVideoDetails(req.user.id);

    const totalVideos = data.videoDetails.length;
    const totalPages = Math.ceil(totalVideos / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedVideos = data.videoDetails.slice(startIndex, endIndex);

    res.status(200).json({
      status: 200,
      source,
      data: {
        videoDetails: paginatedVideos,
        analytics: data.analytics,
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalVideos,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (e) {
    console.log(e.stack);
    res.status(e.statusCode || 500).json({ status: e.statusCode || 500, message: e.message });
  }
};

module.exports = { getMyVideos };