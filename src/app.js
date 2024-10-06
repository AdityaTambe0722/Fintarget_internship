const express = require('express');
const taskQueue = require('./taskQueue');
const app = express();
app.use(express.json());

app.post('/task', taskQueue.handleTask);

function startServer() {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}

module.exports = { startServer };
