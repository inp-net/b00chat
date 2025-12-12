import { ChurrosProfile, UID } from '$lib/users';
import { type } from 'arktype';
import { addHours, compareDesc } from 'date-fns';
import { env } from './env';
import { ulid } from 'ulid';

const ID = type('string').default(() => ulid());
const Now = type('Date').default(() => new Date());

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
		id: ID,
		sentAt: 'Date',
		receivedAt: Now,
		sender: UID,
		content: 'string.trim',
		'censoredBy?': UID
	}).pipe((message) => ({
		...message,
		censored: Boolean(message.censoredBy)
	})),

	Session: type({
		id: ID,
		createdAt: Now,
		user: UID
	}).pipe((session) => ({
		...session,
		validUntil: addHours(session.createdAt, env.SESSION_EXPIRATION_HOURS)
	}))
};

export type User = typeof Tables.User.inferOut;
export type Message = typeof Tables.Message.inferOut;
export type Session = typeof Tables.Session.inferOut;

type Database = {
	[K in keyof typeof Tables]: Record<string, (typeof Tables)[K]['infer']>;
};

export const DB: Database = {
	User: {},
	Message: {},
	Session: {}
};

export function insertMessage(message: Message) {
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
