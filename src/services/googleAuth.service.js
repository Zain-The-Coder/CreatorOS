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
    'https://www.googleapis.com/auth/youtube.readonly' // user ka YouTube channel data sirf dekh sakte ho
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