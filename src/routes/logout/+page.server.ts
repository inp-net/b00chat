import { Logger } from '$lib/logger.js';
import { SESSION_COOKIE } from '$lib/server/auth';
import { Sessions } from '$lib/server/database.js';
import { env } from '$lib/server/env';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    const sessionId = cookies.get(SESSION_COOKIE);

    if (sessionId) {
        Logger.logEvent({
            type: 'auth',
            action: 'logout',
            uid: Sessions.get(sessionId).user
        });

        Sessions.delete(sessionId);
    }

	cookies.delete(SESSION_COOKIE, { path: '/' });

    return redirect(303, env.LOGOUT_URL);
}
