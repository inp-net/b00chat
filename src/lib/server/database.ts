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

const DB: Database = {
	User: {},
	Message: {},
	Session: {}
};

export const Users = {
	get(uid: string) {
		return DB.User[uid] ?? null;
	},
	set(user: typeof Tables.User.inferIn) {
		const newUser = Tables.User.assert(user);
		DB.User[newUser.uid] = newUser;
		return newUser;
	},
	isBanned(uid: string) {
		return DB.User[uid]?.banned;
	},
	isModerator(uid: string) {
		return DB.User[uid]?.moderator;
	},
	ban(uid: string) {
		const user = this.get(uid);
		if (!user) return false;
		DB.User[uid].banned = true;
		return true;
	},
	unban(uid: string) {
		const user = this.get(uid);
		if (!user) return false;
		DB.User[uid].banned = false;
		return true;
	},
	makeModerator(uid: string) {
		const user = this.get(uid);
		if (!user) return false;
		DB.User[uid].moderator = true;
		return true;
	},
	removeModerator(uid: string) {
		const user = this.get(uid);
		if (!user) return false;
		DB.User[uid].moderator = false;
		return true;
	}
};

export const Messages = {
	get(id: string) {
		return DB.Message[id] ?? null;
	},
	insert(message: typeof Tables.Message.inferIn) {
		const msg = Tables.Message.assert(message);
		DB.Message[msg.id] = msg;
		return msg;
	},
	latest(count: number) {
		// We assume messages are inserted in "almost chronological" order:
		// Get the last `count` messages and *then* sort them by sentAt.
		return Object.values(DB.Message)
			.slice(-count)
			.sort((a, b) => compareDesc(a.sentAt, b.sentAt))
			.map((message) => ({
				...message,
				sender: DB.User[message.sender]
			}));
	},
	getByUser(uid: string) {
		return Object.values(DB.Message).filter((message) => message.sender === uid);
	},
	censor(id: string) {
		const message = this.get(id);
		if (!message) return false;

		message.censored = true;
		return true;
	},
	uncensor(id: string) {
		const message = this.get(id);
		if (!message) return false;

		message.censored = false;
		return true;
	}
};

export const Sessions = {
	get(id: string) {
		return DB.Session[id] ?? null;
	},
	set(session: typeof Tables.Session.inferIn) {
		const newSession = Tables.Session.assert(session);
		DB.Session[newSession.id] = newSession;
		return newSession;
	},
	isValid(id: string) {
		const session = this.get(id);
		if (!session) return false;

		return session.validUntil > new Date();
	},
	create(userUid: string) {
		const session = Tables.Session.assert({
			user: userUid
		});

		DB.Session[session.id] = session;
		return session;
	},
	delete(id: string) {
		delete DB.Session[id];
	}
};
