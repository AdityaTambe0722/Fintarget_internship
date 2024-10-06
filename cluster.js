const cluster = require('cluster');
const os = require('os');
const app = require('./src/app'); // Import the application logic

if (cluster.isMaster) {
    const numCPUs = 2; // Two replica sets
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died, restarting...`);
        cluster.fork(); // Restart workers on failure
    });
} else {
    app.startServer();
}
