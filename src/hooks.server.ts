import type { Handle } from '@sveltejs/kit';
import { Authentik, decodeIdToken } from 'arctic';
import { generateState, generateCodeVerifier } from 'arctic';
import { env } from '$env/dynamic/private';

// export const handle: Handle = async ({ event, resolve }) => {
// 	const authentik = new Authentik(env.DOMAIN, env.CLIENT_ID, env.CLIENT_SECRET, env.REDIRECT_URL);

// 	const scopes = ['openid', 'profile', 'email', 'churros:profile'];

// 	// redirection vers l'autorisation
// 	const state = generateState();
// 	const codeVerifier = generateCodeVerifier();
// 	const authorizationUrl = authentik.createAuthorizationURL(state, codeVerifier, scopes);
// 	console.log('Please go here and authorize:', authorizationUrl);

// 	// récupération du token
// 	const code = new URLSearchParams(window.location.search).get('code');

// 	if (!code) {
// 		throw new Error('No code found in URL');
// 	}

// 	const tokens = await authentik.validateAuthorizationCode(code, codeVerifier);
// 	const idToken = tokens.idToken();
// 	const claims = decodeIdToken(idToken);
// 	console.log(claims);

// 	return resolve(event);
// };
