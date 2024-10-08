const { convertToGothic } = require('../fontUtils');

module.exports = {
    name: "ping",
    description: "Check latency.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        const { threadID, messageID } = event;

        const sentMessage = await api.sendMessage(convertToGothic("Calculating ping, please wait..."), threadID, messageID);
        const sentMessageID = sentMessage.messageID;

        const startTime = Date.now();
        const latency = Date.now() - startTime;

        await api.editMessage(convertToGothic(`Ping: ${latency}ms`), sentMessageID);
    },
};
