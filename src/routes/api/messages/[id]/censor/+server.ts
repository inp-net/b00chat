import { Logger } from '$lib/logger';
import { Messages, Users } from '$lib/server/database';
import { broadcastMessage } from '$lib/server/socketSessions';
import type { RequestHandler } from '../$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	const { id } = params;
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!Users.isModerator(locals.user.uid)) {
		return new Response('Forbidden', { status: 403 });
	}

	// Censor the message and broadcast the censorship to all clients.
	Messages.censor(id);
	broadcastMessage({ type: 'message:censored', content: id });

    Logger.logEvent({
        type: 'moderation',
        action: 'censor',
        actorUid: locals.user.uid,
        targetId: id
    })

	return new Response(null, { status: 204 });
};
