import { Logger } from '$lib/logger';
import { Users, Messages } from '$lib/server/database';
import { broadcastMessage } from '$lib/server/socketSessions';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	const { id } = params;

	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!Users.isModerator(locals.user.uid)) {
		return new Response('Forbidden', { status: 403 });
	}

	// Also uncensor all their previous messages.
	for (const message of Messages.getByUser(id)) {
		if (message.censored) {
			Messages.uncensor(message.id);
			broadcastMessage({ type: 'message:uncensored', content: message.id });
		}
	}

	Users.unban(id);
	broadcastMessage({ type: 'user:unbanned', content: id });

    Logger.logEvent({
        type: 'moderation',
        action: 'unban',
        actorUid: locals.user.uid,
        targetId: id
    })

	return new Response(null, { status: 204 });
};
