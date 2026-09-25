const JWT = require('jsonwebtoken');
const config = require('../../config/config.js');

const verifyJWT = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'Login required',
      });
    }

    const decoded = JWT.verify(token, config.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (e) {
    return res.status(401).json({
      status: 401,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = verifyJWT;