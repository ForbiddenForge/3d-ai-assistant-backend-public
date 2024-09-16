import express from 'express';
import chatRouter from './chat/chat.js';
import resultRouter from './result/result.js';

const router = express.Router();

router.use('/', chatRouter);
router.use('/', resultRouter);
router.get('/', (req, res) => {
	res.send('API is up and running!');
});

export default router;
