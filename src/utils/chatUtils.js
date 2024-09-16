import { moderateUserMessage, moderateAIResponse } from './moderationUtils.js';
import { config } from '../config/config.js';
import { fetchCompletion, createAudio } from '../services/ai.js';
import {
	convertAudioFormat,
	adjustAudioPitch,
	generateLipSyncData,
	readJsonTranscript,
	audioFileToBase64,
} from './audioUtils.js';

import { redisClient } from '../queue/queue.js';
import path from 'path';

/**
 * Normalizes response data to ensure uniform message format across the application.
 * @param {string|object} response - The response from an API or other data source.
 * @returns {Array} An array of message objects with standardized properties.
 */
export function normalizeMessages(response) {
	let messages = [];

	try {
		// handle different scenarios of unreliable json input by the ai
		const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;

		// handle {response: text : 'bla bla bla'}
		if (parsedResponse.response) {
			messages = parsedResponse.response;

			// handle {text: response: text: 'bla bla bla'}
		} else if (parsedResponse.text?.response) {
			messages = parsedResponse.text.response;

			// handle {text: text: 'bla bla bla'}
		} else if (parsedResponse.text?.text) {
			messages = [parsedResponse.text];

			// handle array responses directly
		} else if (Array.isArray(parsedResponse)) {
			messages = parsedResponse;

			// handle single text objects
		} else if (parsedResponse.text) {
			messages = [parsedResponse];

			// default case to handle plain text responses missing the other properties
		} else {
			messages = [
				{
					text: response,
					facialExpression: 'default',
					animation: 'Idle',
				},
			];
		}
	} catch (error) {
		// construct 'messages' even if there are parsing errors
		console.error('Error normalizing messages:', error);
		messages = [
			{
				text: 'Error processing response',
				facialExpression: 'concerned',
				animation: 'Idle',
			},
		];
	}

	return messages;
}

export async function processChatPackage(job) {
	const { userMessage, conversationHistory, voice, voice_gender, prompt, isAppleDevice } = job.data;
	console.log(
		`'Received new job with data\nUSERMESSAGE: ${userMessage}\nCONVERSATIONHISTORY: ${conversationHistory}`
	);

	// Check if the userMessage gets flagged by the moderation endpoint for certain categories. Returns an object with message and flag(truefalse) properties.
	const { message: moderatedUserMessage, flagged } = await moderateUserMessage(userMessage);

	// Add user message to received conversation history
	conversationHistory.push({ role: 'user', content: moderatedUserMessage });

	// Retrieve prompt for the AI from config TODO make this dynamic for different front end avatars
	const promptText = config[prompt];

	// Package AI messages to send to the API
	const messagesForAPI = [
		{
			role: 'system',
			content: promptText,
		},
		...conversationHistory, //include history to maintain chatbot context, with last entry being the latest user message
	];

	console.log('messages for API:', messagesForAPI);

	const completion = await fetchCompletion(messagesForAPI);

	console.log('raw API RESPONSE', completion.choices[0].message.content);

	let messages = normalizeMessages(completion.choices[0].message.content);

	// Ensure chatbotResponseMessages is always an array for consistent processing
	if (!Array.isArray(messages)) {
		messages = [messages];
	}

	// AI response content moderation
	const moderatedResponse = await moderateAIResponse(messages);

	messages = moderatedResponse.messages;
	if (moderatedResponse.flagged) {
		console.log('Response was flagged and has been sanitized');
	}

	console.log('CHATGPT RESPONSE:', messages);
	console.log('USAGE INFO:', completion.usage);

	/**
	 * Audio, Speech, and Lipsync generation.
	 * Note: generateLipSyncData, using the Rhubarb executable,
	 * is the most time consuming portion of each message generation.
	 */
	for (let i = 0; i < messages.length; i++) {
		const message = messages[i];
		// generate audio file
		const createAudioFilePath = path.resolve(`audios/message_${i}.ogg`); // The name of your audio file
		const textInput = message.text; // The text you wish to convert to speech

		// pass textinput to openAI TTS and save the file
		await createAudio(voice, voice_gender, textInput, createAudioFilePath);
		// adjust the pitch, saving to a new ogg file because it won't process the file in-place
		await adjustAudioPitch(createAudioFilePath, `audios/message_${i}_converted.ogg`);

		if (isAppleDevice) {
			// convert to mp3 for use by Apple product users if iOS is detected on frontend
			console.log('HOLY SHIT WE GOT AN APPLE USER HERE!!! Converting Audio to mp3 ASAP!');
			await convertAudioFormat(
				`audios/message_${i}_converted.ogg`,
				`audios/message_${i}_converted.mp3`
			);
			// grab the converted mp3 file for filthy iOS users
			message.mp3 = await audioFileToBase64(path.resolve(`audios/message_${i}_converted.mp3`));
		} else {
			// otherwise stick with adding our lightweight pitch-converted .ogg file we have
			message.audio = await audioFileToBase64(path.resolve(`audios/message_${i}_converted.ogg`));
		}
		/**
		 * Generate the lipsync json file from the original audio path 	returned by the tts api
		 * Commented out in order to use a default lipsync file. This gives 10x performance for responses but the model's lips will be totally inaccurate.
		 */
		// await generateLipSyncData(`audios/message_${i}_converted.ogg`, `audios/message_${i}.json`);

		message.lipsync = await readJsonTranscript(`audios/default_lipsync.json`);
	}

	console.log('Final response:', messages);
	return messages;
}
