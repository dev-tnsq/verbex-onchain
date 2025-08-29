import Groq from 'groq-sdk';
import * as FileSystem from 'expo-file-system';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const BASE_URL = 'https://api.groq.com/openai/v1';

if (!GROQ_API_KEY) {
	console.warn('EXPO_PUBLIC_GROQ_API_KEY not set. STT/TTS will not work on-device.');
}

function toBase64FromArrayBuffer(arrayBuffer: ArrayBuffer): string {
	const bytes = new Uint8Array(arrayBuffer);
	let binary = '';
	for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
	// @ts-ignore btoa available in RN
	return btoa(binary);
}

function extFromMime(mime: string): string {
	switch (mime) {
		case 'audio/m4a': return 'm4a';
		case 'audio/mp4': return 'mp4';
		case 'audio/mpeg': return 'mp3';
		case 'audio/mpga': return 'mpga';
		case 'audio/ogg': return 'ogg';
		case 'audio/opus': return 'opus';
		case 'audio/wav': return 'wav';
		case 'audio/webm': return 'webm';
		case 'audio/flac': return 'flac';
		default: return 'm4a';
	}
}

async function getBlobFromUri(uri: string, fallbackMime: string = 'audio/m4a'): Promise<{ blob: Blob; mime: string; filename: string; }> {
	try {
		const res = await fetch(uri);
		const blob = await res.blob();
		const mime = blob.type && blob.type.length > 0 ? blob.type : fallbackMime;
		const ext = extFromMime(mime);
		const base = uri.split('/').pop() || `voice-${Date.now()}`;
		const filename = base.includes('.') ? base : `${base}.${ext}`;
		return { blob, mime, filename };
	} catch {
		// Fallback: read as base64 and rehydrate via data URL
		const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
		const mime = fallbackMime;
		const dataUrl = `data:${mime};base64,${base64}`;
		const res2 = await fetch(dataUrl);
		const blob = await res2.blob();
		const ext = extFromMime(mime);
		const base = uri.split('/').pop() || `voice-${Date.now()}`;
		const filename = base.includes('.') ? base : `${base}.${ext}`;
		return { blob, mime, filename };
	}
}

export async function sttTranscribeFromUri(uri: string, p0: string): Promise<string> {
	if (!GROQ_API_KEY) throw new Error('GROQ API key missing');
	// Try with Groq SDK first
	try {
		const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
		const { blob, mime, filename } = await getBlobFromUri(uri, 'audio/webm');
		// @ts-ignore File may not exist in RN; SDK accepts Blob too
		const file: any = typeof File !== 'undefined' ? new File([blob], filename, { type: mime }) : blob;
		const transcription: any = await groq.audio.transcriptions.create({
			file,
			model: 'whisper-large-v3-turbo',

			response_format: 'text',
			temperature: 0.0,
		});
		const text: string = (transcription as any)?.text || '';
		if (text && text.length > 0) return text;
		throw new Error('empty-transcription');
	} catch (e) {
		// Fallback to REST: append Blob with filename and correct mime
		const { blob, mime, filename } = await getBlobFromUri(uri, 'audio/webm');
		const form = new FormData();
		form.append('model', 'whisper-large-v3-turbo');
		
		form.append('response_format', 'text');
		// @ts-ignore RN FormData supports blob + filename; ensure field named 'file'
		form.append('file', blob as any, filename);

		const res = await fetch(`${BASE_URL}/audio/transcriptions`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
			body: form as any,
		});
		if (!res.ok) {
			const err = await res.text();
			throw new Error(`STT failed: ${res.status} ${err}`);
		}
		const text = await res.text();
		return text;
	}
}

export async function ttsToBase64(text: string, voice: string = 'Fritz-PlayAI'): Promise<string> {
	if (!GROQ_API_KEY) throw new Error('GROQ API key missing');
	// Try Groq SDK first
	try {
		const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
		const response = await groq.audio.speech.create({ model: 'playai-tts', voice, input: text, response_format: 'wav' });
		const arrayBuffer = await response.arrayBuffer();
		return toBase64FromArrayBuffer(arrayBuffer);
	} catch (e) {
		// Fallback to REST
		const res = await fetch(`${BASE_URL}/audio/speech`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${GROQ_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ model: 'playai-tts', voice, input: text, response_format: 'wav' }),
		});
		if (!res.ok) {
			const err = await res.text();
			throw new Error(`TTS failed: ${res.status} ${err}`);
		}
		const arrayBuffer = await res.arrayBuffer();
		return toBase64FromArrayBuffer(arrayBuffer);
	}
}