import { type } from 'arktype';
import { MajorSchema } from './users';
import { Game, ID, QuizQuestion, QuizQuestionData } from './types';

export const ClientCreateMessageSchema = type({
	content: 'string.trim',
	senderUid: 'string',
	senderName: 'string',
	major: MajorSchema
});

export const ClientMessageSchema = ClientCreateMessageSchema.and({
	id: ID,
	censored: 'boolean',
	senderBanned: 'boolean'
});

export type ClientMessage = typeof ClientMessageSchema.inferOut;

export const SocketMessageSchema = type.or(
	{ type: '"message:create"', content: 'string' },
	{ type: '"message:created"', content: ClientMessageSchema },
	{ type: '"message:created:batch"', content: ClientMessageSchema.array() },
	{ type: '"message:censored"', content: ID },
	{ type: '"message:uncensored"', content: ID },
	{ type: '"user:banned"', content: ID },
	{ type: '"user:unbanned"', content: ID },
	{ type: '"game:start"', content: Game },
	{ type: '"game:end"', content: Game },
	{ type: '"game:clicker:click"', content: 'null' },
	{ type: '"game:clicker:score"', content: 'Record<string, number>' },
	{ type: '"game:quiz:question"', content: QuizQuestionData },
	{ type: '"game:quiz:answer"', content: 'number' },
	{ type: '"game:quiz:correct"', content: 'number' }
);
