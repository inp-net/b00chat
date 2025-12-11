import arkenv from 'arkenv';
import * as dotenv from 'dotenv';

dotenv.config();

export const env = arkenv({
	DOMAIN: /^[\w.]+$/,
	CLIENT_ID: 'string.alphanumeric',
	CLIENT_SECRET: 'string.alphanumeric',
	REDIRECT_URL: 'string.url',
	LOGOUT_URL: 'string.url',
	AUTHENTIK_URL: 'string.url',
	AUTHORIZE_URL: 'string.url',
	TOKEN_URL: 'string.url',
	USER_INFO_URL: 'string.url',
	BANNED_UIDS: [/^[\w\d,]+$/, '=>', (uids) => uids.split(',')],
	ADMIN_UIDS: [/^[\w\d,]+$/, '=>', (uids) => uids.split(',')],
	MAX_MESSAGES_COUNT: 'number >= 10',
	MODERATION_DELAY_MS: 'number >= 0'
});
