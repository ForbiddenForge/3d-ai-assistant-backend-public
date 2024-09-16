import express from 'express';
import compression from 'compression'; // Add compression middleware
import { config } from '../config/config.js';

const allowedOrigins = config.allowedOrigins;
const corsOptions = {
	origin: (origin, callback) => {
		// Allow requests w no origin (like mobile apps or curl requests)
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS policy'));
		}
	},
	credentials: true,
	methods: 'GET,POST,PUT,DELETE,OPTIONS',
	allowedHeaders: 'Content-Type,Authorization',
};

const jsonParser = express.json({ limit: '5mb' });
const urlEncodedParser = express.urlencoded({ limit: '5mb', extended: true });

export { corsOptions, jsonParser, urlEncodedParser, compression };
