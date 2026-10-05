const axios = require('axios');

exports.getAIData = async (req, res) => {
  try {
    const userId = req.user.id;

    const response = await axios.get(`${process.env.AI_SERVICE_URL}/api/data`, {
      params: { creatorId: userId }
    });

    return res.status(200).json(response.data);
  } catch (e) {
    console.error(e.stack);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

exports.chatWithAI = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ status: 400, message: 'Question is required' });
    }

    const response = await axios.post(`${process.env.AI_SERVICE_URL}/chat`, {
      creatorId,
      question
    });

    return res.status(200).json(response.data);
  } catch (e) {
    console.error(e.stack);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const response = await axios.get(`${process.env.AI_SERVICE_URL}/api/trends`, {
      params: { creatorId: userId }
    });
    return res.status(200).json(response.data);
  } catch (e) {
    console.error(e.stack);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

exports.suggestTopic = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, target_audience, tone, goal } = req.body;

    const response = await axios.post(`${process.env.AI_SERVICE_URL}/api/suggest-topic`, {
      creatorId: userId, category, target_audience, tone, goal
    });
    return res.status(200).json(response.data);
  } catch (e) {
    console.error(e.stack);
    return res.status(500).json({ status: 500, message: e.message });
  }
};