import { Logger } from '$lib/logger';
import { Users, Messages } from '$lib/server/database';
import { broadcastMessage, socketSessions } from '$lib/server/socketSessions';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	const { id } = params;

	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!Users.isModerator(locals.user.uid)) {
		return new Response('Forbidden', { status: 403 });
	}

	// Also censor all their previous messages.
	for (const message of Messages.getByUser(id)) {
		if (!message.censored) {
			Messages.censor(message.id);
			broadcastMessage({ type: 'message:censored', content: message.id });
		}
	}

	Users.ban(id);
	broadcastMessage({ type: 'user:banned', content: id });

	// Close any active WebSocket connections for the banned user.
	socketSessions.forEach(({ userUid, peer }) => {
		if (userUid === id && peer) {
			peer.close();
		}
	});
    
    Logger.logEvent({
        type: 'moderation',
        action: 'ban',
        actorUid: locals.user.uid,
        targetId: id
    })

	return new Response(null, { status: 204 });
};
