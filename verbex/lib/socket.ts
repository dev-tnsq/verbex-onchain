import { io, Socket } from 'socket.io-client';
import { CONFIG } from '../constants/config';

let socket: Socket | null = null;

export function getSocket(): Socket {
	if (!socket) {
		socket = io(CONFIG.WS_URL, { transports: ['websocket'], forceNew: true });
	}
	return socket;
}

export function disconnectSocket() {
	if (socket) { socket.disconnect(); socket = null; }
}