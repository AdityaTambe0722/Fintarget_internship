const fs = require('fs');

function processTask(userId) {
    const logMessage = `${userId} - task completed at ${new Date().toISOString()}\n`;
    fs.appendFile('./logs/task_log.txt', logMessage, (err) => {
        if (err) console.error('Error logging task:', err);
    });
    console.log(logMessage);
}

module.exports = { processTask };
