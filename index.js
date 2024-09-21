const { spawn } = require("child_process");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Ryuu Bot is running');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Ryuu Bot server is running on port ${port}`);
});

let botProcess = null;

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

process.on('SIGINT', () => {
    if (botProcess) {
        botProcess.kill();
        console.log('Bot process terminated.');
    }
    process.exit();
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (botProcess) {
        botProcess.kill();
    }
    manageBotProcess("ryuu.js");
});
