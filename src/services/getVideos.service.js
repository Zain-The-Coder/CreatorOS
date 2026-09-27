const userModel = require('../models/user.model.js');
const { decrypt } = require('../utils/crypto.utli.js');
const googleService = require('./googleAuth.service.js');
const redis = require('../services/redis.service.js');

const CACHE_TTL_SECONDS = 1200;

exports.getFullVideoDetails = async (userId) => {
  const cacheKey = `youtube:videos:${userId}`;

  // 1) Cache check
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return { data: JSON.parse(cached), source: 'cache' };
  } catch (redisErr) {
    console.error('Redis GET failed, skipping cache:', redisErr.message);
  }

  // 2) Google se fetch
  const user = await userModel.findById(userId).select('+youtube.refreshToken');

  if (!user || !user.youtube?.refreshToken) {
    const err = new Error("YouTube account didn't connected");
    err.statusCode = 400;
    throw err;
  }

  const refreshToken = decrypt(user.youtube.refreshToken);
  const accessToken = await googleService.getAccessTokenFromRefresh(refreshToken);

  const uploadsPlaylistId = await googleService.getUploadsPlaylistId(accessToken);
  const analytics = await googleService.getChannelAnalytics(accessToken , user.youtube.channelId)
  if (!uploadsPlaylistId) {
    const err = new Error("Uploads playlist didn't found");
    err.statusCode = 404;
    throw err;
  }

  const videos = await googleService.getPlaylistVideos(accessToken, uploadsPlaylistId);
  const videoIds = videos.map((v) => v.videoId);
  const videoDetails = await googleService.getVideosFullDetails(accessToken, videoIds);
  
  const fullDetails = {
    videoDetails ,
    analytics
  }


  try {
    await redis.set(cacheKey, JSON.stringify(fullDetails), 'EX', CACHE_TTL_SECONDS);
  } catch (redisErr) {
    console.error('Redis SET failed, cache skip:', redisErr.message);
  }

  return { data: fullDetails, source: 'google'};
};