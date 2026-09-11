import arkenv from 'arkenv';
import { type } from 'arktype';

import * as dotenv from 'dotenv';

dotenv.config();

export const env = arkenv({
	CLIENT_ID: 'string.alphanumeric',
	CLIENT_SECRET: 'string.alphanumeric',
	BETTER_AUTH_SECRET: 'string',
	BETTER_AUTH_URL: 'string.url',
	BASE_URL: 'string.url',
	ISSUER_URL: 'string.url',
	USER_INFO_URL: 'string.url',
	LOGOUT_URL: 'string.url',
	ADMIN_UIDS: type(/^[\w\d,]*$/)
		.pipe((uids) => uids.split(','))
		.default(''),
	BANNED_UIDS: type(/^[\w\d,]*$/)
		.pipe((uids) => uids.split(','))
		.default(''),
	SESSION_EXPIRATION_HOURS: 'string.integer.parse = "4"',
	VERSION: 'string = "dev"',
	BUILD_COMMIT: 'string = "none"'
});
