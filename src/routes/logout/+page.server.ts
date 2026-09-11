import { authClient } from '$lib/client.js';
import { env } from '$lib/server/env';
import { redirect } from '@sveltejs/kit';

export async function load() {
	await authClient.signOut();
	return redirect(303, env.LOGOUT_URL);
}
