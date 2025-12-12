import type { RequestHandler } from './$types';
import { OAuth2RequestError } from 'arctic';
import { error, redirect, text } from '@sveltejs/kit';
import {
	authentik,
	createSession,
	OAUTH_CODE_VERIFIER_COOKIE,
	OAUTH_STATE_COOKIE,
	SESSION_COOKIE
} from '$lib/server/auth';
import { ChurrosProfile } from '$lib/users';
import { ArkErrors } from 'arktype';
import { hoursToSeconds } from 'date-fns';
import { env } from '$lib/server/env';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const storedState = cookies.get(OAUTH_STATE_COOKIE);
	const codeVerifier = cookies.get(OAUTH_CODE_VERIFIER_COOKIE);

	if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
		return text('Invalid state or code verifier', {
			status: 400
		});
	}

	try {
		const token = await authentik.validateAuthorizationCode(code, codeVerifier);

		const userInfo = await fetch(env.USER_INFO_URL, {
			method: 'post',
			headers: {
				Authorization: `Bearer ${token.accessToken()}`,
				'Content-Type': 'application/json'
			}
		});

		const userJson = await userInfo.json();
		const user = ChurrosProfile.in(userJson);

		if (user instanceof ArkErrors) {
			console.error('User info validation errors:', user);
			throw error(
				500,
				'Une erreur est survenue lors de la récupération des informations de l"utilisateur'
			);
		}

		const session = createSession(user);

		cookies.set(SESSION_COOKIE, session.id, {
			path: '/',
			expires: session.validUntil,
			maxAge: hoursToSeconds(env.SESSION_EXPIRATION_HOURS)
		});
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			if (e.code === 'invalid_grant') {
				redirect(302, '/login');
			}
			throw error(500, "Une erreur est survenue lors du processus d'authentification");
		} else {
			console.error('Unexpected error during authentication callback:', e);
			throw error(500, 'Une erreur est survenue');
		}
	}

	redirect(302, '/');
};
