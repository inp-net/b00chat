import { Authentik } from 'arctic/dist/providers/authentik';
import { env } from './env';
import { isFuture } from 'date-fns';
import { DB, Tables, type Session, type User } from './database';
import type { ChurrosProfile } from '$lib/users';

export const OAUTH_STATE_COOKIE = 'oauthState';
export const OAUTH_CODE_VERIFIER_COOKIE = 'oauthCodeVerifier';
export const SESSION_COOKIE = 'sessionId';
export const authentik = new Authentik(
	env.BASE_URL,
	env.CLIENT_ID,
	env.CLIENT_SECRET,
	env.REDIRECT_URL
);

export function validateSession(id: string): User | undefined {
	const session = DB.Session[id];
	if (!session) return undefined;

	const valid = isFuture(session.validUntil);
	if (!valid) {
		logout(id);
		return undefined;
	}

	return DB.User[session.user];
}

export function createSession(user: typeof ChurrosProfile.inferIn): Session {
	const session = Tables.Session.assert({
		user: user.uid
	});

	DB.User[user.uid] = Tables.User.assert(user);
	DB.Session[session.id] = session;

	return session;
}

export function logout(sessionId: string) {
	delete DB.Session[sessionId];
}
