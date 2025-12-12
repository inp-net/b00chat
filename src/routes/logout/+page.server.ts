import { logout, SESSION_COOKIE } from '$lib/server/auth';
import { env } from '$lib/server/env';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
	const session = cookies.get(SESSION_COOKIE);
	if (session) logout(session);

	cookies.delete(SESSION_COOKIE, { path: '/' });
	return redirect(303, env.LOGOUT_URL);
}
