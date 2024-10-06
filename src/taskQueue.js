const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');
const taskHandler = require('./taskHandler');

const redisClient = new Redis();

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    points: 20, // 20 tasks per minute
    duration: 60,
    keyPrefix: 'task',
});

const rateLimiterPerSecond = new RateLimiterRedis({
    storeClient: redisClient,
    points: 1, // 1 task per second
    duration: 1,
    keyPrefix: 'task-sec',
});

const queue = {}; // In-memory queue for user tasks

async function handleTask(req, res) {
    const userId = req.body.user_id;
    try {
        await rateLimiter.consume(userId);
        await rateLimiterPerSecond.consume(userId);
        taskHandler.processTask(userId);
        res.status(200).send('Task queued');
    } catch (err) {
        if (!queue[userId]) {
            queue[userId] = [];
        }
        queue[userId].push(() => taskHandler.processTask(userId));
        res.status(429).send('Rate limit exceeded, task queued');
    }
}

// Process queues every second
setInterval(() => {
    Object.keys(queue).forEach((userId) => {
        if (queue[userId].length > 0) {
            queue[userId].shift()(); // Execute queued tasks
        }
    });
}, 1000);

module.exports = { handleTask };
