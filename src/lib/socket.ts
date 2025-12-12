import { type } from 'arktype';
import { MajorSchema } from './users';

export const SocketMessageClientSchema = type({
	content: 'string',
	senderName: 'string',
	senderUid: 'string',
	senderPronouns: 'string',
	timestamp: 'number.integer',
	major: MajorSchema
});

export type SocketMessageClient = typeof SocketMessageClientSchema.inferOut;

export const SocketMessageSchema = type.or(
	{ type: '"ping"' },
	{ type: '"message"', content: SocketMessageClientSchema },
	{ type: '"message_batch"', content: SocketMessageClientSchema.array() }
);

export type SocketMessage = typeof SocketMessageSchema.inferOut;
