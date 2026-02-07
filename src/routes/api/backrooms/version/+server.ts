import { env } from '$lib/server/env';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	return json({
		version: env.VERSION,
		build_commit: env.BUILD_COMMIT
	});
};
