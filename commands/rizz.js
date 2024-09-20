const axios = require('axios');
const { convertToGothic } = require('../fontUtils');

module.exports = {
    name: "rizz",
    description: "Sends a random rizz lines",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event) {
        try {
            const { data: { pickupline } } = await axios.get('https://api.popcat.xyz/pickuplines');
            await api.sendMessage(convertToGothic(`"${pickupline}"`), event.threadID, event.messageID);
        } catch {
            await api.sendMessage(convertToGothic('Sorry, something went wrong while fetching a pickup line. Please try again later.'), event.threadID, event.messageID);
        }
    },
};
