const googleService = require('../../services/googleAuth.service.js')
const crypto = require('crypto')

const connectYoutube = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthstate = state;
  req.session.linkUserId = req.user.id;
  res.redirect(googleService.getAuthUrl(state));
};

module.exports = connectYoutube ;