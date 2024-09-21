const axios = require('axios');
const { convertToGothic } = require('../fontUtils');

function formatResponse(response) {
  return response.replace(/\*\*(.*?)\*\*/g, (match, p1) => convertToGothic(p1));
}

module.exports = {
  name: "gpt4o",
  description: "Ask GPT anything.",
  prefixRequired: false,
  adminOnly: false,
  async execute(api, event, args) {
    if (args.length === 0) {
      return api.sendMessage(convertToGothic("Please provide a question."), event.threadID, event.messageID);
    }

    const query = args.join(" ");
    const userId = event.senderID;
    const apiUrl = `https://deku-rest-api.gleeze.com/api/gpt-4o?q=${encodeURIComponent(query)}&uid=${userId}`;

    try {
      const thinkingMessage = await api.sendMessage(convertToGothic("Thinking... 🤔"), event.threadID, event.messageID);
      const thinkingMessageID = thinkingMessage.messageID;

      const { data } = await axios.get(apiUrl);
      const formattedResponse = `🤖 | 𝗖𝗛𝗔𝗧-𝗚𝗣𝗧-𝟰𝗢
━━━━━━━━━━━━━━━━━━
${formatResponse(data.result)}
━━━━━━━━━━━━━━━━━━`;

      await api.editMessage(formattedResponse, thinkingMessageID);
      
    } catch (error) {
      await api.sendMessage(convertToGothic("Sorry, I couldn't get a response from GPT."), event.threadID, event.messageID);
    }
  },
};
