import type { RequestHandler } from './$types';
import { OAuth2RequestError } from 'arctic';
import { error, redirect, text } from '@sveltejs/kit';
import { authentik } from '$lib/server/auth';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const storedState = cookies.get('oauthState');
	const codeVerifier = cookies.get('oauthCodeVerifier');

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

		if (!userInfo) {
			throw error(
				500,
				'Une erreur est survenue lors de la récupération des informations de l"utilisateur'
			);
		}

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			if (e.code === 'invalid_grant') {
				redirect(302, '/login');
			}
			throw error(500, "Une erreur est survenue lors du processus d'authentification");
		} else {
			throw error(500, 'Une erreur est survenue');
		}
	}

	redirect(302, '/');
};
