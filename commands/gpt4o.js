const axios = require('axios');
const { convertToGothic } = require('../fontUtils');

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
    const apiUrl = `https://jonellccprojectapis10.adaptable.app/api/gptconvo?ask=${encodeURIComponent(query)}&id=${userId}`;

    try {
      const thinkingMessage = await api.sendMessage(convertToGothic("Thinking... 🤔"), event.threadID, event.messageID);
      const thinkingMessageID = thinkingMessage.messageID;

      const response = await axios.get(apiUrl);
      const gptResponse = response.data.response;
      
      const formattedResponse = `       𝗚𝗣𝗧𝟰𝗢
═══════════════════
${gptResponse}
═══════════════════`;

      await api.editMessage(formattedResponse, thinkingMessageID);
      
    } catch (error) {
      await api.sendMessage(convertToGothic("Sorry, I couldn't get a response from GPT."), event.threadID, event.messageID);
    }
  },
};
