import { insertMessage, latestMessages, type Message } from '$lib/server/database';
import type { SocketMessage, SocketMessageClient } from '$lib/socket';
import type { Peer, Socket } from '@sveltejs/kit';

const socketSessions = new Map<string, Peer | null>();

// TODO add message types for mini games

export const socket: Socket = {
	upgrade(event) {
		const socketId = event.request.headers.get('sec-websocket-key');

		// TODO: uncomment when auth works
		// if (!event.locals.me) {
		// 	return { status: 401, body: 'Unauthorized' };
		// }

		if (!socketId) {
			return { status: 400, body: 'Bad Request' };
		}

		if (socketSessions.has(socketId)) {
			return { status: 409, body: 'WebSocket already connected' };
		}

		socketSessions.set(socketId, null);
	},
	open(peer) {
		const socketId = peer.request.headers.get('sec-websocket-key');
		if (!socketId) return;

		socketSessions.set(socketId, peer);

		const previousMessages = latestMessages(10);
		const socketPreviousMessage: SocketMessageClient[] = previousMessages.map((msg) => ({
			content: msg.content,
			senderName: msg.sender.name,
			timestamp: msg.sentAt.getTime(),
			major: msg.sender.major
		}));

		peer.send(
			JSON.stringify({ type: 'message_batch', content: socketPreviousMessage } as SocketMessage)
		);
	},
	close(peer) {
		const socketId = peer.request.headers.get('sec-websocket-key');
		if (!socketId || !socketSessions.has(socketId)) return;

		socketSessions.delete(socketId);
	},
	async message(peer, message) {
		const parsed = message.json() as SocketMessage;
		const socketId = peer.request.headers.get('sec-websocket-key');

		if (!socketId) return;

		switch (parsed.type) {
			case 'ping':
				peer.send(JSON.stringify({ type: 'pong' }));
				break;
			case 'message': {
				// Broadcast the message to all connected peers
				for (const [id, p] of socketSessions) {
					if (p && id !== socketId) {
						p.send(JSON.stringify(parsed));
					}
				}

				const dbMessage: Message = {
					censored: false,
					content: parsed.content.content,
					sentAt: new Date(parsed.content.timestamp),
					receivedAt: new Date(),
					id: '',
					sender: 'planchetm'
				};

				insertMessage(dbMessage);
				break;
			}
		}
	}
};
