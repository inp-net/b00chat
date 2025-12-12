import { type } from 'arktype';

export const SocketMessageClientSchema = type({
	content: 'string',
	senderName: 'string',
	timestamp: 'number.integer',
	major: 'string'
});

export type SocketMessageClient = typeof SocketMessageClientSchema.inferOut;

export const SocketMessageSchema = type.or(
	{ type: '"ping"' },
	{ type: '"message"', content: SocketMessageClientSchema },
	{ type: '"message_batch"', content: SocketMessageClientSchema.array() }
);

export type SocketMessage = typeof SocketMessageSchema.inferOut;
