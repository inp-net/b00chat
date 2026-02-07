import { type } from 'arktype';
import { MajorSchema } from './users';
import { ID } from './types';

export const ClientCreateMessageSchema = type({
	content: 'string.trim',
	senderUid: 'string',
	senderName: 'string',
	major: MajorSchema,
	timestamp: 'number'
});

export const ClientMessageSchema = ClientCreateMessageSchema.and({
	id: ID,
	censored: 'boolean',
	senderBanned: 'boolean'
});

export type ClientMessage = typeof ClientMessageSchema.inferOut;

export const SocketMessageSchema = type.or(
	{ type: '"message:create"', content: ClientCreateMessageSchema },
	{ type: '"message:created"', content: ClientMessageSchema },
	{ type: '"message:created:batch"', content: ClientMessageSchema.array() },
	{ type: '"message:censored"', content: ID },
	{ type: '"message:uncensored"', content: ID },
	{ type: '"user:banned"', content: ID },
	{ type: '"user:unbanned"', content: ID }
);
