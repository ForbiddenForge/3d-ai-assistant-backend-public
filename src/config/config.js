import dotenv from 'dotenv';
import { PROMPTS } from './prompts.js';
dotenv.config();

const requiredEnv = ['OPENAI_API_KEY', 'REDIS_URL', 'ALLOWED_ORIGINS', 'PORT'];

export const checkEnvVariables = () => {
	const unsetEnv = requiredEnv.filter((envKey) => !process.env[envKey]);
	if (unsetEnv.length > 0) {
		throw new Error(`Required ENV variables are not set: [${unsetEnv.join(', ')}]`);
	}
};

export const config = {
	openaiApiKey: process.env.OPENAI_API_KEY,
	redisUrl: process.env.REDIS_URL,
	allowedOrigins: process.env.ALLOWED_ORIGINS.split(','),
	defaultPrompt: PROMPTS.default,
	secondPrompt: PROMPTS.default2,
};
