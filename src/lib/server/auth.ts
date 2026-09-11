import { betterAuth } from 'better-auth';
import { genericOAuth, type GenericOAuthUserInfo } from 'better-auth/plugins';
import { ChurrosProfile } from '$lib/users';
import { env } from './env';
import { ArkErrors } from 'arktype';
import { Users, type User } from './database';

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: [env.BETTER_AUTH_URL],
	user: {
		additionalFields: {
			uid: { type: 'string', required: false, input: true },
			major: { type: 'string', required: false, input: true },
			pictureURL: { type: 'string', required: false, input: true },
			pronouns: { type: 'string', required: false, input: true },
			firstName: { type: 'string', required: false, input: true },
			lastName: { type: 'string', required: false, input: true }
		}
	},
	session: {
		expiresIn: env.SESSION_EXPIRATION_HOURS * 60 * 60,
		cookieCache: {
			enabled: true,
			maxAge: env.SESSION_EXPIRATION_HOURS * 60 * 60,
			strategy: 'compact',
			refreshCache: true
		}
	},
	account: {
		storeStateStrategy: 'cookie',
		storeAccountCookie: false
	},
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: 'authentik',
					clientId: env.CLIENT_ID,
					clientSecret: env.CLIENT_SECRET,
					discoveryUrl: `${env.ISSUER_URL}.well-known/openid-configuration`,
					scopes: ['openid', 'profile', 'email', 'churros:profile'],
					disableProviderLogout: true,
					accountSubject: ({ profile }) => profile.id ?? '',
					mapProfileToUser: (profile) => ({
						uid: profile.uid,
						major: profile.major,
						pictureURL: profile.pictureURL,
						pronouns: profile.pronouns,
						firstName: profile.firstName,
						lastName: profile.lastName
					}),
					getUserInfo: async (tokens): Promise<GenericOAuthUserInfo | null> => {
						const response = await fetch(env.USER_INFO_URL, {
							headers: {
								Authorization: `Bearer ${tokens.accessToken}`
							}
						});

						if (!response.ok) return null;

						const profileData = await response.json();

						const profile = ChurrosProfile(profileData);

						if (profile instanceof ArkErrors) return null;
						if (env.BANNED_UIDS.includes(profile.uid)) return null;

						return {
							id: profile.uid,
							sub: profile.uid,
							email: profileData.email,
							emailVerified: true,
							name: profile.name,
							image: profile.pictureURL,
							uid: profile.uid,
							major: profile.major,
							pictureURL: profile.pictureURL,
							pronouns: profileData.pronouns,
							firstName: profileData.firstName,
							lastName: profileData.lastName
						};
					}
				}
			]
		})
	],
	experimental: {
		instrumentation: {
			enabled: false
		}
	}
});

export function syncApplicationUser(user: unknown): User | undefined {
	if (!user || typeof user !== 'object') return undefined;

	const authUser = user as Record<string, unknown>;
	const stringValue = (value: unknown) => (typeof value === 'string' ? value : '');
	const uid = stringValue(authUser.uid) || stringValue(authUser.id);
	const name = stringValue(authUser.name) || uid;
	const profile = ChurrosProfile({
		pronouns: stringValue(authUser.pronouns),
		uid,
		pictureURL: stringValue(authUser.pictureURL) || stringValue(authUser.image),
		churrosNickname: name,
		firstName: stringValue(authUser.firstName) || name,
		lastName: stringValue(authUser.lastName) || name,
		major: { uid: stringValue(authUser.major) }
	});

	if (profile instanceof ArkErrors || env.BANNED_UIDS.includes(profile.uid)) return undefined;

	return Users.set({
		pronouns: stringValue(authUser.pronouns),
		uid: profile.uid,
		pictureURL: profile.pictureURL,
		churrosNickname: profile.name,
		firstName: stringValue(authUser.firstName) || name,
		lastName: stringValue(authUser.lastName) || name,
		major: { uid: profile.major }
	});
}
