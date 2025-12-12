import { SESSION_COOKIE, validateSession } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get(SESSION_COOKIE);
	if (session) {
		event.locals.user = validateSession(session);
	}

	return resolve(event);
};
