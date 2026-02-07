import { ChurrosProfile, UID } from '$lib/users';
import { type } from 'arktype';
import { addHours, compareDesc } from 'date-fns';
import { env } from './env';
import { ID, Now } from '$lib/types';

export const Tables = {
	User: ChurrosProfile.pipe((user) => ({
		...user,
		moderator: env.ADMIN_UIDS.includes(user.uid),
		banned: env.BANNED_UIDS.includes(user.uid)
	})),

	Message: type({
		id: ID,
		sentAt: 'Date',
		receivedAt: Now,
		sender: UID,
		content: 'string.trim',
		censored: 'boolean'
	}),

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

export function insertMessage(message: typeof Tables.Message.inferIn) {
	const msg = Tables.Message.assert(message);
	DB.Message[msg.id] = msg;
	return msg;
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

export function censorMessage(id: string) {
	DB.Message[id].censored = true;
}

export function uncensorMessage(id: string) {
	DB.Message[id].censored = false;
}

export function banUser(uid: string) {
	DB.User[uid].banned = true;
}

export function unbanUser(uid: string) {
	DB.User[uid].banned = false;
}

export function makeModerator(uid: string) {
	DB.User[uid].moderator = true;
}

export function removeModerator(uid: string) {
	DB.User[uid].moderator = false;
}
