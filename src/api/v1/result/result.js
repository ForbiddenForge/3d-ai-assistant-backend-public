import express from 'express';

import { redisClient } from '../../../queue/queue.js';

const router = express.Router();

// Route to retrieve chat result
router.get('/result/:jobId', async (req, res) => {
	const jobId = req.params.jobId;

	try {
		const result = await redisClient.get(`result:${jobId}`);

		if (result) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.parse(result));
			await redisClient.del(`result:${jobId}`); // Clean up after sending the response
		} else {
			res.status(202).send({ message: 'Still processing' });
		}
	} catch (error) {
		console.error('Failed to retrieve result:', error);
		res.status(500).send({ message: 'Error retrieving result' });
	}
});

export default router;
