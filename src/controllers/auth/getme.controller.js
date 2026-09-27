const userModel = require('../../models/user.model.js')

const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 200,
      userDetails: user,
    });
  } catch (e) {
    console.log(e.stack);
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

module.exports = { getMe };