import { censorMessage, DB } from '$lib/server/database';
import { broadcastMessage } from '$lib/server/socketSessions';
import type { RequestHandler } from '../$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	const { id } = params;
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!DB.User[locals.user.uid]?.moderator) {
		return new Response('Forbidden', { status: 403 });
	}

	// Censor the message and broadcast the censorship to all clients.
	censorMessage(id);
	broadcastMessage({ type: 'message:censored', content: id });

	return new Response(null, { status: 204 });
};
