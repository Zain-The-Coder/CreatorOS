const {OAuth2Client} = require('google-auth-library');
const config = require('../config/config.js')

const client = new OAuth2Client(
    config.GOOGLE_AUTH_CLIENTID ,
    config.GOOGLE_AUTH_CLIENTSECRET ,
    config.GOOGLE_REDIRECT_URI
);


const scopes = [
    'openid' ,
    'email' ,
    'profile' ,
    'https://www.googleapis.com/auth/youtube.readonly' ,
    'https://www.googleapis.com/auth/yt-analytics.readonly',
];

exports.getAuthUrl = (state) => {
    return client.generateAuthUrl({
        access_type : "offline" ,
        prompt : "consent" , // har baar permission screen dikhata hai. Iske bina Google refresh token sirf pehli baar deta hai, baad mein nahi.
        scope : scopes , // is ka mtlb mujhay user ka kya access chahiye
        state // ek random string jo hum khud banayenge (Step 3 mein). Ye security ke liye hai, taake koi aur fake callback bhej ke aapke user ko hack na kar sake.
    })
}

exports.handleCallback = async (code) => {
  const { tokens } = await client.getToken(code);

  // 1) id_token verify karke user ki info nikalo
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const profile = ticket.getPayload();

  // 2) YouTube channel ka data lo
  const res = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );
  const yt = await res.json();
  const channel = yt.items?.[0] || null;

  return {
    profile: {
      googleId: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    },
    channel: channel && {
      id: channel.id,
      title: channel.snippet.title,
      subscribers: channel.statistics?.subscriberCount,
    },
    refreshToken: tokens.refresh_token, // sirf pehli baar milta hai
  };
};

exports.getAccessTokenFromRefresh = async (refreshToken) => {
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials.access_token;
};


exports.getUploadsPlaylistId = async (accessToken) => {
  const res = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
};

exports.getPlaylistVideos = async (accessToken, playlistId) => {
  let allVideos = [];
  let pageToken = '';

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ''}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    const videos = (data.items || []).map((item) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
    }));

    allVideos = allVideos.concat(videos);
    pageToken = data.nextPageToken || null;

  } while (pageToken);

  return allVideos;
};


exports.getVideosFullDetails = async (accessToken, videoIds) => {
  const allDetails = [];

  // 50-50 ke chunks banao
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const idsParam = batch.join(',');

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,status&id=${idsParam}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json();

    const details = (data.items || []).map((item) => ({
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
      tags: item.snippet.tags || [],
      categoryId: item.snippet.categoryId,
      views: item.statistics.viewCount,
      likes: item.statistics.likeCount,
      comments: item.statistics.commentCount,
      duration: item.contentDetails.duration,
      definition: item.contentDetails.definition,
      caption: item.contentDetails.caption,
      privacyStatus: item.status.privacyStatus,
    }));

    allDetails.push(...details);
  }

  return allDetails;
};




exports.getChannelAnalytics = async (accessToken, channelId) => {
  const endDate = new Date().toISOString().split('T')[0]; // aaj ki date
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]; // 30 din pehle

  const params = new URLSearchParams({
    ids: `channel==${channelId}`,
    startDate,
    endDate,
    metrics: 'estimatedMinutesWatched,averageViewDuration,views',
  });

  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await res.json();
  return data;
};