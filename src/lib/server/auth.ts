import { Authentik } from 'arctic/dist/providers/authentik';
import { env } from './env';
import { Sessions, Tables, Users, type Session, type User } from './database';
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
	const session = Sessions.get(id);
	if (!session) return undefined;

	if (!Sessions.isValid(id)) {
		Sessions.delete(id);
		return undefined;
	}

	return Users.get(session.user);
}

export function createSession(user: typeof ChurrosProfile.inferIn): Session {
	const session = Tables.Session.assert({
		user: user.uid
	});

	Users.set(user);
	Sessions.set(session);

	return session;
}
