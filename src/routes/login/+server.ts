import { authentik } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateCodeVerifier, generateState } from 'arctic';

const OAUTH_STATE_COOKIE = 'oauthState';
const OAUTH_CODE_VERIFIER_COOKIE = 'oauthCodeVerifier';
const SCOPES = ['openid', 'profile', 'email', 'churros:profile'];

export const GET: RequestHandler = ({ cookies }) => {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();

	const url = authentik.createAuthorizationURL(state, codeVerifier, SCOPES);

	cookies.set(OAUTH_STATE_COOKIE, state, {
		secure: false,
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10
	});

	cookies.set(OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, {
		secure: false,
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10
	});
	redirect(302, url);
};
