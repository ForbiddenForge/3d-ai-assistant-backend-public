import express from 'express';

import { jsonParser, urlEncodedParser } from '../../../middleware/middleware.js';
import { chatQueue, redisClient } from '../../../queue/queue.js';

const router = express.Router();

// Route to handle chat messages
router.post('/chat', jsonParser, urlEncodedParser, async (req, res) => {
	// receive from frontend
	const userMessage = req.body.message || 'Hello';
	const conversationHistory = req.body.history || [];
	const voice = req.body.voice || 'default_voice';
	const voice_gender = req.body.voice_gender || 'default_gender';
	const prompt = req.body.prompt || 'defaultPrompt';
	const isAppleDevice = req.body.isAppleDevice || false;

	console.log(`IS APPLE? ${isAppleDevice} type: ${typeof isAppleDevice}`);

	// add the job to the queue
	const job = await chatQueue.add('newChatMessage', {
		userMessage,
		conversationHistory,
		voice,
		voice_gender,
		prompt,
		isAppleDevice,
	});

	// Immediate client response, including the jobId for the frontend to find the output
	res.status(202).json({
		jobId: job.id,
		message: 'Processing your request...',
	});
});

export default router;
