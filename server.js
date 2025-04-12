const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

app.post('/webhook', async (req, res) => {
  const { content, channel_id } = req.body;

  // Geminiを呼び出す
  const geminiResponse = await callGemini(content);

  // Discordに返信
  await replyToDiscord(channel_id, geminiResponse);

  res.status(200).send({ status: 'success' });
});

// Gemini APIを呼び出す関数
async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    const data = response.data;
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return 'Geminiから回答を得られませんでした。';
    }
  } catch (error) {
    console.error(error);
    return 'Gemini呼び出し時にエラーが発生しました。';
  }
}

// Discordに返信する関数
async function replyToDiscord(channelId, message) {
  const url = `https://discord.com/api/v10/channels/${channelId}/messages`;

  try {
    await axios.post(url, { content: message }, {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error(error);
  }
}

app.listen(3000, () => console.log('Glitch app is running'));
