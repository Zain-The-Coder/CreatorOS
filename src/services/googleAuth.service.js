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
  return { tokens };
};