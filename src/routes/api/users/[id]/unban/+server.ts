import { DB, unbanUser, uncensorMessage } from '$lib/server/database';
import { broadcastMessage, socketSessions } from '$lib/server/socketSessions';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	const { id } = params;

	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!DB.User[locals.user.uid]?.moderator) {
		return new Response('Forbidden', { status: 403 });
	}

	// Also uncensor all their previous messages.
	for (const message of Object.values(DB.Message)) {
		if (message.sender === id && message.censored) {
			uncensorMessage(message.id);
			broadcastMessage({ type: 'message:uncensored', content: message.id });
		}
	}

	unbanUser(id);
        broadcastMessage({ type: 'user:unbanned', content: id });

	return new Response(null, { status: 204 });
};
