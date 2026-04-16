import type { Peer } from '@sveltejs/kit';
import type { SocketMessageSchema } from '$lib/socket';

type SocketPeer = { userUid: string | null; peer: Peer | null };
export const socketSessions = new Map<string, SocketPeer>();

export const sendMessage = (peer: Peer, message: typeof SocketMessageSchema.inferOut) => {
	peer.send(JSON.stringify(message));
};

export const broadcastMessage = (
	message: typeof SocketMessageSchema.inferOut,
	filter?: (peer: Peer) => boolean
) => {
	for (const { peer } of socketSessions.values()) {
		if (peer && (!filter || filter(peer))) {
			sendMessage(peer, message);
		}
	}
};
