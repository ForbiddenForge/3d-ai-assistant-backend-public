import { WebSocketServer } from 'ws';
import { redisClient } from './queue/queue.js';

export const setupWebSocket = (server) => {
	const wss = new WebSocketServer({ server });

	wss.on('connection', (ws) => {
		console.log('New WebSocket connection established');

		const sendPing = () => {
			if (ws.readyState === ws.OPEN) {
				ws.ping();
				setTimeout(sendPing, 30000); // Send ping every 30 seconds
			}
		};

		sendPing();

		ws.on('pong', () => {
			console.log('Received pong from client');
		});

		ws.on('message', async (message) => {
			const { jobId } = JSON.parse(message);
			console.log('Received jobId from WebSocket:', jobId);

			const checkResult = async () => {
				const result = await redisClient.get(`result:${jobId}`);
				if (result) {
					ws.send(result);
					await redisClient.del(`result:${jobId}`);
				} else {
					setTimeout(checkResult, 1000);
				}
			};

			checkResult();
		});

		ws.on('close', () => {
			console.log('WebSocket connection closed');
		});

		ws.on('error', (error) => {
			console.error('WebSocket error:', error);
		});
	});
};
