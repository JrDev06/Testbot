const fs = require('fs');
const path = require('path');
const { convertToGothic } = require('../fontUtils');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8'));
const owner = config.owner || 'Unknown';
const prefix = config.prefix || '!';

module.exports = {
    name: "help",
    description: "Lists all available commands.",
    prefixRequired: true,
    adminOnly: false,
    async execute(api, event, args, commands) {
        const { threadID } = event;

        let helpMessage = `📋 | ${convertToGothic('Command List')}\n\n`;

        Object.entries(commands).forEach(([name, command], index) => {
            const commandName = `${index + 1}. ${convertToGothic(name)}`;
            helpMessage += `⦿ ${commandName}\n`;
        });

        helpMessage += `\n⦾ Total Commands: [ ${Object.keys(commands).length} ]\n`;
        helpMessage += `⦾ Prefix: [ ${convertToGothic(prefix)} ]\n`;
        helpMessage += `⦾ Created By: ${convertToGothic(owner)}\n`;

        await api.sendMessage(helpMessage, event.threadID, event.messageID);
    },
};
