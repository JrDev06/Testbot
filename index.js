const { spawn } = require("child_process");
const express = require("express");
const path = require("path");
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Ryuu Bot server is running on port ${port}`);
});

let botProcess = null;

const getRandomRestartHours = () => {
    return Math.floor(Math.random() * (9 - 7 + 1)) + 7;
};

const manageBotProcess = (script) => {
    if (botProcess) {
        botProcess.kill();
        console.log(`Terminated previous instance of ${script}.`);
    }

    botProcess = spawn("node", ["--trace-warnings", "--async-stack-traces", script], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    botProcess.on("close", (exitCode) => {
        console.log(`${script} terminated with code: ${exitCode}`);
        if (exitCode !== 0) {
            console.log(`Restarting ${script} in 3 seconds...`);
            setTimeout(() => manageBotProcess(script), 3000);
        }
    });

    botProcess.on("error", (error) => {
        console.error(`Error while starting ${script}: ${error.message}`);
    });
};

manageBotProcess("ryuu.js");

cron.schedule('0 * * * *', () => {
    const hours = getRandomRestartHours();
    console.log(`Scheduled bot restart in ${hours} hours.`);

    const restartCron = cron.schedule(`0 */${hours} * * *`, () => {
        console.log('Restarting bot process due to scheduled interval.');
        manageBotProcess("ryuu.js");
        restartCron.stop();
    });
});
