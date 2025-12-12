import { insertMessage, latestMessages, type User } from '$lib/server/database';
import type { SocketMessage, SocketMessageClient } from '$lib/socket';
import type { Peer, Socket } from '@sveltejs/kit';

type SocketPeer = { user: User | null; peer: Peer | null };

const socketSessions = new Map<string, SocketPeer>();

// TODO add message types for mini games

export const socket: Socket = {
	upgrade(event) {
		const socketId = event.request.headers.get('sec-websocket-key');

		if (!socketId) {
			return { status: 400, body: 'Bad Request' };
		}

		if (socketSessions.has(socketId)) {
			return { status: 409, body: 'WebSocket already connected' };
		}

		socketSessions.set(socketId, { user: event.locals.user ?? null, peer: null });
	},
	open(peer) {
		const socketId = peer.request.headers.get('sec-websocket-key');
		if (!socketId) return;

		const socketPeer = socketSessions.get(socketId);
		socketSessions.set(socketId, { user: socketPeer?.user ?? null, peer });

		const previousMessages = latestMessages(10);
		const socketPreviousMessage: SocketMessageClient[] = previousMessages
			.map((msg) => ({
				content: msg.content,
				senderName: msg.sender.name,
				senderPronouns: msg.sender.pronouns,
				senderUid: msg.sender.uid,
				timestamp: msg.sentAt.getTime(),
				major: msg.sender.major
			}))
			.reverse();

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
					if (p.peer && id !== socketId) {
						p.peer.send(JSON.stringify(parsed));
					}
				}

				insertMessage({
					content: parsed.content.content,
					sentAt: new Date(parsed.content.timestamp),
					receivedAt: new Date(),
					sender: parsed.content.senderUid
				});

				break;
			}
		}
	}
};
