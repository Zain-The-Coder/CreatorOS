const axios = require('axios');

exports.getAIData = async (req, res) => {
  try {
    const userId = req.user.id;

    const response = await axios.get(`${process.env.AI_SERVICE_URL}/api/data`, {
      params: { creatorId : userId }
    });

    return res.status(200).json(response.data);
  } catch (e) {
    console.error(e.stack);
    return res.status(500).json({ status: 500, message: e.message });
  }
};