import { DB } from '$lib/server/database';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	console.log('Database:', DB);

	return redirect(303, '/');
};
