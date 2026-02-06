import { DB, insertMessage, latestMessages } from '$lib/server/database';
import { broadcastMessage, sendMessage, socketSessions } from '$lib/server/socketSessions';
import type { ClientMessage, SocketMessageSchema } from '$lib/socket';
import type { Socket } from '@sveltejs/kit';

export const socket: Socket = {
	upgrade(event) {
		const socketId = event.request.headers.get('sec-websocket-key');

		if (!socketId) {
			return { status: 400, body: 'Bad Request' };
		}

		if (socketSessions.has(socketId)) {
			return { status: 409, body: 'WebSocket already connected' };
		}

		socketSessions.set(socketId, { userUid: event.locals.user?.uid ?? null, peer: null });
	},
	open(peer) {
		const socketId = peer.request.headers.get('sec-websocket-key');
		if (!socketId) return;

		const socketPeer = socketSessions.get(socketId);
		socketSessions.set(socketId, { userUid: socketPeer?.userUid ?? null, peer });

		const previousMessages = latestMessages(10);
		const socketPreviousMessages: ClientMessage[] = previousMessages
			.map((msg) => ({
                id: msg.id,
				content: msg.content,
				senderName: msg.sender.name,
				senderUid: msg.sender.uid,
				timestamp: msg.sentAt.getTime(),
				major: msg.sender.major,
                censored: msg.censored
			}))
			.reverse();

        sendMessage(peer, { type: 'message:created:batch', content: socketPreviousMessages });
	},
	close(peer) {
		const socketId = peer.request.headers.get('sec-websocket-key');
		if (!socketId || !socketSessions.has(socketId)) return;

		socketSessions.delete(socketId);
	},
	async message(peer, message) {
		const parsed = message.json() as typeof SocketMessageSchema.inferIn;
		const socketId = peer.request.headers.get('sec-websocket-key');
		if (!socketId) return;

        const socketSession = socketSessions.get(socketId ?? '');
        // If the user is not logged in or is banned, ignore their messages.
        const socketUser = DB.User[socketSession?.userUid ?? ''];
        if (!socketSession || !socketUser || socketUser.banned) return;

        
		switch (parsed.type) {
			case 'message:create': {
				// Broadcast the message to all connected peers
                const { content, senderUid, senderName, major } = parsed.content;
                
				const { id } = insertMessage({
                    content: parsed.content.content.substring(0, 250),
					sentAt: new Date(parsed.content.timestamp),
					receivedAt: new Date(),
					sender: parsed.content.senderUid
				});

                broadcastMessage({
                    type: 'message:created',
                    content: {
                        id,
                        content,
                        senderUid,
                        senderName,
                        major,
                        timestamp: parsed.content.timestamp,
                        censored: false
                    } 
                });
				break;
			}
		}
	}
};
