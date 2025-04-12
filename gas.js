// DiscordのWebhook URL（スクリプトプロパティ推奨）
const DISCORD_WEBHOOK_URL = PropertiesService.getScriptProperties().getProperty('DISCORD_WEBHOOK_URL');
// Gemini APIキー（スクリプトプロパティ推奨）
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

// DiscordからのPOSTリクエストを受信
function doPost(e) {
  try {
    const discordData = JSON.parse(e.postData.contents);
    
    // Discordから送られるメッセージ内容を取得
    const prompt = discordData.content;

    // Gemini API呼び出し
    const geminiResponse = callGemini(prompt);

    // Discordに結果を返す
    sendToDiscord(geminiResponse);

    // Discordに即座にHTTP 200を返す
    return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(error);
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Gemini APIを呼び出す関数
function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [
      { parts: [{ text: prompt }] }
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());

  if(json.candidates && json.candidates[0].content.parts[0].text) {
    return json.candidates[0].content.parts[0].text;
  } else {
    return "Geminiから有効な回答を得られませんでした。";
  }
}

// DiscordのWebhookに送信する関数
function sendToDiscord(message) {
  const payload = {
    content: message
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(DISCORD_WEBHOOK_URL, options);
}
