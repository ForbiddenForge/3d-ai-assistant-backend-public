import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Executes a command line command.
 * @param {string} command - The command to execute.
 * @returns {Promise<string>} - The output of the command execution.
 */
export function execCommand(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error('Error executing command:', stderr);
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	});
}

/**
 * Adjusts the pitch of an audio file using FFMPEG.
 * @param {string} inputFilePath - The path to the input audio file.
 * @param {string} outputFilePath - The path to the output audio file.
 */
export async function adjustAudioPitch(inputFilePath, outputFilePath) {
	const startTime = Date.now();
	const ffmpegPath = path.join('bin', 'ffmpeg', 'ffmpeg');
	const command = `${ffmpegPath} -i "${inputFilePath}" -af atempo=0.92,asetrate=48000*1.07 "${outputFilePath}" -y`;
	try {
		await execCommand(command);
		console.log(`Audio pitch adjustment done in ${Date.now() - startTime}ms`);
	} catch (error) {
		console.error('Audio pitch adjustment error:', error);
	}
}

/**
 * Converts an audio file to another format using FFMPEG.
 * @param {string} inputFilePath - The path to the input audio file.
 * @param {string} outputFilePath - The path to the output MP3 file.
 */
export async function convertAudioFormat(inputFilePath, outputFilePath) {
	const startTime = Date.now();
	const ffmpegPath = path.join('bin', 'ffmpeg', 'ffmpeg');
	const command = `${ffmpegPath} -i "${inputFilePath}" "${outputFilePath}" -y`;
	try {
		await execCommand(command);
		console.log(`Audio conversion done in ${Date.now() - startTime}ms`);
	} catch (error) {
		console.error('Audio conversion error:', error);
	}
}

/**
 * Generates lip synchronization data using Rhubarb Lip Sync.
 * @param {string} audioFilePath - The path to the audio file.
 * @param {string} outputPath - The path to save the lip sync JSON data.
 */
export async function generateLipSyncData(audioFilePath, jsonOutputPath) {
	const startTime = Date.now();
	const rhubarbPath = path.join('bin', 'Rhubarb-Lip-Sync-1.13.0-Linux', 'rhubarb');
	const command = `${rhubarbPath} -f json -o "${jsonOutputPath}" "${audioFilePath}" -r phonetic`;
	try {
		await execCommand(command);
		console.log(`Lip sync data generation done in ${Date.now() - startTime}ms`);
	} catch (error) {
		console.error('Rhubarb Lip Sync error:', error);
	}
}

/**
 * Reads JSON data from a file.
 * @param {string} filePath - Path to the JSON file.
 */
export async function readJsonTranscript(filePath) {
	try {
		const data = await fs.promises.readFile(filePath, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Error reading JSON transcript:', error);
		throw error;
	}
}

/**
 * Converts an audio file to a Base64 string.
 * @param {string} filePath - The path to the audio file.
 */
export async function audioFileToBase64(filePath) {
	try {
		const data = await fs.promises.readFile(filePath);
		return data.toString('base64');
	} catch (error) {
		console.error('Error converting audio file to Base64:', error);
		throw error;
	}
}
