const youtubeDataService = require('../../services/getVideos.service.js');
const videoModel = require('../../models/videos.model.js');

const getMyVideos = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 30);

    const userId = req.user.id;

    const { data, source } = await youtubeDataService.getFullVideoDetails(userId);
    const { videoDetails } = data;

    // Transform API data
    const storedVideos = videoDetails.map((item) => ({
      userId,
      video_id: item.videoId,
      title: item.title,
      description: item.description,
      video_published: item.publishedAt,
      stats: {
        views: item.views,
        likes: item.likes,
        comments: item.comments,
        caption: item.caption,
      },
      tags: item.tags,
    }));

    // Sirf tab DB update karo jab data FRESH Google se aaya ho (cache se nahi)
    if (source === 'google' && storedVideos.length > 0) {
      videoModel.bulkWrite(
        storedVideos.map((video) => ({
          updateOne: {
            filter: { creatorId: video.userId, video_id: video.video_id },
            update: { $set: video },
            upsert: true,
          },
        }))
      ).catch((err) => console.error('Video bulkWrite failed:', err.message));
    }

    // Pagination
    const totalVideos = videoDetails.length;
    const totalPages = Math.ceil(totalVideos / limit);
    const startIndex = (page - 1) * limit;
    const paginatedVideos = videoDetails.slice(startIndex, startIndex + limit);

    return res.status(200).json({
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
    console.error(e.stack);
    return res.status(e.statusCode || 500).json({
      status: e.statusCode || 500,
      message: e.message,
    });
  }
};

module.exports = { getMyVideos };