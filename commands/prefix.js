const { convertToGothic } = require('../fontUtils');
const config = require('../config.json'); 

module.exports = {
    name: "prefix",
    description: "Displays the current prefix.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        const { threadID, messageID } = event;
        const prefix = config.prefix || '!';

        try {
            const message = convertToGothic(`The current prefix is: ${prefix}`);
            await api.sendMessage(message, threadID, messageID);
        } catch (error) {
            console.error(`Error executing prefix command: ${error}`);
            await api.sendMessage(convertToGothic("An error occurred while retrieving the prefix."), threadID, messageID);
        }
    },
};
