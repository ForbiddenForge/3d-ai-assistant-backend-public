import OpenAI from 'openai';
import { config } from '../config/config.js';
import fs from 'fs';

export const openai = new OpenAI({
	apiKey: config.openaiApiKey,
});

export async function fetchCompletion(messagesForAPI) {
	try {
		const completion = await openai.chat.completions.create({
			//gpt-3.5-turbo-0125, gpt-4-0125-preview'
			//comment out response_format for these modesl gpt-3.5-turbo-0613, gpt-4-0613
			model: 'gpt-3.5-turbo-0125',
			max_tokens: 2500,
			temperature: 0.8,
			response_format: {
				type: 'json_object',
			},
			messages: messagesForAPI,
			user: 'api-beta-test',
		});
		return completion;
	} catch (error) {
		console.error('Failed to fetch chat completion:', error);
		throw error;
	}
}

const availableVoices = {
	//OpenAI TTS
	default_gender: 'nova',
	male: 'echo',
	female: 'nova',
};

/**
 * Converts text to speech and saves the audio file.
 * @param {string} textInput - Text to convert to speech.
 * @param {string} fileName - Path to save the audio file.
 */
export async function createAudio(voice, voice_gender, textInput, fileName) {
	if (voice === 'openai_tts' || voice === 'default_voice') {
		try {
			const audio = await openai.audio.speech.create({
				model: 'tts-1-hd',
				voice: availableVoices[voice_gender],
				input: textInput,
				response_format: 'opus',
			});

			const buffer = Buffer.from(await audio.arrayBuffer());
			await fs.promises.writeFile(fileName, buffer);
			console.log(`Audio file saved to ${fileName}`);
		} catch (error) {
			console.error('Error creating audio file:', error);
		}
	}
}
