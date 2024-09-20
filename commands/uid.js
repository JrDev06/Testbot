const { convertToGothic } = require('../fontUtils');

module.exports = {
    name: "uid",
    description: "Get your user ID.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event) {
        try {
            const { threadID, messageID, senderID } = event;
            if (senderID) {
                await api.sendMessage(convertToGothic(`Your UID is: ${senderID}`), threadID, messageID);
            }
        } catch {}
    },
};
