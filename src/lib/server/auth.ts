import { Authentik } from 'arctic/dist/providers/authentik';
import { env } from './env';

export const authentik = new Authentik(
	env.DOMAIN,
	env.CLIENT_ID,
	env.CLIENT_SECRET,
	env.REDIRECT_URL
);
