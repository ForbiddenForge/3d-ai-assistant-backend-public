import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config/config.js';
import { processChatPackage } from '../utils/chatUtils.js';

const redisClient = new IORedis(config.redisUrl, {
	maxRetriesPerRequest: null,
	reconnectOnError: () => true, // Reconnect on error
});

const chatQueue = new Queue('chatProcessingQueue', { connection: redisClient });

const chatWorker = new Worker(
	'chatProcessingQueue',
	async (job) => {
		const startTime = Date.now();
		try {
			const messages = await processChatPackage(job);
			// Batch Redis commands
			const multi = redisClient.multi();
			multi.set(`result:${job.id}`, JSON.stringify(messages), 'EX', 3600); // Expires in 1 hour.
			await multi.exec();
			console.log(
				`Worker finished job ${job.id} (processChatPackage) in ${Date.now() - startTime}ms`
			);
		} catch (error) {
			console.error('Error processing chat queue job:', error);
			job.moveToFailed({ message: error.message });
		}
	},
	{ connection: redisClient, concurrency: 5 } // Process multiple jobs in parallel
);

export { chatQueue, redisClient };
