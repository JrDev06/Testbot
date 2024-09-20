const fs = require('fs');
const path = require('path');
const axios = require('axios');
const login = require('./unofficial-fca');
const express = require('express');
const app = express();

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const prefix = config.prefix;
const apiOptions = config.apiOptions;
const adminBot = config.adminBot || [];
const autoLoad = config.autoLoad ?? false;

let commands = {};
let events = {};

const loadFiles = async (directory, type) => {
    const files = fs.readdirSync(path.join(__dirname, directory)).filter(file => file.endsWith('.js'));
    await Promise.all(files.map(async (file) => {
        const module = require(`./${directory}/${file}`);
        if (type === 'commands') {
            commands[module.name] = module;
        } else if (type === 'events') {
            for (const key in module) {
                if (typeof module[key] === 'function') {
                    events[key] = module[key];
                }
            }
        }
    }));
};

const reloadFiles = async (directory, type) => {
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} directory changed. Reloading...`);
    if (type === 'commands') {
        commands = {};
        await loadFiles('commands', 'commands');
    } else if (type === 'events') {
        events = {};
        await loadFiles('events', 'events');
    }
};

const watchFiles = (directory, type) => {
    fs.watch(path.join(__dirname, directory), (eventType, filename) => {
        if (filename && filename.endsWith('.js') && eventType === 'change') {
            reloadFiles(directory, type);
        }
    });
};

const initialize = async () => {
    await loadFiles('commands', 'commands');
    await loadFiles('events', 'events');

    if (autoLoad) {
        watchFiles('commands', 'commands');
        watchFiles('events', 'events');
    }
};

const runBot = () => {
    fs.readFile('appstate.json', 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading appstate.json: ${err.message}`);
            return;
        }

        let appState;
        try {
            appState = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing appstate.json:', error.message);
            return;
        }

        login({ appState: appState }, (loginError, api) => {
            if (loginError) {
                console.error('Login error:', loginError);
                return;
            }

            api.setOptions(apiOptions);

            api.listenMqtt(async (err, event) => {
                if (err) {
                    console.error('Error listening to MQTT:', err);
                    return;
                }
                
                for (const commandName in commands) {
                    const command = commands[commandName];

                    if (command.auto && command.autoActivate && command.autoActivate(event.body)) {
                        try {
                            await command.execute(api, event, []);
                        } catch (error) {
                            console.error(`Auto command execution error: ${error}`);
                        }
                        return;
                    }
                }
                
                const message = event.body ?? "";
                const isPrefixed = message.startsWith(prefix);

                let commandName = "";
                let args = [];

                if (isPrefixed) {
                    [commandName, ...args] = message.slice(prefix.length).trim().split(/ +/g);
                } else {
                    [commandName, ...args] = message.trim().split(/ +/g);
                }

                const command = commands[commandName] || commands[commandName.toLowerCase()];

                if (command) {
                    if (isPrefixed && command.prefixRequired === false) {
                        api.sendMessage('This command does not require a prefix.', event.threadID, event.messageID);
                    } else if (!isPrefixed && command.prefixRequired === true) {
                        api.sendMessage('This command requires a prefix to start.', event.threadID, event.messageID);
                    } else if (command.adminOnly && !adminBot.includes(event.senderID)) {
                        api.sendMessage('Only bot admins have access to this command.', event.threadID, event.messageID);
                    } else {
                        try {
                            await command.execute(api, event, args, commands, api);
                        } catch (error) {
                            console.error('Command execution error:', error);
                        }
                    }
                } else if (isPrefixed) {
                    api.sendMessage(`The command "${commandName}" does not exist. Please type ${prefix}help to see the list of commands.`, event.threadID, event.messageID);
                }
            });

            process.on('unhandledRejection', (reason, promise) => {
                console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            });

            process.on('uncaughtException', err => {
                console.error('Uncaught Exception:', err);
            });
        });
    });
};

(async () => {
    await initialize();
    runBot();
})();