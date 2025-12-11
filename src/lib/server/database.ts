import { ChurrosProfile, UID } from '$lib/users';
import { type } from 'arktype';
import { compareDesc } from 'date-fns';
import { env } from './env';
import { ulid } from 'ulid';

export const Tables = {
	User: ChurrosProfile.and({
		'bannedBy?': UID,
		'moderatorBy?': UID
	}).pipe((user) => ({
		...user,
		moderator: env.ADMIN_UIDS.includes(user.uid) || 'moderatorBy' in user,
		banned: env.BANNED_UIDS.includes(user.uid) || 'bannedBy' in user
	})),
	Message: type({
		id: ['string', '=', () => ulid()],
		sentAt: 'Date',
		sender: UID,
		content: 'string.trim',
		'censoredBy?': UID
	}).pipe((message) => ({
		...message,
		censored: Boolean(message.censoredBy)
	}))
};

type Database = {
	[K in keyof typeof Tables]: Record<string, (typeof Tables)[K]['infer']>;
};

export const DB: Database = {
	User: {},
	Message: {}
};

export function setUser(user: typeof Tables.User.inferIn) {
	DB.User[user.uid] = Tables.User.assert(user);
}

export function insertMessage(message: typeof Tables.Message.inferIn) {
	const msg = Tables.Message.assert(message);
	DB.Message[msg.id] = msg;
}

export function latestMessages(count: number) {
	// We assume messages are inserted in "almost chronological" order:
	// Get the last `count` messages and *then* sort them by sentAt.

	return Object.values(DB.Message)
		.slice(-count)
		.sort((a, b) => compareDesc(a.sentAt, b.sentAt))
		.map((message) => ({
			...message,
			sender: DB.User[message.sender]
		}));
}

export function censorMessage(id: string, censoredBy: string) {
	DB.Message[id] = Tables.Message.assert({
		...DB.Message[id],
		censoredBy
	});
}

/**
 * Also censors all their messages
 */
export function banUser(uid: string, bannedBy: string) {
	if (!DB.User[bannedBy]?.moderator) throw new Error('Only moderators can ban users.');

	DB.User[uid] = Tables.User.assert({
		...DB.User[uid],
		bannedBy
	});

	for (const message of Object.values(DB.Message)) {
		if (message.sender === uid && !message.censoredBy) {
			censorMessage(message.id, bannedBy);
		}
	}
}

export function makeModerator(uid: string, moderatorBy: string) {
	if (!DB.User[moderatorBy]?.moderator)
		throw new Error('Only moderators can make other users moderators.');

	DB.User[uid] = Tables.User.assert({
		...DB.User[uid],
		moderatorBy
	});
}
