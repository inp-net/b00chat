import arkenv, { type } from 'arkenv';
import * as dotenv from 'dotenv';

dotenv.config();

export const env = arkenv({
	BASE_URL: 'string.url',
	CLIENT_ID: 'string.alphanumeric',
	CLIENT_SECRET: 'string.alphanumeric',
	REDIRECT_URL: 'string.url',
	LOGOUT_URL: 'string.url',
	BANNED_UIDS: [/^[\w\d,]+$/, '=>', (uids) => uids.split(',')],
	ADMIN_UIDS: [/^[\w\d,]+$/, '=>', (uids) => uids.split(',')],
	// TODO
	// MAX_MESSAGES_COUNT: 'number >= 10',
	MODERATION_DELAY_MS: 'string.integer.parse = "1000"',
	SESSION_EXPIRATION_HOURS: 'string.integer.parse = "4"'
});
